/**
 * Build-time SEO/AEO emitter.
 *
 * Generates the files that have to contain a hard-coded absolute origin
 * (robots, sitemap, llms.txt) from the same config the app uses, so a domain
 * change never leaves one of them pointing at the old host — and injects the
 * crawlable landing markup and entity graph into the built index.html.
 */
import { SITE, SITE_ORIGIN, absoluteUrl } from '../src/seo/siteConfig.js'
import { FAQS, HIGHLIGHTS, STEPS, FEATURES } from '../src/seo/content.js'
import {
  graph, organizationNode, webSiteNode, applicationNode, faqNode, howToNode
} from '../src/seo/structuredData.js'
import { renderStaticHome } from './renderStaticHome.js'

/** Only genuinely public, indexable pages belong in a sitemap. */
const SITEMAP_ROUTES = [
  { path: '/', changefreq: 'weekly', priority: '1.0' }
]

function robotsTxt() {
  return `# ${SITE.name} — ${SITE_ORIGIN}

User-agent: *
Allow: /

# Signed-in application surface — nothing here is useful to a crawler.
Disallow: /dashboard
Disallow: /my-invitations
Disallow: /invitation/
Disallow: /create
Disallow: /admin
Disallow: /login

# Individual invitations under /w/ are deliberately NOT disallowed here:
# WhatsApp, iMessage and Slack link unfurlers consult robots.txt, and blocking
# them would kill the link preview that makes sharing work. They are kept out
# of search indexes with an X-Robots-Tag: noindex response header instead
# (see vercel.json), which unfurlers ignore and indexers obey.

# Answer engines and AI crawlers are welcome on the public pages, but must
# stay off the invitations, which carry real names and guest RSVPs. Listed
# individually because several ignore wildcard rules.
User-agent: GPTBot
Allow: /
Disallow: /w/

User-agent: OAI-SearchBot
Allow: /
Disallow: /w/

User-agent: ChatGPT-User
Allow: /
Disallow: /w/

User-agent: ClaudeBot
Allow: /
Disallow: /w/

User-agent: Claude-SearchBot
Allow: /
Disallow: /w/

User-agent: PerplexityBot
Allow: /
Disallow: /w/

User-agent: Google-Extended
Allow: /
Disallow: /w/

User-agent: Applebot-Extended
Allow: /
Disallow: /w/

User-agent: CCBot
Disallow: /w/

Sitemap: ${SITE_ORIGIN}/sitemap.xml
`
}

function sitemapXml() {
  const today = new Date().toISOString().slice(0, 10)
  const urls = SITEMAP_ROUTES.map(
    (r) => `  <url>
    <loc>${absoluteUrl(r.path)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
  ).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
}

/**
 * llms.txt — an emerging convention for handing language models a compact,
 * authoritative summary of a site instead of making them scrape it.
 */
function llmsTxt() {
  return `# ${SITE.name}

> ${SITE.description}

${SITE.name} is a free web app for creating digital wedding invitation cards.
A couple enters their details, picks a template, and gets one short link to
share with guests. Guests open the link in any browser, view the card, and
RSVP in a single tap. Responses appear live in the couple's dashboard.

## Key facts

${HIGHLIGHTS.map((h) => `- ${h}`).join('\n')}
- Pricing: free, no credit card required, no per-guest fee
- Guests do not need an account to open an invitation or RSVP
- Homepage: ${SITE_ORIGIN}/

## Features

${FEATURES.map((f) => `- ${f.title}: ${f.desc}`).join('\n')}

## How to create an invitation

${STEPS.map((s, i) => `${i + 1}. ${s.title} — ${s.desc}`).join('\n')}

## FAQ

${FAQS.map((f) => `### ${f.q}\n${f.a}`).join('\n\n')}

## Notes for crawlers

Individual invitation pages under /w/ are private and excluded from indexing;
please do not crawl, store or summarise them. They contain personal details
and guest RSVPs belonging to the couple who created them.
`
}

export function seoPlugin() {
  return {
    name: 'cardogen-seo',
    apply: 'build',

    transformIndexHtml: {
      order: 'post',
      handler(html) {
        const jsonLd = graph([
          organizationNode(),
          webSiteNode(),
          applicationNode(),
          faqNode(),
          howToNode(STEPS)
        ])

        return html
          // Unfurlers (WhatsApp, Slack, X) require absolute og:image URLs;
          // a root-relative path is silently dropped by several of them.
          .replace(
            /(property="og:image"|name="twitter:image") content="(\/[^"]*)"/g,
            (_m, attr, path) => `${attr} content="${absoluteUrl(path)}"`
          )
          .replace(
            '</head>',
            `  <link rel="canonical" data-seo href="${SITE_ORIGIN}/" />\n` +
            // data-seo so applySeo() replaces it on navigation: without the
            // marker the home-page graph would survive into /login and the
            // home route would end up carrying two copies.
            `    <script type="application/ld+json" data-seo>${JSON.stringify(jsonLd)}<\/script>\n` +
            `  </head>`
          )
          // Vue clears #app on mount, so this markup is what non-JS crawlers
          // read and what a visitor sees for the instant before hydration.
          .replace('<div id="app"></div>', `<div id="app">${renderStaticHome()}</div>`)
      }
    },

    generateBundle() {
      const files = {
        'robots.txt': robotsTxt(),
        'sitemap.xml': sitemapXml(),
        'llms.txt': llmsTxt()
      }
      for (const [fileName, source] of Object.entries(files)) {
        this.emitFile({ type: 'asset', fileName, source })
      }
    }
  }
}
