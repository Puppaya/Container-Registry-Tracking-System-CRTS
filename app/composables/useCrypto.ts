import CryptoJS from 'crypto-js'

export function useCrypto() {
  const config = useRuntimeConfig()

  function encryptPassword(password: string): string {
    return CryptoJS.AES.encrypt(password, config.public.secretKey).toString()
  }

  return { encryptPassword }
}
