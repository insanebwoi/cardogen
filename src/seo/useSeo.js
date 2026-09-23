/**
 * Applies head tags for the current page.
 *
 * A single-page app swaps views without a document reload, so every tag that
 * describes "this page" has to be rewritten on navigation — otherwise a
 * crawler that renders JS, and every social unfurler, keeps seeing whatever
 * the first route happened to set.
 *
 * Tags written here are marked data-seo so they can be cleared wholesale on
 * the next navigation without disturbing the static tags in index.html.
 */
import { SITE, absoluteUrl } from './siteConfig.js'

const MANAGED = 'data-seo'

function clearManaged() {
  document.head.querySelectorAll(`[${MANAGED}]`).forEach((el) => el.remove())
}

function setMeta(attr, key, content) {
  if (!content) return
  const el = document.createElement('meta')
  el.setAttribute(attr, key)
  el.setAttribute('content', content)
  el.setAttribute(MANAGED, '')
  document.head.appendChild(el)
}

function setLink(rel, href) {
  if (!href) return
  const el = document.createElement('link')
  el.setAttribute('rel', rel)
  el.setAttribute('href', href)
  el.setAttribute(MANAGED, '')
  document.head.appendChild(el)
}

function setJsonLd(data) {
  if (!data) return
  const el = document.createElement('script')
  el.type = 'application/ld+json'
  el.setAttribute(MANAGED, '')
  el.textContent = JSON.stringify(data)
  document.head.appendChild(el)
}

/**
 * @param {object} seo
 * @param {string} seo.title        already-formatted document title
 * @param {string} seo.description
 * @param {string} seo.path         site-relative path, for the canonical
 * @param {boolean} seo.index       false → noindex,nofollow
 * @param {string} [seo.image]      social preview, site-relative or absolute
 * @param {string} [seo.type]       og:type, defaults to website
 * @param {object} [seo.jsonLd]     schema.org @graph for this page
 */
export function applySeo(seo) {
  if (typeof document === 'undefined') return

  const title = seo.title || `${SITE.name} — ${SITE.tagline}`
  const description = seo.description || SITE.description
  const canonical = seo.path ? absoluteUrl(seo.path) : null
  const image = absoluteUrl(seo.image || SITE.ogImage)

  document.title = title
  clearManaged()

  setMeta('name', 'description', description)

  // Indexing directives. Both robots and the Google-specific token, since
  // max-image-preview/max-snippet are what unlock large previews.
  setMeta(
    'name',
    'robots',
    seo.index === false
      ? 'noindex, nofollow'
      : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
  )

  if (canonical) {
    setLink('canonical', canonical)
    setMeta('property', 'og:url', canonical)
  }

  setMeta('property', 'og:site_name', SITE.name)
  setMeta('property', 'og:title', title)
  setMeta('property', 'og:description', description)
  setMeta('property', 'og:type', seo.type || 'website')
  setMeta('property', 'og:image', image)
  setMeta('property', 'og:image:alt', title)
  setMeta('property', 'og:locale', SITE.locale)

  setMeta('name', 'twitter:card', 'summary_large_image')
  setMeta('name', 'twitter:title', title)
  setMeta('name', 'twitter:description', description)
  setMeta('name', 'twitter:image', image)

  setJsonLd(seo.jsonLd)
}
