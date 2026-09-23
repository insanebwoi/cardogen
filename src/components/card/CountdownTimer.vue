<template>
  <div class="countdown" :class="`countdown-${theme}`">
    <template v-if="!isExpired">
      <h3 class="cd-title">
        <span class="cd-title-rule"></span>
        Counting down to the big day
        <span class="cd-title-rule"></span>
      </h3>

      <div class="cd-row">
        <div v-for="u in units" :key="u.label" class="cd-unit">
          <div class="cd-dial">
            <!-- Ring fills as the unit runs down, so the card reads at a glance. -->
            <svg class="cd-ring" viewBox="0 0 64 64" aria-hidden="true">
              <circle class="cd-track" cx="32" cy="32" :r="R" />
              <circle
                class="cd-arc"
                cx="32" cy="32" :r="R"
                :stroke-dasharray="CIRC"
                :stroke-dashoffset="CIRC * (1 - u.fraction)"
                :class="{ 'no-ease': u.label === 'Days' }"
              />
            </svg>

            <span class="cd-digits">
              <Transition :name="reduceMotion ? '' : 'roll'" mode="out-in">
                <span :key="u.value" class="cd-value">{{ pad(u.value) }}</span>
              </Transition>
            </span>
          </div>
          <span class="cd-label">{{ u.label }}</span>
        </div>
      </div>

      <p class="cd-foot">{{ humanRemaining }}</p>
    </template>

    <div v-else class="cd-expired">
      <span class="cd-expired-ring" aria-hidden="true"></span>
      <Icon name="PartyPopper" size="22" />
      <strong>The celebration has begun</strong>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useCountdown } from '@/composables/useCountdown'

const props = defineProps({
  date: String,
  time: String,
  theme: { type: String, default: 'gold' }
})

const { days, hours, minutes, seconds, isExpired } = useCountdown(props.date, props.time)

const R = 28
const CIRC = 2 * Math.PI * R

const reduceMotion = typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// The days ring needs a span to measure against; the first reading is it.
const startDays = ref(0)
onMounted(() => {
  // A tick may not have landed yet, so fall back to the value on the next frame.
  requestAnimationFrame(() => { startDays.value = Math.max(days.value, 1) })
})

function pad(n) { return String(n).padStart(2, '0') }

const units = computed(() => [
  { label: 'Days', value: days.value, fraction: startDays.value ? Math.min(1, days.value / startDays.value) : 1 },
  { label: 'Hours', value: hours.value, fraction: hours.value / 24 },
  { label: 'Mins', value: minutes.value, fraction: minutes.value / 60 },
  { label: 'Secs', value: seconds.value, fraction: seconds.value / 60 }
])

const humanRemaining = computed(() => {
  if (days.value > 1) return `${days.value} days to go`
  if (days.value === 1) return 'Tomorrow is the day'
  if (hours.value >= 1) return `${hours.value} hours to go`
  return 'Just moments away'
})
</script>

<style scoped>
.countdown {
  text-align: center; margin: 30px 0;
  /* Every colour comes from these, so a theme only overrides four values. */
  --cd-accent: #d4af37;
  --cd-text: #f5e6c8;
  --cd-surface: rgba(212, 175, 55, 0.08);
  --cd-track: rgba(212, 175, 55, 0.16);
  --cd-muted: rgba(245, 230, 200, 0.55);
}

.cd-title {
  display: flex; align-items: center; justify-content: center; gap: 12px;
  font-size: 0.7rem; font-weight: 600; letter-spacing: 0.22em; text-transform: uppercase;
  color: var(--cd-muted); margin-bottom: 20px;
}
.cd-title-rule {
  width: 34px; height: 1px; flex: none;
  background: linear-gradient(90deg, transparent, var(--cd-accent), transparent);
}

.cd-row { display: flex; justify-content: center; gap: 10px; }

.cd-unit { display: flex; flex-direction: column; align-items: center; gap: 9px; }

.cd-dial {
  position: relative; width: 72px; height: 72px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  background: var(--cd-surface);
}

