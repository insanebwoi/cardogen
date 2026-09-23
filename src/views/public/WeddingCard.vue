<template>
  <!-- Branded status screens: a dead or switched-off link still looks like Cardogen. -->
  <div v-if="notFound || revoked" class="status-page">
    <div class="status-bg" aria-hidden="true">
      <span class="sb-blob sb-blob-a"></span>
      <span class="sb-blob sb-blob-b"></span>
    </div>

    <RouterLink to="/" class="status-brand">
      <span class="sb-mark"><Icon name="Heart" size="16" /></span>
      <span class="sb-word">Cardogen</span>
    </RouterLink>

    <div class="status-card">
      <span class="status-icon" :class="revoked ? 'is-revoked' : 'is-missing'">
        <Icon :name="revoked ? 'Lock' : 'HeartCrack'" size="26" />
      </span>

      <template v-if="revoked">
        <h1 class="status-title">This invitation is no longer available</h1>
        <p class="status-names">{{ invitation.brideName }} &amp; {{ invitation.groomName }}</p>
        <p class="status-text">
          The couple have turned this card off, so it can't be opened right now.
          If you think that's a mistake, please reach out to them — they can switch it back on any time.
        </p>
      </template>

      <template v-else>
        <h1 class="status-title">Invitation not found</h1>
        <p class="status-text">
          This link doesn't match any invitation. Check that it was copied in full —
          links look like <code class="status-code">{{ origin }}/w/your-link</code>
        </p>
      </template>

      <div class="status-actions">
        <RouterLink to="/" class="btn btn-primary btn-sm">
          <Icon name="Sparkles" size="16" />
          Create your own invitation
        </RouterLink>
        <RouterLink to="/" class="status-link">Go to Cardogen home</RouterLink>
      </div>
    </div>

    <p class="status-foot">Free digital wedding invitations · Share one link · Collect RSVPs</p>
  </div>

  <!-- Sealed until the guest asks for it, then the envelope unfolds. -->
  <div
    v-else-if="phase !== 'done'"
    class="card-loading"
    :class="[`theme-${loaderTheme}`, phase]"
    :role="phase === 'sealed' ? 'button' : null"
    :tabindex="phase === 'sealed' ? 0 : null"
    @click="unfold"
    @keydown.enter.space.prevent="unfold"
  >
    <div class="envelope" aria-hidden="true">
      <div class="env-body"></div>
      <div class="env-flap-back"></div>
      <div class="env-letter">
        <span class="lt-line lt-line-1"></span>
        <span class="lt-line lt-line-2"></span>
        <span class="lt-heart"><Icon name="Heart" size="16" /></span>
        <span class="lt-line lt-line-3"></span>
      </div>
      <div class="env-flap"></div>
      <div class="env-seal"><Icon name="Heart" size="14" /></div>
    </div>

    <p class="loading-text">{{ phase === 'sealed' ? 'You have an invitation waiting' : loadingText }}</p>

    <button v-if="phase === 'sealed'" type="button" class="unfold-btn" @click.stop="unfold">
      <Icon name="MailOpen" size="18" />
      Click here to unfold the card
    </button>

    <p class="gate-credit">Powered by <strong>Cardogen</strong></p>

    <div
      v-if="phase === 'unfolding' && music.downloading.value"
      class="music-progress"
      :class="{ indeterminate: music.streaming.value && !music.progress.value }"
      aria-hidden="true"
    >
      <span class="mp-fill" :style="{ width: Math.round(music.progress.value * 100) + '%' }"></span>
    </div>
  </div>

  <div v-else class="wedding-card-page">
    <TemplateRenderer :templateId="invitation.templateId" :invitation="invitation" />

    <button
      v-if="hasMusic"
      class="music-fab"
      data-music-control
      :class="{ paused: !music.playing.value }"
      @click="music.toggle()"
      :title="music.playing.value ? `Turn off ${invitation.musicName || 'music'}` : `Turn on ${invitation.musicName || 'music'}`"
      :aria-label="music.playing.value ? 'Turn music off' : 'Turn music on'"
    >
      <Icon :name="music.playing.value ? 'Volume2' : 'VolumeX'" size="18" />
      <span class="eq" aria-hidden="true"><i></i><i></i><i></i></span>
    </button>
  </div>
</template>

<script setup>
import { computed, watch, onMounted, onBeforeUnmount, ref } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useInvitationStore } from '@/stores/invitationStore'
import TemplateRenderer from '@/components/templates/TemplateRenderer.vue'
import { useInvitationAudio } from '@/composables/useInvitationAudio'

