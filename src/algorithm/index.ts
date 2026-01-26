export { getXBogus, type XBogusResult } from './xbogus.js'
export { getABogus, generateBrowserFingerprint, type ABogusResult, type ABogusOptions } from './abogus.js'

export function generateMsToken(length: number = 128): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