.cd-ring { position: absolute; inset: 0; width: 100%; height: 100%; transform: rotate(-90deg); }
.cd-track { fill: none; stroke: var(--cd-track); stroke-width: 3; }
.cd-arc {
  fill: none; stroke: var(--cd-accent); stroke-width: 3; stroke-linecap: round;
  transition: stroke-dashoffset 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  filter: drop-shadow(0 0 4px color-mix(in srgb, var(--cd-accent) 45%, transparent));
}
/* The days arc jumps rarely; easing a whole day looks broken. */
.cd-arc.no-ease { transition: none; }

.cd-digits {
  position: relative; display: block; overflow: hidden;
  height: 1.7rem; width: 2.4ch;
}
.cd-value {
  display: block; line-height: 1.7rem;
  font-family: var(--font-display, serif);
  font-size: 1.5rem; font-weight: 700; font-variant-numeric: tabular-nums;
  color: var(--cd-text);
}

/* Digits roll up as they change. */
.roll-enter-active, .roll-leave-active { transition: transform 0.42s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.42s ease; }
.roll-enter-from { transform: translateY(100%); opacity: 0; }
.roll-leave-to { transform: translateY(-100%); opacity: 0; }

.cd-label {
  font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.16em;
  color: var(--cd-accent); font-weight: 600;
}

.cd-foot {
  margin-top: 16px; font-size: 0.78rem; font-style: italic;
  color: var(--cd-muted);
}

/* ---- Expired ---- */
.cd-expired {
  position: relative; display: inline-flex; align-items: center; gap: 10px;
  padding: 16px 26px; border-radius: 100px;
  background: var(--cd-surface); color: var(--cd-text);
  font-size: 1rem;
}
.cd-expired strong { font-family: var(--font-display, serif); font-weight: 600; }
.cd-expired-ring {
  position: absolute; inset: 0; border-radius: 100px;
  border: 1px solid var(--cd-accent);
  animation: halo 2.4s ease-out infinite;
}
@keyframes halo {
  0% { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(1.12); opacity: 0; }
}

@media (max-width: 420px) {
  .cd-row { gap: 6px; }
  .cd-dial { width: 62px; height: 62px; }
  .cd-value { font-size: 1.25rem; }
  .cd-title { font-size: 0.62rem; letter-spacing: 0.16em; gap: 8px; }
  .cd-title-rule { width: 20px; }
}

@media (prefers-reduced-motion: reduce) {
  .cd-arc { transition: none; }
  .cd-expired-ring { animation: none; }
}

/* ---- Themes: four variables each ---- */
.countdown-gold {
  --cd-accent: #d4af37; --cd-text: #f5e6c8;
  --cd-surface: rgba(212,175,55,0.08); --cd-track: rgba(212,175,55,0.16);
  --cd-muted: rgba(245,230,200,0.55);
}
.countdown-pink {
  --cd-accent: #ec4899; --cd-text: #9d174d;
  --cd-surface: rgba(244,114,182,0.09); --cd-track: rgba(244,114,182,0.2);
  --cd-muted: #be185d;
}
.countdown-minimal {
  --cd-accent: #57534e; --cd-text: #1c1917;
  --cd-surface: #f5f5f4; --cd-track: #e7e5e4;
  --cd-muted: #78716c;
}
.countdown-green {
  --cd-accent: #6ee7b7; --cd-text: #ecfdf5;
  --cd-surface: rgba(110,231,183,0.09); --cd-track: rgba(110,231,183,0.18);
  --cd-muted: rgba(167,243,208,0.7);
}
.countdown-vintage {
  --cd-accent: #9a7b3f; --cd-text: #14532d;
  --cd-surface: rgba(154,123,63,0.09); --cd-track: rgba(154,123,63,0.22);
  --cd-muted: rgba(20,83,45,0.55);
}
.countdown-glass {
  --cd-accent: #6fb4ff; --cd-text: #f4f5f8;
  --cd-surface: rgba(255,255,255,0.06); --cd-track: rgba(111,180,255,0.18);
  --cd-muted: rgba(235,238,248,0.52);
}
.countdown-purple {
  --cd-accent: #c084fc; --cd-text: #ffffff;
  --cd-surface: rgba(168,85,247,0.12); --cd-track: rgba(168,85,247,0.22);
  --cd-muted: rgba(226,214,255,0.6);
}
</style>
