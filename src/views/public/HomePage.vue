<template>
  <div class="home">
    <!-- HERO -->
    <section class="hero">
      <div class="hero-grid-bg" aria-hidden="true"></div>
      <div class="hero-blob hero-blob-a" aria-hidden="true"></div>
      <div class="hero-blob hero-blob-b" aria-hidden="true"></div>

      <div class="hero-inner">
        <span class="hero-pill">
          <span class="hero-pill-dot"></span>
          Free forever · No credit card
        </span>

        <h1 class="hero-headline">
          {{ HERO.headlineLead }}<br />
          <em>{{ HERO.headlineEm }}</em>
        </h1>

        <p class="hero-sub">{{ HERO.sub }}</p>

        <div class="hero-cta">
          <RouterLink to="/login" class="btn-primary">
            Start creating
            <Icon name="ArrowRight" size="16" />
          </RouterLink>
          <a href="#how" class="btn-ghost">How it works</a>
        </div>

        <!-- Card mock-ups stack -->
        <div class="hero-mocks" aria-hidden="true">
          <div class="mock mock-1">
            <div class="mock-dot"></div>
            <p class="mock-eyebrow">The wedding of</p>
            <p class="mock-names">Priya <span>&</span> Arjun</p>
            <div class="mock-line"></div>
            <p class="mock-meta">12 · 07 · 2026</p>
          </div>
          <div class="mock mock-2">
            <p class="mock-eyebrow">Save the date</p>
            <p class="mock-names mock-names-script">Sara <span>&</span> Omar</p>
            <div class="mock-line"></div>
            <p class="mock-meta">The Grand · 6:30 PM</p>
          </div>
          <div class="mock mock-3">
            <div class="mock-seal"><Icon name="Heart" size="12" /></div>
            <p class="mock-eyebrow">You're invited</p>
            <p class="mock-names">Grace <span>&</span> Daniel</p>
            <div class="mock-line"></div>
            <p class="mock-meta">Garden Terrace</p>
          </div>
        </div>
      </div>
    </section>

    <!-- FEATURES -->
    <section class="features" id="features">
      <div class="section-head">
        <span class="section-kicker">Features</span>
        <h2>Everything you need.<br />Nothing you don't.</h2>
      </div>

      <div class="feature-grid">
        <div v-for="f in features" :key="f.title" class="feature">
          <div class="feature-ico"><Icon :name="f.icon" size="20" /></div>
          <h3>{{ f.title }}</h3>
          <p>{{ f.desc }}</p>
        </div>
      </div>
    </section>

    <!-- HOW -->
    <section class="how" id="how">
      <div class="section-head">
        <span class="section-kicker">How it works</span>
        <h2>Three steps. One link.</h2>
      </div>

      <ol class="steps">
        <li v-for="(s, i) in steps" :key="s.title" class="step">
          <span class="step-num">{{ String(i + 1).padStart(2, '0') }}</span>
          <h3>{{ s.title }}</h3>
          <p>{{ s.desc }}</p>
        </li>
      </ol>
    </section>

    <!-- FAQ — visible on the page, and mirrored into FAQPage structured data. -->
    <section class="faq" id="faq" aria-labelledby="faq-heading">
      <div class="section-head">
        <span class="section-kicker">FAQ</span>
        <h2 id="faq-heading">Questions, answered.</h2>
      </div>

      <ul class="faq-list">
        <li v-for="(f, i) in FAQS" :key="f.q" class="faq-item" :class="{ open: openFaq === i }">
          <h3 class="faq-q-wrap">
            <button
              class="faq-q"
              :aria-expanded="openFaq === i"
              :aria-controls="`faq-a-${i}`"
              @click="toggleFaq(i)"
            >
              <span>{{ f.q }}</span>
              <Icon name="ChevronDown" size="18" class="faq-chevron" />
            </button>
          </h3>
          <div :id="`faq-a-${i}`" class="faq-a" role="region">
            <p>{{ f.a }}</p>
          </div>
        </li>
      </ul>
    </section>

    <!-- CTA -->
    <section class="cta">
      <div class="cta-card">
        <h2>{{ CTA.heading }}</h2>
        <p>{{ CTA.sub }}</p>
        <RouterLink to="/login" class="btn-primary">
          Get started
          <Icon name="ArrowRight" size="16" />
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
// Shared with the build-time static renderer so the crawlable HTML in
// dist/index.html can never drift from what this component shows.
import { HERO, FEATURES as features, STEPS as steps, FAQS, CTA } from '@/seo/content'

