<template>
  <div class="countdown" :class="`countdown-${theme}`">
    <h3 class="countdown-label">{{ isExpired ? '' : 'Counting down to the big day' }}</h3>
    <div v-if="!isExpired" class="countdown-boxes">
      <div class="cd-box" v-for="(u, i) in units" :key="i">
        <span class="cd-value">{{ String(u.value).padStart(2, '0') }}</span>
        <span class="cd-label">{{ u.label }}</span>
      </div>
    </div>
    <div v-else class="countdown-expired">🎊 The Celebration Has Begun! 🎊</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCountdown } from '@/composables/useCountdown'
const props = defineProps({ date: String, time: String, theme: { type: String, default: 'gold' } })
const { days, hours, minutes, seconds, isExpired } = useCountdown(props.date, props.time)
const units = computed(() => [
  { value: days.value, label: 'Days' },
  { value: hours.value, label: 'Hours' },
  { value: minutes.value, label: 'Mins' },
  { value: seconds.value, label: 'Secs' }
])
</script>

<style scoped>
.countdown { text-align: center; margin: 28px 0; }
.countdown-label { font-size: 0.85rem; margin-bottom: 16px; opacity: 0.7; }
.countdown-boxes { display: flex; justify-content: center; gap: 12px; }
.cd-box {
  padding: 16px 12px; border-radius: 12px; min-width: 72px;
  display: flex; flex-direction: column; align-items: center;
}
.cd-value { font-size: 1.8rem; font-weight: 800; line-height: 1; }
.cd-label { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 6px; }
.countdown-expired { font-size: 1.3rem; font-weight: 700; animation: pulse 1.5s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }

/* Themes */
.countdown-gold .countdown-label { color: rgba(245,230,200,0.6); }
.countdown-gold .cd-box { background: rgba(212,175,55,0.12); }
.countdown-gold .cd-value { color: #f5e6c8; }
.countdown-gold .cd-label { color: #d4af37; }
.countdown-gold .countdown-expired { color: #fcd34d; }

.countdown-pink .countdown-label { color: #be185d; }
.countdown-pink .cd-box { background: rgba(244,114,182,0.1); }
.countdown-pink .cd-value { color: #9d174d; }
.countdown-pink .cd-label { color: #f472b6; }
.countdown-pink .countdown-expired { color: #ec4899; }

.countdown-minimal .countdown-label { color: #78716c; }
.countdown-minimal .cd-box { background: #f5f5f4; border: 1px solid #e7e5e4; }
.countdown-minimal .cd-value { color: #292524; }
.countdown-minimal .cd-label { color: #a8a29e; }
.countdown-minimal .countdown-expired { color: #44403c; }

.countdown-green .countdown-label { color: #6ee7b7; }
.countdown-green .cd-box { background: rgba(110,231,183,0.1); }
.countdown-green .cd-value { color: #ecfdf5; }
.countdown-green .cd-label { color: #6ee7b7; }
.countdown-green .countdown-expired { color: #a7f3d0; }

.countdown-purple .countdown-label { color: rgba(255,255,255,0.4); }
.countdown-purple .cd-box { background: rgba(168,85,247,0.15); border: 1px solid rgba(168,85,247,0.2); }
.countdown-purple .cd-value { color: white; }
.countdown-purple .cd-label { color: #c084fc; }
.countdown-purple .countdown-expired { color: #e879f9; }
</style>
