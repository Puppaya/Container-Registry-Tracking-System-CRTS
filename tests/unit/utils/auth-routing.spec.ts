import { describe, expect, it } from 'vitest'
import {
  isHubEntryPath,
  isPublicPath,
  resolveHubEntryRedirect,
  shouldRedirectLoggedInFromPublicPath
} from '~/utils/auth-routing'

describe('auth-routing', () => {
  it('should treat /hub/entry as public', () => {
    expect(isPublicPath('/hub/entry')).toBe(true)
  })

  it('should treat /public routes as public', () => {
    expect(isPublicPath('/public')).toBe(true)
    expect(isPublicPath('/public/register')).toBe(true)
    expect(isPublicPath('/public/track/MSCU1234567')).toBe(true)
  })

  it('should detect hub entry paths', () => {
    expect(isHubEntryPath('/hub/entry')).toBe(true)
    expect(isHubEntryPath('/login')).toBe(false)
  })

  it('should not redirect logged-in users away from /hub/entry', () => {
    expect(shouldRedirectLoggedInFromPublicPath('/hub/entry')).toBe(false)
    expect(shouldRedirectLoggedInFromPublicPath('/login')).toBe(true)
  })

  it('should resolve hub inner path redirects safely', () => {
    expect(resolveHubEntryRedirect('/containers')).toBe('/containers')
    expect(resolveHubEntryRedirect('https://evil.example/')).toBe('/dashboard')
    expect(resolveHubEntryRedirect(undefined)).toBe('/dashboard')
  })
})
