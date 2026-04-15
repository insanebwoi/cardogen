<template>
  <div v-if="loading" class="card-loading" :class="`theme-${loaderTheme}`">
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
    <p class="loading-text">Unfolding your invitation</p>
  </div>
  <div v-else-if="!invitation" class="card-not-found">
    <span><Icon name="HeartCrack" size="32" /></span>
    <h2>Invitation Not Found</h2>
    <p>This invitation may have been removed or is no longer active.</p>
  </div>
  <div v-else class="wedding-card-page">
    <TemplateRenderer :templateId="invitation.templateId" :invitation="invitation" />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useInvitationStore } from '@/stores/invitationStore'
import TemplateRenderer from '@/components/templates/TemplateRenderer.vue'

const route = useRoute()
const invitationStore = useInvitationStore()
const { currentInvitation: invitation, loading } = storeToRefs(invitationStore)

const TEMPLATE_THEME = {
  'royal-gold': 'gold',
  'floral-dream': 'pink',
  'minimal-white': 'minimal',
  'traditional-classic': 'green',
  'modern-love': 'purple'
}

const loaderTheme = computed(() => {
  const id = invitation.value?.templateId
  if (!id) return 'pink'
  return TEMPLATE_THEME[id] || invitation.value?.theme || 'pink'
})

onMounted(async () => {
  await invitationStore.fetchByShortCode(route.params.shortCode)
  if (invitation.value) {
    document.title = `${invitation.value.brideName} & ${invitation.value.groomName} — Wedding Invitation`
  }
})
</script>

<style scoped>
.card-loading, .card-not-found {
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

.card-not-found span { font-size: 4rem; }
.card-not-found h2 { margin-top: 16px; font-family: var(--font-display); color: var(--gray-800); }
.card-not-found p { color: var(--gray-500); margin-top: 8px; }
</style>
