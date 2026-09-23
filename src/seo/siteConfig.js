/**
 * One source of truth for everything an indexer, a social unfurler or an
 * answer engine needs to know about this site.
 *
 * The origin is env-driven so a domain change is a single Vercel variable
 * rather than a hunt through canonical tags, sitemaps and JSON-LD.
 */

const FALLBACK_ORIGIN = 'https://cardogen.mopgen.in'

function readEnvOrigin() {
  // import.meta.env in the app, process.env in the Node build scripts.
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SITE_URL) {
    return import.meta.env.VITE_SITE_URL
  }
  if (typeof process !== 'undefined' && process.env?.VITE_SITE_URL) {
    return process.env.VITE_SITE_URL
  }
  return FALLBACK_ORIGIN
}

/** No trailing slash, so `${SITE_ORIGIN}${path}` is always well formed. */
export const SITE_ORIGIN = readEnvOrigin().replace(/\/+$/, '')

export const SITE = {
  name: 'Cardogen',
  legalName: 'Cardogen',
  tagline: 'Free online wedding invitation cards',
  /** Used wherever a one-line description of the product is needed. */
  description:
    'Create a free online wedding invitation card in minutes. Pick a designer template, share one WhatsApp link, and track RSVPs in a live dashboard. No credit card, free forever.',
  locale: 'en_IN',
  lang: 'en',
  themeColor: '#f43f5e',
  twitter: '@cardogen',
  /** Social preview image, 1200x630. */
  ogImage: '/og-image.png',
  founded: '2026'
}

/** Absolute URL for a site-relative path. */
export function absoluteUrl(path = '/') {
  if (/^https?:\/\//i.test(path)) return path
  return `${SITE_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`
}
