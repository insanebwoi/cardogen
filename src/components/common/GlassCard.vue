<template>
  <component
    :is="tag"
    class="glass-card"
    :class="[`gc-e${elevation}`, { 'gc-interactive': interactive, 'gc-dark': dark }]"
    :style="{ borderRadius: radius + 'px', padding }"
  >
    <slot />
  </component>
</template>

<script setup>
defineProps({
  radius: { type: Number, default: 16 },
  padding: { type: String, default: '24px' },
  /** 1 = nested panel, 2 = standard card, 3 = the piece that floats above everything. */
  elevation: { type: Number, default: 2 },
  /** Lift on hover. Off by default: static panels shouldn't move under the cursor. */
  interactive: { type: Boolean, default: false },
  /** Forces the dark treatment, for surfaces that are always on a dark field. */
  dark: { type: Boolean, default: false },
  tag: { type: String, default: 'div' }
})
</script>

<style scoped>
.glass-card {
  position: relative;
  background: rgba(255, 255, 255, 0.42);
  /* saturate() is what separates glass from plain translucency — without it
     the colour behind the panel goes gray instead of bleeding through. */
  backdrop-filter: blur(28px) saturate(190%);
  -webkit-backdrop-filter: blur(28px) saturate(190%);
  border: 1px solid rgba(255, 255, 255, 0.6);
  transition: background 0.3s ease, box-shadow 0.3s ease, transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

/* A 1px bevel: lit along the top-left, shaded along the bottom-right. */
.glass-card::after {
  content: ''; position: absolute; inset: 0; border-radius: inherit;
  padding: 1px; pointer-events: none;
  background: linear-gradient(145deg,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(255, 255, 255, 0.28) 38%,
    rgba(120, 140, 180, 0.18) 62%,
    rgba(255, 255, 255, 0.6) 100%);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
}

/*
 * Real glass casts several shadows at once: a tight contact shadow, a broad
 * ambient one, and a wider bloom tinted by the light behind it. A single
 * large blur reads as a flat drop shadow instead.
 */
.gc-e1 {
  background: rgba(255, 255, 255, 0.34);
  backdrop-filter: blur(18px) saturate(180%);
  -webkit-backdrop-filter: blur(18px) saturate(180%);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.6) inset;
}
.gc-e2 {
  box-shadow:
    0 2px 6px -1px rgba(20, 30, 60, 0.14),
    0 16px 34px -12px rgba(20, 30, 60, 0.24),
    0 1px 0 rgba(255, 255, 255, 0.9) inset,
    0 -1px 0 rgba(255, 255, 255, 0.35) inset;
}
.gc-e3 {
  box-shadow:
    0 2px 6px -1px rgba(20, 30, 60, 0.16),
    0 24px 48px -16px rgba(20, 30, 60, 0.28),
    0 48px 90px -30px rgba(10, 60, 140, 0.3),
    0 1px 0 rgba(255, 255, 255, 0.9) inset,
    0 -1px 0 rgba(255, 255, 255, 0.35) inset;
}

.gc-interactive:hover {
  background: rgba(255, 255, 255, 0.52);
  transform: translateY(-2px);
}
.gc-interactive.gc-e2:hover {
  box-shadow:
    0 4px 10px -2px rgba(20, 30, 60, 0.16),
    0 22px 44px -14px rgba(20, 30, 60, 0.3),
    0 1px 0 rgba(255, 255, 255, 0.9) inset;
}

/* Explicit dark surface — same treatment the OS setting applies. */
.gc-dark {
  background: rgba(20, 20, 26, 0.5);
  border-color: rgba(255, 255, 255, 0.12);
}
.gc-dark::after {
  background: linear-gradient(145deg,
    rgba(255, 255, 255, 0.45) 0%,
    rgba(255, 255, 255, 0.06) 40%,
    rgba(0, 0, 0, 0.3) 64%,
    rgba(255, 255, 255, 0.14) 100%);
}
.gc-dark.gc-e1 {
  background: rgba(255, 255, 255, 0.05);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.08) inset;
}
.gc-dark.gc-e2 {
  box-shadow:
    0 2px 6px -1px rgba(0, 0, 0, 0.55),
    0 16px 34px -12px rgba(0, 0, 0, 0.6),
    0 1px 0 rgba(255, 255, 255, 0.12) inset;
}
.gc-dark.gc-e3 {
  box-shadow:
    0 2px 8px -1px rgba(0, 0, 0, 0.6),
    0 26px 50px -16px rgba(0, 0, 0, 0.7),
    0 60px 110px -40px rgba(60, 130, 255, 0.35),
    0 1px 0 rgba(255, 255, 255, 0.16) inset,
    0 -1px 0 rgba(255, 255, 255, 0.04) inset;
}
.gc-dark.gc-interactive:hover { background: rgba(255, 255, 255, 0.1); }

@media (prefers-color-scheme: dark) {
  .glass-card {
    background: rgba(28, 28, 30, 0.5);
    border-color: rgba(255, 255, 255, 0.14);
  }
  .glass-card::after {
    background: linear-gradient(145deg,
      rgba(255, 255, 255, 0.35) 0%,
      rgba(255, 255, 255, 0.08) 38%,
      rgba(0, 0, 0, 0.25) 62%,
      rgba(255, 255, 255, 0.16) 100%);
  }
  .gc-e1 { background: rgba(255, 255, 255, 0.07); box-shadow: 0 1px 0 rgba(255, 255, 255, 0.08) inset; }
  .gc-e2 {
    box-shadow:
      0 2px 6px -1px rgba(0, 0, 0, 0.5),
      0 16px 34px -12px rgba(0, 0, 0, 0.55),
      0 1px 0 rgba(255, 255, 255, 0.12) inset;
  }
  .gc-e3 {
    box-shadow:
      0 2px 6px -1px rgba(0, 0, 0, 0.5),
      0 24px 48px -16px rgba(0, 0, 0, 0.6),
      0 48px 90px -30px rgba(0, 0, 0, 0.7),
      0 1px 0 rgba(255, 255, 255, 0.14) inset;
  }
  .gc-interactive:hover { background: rgba(255, 255, 255, 0.12); }
}

@media (prefers-reduced-motion: reduce) {
  .glass-card { transition: none; }
  .gc-interactive:hover { transform: none; }
}
</style>
