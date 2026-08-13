import { buildHubEmbedCsp } from '../utils/hub-frame-ancestors'

/** Runtime CSP so Hub frame-ancestors can change without rebuild. */
export default defineEventHandler((event) => {
  setResponseHeader(event, 'Content-Security-Policy', buildHubEmbedCsp())
  removeResponseHeader(event, 'X-Frame-Options')
})
