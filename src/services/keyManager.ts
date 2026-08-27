import { generateKeyPair, exportJWK, importJWK } from 'jose'
import { randomUUID } from 'crypto'
import { redisKeys, REDIS_PREFIXES } from '../config/redis.js'
import { redis, type MyRedisClientType } from '../loaders/loadRedis.js'
import {
  setActiveKid,
  setSigningKey,
  addToPublicKeyCache,
  deletePublicKeyCacheEntry,
  deletePKCELoopwise,
} from './keyStore.js'
import { insertNewActiveRowIfNecessary } from '../repositories/keyManagementRepo.js'

let lastRotatedPeriod: string | null = null

async function createAndExportKeys() {
  const { privateKey, publicKey } = await generateKeyPair('EdDSA', {
    crv: 'Ed25519',
  })

  const privateJwk = await exportJWK(privateKey)
  const publicJwk = await exportJWK(publicKey)

  const kid = randomUUID()
  privateJwk.kid = kid
  publicJwk.kid = kid

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
      .exec()

    const validPrivateKey = (await importJWK(private_jwk)) as CryptoKey
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
        .exec()
      //importJwk from Postgres & in-memory store
      const validPrivateKey = (await importJWK(private_jwk)) as CryptoKey
      const validPublicKey = (await importJWK(public_jwk)) as CryptoKey
      inMemoryKeysStore(validPrivateKey, validPublicKey, kid)
    }
  }
}

export async function rotateKeys() {
  const currentMY = new Date().toISOString().slice(0, 10) // e.g. "2024-06-01"

  //Cron job has already run for this month, so we can skip the rotation.
  if (lastRotatedPeriod === currentMY) return

  const redisInstance = redis.getRedisInstance()
  const KEY_POINTING_TO_ACTIVE_KID = redisKeys.kidPointer() //returns jwk:active_kid
  const activeKid = await redisInstance.get(KEY_POINTING_TO_ACTIVE_KID) //returns "56739"

  if (activeKid === null) {
    //Redis works; state recovery from Postgres
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

    async function clearJwkKeys(redisInstance: MyRedisClientType) {
      let cursor = '0'

      do {
        const [nextCursor, keys] = await redisInstance.scan(
          cursor,
          'MATCH',
          `${REDIS_PREFIXES.JWK_STORE}*`,
          'COUNT',
          100,
        )

        cursor = nextCursor

        if (keys.length) {
          await redisInstance.del(keys)
        }
      } while (cursor !== '0')
    }
    await clearJwkKeys(redisInstance)

    const KEY_OF_UPDATED_ACTIVE_PAIR = redisKeys.jwkStore(kid) // NEW jwk:keys:60000
    //Cache redis, in-memory, lastRotatedPeriod
    await redisInstance
      .multi()
      .expire('jwk:keys:*', 60 * 15)
      .hset(KEY_OF_UPDATED_ACTIVE_PAIR, {
        kid,
        private_jwk: JSON.stringify(private_jwk),
        public_jwk: JSON.stringify(public_jwk),
        rotation_period,
      })
      .set(KEY_POINTING_TO_ACTIVE_KID, kid)
      .exec()

    deletePKCELoopwise()
    const validPrivateKey = (await importJWK(private_jwk)) as CryptoKey
    const validPublicKey = (await importJWK(public_jwk)) as CryptoKey
    inMemoryKeysStore(validPrivateKey, validPublicKey, kid)
    lastRotatedPeriod = currentMY
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
      }) //Checks, update if necessary, returns
    const KEY_OF_UPDATED_ACTIVE_PAIR = redisKeys.jwkStore(kid) // NEW jwk:keys:60000
    //Cache redis, in-memory, lastRotatedPeriod
    await redisInstance
      .multi()
      .expire(KEY_OF_CURRENT_ACTIVE_PAIR, 60 * 15)
      .hset(KEY_OF_UPDATED_ACTIVE_PAIR, {
        kid,
        private_jwk: JSON.stringify(private_jwk),
        public_jwk: JSON.stringify(public_jwk),
        rotation_period,
      })
      .set(KEY_POINTING_TO_ACTIVE_KID, kid)
      .exec() //ttl KEY_OF_CURRENT_ACTIVE_PAIR

    const validPrivateKey = (await importJWK(private_jwk)) as CryptoKey
    const validPublicKey = (await importJWK(public_jwk)) as CryptoKey
    inMemoryKeysStore(validPrivateKey, validPublicKey, kid)
    if (activeKid !== kid) {
      setTimeout(
        () => {
          deletePublicKeyCacheEntry(activeKid as string)
        },
        15 * 60 * 1000,
      )
    }
    lastRotatedPeriod = currentMY
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
