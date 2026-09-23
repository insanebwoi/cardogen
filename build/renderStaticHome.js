/**
 * Renders the landing copy as plain semantic HTML, baked into dist/index.html
 * at build time.
 *
 * Why this exists: Cardogen is client-rendered, so the served document is an
 * empty <div id="app">. Googlebot executes JavaScript and copes, but the
 * answer-engine crawlers — GPTBot, ClaudeBot, PerplexityBot, Bingbot's older
 * paths — largely do not, and would index a blank page. This gives them the
 * real words.
 *
 * It is not cloaking: the markup is generated from src/seo/content.js, the
 * same module HomePage.vue renders from, so crawler and visitor get the same
 * content. Vue clears #app on mount and takes over for anyone with JS.
 */
import { HERO, FEATURES, STEPS, FAQS, HIGHLIGHTS, CTA } from '../src/seo/content.js'
import { SITE } from '../src/seo/siteConfig.js'

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

export function renderStaticHome() {
  return `
    <div id="seo-static-home">
      <header>
        <p>${esc(HERO.pill)}</p>
        <h1>${esc(HERO.headlineLead)} ${esc(HERO.headlineEm)}</h1>
        <p>${esc(HERO.sub)}</p>
        <p><a href="/login">${esc(HERO.ctaPrimary)}</a></p>
      </header>

      <section>
        <h2>Why couples use ${esc(SITE.name)}</h2>
        <ul>
          ${HIGHLIGHTS.map((h) => `<li>${esc(h)}</li>`).join('\n          ')}
        </ul>
      </section>

      <section>
        <h2>Everything you need. Nothing you don't.</h2>
        ${FEATURES.map(
          (f) => `<article>
            <h3>${esc(f.title)}</h3>
            <p>${esc(f.desc)}</p>
          </article>`
        ).join('\n        ')}
      </section>

      <section>
        <h2>How to create a wedding invitation card online</h2>
        <ol>
          ${STEPS.map(
            (s) => `<li>
            <h3>${esc(s.title)}</h3>
            <p>${esc(s.desc)}</p>
          </li>`
          ).join('\n          ')}
        </ol>
      </section>

      <section>
        <h2>Frequently asked questions</h2>
        ${FAQS.map(
          (f) => `<article>
            <h3>${esc(f.q)}</h3>
            <p>${esc(f.a)}</p>
          </article>`
        ).join('\n        ')}
      </section>

      <section>
        <h2>${esc(CTA.heading)}</h2>
        <p>${esc(CTA.sub)}</p>
        <p><a href="/login">${esc(CTA.button)}</a></p>
      </section>
    </div>`
}
