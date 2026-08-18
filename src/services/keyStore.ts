let activeKid: string
let signingKey: CryptoKey
const publicKeyCache: Map<string, CryptoKey> = new Map()

export function setActiveKid(kid: string) {
  activeKid = kid
}

export function getActiveKid() {
  return activeKid
}

export function getSigningKey(): CryptoKey {
  return signingKey
}

export function setSigningKey(key: CryptoKey): void {
  signingKey = key
}

export function getPublicKeyFromCache(kid: string): CryptoKey | undefined {
  return publicKeyCache.get(kid)
}

export function addToPublicKeyCache(kid: string, publicKey: CryptoKey): void {
  publicKeyCache.set(kid, publicKey)
}

export function deletePublicKeyCacheEntry(kid: string) {
  publicKeyCache.delete(kid)
}

export function deletePKCELoopwise() {
  for (const key of publicKeyCache.keys()) {
    setTimeout(() => publicKeyCache.delete(key), 15 * 60 * 1000)
  }
}
