import { describe, expect, it } from 'vitest'
import { buildHubEmbedCsp, resolveHubFrameAncestors } from '../../../server/utils/hub-frame-ancestors'

describe('hub-frame-ancestors', () => {
  it('should include Hub production origin by default', () => {
    expect(resolveHubFrameAncestors('')).toContain('https://laoxone.sdplao.com:5500')
  })

  it('should build CSP with frame-ancestors directive', () => {
    const csp = buildHubEmbedCsp("'self' https://laoxone.sdplao.com:5500")
    expect(csp).toContain('frame-ancestors \'self\' https://laoxone.sdplao.com:5500')
    expect(csp).not.toContain('X-Frame-Options')
  })
})
