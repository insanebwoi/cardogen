/**
 * schema.org graphs. Search engines use these for rich results; answer
 * engines use them as a machine-readable statement of what the product is,
 * which is far more reliable than asking them to infer it from marketing copy.
 *
 * Everything hangs off stable @id values so the nodes cross-reference into a
 * single graph instead of floating as unrelated islands.
 */
import { SITE, SITE_ORIGIN, absoluteUrl } from './siteConfig.js'
import { FAQS } from './content.js'

const ORG_ID = `${SITE_ORIGIN}/#organization`
const SITE_ID = `${SITE_ORIGIN}/#website`

export function organizationNode() {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE.name,
    legalName: SITE.legalName,
    url: `${SITE_ORIGIN}/`,
    description: SITE.description,
    foundingDate: SITE.founded,
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl('/favicon.svg')
    }
  }
}

export function webSiteNode() {
  return {
    '@type': 'WebSite',
    '@id': SITE_ID,
    name: SITE.name,
    url: `${SITE_ORIGIN}/`,
    description: SITE.description,
    inLanguage: SITE.lang,
    publisher: { '@id': ORG_ID }
  }
}

/**
 * The product itself. SoftwareApplication with a zero-price Offer is what
 * makes "free" a machine-readable fact rather than a marketing adjective.
 */
export function applicationNode() {
  return {
    '@type': 'SoftwareApplication',
    '@id': `${SITE_ORIGIN}/#app`,
    name: SITE.name,
    url: `${SITE_ORIGIN}/`,
    applicationCategory: 'LifestyleApplication',
    applicationSubCategory: 'Wedding invitation maker',
    operatingSystem: 'Any modern web browser',
    browserRequirements: 'Requires JavaScript',
    description: SITE.description,
    inLanguage: SITE.lang,
    publisher: { '@id': ORG_ID },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      description: 'Free forever, no credit card required'
    },
    featureList: [
      'Designer wedding invitation templates',
      'Shareable short link for WhatsApp and iMessage',
      'Built-in RSVP collection and tracking',
      'Live countdown to the wedding date',
      'Background music on the invitation card',
      'Mobile-first responsive design'
    ]
  }
}

export function faqNode() {
  return {
    '@type': 'FAQPage',
    '@id': `${SITE_ORIGIN}/#faq`,
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a }
    }))
  }
}

/** Step-by-step instructions — eligible for how-to rich results and readily quoted by AI answers. */
export function howToNode(steps) {
  return {
    '@type': 'HowTo',
    '@id': `${SITE_ORIGIN}/#howto`,
    name: 'How to create a free online wedding invitation card',
    description: 'Create, share and track a digital wedding invitation in three steps.',
    totalTime: 'PT5M',
    estimatedCost: { '@type': 'MonetaryAmount', currency: 'INR', value: '0' },
    step: steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.title,
      text: s.desc
    }))
  }
}

export function breadcrumbNode(trail) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      item: absoluteUrl(t.path)
    }))
  }
}

/** Wraps nodes into the single @graph document that gets serialised into the page. */
export function graph(nodes) {
  return { '@context': 'https://schema.org', '@graph': nodes.filter(Boolean) }
}
