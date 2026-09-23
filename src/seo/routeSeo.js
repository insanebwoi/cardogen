/**
 * Per-route titles, descriptions and indexing rules.
 *
 * Indexing policy: only the marketing surface is indexable. Individual
 * invitations at /w/:shortCode are private by nature — a guest list is not
 * something to publish to a search engine — so they are noindex here and
 * disallowed in robots.txt. Signed-in and admin screens are noindex because
 * a crawler only ever sees their login redirect anyway.
 */
import { SITE } from './siteConfig.js'

const TITLE_SUFFIX = ` · ${SITE.name}`

/** Keeps titles inside the ~60 characters Google renders before truncating. */
export function formatTitle(title, { bare = false } = {}) {
  if (!title) return `${SITE.name} — ${SITE.tagline}`
  if (bare) return title
  return `${title}${TITLE_SUFFIX}`
}

export const ROUTE_SEO = {
  Home: {
    title: 'Free Online Wedding Invitation Cards — Cardogen',
    bareTitle: true,
    description: SITE.description,
    index: true,
    path: '/'
  },
  Login: {
    title: 'Sign in',
    description: 'Sign in to Cardogen to create and manage your free digital wedding invitations.',
    index: false,
    path: '/login'
  },
  WeddingCard: {
    // Filled in at runtime from the invitation itself.
    title: 'Wedding Invitation',
    description: "You're invited — open the invitation to see the details and RSVP.",
    index: false
  },
  NotFound: {
    title: 'Page not found',
    description: 'This page does not exist.',
    index: false
  }
}

/** Anything not listed above is treated as private application surface. */
export const PRIVATE_DEFAULT = { title: 'Dashboard', description: '', index: false }

export function seoForRoute(name) {
  return ROUTE_SEO[name] || PRIVATE_DEFAULT
}
