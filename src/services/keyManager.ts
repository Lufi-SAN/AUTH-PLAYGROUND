import { generateKeyPair, exportJWK, importJWK } from 'jose'
import { randomUUID } from 'crypto'
import { redisKeys } from '../config/redis.js'
import { redis } from '../loaders/loadRedis.js'
import {
  setActiveKid,
  setSigningKey,
  addToPublicKeyCache,
  deletePKCELoopwise,
} from './keyStore.js'
import { insertNewActiveRowIfNecessary } from '../repositories/keyManagementRepo.js'

let lastRotatedPeriod: string | null = null

export async function createAndExportKeys() {
  const { privateKey, publicKey } = await generateKeyPair('EdDSA', {
    crv: 'Ed25519',
    extractable: true,
  })

  const privateJwk = await exportJWK(privateKey)
  const publicJwk = await exportJWK(publicKey)

  const kid = randomUUID()
  privateJwk.kid = kid
  publicJwk.kid = kid

  privateJwk.alg = publicJwk.alg = 'EdDSA'

  return { privateKey, publicKey, privateJwk, publicJwk, kid }
}

function inMemoryKeysStore(
  privateKey: CryptoKey,
  publicKey: CryptoKey,
  kid: string,
) {
  addToPublicKeyCache(kid, publicKey)
  setSigningKey(privateKey)
  setActiveKid(kid)
}

export async function initializeKeysStore() {
  const redisInstance = redis.getRedisInstance()

  const KEY_FOR_ACTIVE_KID_POINTER = redisKeys.kidPointer() //returns "jwk:active_kid"
  const KEY_FOR_JWT_TRACKING = redisKeys.jwkTracker()

  const now = new Date()
  const nowToString = now.toISOString()
  const currentRotationPeriod = nowToString.slice(0, 10)

  const activeKid = await redisInstance.get(KEY_FOR_ACTIVE_KID_POINTER) //returns "567-829-efrg"

  if (!activeKid) {
    const {
      privateKey,
      publicKey,
      privateJwk,
      publicJwk,
      kid: newKid,
    } = await createAndExportKeys()

    const { kid, private_jwk, public_jwk, rotation_period } =
      await insertNewActiveRowIfNecessary({
        kid: newKid,
        privateJwk,
        publicJwk,
        rotationPeriod: currentRotationPeriod,
      }) //optimised for check + action(if necessary) + return same fields

    const KEY_FOR_JWK_STORE = redisKeys.jwkStore(kid)
    await redisInstance
      .multi()
      .hset(KEY_FOR_JWK_STORE, {
        kid,
        private_jwk: JSON.stringify(private_jwk),
        public_jwk: JSON.stringify(public_jwk),
        rotation_period,
      })
      .set(KEY_FOR_ACTIVE_KID_POINTER, kid)
      .sadd(KEY_FOR_JWT_TRACKING, KEY_FOR_JWK_STORE)
      .exec()

    const validPrivateKey = (await importJWK(private_jwk, 'EdDSA', {
      extractable: true,
    })) as CryptoKey
    const validPublicKey = (await importJWK(public_jwk)) as CryptoKey
    inMemoryKeysStore(validPrivateKey, validPublicKey, kid)
  }

  if (activeKid) {
    const KEY_OF_CURRENT_ACTIVE_PAIR = redisKeys.jwkStore(activeKid)
    const fields = ['kid', 'private_jwk', 'public_jwk', 'rotation_period']
    const [kid, privateJwk, publicJwk, rotationPeriodRedis] =
      await redisInstance.hmget(KEY_OF_CURRENT_ACTIVE_PAIR, ...fields)

    if (rotationPeriodRedis === currentRotationPeriod) {
      //everything kosher - rotation happened already - update in-memory
      const privateKey = (await importJWK(
        JSON.parse(privateJwk as string),
        'EdDSA',
        {
          extractable: true,
        },
      )) as CryptoKey
      const publicKey = (await importJWK(
        JSON.parse(publicJwk as string),
      )) as CryptoKey
      inMemoryKeysStore(privateKey, publicKey, kid as string)
    } else {
      //Check if within rotation grace limit & leave to cron rotation job
      const [monthStartTime, monthGraceTime] = [
        Date.UTC(now.getFullYear(), now.getMonth(), 1, 0, 0),
        Date.UTC(now.getFullYear(), now.getMonth(), 1, 0, 14),
      ]
      const currentTime = now.getTime()
      if (monthStartTime <= currentTime && currentTime <= monthGraceTime) {
        //Let cron handle it
        return
      }

      //Check Postgres
      const {
        privateJwk: newPrivateJwk,
        publicJwk: newPublicJwk,
        kid: newKid,
      } = await createAndExportKeys()

      const { kid, private_jwk, public_jwk, rotation_period } =
        await insertNewActiveRowIfNecessary({
          kid: newKid,
          privateJwk: newPrivateJwk,
          publicJwk: newPublicJwk,
          rotationPeriod: currentRotationPeriod,
        }) //get valid active data anyway

      //clear old jwk_store in redis
      const KEY_FOR_JWK_STORE = redisKeys.jwkStore(kid)
      await redisInstance
        .multi()
        .del(KEY_OF_CURRENT_ACTIVE_PAIR)
        .hset(KEY_FOR_JWK_STORE, {
          kid,
          private_jwk: JSON.stringify(private_jwk),
          public_jwk: JSON.stringify(public_jwk),
          rotation_period,
        })
        .set(KEY_FOR_ACTIVE_KID_POINTER, kid)
        .del(KEY_FOR_JWT_TRACKING)
        .sadd(KEY_FOR_JWT_TRACKING, KEY_FOR_JWK_STORE)
        .exec()
      //importJwk from Postgres & in-memory store
      const validPrivateKey = (await importJWK(private_jwk, 'EdDSA', {
        extractable: true,
      })) as CryptoKey
      const validPublicKey = (await importJWK(public_jwk)) as CryptoKey
      inMemoryKeysStore(validPrivateKey, validPublicKey, kid)
    }
  }
}