const route = useRoute()
const origin = typeof window !== 'undefined' ? window.location.origin : 'cardogen.app'
const invitationStore = useInvitationStore()
const { currentInvitation: invitation } = storeToRefs(invitationStore)

const music = useInvitationAudio()
const loading = ref(true)

// 'sealed' → waiting for the guest's click · 'unfolding' → animation + loading · 'done' → the card
const phase = ref('sealed')
let dataReady = null
// Treat a missing isActive as live — only an explicit false revokes a card.
const isLive = computed(() => !!invitation.value && invitation.value.isActive !== false)
const hasMusic = computed(() => !!(
  isLive.value && invitation.value?.musicEnabled &&
  invitation.value?.musicUrl && !music.failed.value))
// Errors only make sense once the lookup has finished.
const notFound = computed(() => !loading.value && !invitation.value)
const revoked = computed(() => !loading.value && !!invitation.value && !isLive.value)
const loadingText = computed(() =>
  music.downloading.value
    ? `Loading ${invitation.value?.musicName || 'your song'}…`
    : 'Unfolding your invitation')

const TEMPLATE_THEME = {
  'royal-gold': 'gold',
  'floral-dream': 'pink',
  'minimal-white': 'minimal',
  'traditional-classic': 'green',
  'modern-love': 'purple',
  'ios-glass': 'glass'
}

const loaderTheme = computed(() => {
  const id = invitation.value?.templateId
  if (!id) return 'pink'
  return TEMPLATE_THEME[id] || invitation.value?.theme || 'pink'
})

const THEME_CLASSES = ['pink', 'gold', 'minimal', 'green', 'purple'].map((t) => `card-theme-${t}`)

/**
 * The guest is looking at the couple's template, so the chrome around it —
 * toasts, buttons — follows that palette instead of the Cardogen rose.
 * Set on <body> because toasts render outside this component.
 */
function applyTheme(theme) {
  document.body.classList.remove(...THEME_CLASSES)
  if (theme) document.body.classList.add(`card-theme-${theme}`)
}

watch(loaderTheme, applyTheme, { immediate: true })
onBeforeUnmount(() => document.body.classList.remove(...THEME_CLASSES))

/**
 * The click is what lets the audio play, so start() runs inside the handler.
 * The envelope animates for at least a beat even if everything is cached.
 */
function unfold() {
  if (phase.value !== 'sealed') return
  phase.value = 'unfolding'
  if (hasMusic.value) music.start()

  const startedAt = Date.now()
  Promise.resolve(dataReady).then(() => {
    // Music that was still downloading when the guest clicked starts now.
    if (hasMusic.value && !music.playing.value) music.start()
    const remaining = Math.max(0, 2600 - (Date.now() - startedAt))
    setTimeout(() => { phase.value = 'done' }, remaining)
  })
}

onMounted(() => {
  dataReady = load()
})

