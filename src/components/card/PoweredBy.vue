<template>
  <a
    class="powered"
    :class="`pb-${theme}`"
    :href="homeUrl"
    target="_blank"
    rel="noopener"
    aria-label="Create your own invitation with Cardogen"
  >
    <span class="pb-mark"><Icon name="Heart" size="11" /></span>
    <span class="pb-text">Powered by <strong>Cardogen</strong></span>
  </a>
</template>

<script setup>
defineProps({ theme: { type: String, default: 'gold' } })
const homeUrl = typeof window !== 'undefined' ? window.location.origin : '/'
</script>

<style scoped>
.powered {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 18px 16px max(18px, env(safe-area-inset-bottom));
  font-size: 0.72rem; letter-spacing: 0.06em;
  color: var(--pb-text, rgba(245, 230, 200, 0.5));
  background: var(--pb-bg, transparent);
  transition: color 0.25s;
}
.powered:hover { color: var(--pb-accent, #d4af37); }
.pb-text strong { font-weight: 700; letter-spacing: 0.02em; }
.pb-mark {
  display: inline-flex; align-items: center; justify-content: center;
  width: 18px; height: 18px; border-radius: 5px;
  background: var(--pb-accent, #d4af37);
  color: var(--pb-on-accent, #1a0a00);
}

/* One set of variables per card theme. */
.pb-gold { --pb-text: rgba(245,230,200,0.45); --pb-accent: #d4af37; --pb-on-accent: #1a0a00; --pb-bg: #0a0400; }
.pb-pink { --pb-text: rgba(157,23,77,0.5); --pb-accent: #ec4899; --pb-on-accent: #fff; --pb-bg: #fff5f8; }
.pb-minimal { --pb-text: #a8a29e; --pb-accent: #1c1917; --pb-on-accent: #fff; --pb-bg: #fafaf9; }
.pb-green { --pb-text: rgba(167,243,208,0.5); --pb-accent: #10b981; --pb-on-accent: #04301f; --pb-bg: #04291c; }
.pb-glass { --pb-text: rgba(235,238,248,0.42); --pb-accent: #6fb4ff; --pb-on-accent: #06070c; --pb-bg: #06070c; }
.pb-purple { --pb-text: rgba(226,214,255,0.45); --pb-accent: #a855f7; --pb-on-accent: #fff; --pb-bg: #0c0716; }
</style>
