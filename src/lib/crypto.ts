import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const TAG_LENGTH = 16

function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  if (!key) {
    throw new Error('ENCRYPTION_KEY is required')
  }
  return crypto.createHash('sha256').update(key).digest()
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv)

  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final()
  ])

  const tag = cipher.getAuthTag()

  return Buffer.concat([iv, tag, encrypted]).toString('base64')
}

export function decrypt(encryptedText: string): string | null {
  try {
    const buffer = Buffer.from(encryptedText, 'base64')

    const iv = buffer.subarray(0, IV_LENGTH)
    const tag = buffer.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH)
    const encrypted = buffer.subarray(IV_LENGTH + TAG_LENGTH)

    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv)
    decipher.setAuthTag(tag)

    return decipher.update(encrypted).toString('utf8') + decipher.final('utf8')
  } catch (error) {
    console.error('Decryption failed:', error instanceof Error ? error.message : error)
    return null
  }
}
