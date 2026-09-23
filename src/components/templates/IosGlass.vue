<template>
  <div class="ig">
    <!-- Two quiet light sources; everything else is dark. -->
    <div class="ig-field" aria-hidden="true">
      <span class="ig-light ig-light-1"></span>
      <span class="ig-light ig-light-2"></span>
    </div>

    <GlassCard
      ref="cardEl"
      tag="article"
      class="ig-card"
      :radius="36"
      :elevation="3"
      padding="0"
      dark
      :style="cardStyle"
      @pointermove="onPointerMove"
      @pointerleave="resetTilt"
      @dblclick="burstAt"
    >
      <!-- Reflection that follows the pointer across the pane -->
      <span class="ig-sheen" aria-hidden="true"></span>

      <!-- Tap-back hearts, the way iMessage reactions float away -->
      <div class="ig-hearts" aria-hidden="true">
        <span
          v-for="h in hearts"
          :key="h.id"
          class="ig-heart"
          :style="h.style"
        >
          <Icon name="Heart" :size="h.size" fill="currentColor" />
        </span>
      </div>

      <div class="ig-inner">
        <header class="ig-head">
          <!-- The drop: a bead of glass resting on the card -->
          <span class="ig-drop">
            <span class="ig-drop-spec" aria-hidden="true"></span>
            <span class="ig-drop-text">{{ initials }}</span>
          </span>
          <p class="ig-eyebrow">The wedding of</p>
        </header>

        <div class="ig-names">
          <h1 class="ig-name">{{ invitation.brideName }}</h1>
          <span class="ig-amp" aria-hidden="true">&amp;</span>
          <h1 class="ig-name">{{ invitation.groomName }}</h1>
        </div>

        <div class="ig-when">
          <span>{{ weekday }}</span>
          <i aria-hidden="true"></i>
          <span>{{ shortDate }}</span>
          <i aria-hidden="true"></i>
          <span>{{ formatTime(invitation.weddingTime) }}</span>
        </div>

        <p v-if="invitation.customMessage" class="ig-message">{{ invitation.customMessage }}</p>

        <CountdownTimer :date="invitation.weddingDate" :time="invitation.weddingTime" theme="glass" />

        <GlassCard tag="section" class="ig-venue" :radius="26" :elevation="1" padding="24px 18px" dark>
          <span class="ig-label">Location</span>
          <h2 class="ig-venue-name">{{ invitation.venueName }}</h2>
          <p v-if="invitation.venueAddress" class="ig-venue-addr">{{ invitation.venueAddress }}</p>

          <div class="ig-actions">
            <a
              v-if="invitation.venueMapUrl"
              :href="invitation.venueMapUrl"
              target="_blank"
              rel="noopener"
              class="ig-btn ig-btn-filled"
            >
              <Icon name="Navigation" size="15" /> Directions
            </a>
            <button type="button" class="ig-btn" @click="addToCalendar">
              <Icon name="CalendarPlus" size="15" /> Add to Calendar
            </button>
            <button
              type="button"
              class="ig-btn ig-btn-love"
              :class="{ tapped: lovePulse }"
              @click="sendLove"
              aria-label="Send love"
            >
              <Icon name="Heart" size="15" :fill="loveCount ? 'currentColor' : 'none'" />
              {{ loveCount ? loveCount : 'Send love' }}
            </button>
          </div>
        </GlassCard>

        <RsvpForm :invitationId="invitation.id" theme="glass" />
      </div>
    </GlassCard>
  </div>
</template>

<script setup>
import { computed, ref, onBeforeUnmount } from 'vue'
import GlassCard from '@/components/common/GlassCard.vue'
import CountdownTimer from '@/components/card/CountdownTimer.vue'
import RsvpForm from '@/components/card/RsvpForm.vue'

const props = defineProps({ invitation: Object })

const cardEl = ref(null)
const tilt = ref({ x: 0, y: 0, px: 50, py: 0 })
let frame = null