// First answer open: the page should show an answer, not a wall of closed rows.
const openFaq = ref(0)
function toggleFaq(i) { openFaq.value = openFaq.value === i ? -1 : i }
</script>

<style scoped>
:root { color-scheme: light; }

.home { color: #0a0a0a; line-height: 1.5; }

/* ================ HERO ================ */
.hero {
  position: relative; overflow: hidden;
  padding: 80px 20px 100px;
  background: #fafaf9;
  isolation: isolate;
}
.hero-grid-bg {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(to right, rgba(10,10,10,0.04) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(10,10,10,0.04) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse at center, black 40%, transparent 75%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 40%, transparent 75%);
  z-index: -2;
}
.hero-blob { position: absolute; border-radius: 50%; filter: blur(90px); opacity: 0.55; z-index: -1; }
.hero-blob-a { width: 420px; height: 420px; background: #fecdd3; top: -120px; right: -80px; }
.hero-blob-b { width: 360px; height: 360px; background: #ddd6fe; bottom: -120px; left: -80px; }

.hero-inner { max-width: 820px; margin: 0 auto; text-align: center; }

.hero-pill {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 6px 14px; border-radius: 100px;
  background: white; border: 1px solid rgba(10,10,10,0.08);
  font-size: 12px; font-weight: 500; color: #404040;
  box-shadow: 0 1px 2px rgba(10,10,10,0.04);
}
.hero-pill-dot {
  width: 6px; height: 6px; border-radius: 50%; background: #10b981;
  box-shadow: 0 0 0 3px rgba(16,185,129,0.18);
}

.hero-headline {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(2.6rem, 7vw, 4.6rem);
  line-height: 1.02;
  letter-spacing: -0.035em;
  font-weight: 500;
  color: #0a0a0a;
  margin: 28px 0 20px;
}
.hero-headline em {
  font-style: italic;
  background: linear-gradient(135deg, #f43f5e 0%, #d946ef 55%, #8b5cf6 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}

.hero-sub {
  max-width: 520px; margin: 0 auto;
  font-size: 1.05rem; color: #525252;
}

.hero-cta {
  display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;
  margin-top: 32px;
}

.btn-primary, .btn-ghost {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 13px 22px;
  border-radius: 100px;
  font-size: 0.92rem; font-weight: 600;
  transition: transform 0.15s ease, background 0.2s ease, box-shadow 0.2s ease;
  text-decoration: none;
}
.btn-primary {
  background: #0a0a0a; color: white;
  box-shadow: 0 1px 0 rgba(255,255,255,0.1) inset, 0 10px 30px -10px rgba(10,10,10,0.5);
}
.btn-primary:hover { transform: translateY(-1px); background: #171717; }
.btn-ghost {
  background: white; color: #0a0a0a; border: 1px solid rgba(10,10,10,0.1);
}
.btn-ghost:hover { background: #f5f5f4; }

/* Floating mocks */
.hero-mocks {
  margin-top: 80px;
  position: relative; height: 360px;
  max-width: 720px; margin-left: auto; margin-right: auto;
}
.mock {
  position: absolute; top: 0; left: 50%;
  width: 220px; padding: 28px 22px;
  background: white; border-radius: 20px;
  border: 1px solid rgba(10,10,10,0.06);
  box-shadow: 0 30px 60px -20px rgba(10,10,10,0.2), 0 10px 20px -10px rgba(10,10,10,0.1);
  text-align: center;
  transition: transform 0.3s ease;
}
.mock-1 {
  transform: translateX(-50%) translateX(-170px) rotate(-7deg) translateY(20px);
  z-index: 1;
}
.mock-2 {
  transform: translateX(-50%) rotate(0deg);
  z-index: 3;
  background: linear-gradient(180deg, #1a0a00 0%, #2d1810 100%);
  color: #f5e6c8;
  border-color: rgba(212,175,55,0.3);
}
.mock-3 {
  transform: translateX(-50%) translateX(170px) rotate(7deg) translateY(20px);
  z-index: 2;
  background: linear-gradient(180deg, #fff1f5 0%, #fde4ef 100%);
}
.mock-eyebrow {
  font-size: 0.65rem; letter-spacing: 0.25em; text-transform: uppercase;
  font-weight: 600; opacity: 0.6; margin-bottom: 14px;
}
.mock-names {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.25rem; font-weight: 600; letter-spacing: -0.01em;
  line-height: 1.3;
}
.mock-names-script {
  font-style: italic;
  background: linear-gradient(135deg, #d4af37, #f5e6c8);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.mock-names span { font-style: italic; opacity: 0.6; margin: 0 4px; }
.mock-line { width: 32px; height: 1px; background: currentColor; opacity: 0.2; margin: 12px auto; }
.mock-meta { font-size: 0.75rem; opacity: 0.7; }
.mock-dot { width: 6px; height: 6px; border-radius: 50%; background: #f43f5e; margin: 0 auto 12px; }
.mock-seal {
  width: 26px; height: 26px; border-radius: 50%;
  background: linear-gradient(135deg, #f43f5e, #ec4899);
  color: white;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 12px;
  box-shadow: 0 4px 10px rgba(244,63,94,0.4);
}
.mock { animation: float 6s ease-in-out infinite; }
.mock-2 { animation-delay: -2s; }
.mock-3 { animation-delay: -4s; }
@keyframes float {
  0%, 100% { translate: 0 0; }
  50% { translate: 0 -8px; }
}

/* ================ FEATURES ================ */
.features { padding: 120px 20px; background: white; }
.section-head { max-width: 720px; margin: 0 auto 60px; text-align: center; }
.section-kicker {
  display: inline-block; font-size: 0.72rem; font-weight: 600;
  letter-spacing: 0.25em; text-transform: uppercase; color: #f43f5e;
  margin-bottom: 14px;
}
.section-head h2 {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(1.9rem, 4vw, 2.8rem);
  line-height: 1.08;
  letter-spacing: -0.03em;
  font-weight: 500;
  color: #0a0a0a;
}

.feature-grid {
  max-width: 1080px; margin: 0 auto;
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: rgba(10,10,10,0.08);
  border: 1px solid rgba(10,10,10,0.08);
  border-radius: 16px;
  overflow: hidden;
}
.feature {
  background: white;
  padding: 36px 28px;
  transition: background 0.2s ease;
}
.feature:hover { background: #fafaf9; }
.feature-ico {
  display: inline-flex; align-items: center; justify-content: center;
  width: 40px; height: 40px; border-radius: 10px;
  background: #f5f5f4; color: #0a0a0a;
  margin-bottom: 18px;
}
.feature h3 {
  font-size: 1rem; font-weight: 600; color: #0a0a0a; margin-bottom: 6px;
  letter-spacing: -0.01em;
}
.feature p { font-size: 0.88rem; color: #525252; line-height: 1.6; }

/* ================ HOW ================ */
.how { padding: 120px 20px; background: #0a0a0a; color: white; }
.how .section-head h2 { color: white; }
.how .section-kicker { color: #fda4af; }

.steps {
  max-width: 1080px; margin: 0 auto;
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
  list-style: none; padding: 0;
}
.step {
  padding: 32px 28px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  transition: background 0.2s ease, border-color 0.2s ease;
}
.step:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.15); }
.step-num {
  display: inline-block; font-family: 'Playfair Display', serif;
  font-size: 1.1rem; font-style: italic; color: #fda4af;
  margin-bottom: 16px;
}
.step h3 {
  font-size: 1.05rem; font-weight: 600; margin-bottom: 8px; letter-spacing: -0.01em;
}
.step p { font-size: 0.88rem; color: rgba(255,255,255,0.55); line-height: 1.6; }

/* ================ CTA ================ */
.cta { padding: 100px 20px; background: #fafaf9; }
.cta-card {
  max-width: 720px; margin: 0 auto;
  padding: 56px 40px; border-radius: 24px;
  background: white;
  border: 1px solid rgba(10,10,10,0.08);
  text-align: center;
  box-shadow: 0 40px 80px -30px rgba(10,10,10,0.15);
}
.cta-card h2 {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(1.6rem, 3.5vw, 2.2rem);
  line-height: 1.1; letter-spacing: -0.03em; font-weight: 500;
  color: #0a0a0a; margin-bottom: 10px;
}
.cta-card p { color: #525252; margin-bottom: 28px; font-size: 0.95rem; }

/* ================ FAQ ================ */
.faq { padding: 110px 20px; background: #fafaf9; }
.faq-list {
  max-width: 760px; margin: 48px auto 0;
  list-style: none; padding: 0;
  border-top: 1px solid rgba(10,10,10,0.08);
}
.faq-item { border-bottom: 1px solid rgba(10,10,10,0.08); }

/* The heading carries the button so the question stays a real <h3> in the
   outline — collapsing it into a bare button would hide it from the
   document structure a crawler reads. */
.faq-q-wrap { margin: 0; font-size: inherit; font-weight: inherit; }
.faq-q {
  width: 100%;
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  padding: 22px 4px;
  background: none; border: none; cursor: pointer;
  font-family: inherit; font-size: 1rem; font-weight: 600;
  color: #0a0a0a; text-align: left;
}
.faq-q:hover { color: #f43f5e; }
.faq-q:focus-visible { outline: 2px solid #f43f5e; outline-offset: 2px; border-radius: 6px; }
.faq-chevron { flex: none; color: #737373; transition: transform 0.25s ease; }
.faq-item.open .faq-chevron { transform: rotate(180deg); }

/* Collapsed with a grid row rather than display:none — the text stays in the
   DOM and in the accessibility tree, just clipped. */
.faq-a {
  display: grid; grid-template-rows: 0fr;
  transition: grid-template-rows 0.28s ease;
}
.faq-item.open .faq-a { grid-template-rows: 1fr; }
.faq-a > p {
  overflow: hidden;
  margin: 0; padding: 0 4px;
  color: #525252; line-height: 1.65; font-size: 0.95rem;
  max-width: 62ch;
}
.faq-item.open .faq-a > p { padding-bottom: 24px; }

@media (max-width: 600px) {
  .faq { padding: 80px 16px; }
  .faq-q { font-size: 0.95rem; padding: 20px 2px; }
}

@media (prefers-reduced-motion: reduce) {
  .faq-a { transition: none; }
  .faq-chevron { transition: none; }
}

/* ================ RESPONSIVE ================ */
@media (max-width: 900px) {
  .feature-grid, .steps { grid-template-columns: repeat(2, 1fr); }
  .hero-mocks { height: 300px; }
  .mock { width: 180px; padding: 22px 18px; }
  .mock-1 { transform: translateX(-50%) translateX(-130px) rotate(-8deg) translateY(14px); }
  .mock-3 { transform: translateX(-50%) translateX(130px) rotate(8deg) translateY(14px); }
}
@media (max-width: 600px) {
  .hero { padding: 56px 16px 80px; }
  .features, .how, .cta { padding: 80px 16px; }
  .feature-grid, .steps { grid-template-columns: 1fr; }
  .hero-mocks { height: 280px; margin-top: 60px; }
  .mock { width: 160px; padding: 20px 16px; }
  .mock-1 { transform: translateX(-50%) translateX(-90px) rotate(-8deg) translateY(14px); }
  .mock-3 { transform: translateX(-50%) translateX(90px) rotate(8deg) translateY(14px); }
  .mock-names { font-size: 1.05rem; }
  .cta-card { padding: 40px 24px; }
}

@media (prefers-reduced-motion: reduce) {
  .mock { animation: none; }
}
</style>