export async function rotateKeys() {
  const currentMY = new Date().toISOString().slice(0, 10) // e.g. "2024-06-01"

  const KEY_FOR_JWT_TRACKING = redisKeys.jwkTracker()

  //Cron job has already run for this month, so we can skip the rotation.
  if (lastRotatedPeriod === currentMY) return

  const redisInstance = redis.getRedisInstance()
  const KEY_POINTING_TO_ACTIVE_KID = redisKeys.kidPointer() //returns jwk:active_kid
  const activeKid = await redisInstance.get(KEY_POINTING_TO_ACTIVE_KID) //returns "56739"

  if (activeKid === null) {
    //Redis works; state recovery from Postgres
    await ensureCorrectRotationExists()
    return
  }

  const KEY_OF_CURRENT_ACTIVE_PAIR = redisKeys.jwkStore(activeKid) // old jwk:keys:56739
  const lastRotationPeriodFromRedis = await redisInstance.hget(
    KEY_OF_CURRENT_ACTIVE_PAIR,
    'rotation_period',
  )

  async function ensureCorrectRotationExists() {
    const {
      privateKey,
      publicKey,
      privateJwk,
      publicJwk,
      kid: newKid,
    } = await createAndExportKeys()

    const { kid, private_jwk, public_jwk, rotation_period } =
      await insertNewActiveRowIfNecessary({
        kid: newKid,
        privateJwk,
        publicJwk,
        rotationPeriod: currentMY,
      }) //Checks, update if necessary, returns correct fields anyway

    const oldKeys = await redisInstance.smembers(KEY_FOR_JWT_TRACKING)
    const pipeline = redisInstance.multi()

    for (const oldKey of oldKeys) {
      pipeline.expire(oldKey, 15 * 60)
    }

    const KEY_OF_UPDATED_ACTIVE_PAIR = redisKeys.jwkStore(kid) // NEW jwk:keys:60000
    //Cache redis, in-memory, lastRotatedPeriod
    pipeline
      .hset(KEY_OF_UPDATED_ACTIVE_PAIR, {
        kid,
        private_jwk: JSON.stringify(private_jwk),
        public_jwk: JSON.stringify(public_jwk),
        rotation_period,
      })
      .set(KEY_POINTING_TO_ACTIVE_KID, kid)
      .del(KEY_FOR_JWT_TRACKING)
      .sadd(KEY_FOR_JWT_TRACKING, KEY_OF_UPDATED_ACTIVE_PAIR)

    await pipeline.exec()

    deletePKCELoopwise()
    const validPrivateKey = (await importJWK(private_jwk, 'EdDSA', {
      extractable: true,
    })) as CryptoKey
    const validPublicKey = (await importJWK(public_jwk)) as CryptoKey
    inMemoryKeysStore(validPrivateKey, validPublicKey, kid)
    lastRotatedPeriod = currentMY
    return
  }

  if (lastRotationPeriodFromRedis === currentMY) {
    //Redis cache has correct value: update in-memory & move on
    lastRotatedPeriod = lastRotationPeriodFromRedis
    return
  }

  if (lastRotationPeriodFromRedis === null) {
    //Redis works; state recovery
    await ensureCorrectRotationExists()
    return
  }

  if (lastRotationPeriodFromRedis !== currentMY) {
    //Redis works; Redis has values but they're outdated; Check if Postgres might have updated data
    await ensureCorrectRotationExists()
    return
  }
}