const reduceMotion = typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const initials = computed(() => {
  const i = (n) => (n || '').trim().charAt(0).toUpperCase()
  return `${i(props.invitation?.brideName)}${i(props.invitation?.groomName)}`
})

const weddingDate = computed(() => {
  const d = props.invitation?.weddingDate
  if (!d) return null
  const parsed = new Date(d)
  return isNaN(parsed.getTime()) ? null : parsed
})

const shortDate = computed(() =>
  weddingDate.value?.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) || '')
const weekday = computed(() =>
  weddingDate.value?.toLocaleDateString('en-US', { weekday: 'long' }) || '')

function formatTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':')
  const d = new Date()
  d.setHours(+h, +m)
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

/** Feeds pointer position to CSS; the sheen and the tilt both read from it. */
function onPointerMove(e) {
  if (reduceMotion || e.pointerType === 'touch' || !cardEl.value) return
  if (frame) return
  frame = requestAnimationFrame(() => {
    frame = null
    const el = cardEl.value?.$el || cardEl.value
    const r = el?.getBoundingClientRect?.()
    if (!r) return
    const px = ((e.clientX - r.left) / r.width) * 100
    const py = ((e.clientY - r.top) / r.height) * 100
    tilt.value = {
      // Small angles: glass should feel weighty, not floaty.
      y: ((px - 50) / 50) * 2.2,
      x: -((py - 50) / 50) * 2.2,
      px, py
    }
  })
}

function resetTilt() { tilt.value = { x: 0, y: 0, px: 50, py: 0 } }

/* ---------- Tap-back hearts ---------- */
const hearts = ref([])
const loveCount = ref(0)
const lovePulse = ref(false)
const MAX_HEARTS = 28        // a hard cap; one held-down finger shouldn't spawn hundreds
let heartId = 0
const timers = new Set()

function spawnHeart(xPct, yPct) {
  if (reduceMotion || hearts.value.length >= MAX_HEARTS) return
  const id = ++heartId
  const drift = (Math.random() * 2 - 1) * 46          // px of sideways wander
  const rise = 150 + Math.random() * 110
  const life = 1500 + Math.random() * 700

  hearts.value.push({
    id,
    size: 15 + Math.round(Math.random() * 11),
    style: {
      left: `${xPct}%`,
      top: `${yPct}%`,
      '--drift': `${drift}px`,
      '--rise': `${-rise}px`,
      '--spin': `${(Math.random() * 2 - 1) * 26}deg`,
      animationDuration: `${life}ms`
    }
  })

  const t = setTimeout(() => {
    hearts.value = hearts.value.filter((h) => h.id !== id)
    timers.delete(t)
  }, life)
  timers.add(t)
}

/** The button: a small cluster, offset so they don't overlap exactly. */
function sendLove() {
  loveCount.value++
  lovePulse.value = true
  const t = setTimeout(() => { lovePulse.value = false; timers.delete(t) }, 420)
  timers.add(t)

  const count = 5
  for (let i = 0; i < count; i++) {
    const t2 = setTimeout(() => {
      spawnHeart(42 + Math.random() * 16, 76 + Math.random() * 8)
      timers.delete(t2)
    }, i * 90)
    timers.add(t2)
  }
}

/** Double-tap anywhere on the card drops hearts right where you tapped. */
function burstAt(e) {
  const el = cardEl.value?.$el || cardEl.value
  const r = el?.getBoundingClientRect?.()
  if (!r) return
  const x = ((e.clientX - r.left) / r.width) * 100
  const y = ((e.clientY - r.top) / r.height) * 100
  loveCount.value++
  for (let i = 0; i < 4; i++) {
    const t = setTimeout(() => {
      spawnHeart(x + (Math.random() * 10 - 5), y + (Math.random() * 6 - 3))
      timers.delete(t)
    }, i * 80)
    timers.add(t)
  }
}

