import CryptoJS from 'crypto-js'

export const encryptPassword = (password: string, secretKey: string): string => {
  return CryptoJS.AES.encrypt(password, secretKey).toString()
}

export const decryptPasswordClient = (encrypted: string, secretKey: string): string => {
  const bytes = CryptoJS.AES.decrypt(encrypted, secretKey)
  return bytes.toString(CryptoJS.enc.Utf8)
}