async function load() {
  try {
    await invitationStore.fetchByShortCode(route.params.shortCode)
    if (!invitation.value) return
    document.title = `${invitation.value.brideName} & ${invitation.value.groomName} — Wedding Invitation`

    const inv = invitation.value
    if (isLive.value && inv.musicEnabled && inv.musicUrl) {
      await music.prepare(inv.musicUrl, {
        start: inv.musicStart || 0,
        end: inv.musicEnd || 0,
        loop: inv.musicLoop !== false
      })
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.card-loading, .card-not-found {
  position: relative;
  min-height: 100vh; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  background: radial-gradient(ellipse at center, var(--ld-bg-0) 0%, var(--ld-bg-1) 55%, var(--ld-bg-2) 100%);
  transition: background 0.6s ease;
}

/* Theme palettes — drive every loader color via CSS vars */
.card-loading.theme-pink {
  --ld-bg-0: #fff5f8; --ld-bg-1: #fde4ef; --ld-bg-2: #fbd0e1;
  --ld-body: linear-gradient(135deg, #fff 0%, #fef7fb 100%);
  --ld-body-wall: #fef7fb;
  --ld-flap-back: #fce7f3;
  --ld-flap: #fbcfe8;
  --ld-letter: linear-gradient(180deg, #ffffff 0%, #fff8fb 100%);
  --ld-line: linear-gradient(90deg, #fbcfe8, #f9a8d4, #fbcfe8);
  --ld-heart: #ec4899;
  --ld-seal: linear-gradient(135deg, #f43f5e, #ec4899);
  --ld-seal-shadow: rgba(244, 63, 94, 0.45);
  --ld-shadow: rgba(190, 24, 93, 0.25);
  --ld-shadow-soft: rgba(236, 72, 153, 0.12);
  --ld-text: #be185d;
}
.card-loading.theme-gold {
  --ld-bg-0: #2d1810; --ld-bg-1: #1a0a00; --ld-bg-2: #0d0500;
  --ld-body: linear-gradient(135deg, #2a1a08 0%, #1a0f04 100%);
  --ld-body-wall: #241505;
  --ld-flap-back: #3a2410;
  --ld-flap: linear-gradient(135deg, #d4af37, #b8860b);
  --ld-letter: linear-gradient(180deg, #fef7e0 0%, #f5e6c8 100%);
  --ld-line: linear-gradient(90deg, #d4af37, #f5e6c8, #d4af37);
  --ld-heart: #d4af37;
  --ld-seal: linear-gradient(135deg, #d4af37, #8b6914);
  --ld-seal-shadow: rgba(212, 175, 55, 0.5);
  --ld-shadow: rgba(0, 0, 0, 0.6);
  --ld-shadow-soft: rgba(212, 175, 55, 0.2);
  --ld-text: #d4af37;
}
.card-loading.theme-minimal {
  --ld-bg-0: #fafaf9; --ld-bg-1: #f5f5f4; --ld-bg-2: #e7e5e4;
  --ld-body: linear-gradient(135deg, #ffffff 0%, #fafaf9 100%);
  --ld-body-wall: #fafaf9;
  --ld-flap-back: #e7e5e4;
  --ld-flap: #d6d3d1;
  --ld-letter: linear-gradient(180deg, #ffffff 0%, #fafaf9 100%);
  --ld-line: linear-gradient(90deg, #e7e5e4, #a8a29e, #e7e5e4);
  --ld-heart: #292524;
  --ld-seal: linear-gradient(135deg, #44403c, #1c1917);
  --ld-seal-shadow: rgba(28, 25, 23, 0.35);
  --ld-shadow: rgba(0, 0, 0, 0.15);
  --ld-shadow-soft: rgba(0, 0, 0, 0.08);
  --ld-text: #57534e;
}
.card-loading.theme-green {
  --ld-bg-0: #064e3b; --ld-bg-1: #065f46; --ld-bg-2: #047857;
  --ld-body: linear-gradient(135deg, #065f46 0%, #064e3b 100%);
  --ld-body-wall: #05402e;
  --ld-flap-back: #047857;
  --ld-flap: linear-gradient(135deg, #10b981, #059669);
  --ld-letter: linear-gradient(180deg, #ecfdf5 0%, #d1fae5 100%);
  --ld-line: linear-gradient(90deg, #a7f3d0, #6ee7b7, #a7f3d0);
  --ld-heart: #f43f5e;
  --ld-seal: linear-gradient(135deg, #10b981, #047857);
  --ld-seal-shadow: rgba(16, 185, 129, 0.5);
  --ld-shadow: rgba(0, 0, 0, 0.5);
  --ld-shadow-soft: rgba(110, 231, 183, 0.2);
  --ld-text: #a7f3d0;
}
.card-loading.theme-glass {
  --ld-bg-0: #131a2c; --ld-bg-1: #0b0f1c; --ld-bg-2: #06070c;
  --ld-body: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.04));
  --ld-body-wall: rgba(255,255,255,0.07);
  --ld-flap-back: rgba(255,255,255,0.09);
  --ld-flap: linear-gradient(135deg, rgba(61,139,255,0.55), rgba(122,92,255,0.5));
  --ld-letter: linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.06) 100%);
  --ld-line: linear-gradient(90deg, rgba(111,180,255,0.3), #6fb4ff, rgba(111,180,255,0.3));
  --ld-heart: #6fb4ff;
  --ld-seal: linear-gradient(135deg, #3d8bff, #7a5cff);
  --ld-seal-shadow: rgba(80, 130, 255, 0.55);
  --ld-shadow: rgba(0, 0, 0, 0.7);
  --ld-shadow-soft: rgba(111, 180, 255, 0.16);
  --ld-text: #a9c4ee;
}
.card-loading.theme-purple {
  --ld-bg-0: #1e1033; --ld-bg-1: #140a22; --ld-bg-2: #0f0a1a;
  --ld-body: linear-gradient(135deg, #2a1a4a 0%, #1a1030 100%);
  --ld-body-wall: #1e1538;
  --ld-flap-back: #2a1a4a;
  --ld-flap: linear-gradient(135deg, #a855f7, #7c3aed);
  --ld-letter: linear-gradient(180deg, #f5f3ff 0%, #ede9fe 100%);
  --ld-line: linear-gradient(90deg, #c4b5fd, #a78bfa, #c4b5fd);
  --ld-heart: #e879f9;
  --ld-seal: linear-gradient(135deg, #a855f7, #6d28d9);
  --ld-seal-shadow: rgba(168, 85, 247, 0.55);
  --ld-shadow: rgba(0, 0, 0, 0.6);
  --ld-shadow-soft: rgba(168, 85, 247, 0.25);
  --ld-text: #c4b5fd;
}

.envelope {
  position: relative;
  width: 180px;
  height: 120px;
  perspective: 900px;
  transform-style: preserve-3d;
}

.env-body {
  position: absolute; inset: 0;
  background: var(--ld-body);
  border-radius: 6px;
  box-shadow:
    0 20px 50px -12px var(--ld-shadow),
    0 0 0 1px var(--ld-shadow-soft);
  transition: background 0.6s ease, box-shadow 0.6s ease;
}
.env-body::before,
.env-body::after {
  content: ''; position: absolute; bottom: 0;
  width: 0; height: 0;
  border-style: solid;
}
.env-body::before {
  left: 0;
  border-width: 0 0 120px 90px;
  border-color: transparent transparent var(--ld-body-wall) transparent;
  filter: brightness(0.95);
}
.env-body::after {
  right: 0;
  border-width: 0 90px 120px 0;
  border-color: transparent var(--ld-body-wall) transparent transparent;
  filter: brightness(0.95);
}

.env-flap-back {
  position: absolute; top: 0; left: 0; right: 0;
  width: 0; height: 0; margin: 0 auto;
  border-style: solid;
  border-width: 70px 90px 0 90px;
  border-color: var(--ld-flap-back) transparent transparent transparent;
  z-index: 1;
}

.env-letter {
  position: absolute; left: 10px; right: 10px; bottom: 10px;
  height: 96px;
  background: var(--ld-letter);
  border-radius: 4px;
  box-shadow: 0 4px 14px var(--ld-shadow-soft);
  z-index: 2;
  padding: 14px 18px;
  display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 8px;
  transform: translateY(0);
  animation: letter-rise 2.6s cubic-bezier(0.22, 1, 0.36, 1) infinite;
  transition: background 0.6s ease;
}
.lt-line {
  display: block; height: 3px; border-radius: 2px;
  background: var(--ld-line);
  background-size: 200% 100%;
  animation: shimmer 2s linear infinite;
}
.lt-line-1 { width: 70%; }
.lt-line-2 { width: 50%; }
.lt-line-3 { width: 60%; }
.lt-heart {
  color: var(--ld-heart);
  animation: heart-beat 1.4s ease-in-out infinite;
}

.env-flap {
  position: absolute; top: 0; left: 0; right: 0;
  width: 180px; height: 70px; margin: 0 auto;
  clip-path: polygon(0 0, 100% 0, 50% 100%);
  background: var(--ld-flap);
  transform-origin: top center;
  transform: rotateX(0deg);
  animation: flap-open 2.6s cubic-bezier(0.22, 1, 0.36, 1) infinite;
  z-index: 3;
  filter: drop-shadow(0 2px 3px var(--ld-shadow-soft));
  transition: background 0.6s ease;
}

.env-seal {
  position: absolute; top: 48px; left: 50%; transform: translate(-50%, -50%) scale(1);
  width: 28px; height: 28px; border-radius: 50%;
  background: var(--ld-seal);
  color: white;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 12px var(--ld-seal-shadow);
  z-index: 4;
  animation: seal-pop 2.6s cubic-bezier(0.22, 1, 0.36, 1) infinite;
}

@keyframes flap-open {
  0%, 10% { transform: rotateX(0deg); }
  40%, 60% { transform: rotateX(-180deg); }
  90%, 100% { transform: rotateX(0deg); }
}

@keyframes letter-rise {
  0%, 15% { transform: translateY(30px) scale(0.96); opacity: 0.6; }
  45%, 60% { transform: translateY(-38px) scale(1); opacity: 1; }
  85%, 100% { transform: translateY(30px) scale(0.96); opacity: 0.6; }
}

@keyframes seal-pop {
  0%, 8% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  12%, 60% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
  88%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
}

@keyframes heart-beat {
  0%, 100% { transform: scale(1); }
  30% { transform: scale(1.2); }
  60% { transform: scale(0.95); }
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.loading-text {
  margin-top: 40px;
  color: var(--ld-text);
  transition: color 0.6s ease;
  font-family: var(--font-display, 'Playfair Display', Georgia, serif);
  font-size: 1rem;
  font-style: italic;
  letter-spacing: 0.08em;
  opacity: 0.85;
  animation: text-fade 2.6s ease-in-out infinite;
}

@keyframes text-fade { 0%, 100% { opacity: 0.55; } 50% { opacity: 1; } }

@media (prefers-reduced-motion: reduce) {
  .env-flap, .env-letter, .env-seal, .lt-heart, .lt-line, .loading-text { animation: none; }
  .env-flap { transform: rotateX(-180deg); }
}

.gate-credit {
  position: absolute; bottom: max(18px, env(safe-area-inset-bottom));
  left: 0; right: 0;
  font-size: 0.7rem; letter-spacing: 0.08em;
  color: var(--ld-text); opacity: 0.45;
}
.gate-credit strong { font-weight: 700; }

/* Sealed: the envelope waits, still and closed, until it is clicked. */
.card-loading.sealed { cursor: pointer; padding: 40px 24px; text-align: center; }
.card-loading.sealed .env-flap,
.card-loading.sealed .env-letter,
.card-loading.sealed .env-seal,
.card-loading.sealed .lt-line,
.card-loading.sealed .lt-heart,
.card-loading.sealed .loading-text { animation: none; }
.card-loading.sealed .envelope { animation: seal-float 4s ease-in-out infinite; }
.card-loading.sealed .env-letter { transform: translateY(6px) scale(0.97); }
.card-loading.sealed .loading-text { opacity: 0.85; }
.card-loading.sealed:hover .env-flap { transform: rotateX(-24deg); }
.card-loading.sealed .env-flap { transition: transform 0.5s ease; }

@keyframes seal-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.unfold-btn {
  margin-top: 26px;
  display: inline-flex; align-items: center; gap: 9px;
  padding: 14px 28px; border: none; border-radius: 99px; cursor: pointer;
  background: var(--ld-seal); color: white;
  font-size: 0.92rem; font-weight: 600; letter-spacing: 0.02em;
  box-shadow: 0 10px 30px var(--ld-seal-shadow);
  animation: unfold-pulse 2.4s ease-in-out infinite;
  transition: transform 0.2s;
}
.unfold-btn:hover { transform: translateY(-2px); }

@keyframes unfold-pulse {
  0%, 100% { box-shadow: 0 10px 30px var(--ld-seal-shadow), 0 0 0 0 var(--ld-seal-shadow); }
  50% { box-shadow: 0 10px 30px var(--ld-seal-shadow), 0 0 0 16px transparent; }
}

@media (prefers-reduced-motion: reduce) {
  .card-loading.sealed .envelope, .unfold-btn { animation: none; }
}

.music-progress {
  margin-top: 18px; width: 180px; height: 4px; border-radius: 99px;
  background: var(--ld-shadow-soft); overflow: hidden;
}
.mp-fill {
  display: block; height: 100%; border-radius: 99px;
  background: var(--ld-seal); transition: width 0.2s ease;
}

/* A CORS-blocked host gives no byte counts — show motion, not a stuck 0%. */
.music-progress.indeterminate .mp-fill {
  width: 40% !important;
  animation: mp-slide 1.1s ease-in-out infinite;
}
@keyframes mp-slide {
  0% { transform: translateX(-110%); }
  100% { transform: translateX(260%); }
}

/* Floating music control on the open card */
.music-fab {
  position: fixed; right: 18px; bottom: 18px; z-index: 60;
  display: inline-flex; align-items: center; gap: 8px;
  padding: 11px 14px; border: none; border-radius: 99px; cursor: pointer;
  background: rgba(20, 16, 28, 0.78); color: white;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 26px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s, background 0.2s;
}
.music-fab:hover { transform: translateY(-2px); background: var(--brand-accent); }

.eq { display: inline-flex; align-items: flex-end; gap: 2px; height: 14px; }
.eq i { width: 2.5px; border-radius: 2px; background: currentColor; height: 40%; animation: eq-bounce 0.9s ease-in-out infinite; }
.eq i:nth-child(2) { animation-delay: 0.15s; }
.eq i:nth-child(3) { animation-delay: 0.3s; }
.music-fab.paused .eq i { animation-play-state: paused; height: 25%; }

@keyframes eq-bounce { 0%, 100% { height: 30%; } 50% { height: 100%; } }

@media (prefers-reduced-motion: reduce) {
  .eq i { animation: none; }
}

/* ============ Branded status screens ============ */
.status-page {
  position: relative; min-height: 100vh; min-height: 100dvh;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 22px; padding: 32px 20px max(32px, env(safe-area-inset-bottom));
  background: linear-gradient(170deg, #fff8fa 0%, #fff 45%, #fff5f7 100%);
  text-align: center; overflow: hidden;
}
.status-bg { position: absolute; inset: 0; pointer-events: none; }
.sb-blob { position: absolute; border-radius: 50%; filter: blur(70px); opacity: 0.5; }
.sb-blob-a { width: 320px; height: 320px; top: -90px; left: -80px; background: var(--rose-200); }
.sb-blob-b { width: 280px; height: 280px; bottom: -80px; right: -70px; background: var(--gold-200); }

.status-brand { position: relative; display: inline-flex; align-items: center; gap: 9px; font-weight: 700; font-size: 1.15rem; }
.sb-mark {
  width: 30px; height: 30px; border-radius: 9px;
  display: inline-flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, var(--rose-500), var(--rose-700));
  color: white; box-shadow: 0 4px 12px rgba(244, 63, 94, 0.3);
}
.sb-word {
  background: linear-gradient(135deg, var(--rose-500), var(--rose-700));
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
}

.status-card {
  position: relative; width: 100%; max-width: 440px;
  background: rgba(255,255,255,0.86); backdrop-filter: blur(12px);
  border: 1px solid var(--rose-100); border-radius: 22px;
  padding: 34px 26px; box-shadow: var(--shadow-lg);
}
.status-icon {
  width: 62px; height: 62px; border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  margin-bottom: 18px;
}
.status-icon.is-revoked { background: var(--rose-50); color: var(--rose-600); }
.status-icon.is-missing { background: var(--gray-100); color: var(--gray-500); }

.status-title {
  font-family: var(--font-display); font-weight: 600;
  font-size: clamp(1.25rem, 5.2vw, 1.55rem); line-height: 1.3;
  color: var(--gray-900);
}
.status-names {
  margin-top: 10px; font-family: var(--font-script);
  font-size: clamp(1.4rem, 6vw, 1.8rem); color: var(--rose-600);
}
.status-text {
  margin-top: 12px; color: var(--gray-500);
  font-size: 0.9rem; line-height: 1.65;
}
.status-code {
  display: inline-block; margin-top: 6px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.78rem; color: var(--rose-700);
  background: var(--rose-50); padding: 3px 8px; border-radius: 6px;
  overflow-wrap: anywhere;
}

.status-actions {
  margin-top: 26px; display: flex; flex-direction: column;
  align-items: center; gap: 12px;
}
.status-actions .btn { width: 100%; max-width: 280px; }
.status-link { font-size: 0.82rem; color: var(--gray-500); text-decoration: underline; text-underline-offset: 3px; }
.status-link:hover { color: var(--rose-600); }

.status-foot {
  position: relative; font-size: 0.75rem; color: var(--gray-400);
  letter-spacing: 0.02em; max-width: 34ch;
}

@media (max-width: 420px) {
  .status-card { padding: 28px 20px; border-radius: 18px; }
  .sb-blob-a, .sb-blob-b { filter: blur(50px); }
}
.card-not-found h2 { margin-top: 16px; font-family: var(--font-display); color: var(--gray-800); }

@media (max-width: 600px) {
  .card-loading, .card-not-found { min-height: 100dvh; padding: 28px 20px; }
  .envelope { width: 150px; height: 100px; }
  .env-flap, .env-flap-back { width: 150px; }
  .env-flap-back { border-width: 58px 75px 0 75px; }
  .env-flap { height: 58px; }
  .env-body::before { border-width: 0 0 100px 75px; }
  .env-body::after { border-width: 0 75px 100px 0; }
  .env-letter { height: 80px; padding: 12px 14px; }
  .loading-text { margin-top: 30px; font-size: 0.92rem; }
  .unfold-btn { margin-top: 22px; padding: 13px 22px; font-size: 0.86rem; }

  .music-fab {
    right: 14px;
    bottom: max(14px, env(safe-area-inset-bottom));
    padding: 10px 12px;
  }
}
.card-not-found p { color: var(--gray-500); margin-top: 8px; }
</style>