const cardStyle = computed(() => ({
  '--tilt-x': `${tilt.value.x}deg`,
  '--tilt-y': `${tilt.value.y}deg`,
  '--sheen-x': `${tilt.value.px}%`,
  '--sheen-y': `${tilt.value.py}%`
}))

onBeforeUnmount(() => {
  if (frame) cancelAnimationFrame(frame)
  timers.forEach(clearTimeout)
  timers.clear()
})

/** Generates the .ics locally so the guest's own calendar handles it. */
function addToCalendar() {
  const inv = props.invitation
  if (!inv?.weddingDate) return
  const [h, m] = (inv.weddingTime || '12:00').split(':')
  const start = new Date(inv.weddingDate)
  start.setHours(+h || 12, +m || 0, 0, 0)
  const end = new Date(start.getTime() + 4 * 60 * 60 * 1000)

  const stamp = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const esc = (v) => String(v || '').replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n')

  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Cardogen//Wedding Invitation//EN',
    'BEGIN:VEVENT',
    `UID:${inv.shortCode || Date.now()}@cardogen`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${esc(`${inv.brideName} & ${inv.groomName} — Wedding`)}`,
    `LOCATION:${esc([inv.venueName, inv.venueAddress].filter(Boolean).join(', '))}`,
    `DESCRIPTION:${esc(inv.customMessage || 'We would love to celebrate with you.')}`,
    'END:VEVENT', 'END:VCALENDAR'
  ].join('\r\n')

  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `${inv.brideName || 'wedding'}-${inv.groomName || 'invitation'}.ics`.toLowerCase().replace(/\s+/g, '-')
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
</script>

<style scoped>
.ig {
  --ig-text: #f4f5f8;
  --ig-text-2: rgba(235, 238, 248, 0.52);
  --ig-tint: #6fb4ff;

  position: relative; min-height: 100vh; min-height: 100dvh; overflow: hidden;
  background: #06070c;
  padding: 36px 14px max(36px, env(safe-area-inset-bottom));
  display: flex; align-items: center; justify-content: center;
  /* System stack: it should read as native, not styled. */
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Inter, system-ui, sans-serif;
  color: var(--ig-text);
}

/* ---- Light behind the glass ---- */
.ig-field { position: absolute; inset: -20%; pointer-events: none; }
.ig-light { position: absolute; border-radius: 50%; filter: blur(90px); }
.ig-light-1 {
  width: 54%; height: 54%; top: -4%; left: -6%;
  background: radial-gradient(circle, rgba(64, 130, 255, 0.5), transparent 66%);
  animation: swell 26s ease-in-out infinite alternate;
}
.ig-light-2 {
  width: 46%; height: 46%; bottom: -6%; right: -6%;
  background: radial-gradient(circle, rgba(150, 90, 255, 0.4), transparent 66%);
  animation: swell 32s ease-in-out infinite alternate-reverse;
}
@keyframes swell { to { transform: translate(6%, -6%) scale(1.16); } }

/* ---- The pane ---- */
.ig-card {
  position: relative; z-index: 5; width: 100%; max-width: 480px;
  transform: perspective(1200px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg));
  transform-style: preserve-3d;
  transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}
/* GlassCard draws the bevel; here it swings with the tilt. */
.ig-card :deep(.glass-card)::after, .ig-card::after {
  background: linear-gradient(
    calc(var(--tilt-y, 0deg) * 8 + 145deg),
    rgba(255, 255, 255, 0.5) 0%,
    rgba(255, 255, 255, 0.07) 40%,
    rgba(0, 0, 0, 0.32) 64%,
    rgba(255, 255, 255, 0.18) 100%
  );
  z-index: 2;
}
.ig-sheen {
  position: absolute; inset: 0; border-radius: inherit; pointer-events: none; z-index: 1;
  background: radial-gradient(
    520px circle at var(--sheen-x, 50%) var(--sheen-y, 0%),
    rgba(255, 255, 255, 0.13), rgba(255, 255, 255, 0.03) 42%, transparent 68%
  );
  transition: background 0.25s ease;
}
.ig-inner { position: relative; z-index: 3; padding: 34px 20px; text-align: center; }
@media (min-width: 900px) { .ig-inner { padding: 44px 38px; } }

/* ---- Hearts ---- */
.ig-hearts {
  position: absolute; inset: 0; overflow: hidden;
  border-radius: inherit; pointer-events: none; z-index: 4;
}
.ig-heart {
  position: absolute;
  color: #ff5a7a;
  /* Sits above the dark glass, so it needs its own glow to read. */
  filter: drop-shadow(0 2px 8px rgba(255, 90, 122, 0.55));
  animation: heart-float cubic-bezier(0.22, 1, 0.36, 1) forwards;
  will-change: transform, opacity;
}
@keyframes heart-float {
  0%   { transform: translate(-50%, -50%) scale(0.2) rotate(0deg); opacity: 0; }
  14%  { transform: translate(-50%, -50%) scale(1.18) rotate(0deg); opacity: 1; }
  28%  { transform: translate(-50%, -50%) scale(1) rotate(var(--spin, 0deg)); opacity: 1; }
  100% {
    transform: translate(calc(-50% + var(--drift, 0px)), calc(-50% + var(--rise, -160px)))
               scale(0.7) rotate(var(--spin, 0deg));
    opacity: 0;
  }
}

.ig-btn-love { color: #ff8fa3; }
.ig-btn-love:hover { background: rgba(255, 90, 122, 0.16); }
/* A quick swell on press, echoing an iOS tap-back */
.ig-btn-love.tapped {
  animation: love-pop 0.42s cubic-bezier(0.22, 1, 0.36, 1);
  background: rgba(255, 90, 122, 0.2);
}
@keyframes love-pop {
  0% { transform: scale(1); }
  35% { transform: scale(1.14); }
  60% { transform: scale(0.97); }
  100% { transform: scale(1); }
}

/* ---- The drop ---- */
.ig-head { display: flex; flex-direction: column; align-items: center; gap: 15px; }
.ig-drop {
  position: relative; width: 66px; height: 66px;
  display: inline-flex; align-items: center; justify-content: center;
  /* Slightly taller than wide at the base: a bead under its own weight. */
  border-radius: 50% 50% 48% 48% / 46% 46% 54% 54%;
  background:
    radial-gradient(120% 90% at 30% 22%, rgba(255, 255, 255, 0.34), rgba(255, 255, 255, 0.06) 46%, transparent 62%),
    linear-gradient(170deg, rgba(120, 170, 255, 0.24), rgba(150, 90, 255, 0.16));
  backdrop-filter: blur(10px) saturate(180%);
  -webkit-backdrop-filter: blur(10px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.24);
  box-shadow:
    0 12px 26px -10px rgba(0, 0, 0, 0.75),
    0 0 26px -6px rgba(90, 150, 255, 0.4),
    0 2px 1px rgba(255, 255, 255, 0.45) inset,
    0 -8px 14px -8px rgba(0, 0, 0, 0.5) inset;
}
/* The hard little catchlight every water bead has */
.ig-drop-spec {
  position: absolute; top: 11px; left: 15px;
  width: 15px; height: 10px; border-radius: 50%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.25));
  filter: blur(0.5px);
}
.ig-drop-text {
  font-size: 1.05rem; font-weight: 600; letter-spacing: 0.01em;
  color: rgba(255, 255, 255, 0.92);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
}
.ig-eyebrow { font-size: 0.72rem; font-weight: 500; color: var(--ig-text-2); }

/* ---- Names ---- */
.ig-names { margin: 26px 0 22px; }
.ig-name {
  font-size: clamp(2rem, 9vw, 2.85rem); font-weight: 600;
  letter-spacing: -0.035em; line-height: 1.08;
  overflow-wrap: anywhere;
}
.ig-amp {
  display: block; margin: 3px 0;
  font-size: 1.1rem; font-weight: 400; color: var(--ig-text-2);
}

/* ---- One quiet line for date and time ---- */
.ig-when {
  display: inline-flex; align-items: center; justify-content: center;
  flex-wrap: wrap; gap: 10px;
  font-size: 0.8rem; letter-spacing: 0.01em; color: var(--ig-text-2);
}
.ig-when i { width: 3px; height: 3px; border-radius: 50%; background: rgba(235, 238, 248, 0.3); }

.ig-message {
  margin: 22px auto 0; max-width: 34ch;
  font-size: 0.9rem; line-height: 1.65; color: var(--ig-text-2);
}

/* ---- Venue ---- */
.ig-venue { margin-top: 14px; }
.ig-label {
  font-size: 0.64rem; font-weight: 600; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--ig-text-2);
}
.ig-venue-name {
  margin-top: 9px; font-size: 1.15rem; font-weight: 600;
  letter-spacing: -0.02em; line-height: 1.35; overflow-wrap: anywhere;
}
.ig-venue-addr {
  margin-top: 6px; font-size: 0.84rem; line-height: 1.55;
  color: var(--ig-text-2); overflow-wrap: anywhere;
}
.ig-actions { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-top: 18px; }
.ig-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 7px;
  padding: 12px 20px; border-radius: 100px; cursor: pointer;
  font-family: inherit; font-size: 0.85rem; font-weight: 600; letter-spacing: -0.01em;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: var(--ig-text);
  transition: transform 0.18s ease, background 0.2s;
}
.ig-btn:hover { background: rgba(255, 255, 255, 0.14); }
.ig-btn:active { transform: scale(0.96); }
.ig-btn:focus-visible { outline: 2px solid var(--ig-tint); outline-offset: 3px; }
.ig-btn-filled {
  background: linear-gradient(140deg, #3d8bff, #7a5cff);
  border-color: transparent; color: #fff;
  box-shadow: 0 10px 24px -8px rgba(80, 130, 255, 0.7);
}
.ig-btn-filled:hover { background: linear-gradient(140deg, #2f7dff, #6a4cff); }

/* ---- Entrance ---- */
.ig-inner > * { opacity: 0; transform: translateY(16px) scale(0.99); animation: pop 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
@keyframes pop { to { opacity: 1; transform: none; } }
.ig-inner > *:nth-child(1) { animation-delay: 0.05s; }
.ig-inner > *:nth-child(2) { animation-delay: 0.13s; }
.ig-inner > *:nth-child(3) { animation-delay: 0.21s; }
.ig-inner > *:nth-child(4) { animation-delay: 0.29s; }
.ig-inner > *:nth-child(5) { animation-delay: 0.37s; }
.ig-inner > *:nth-child(n+6) { animation-delay: 0.45s; }

@media (max-width: 600px) {
  .ig-inner { padding: 30px 16px; }
  .ig-actions .ig-btn { flex: 1 1 auto; }
  /* No pointer to track: keep it flat and the reflection still. */
  .ig-card { transform: none; }
  .ig-sheen { background: radial-gradient(300px circle at 50% 0%, rgba(255, 255, 255, 0.12), transparent 62%); }
  /* backdrop-filter over animated blurs is the heaviest thing here. */
  .ig-light { filter: blur(60px); animation: none; }
}

@media (prefers-reduced-motion: reduce) {
  /* spawnHeart() bails out here too, so nothing is left animating. */
  .ig-heart, .ig-btn-love.tapped { animation: none; }
  .ig-light { animation: none; }
  .ig-card { transform: none; transition: none; }
  .ig-inner > * { opacity: 1; transform: none; animation: none; }
}
</style>
