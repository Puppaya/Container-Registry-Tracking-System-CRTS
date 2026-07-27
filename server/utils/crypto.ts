import { createError } from 'h3'
import CryptoJS from 'crypto-js'
import bcrypt from 'bcryptjs'


export const decryptPassword = (encrypted: string): string => {
    try {
        const secretKey = process.env.SECRET_KEY
        if (!secretKey) {
            throw new Error('SECRET_KEY is not configured')
        }
        const bytes = CryptoJS.AES.decrypt(encrypted, secretKey)
        const decrypted = bytes.toString(CryptoJS.enc.Utf8)
        if (!decrypted) throw new Error('Decryption failed')
        return decrypted
    } catch (e) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid encrypted password format'
        })
    }
}

export const hashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, 10)
}

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
    return await bcrypt.compare(password, hash)
}

export const verifyPassword = async (hash: string, password: string): Promise<boolean> => {
    return await bcrypt.compare(password, hash)
}
