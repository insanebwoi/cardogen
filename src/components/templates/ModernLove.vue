<template>
  <div class="ml">
    <!-- Aurora field: layered light rather than two blurred circles -->
    <div class="ml-aura" aria-hidden="true">
      <span class="ml-layer ml-layer-1"></span>
      <span class="ml-layer ml-layer-2"></span>
      <span class="ml-layer ml-layer-3"></span>
    </div>
    <div class="ml-grain" aria-hidden="true"></div>

    <article class="ml-card">
      <div class="ml-inner">
        <header class="ml-head">
          <span class="ml-tag">#{{ hashtag }}</span>
          <p class="ml-eyebrow">The wedding of</p>
        </header>

        <!-- Names stacked and offset: the type is the composition -->
        <div class="ml-names">
          <h1 class="ml-name ml-name-a">{{ invitation.brideName }}</h1>
          <span class="ml-amp" aria-hidden="true">&amp;</span>
          <h1 class="ml-name ml-name-b">{{ invitation.groomName }}</h1>
        </div>

        <!-- The date set as numerals, used as a graphic element -->
        <div class="ml-date">
          <span class="ml-date-digits">{{ dateDigits }}</span>
          <span class="ml-date-meta">
            <span>{{ weekday }}</span>
            <i></i>
            <span>{{ formatTime(invitation.weddingTime) }}</span>
          </span>
        </div>

        <blockquote v-if="invitation.customMessage" class="ml-quote">
          {{ invitation.customMessage }}
        </blockquote>

        <CountdownTimer :date="invitation.weddingDate" :time="invitation.weddingTime" theme="purple" />

        <section class="ml-venue">
          <span class="ml-label">Where</span>
          <h2 class="ml-venue-name">{{ invitation.venueName }}</h2>
          <p v-if="invitation.venueAddress" class="ml-venue-addr">{{ invitation.venueAddress }}</p>

          <div class="ml-actions">
            <a
              v-if="invitation.venueMapUrl"
              :href="invitation.venueMapUrl"
              target="_blank"
              rel="noopener"
              class="ml-btn ml-btn-primary"
            >
              <Icon name="Navigation" size="15" /> Directions
            </a>
            <button type="button" class="ml-btn" @click="addToCalendar">
              <Icon name="CalendarPlus" size="15" /> Add to calendar
            </button>
          </div>
        </section>

        <RsvpForm :invitationId="invitation.id" theme="purple" />

        <footer class="ml-foot" aria-hidden="true">
          <span class="ml-foot-rule"></span>
          <Icon name="Heart" size="13" />
          <span class="ml-foot-rule"></span>
        </footer>
      </div>
    </article>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import CountdownTimer from '@/components/card/CountdownTimer.vue'
import RsvpForm from '@/components/card/RsvpForm.vue'

const props = defineProps({ invitation: Object })

const weddingDate = computed(() => {
  const d = props.invitation?.weddingDate
  if (!d) return null
  const parsed = new Date(d)
  return isNaN(parsed.getTime()) ? null : parsed
})

const dateDigits = computed(() => {
  const d = weddingDate.value
  if (!d) return ''
  const p = (n) => String(n).padStart(2, '0')
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`
})

const weekday = computed(() => weddingDate.value?.toLocaleDateString('en-US', { weekday: 'long' }) || '')

const hashtag = computed(() => {
  const clean = (n) => (n || '').replace(/[^a-zA-Z0-9]/g, '')
  const b = clean(props.invitation?.brideName)
  const g = clean(props.invitation?.groomName)
  return b && g ? `${b}Weds${g}` : 'OurWedding'
})

function formatTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':')
  const d = new Date()
  d.setHours(+h, +m)
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

/** Writes an .ics locally so the guest's own calendar app handles it. */
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
.ml {
  position: relative; min-height: 100vh; min-height: 100dvh; overflow: hidden;
  background: #09060f;
  padding: 44px 16px max(44px, env(safe-area-inset-bottom));
  display: flex; align-items: center; justify-content: center;
}

/* ---- Background ---- */
.ml-aura { position: absolute; inset: -20%; pointer-events: none; }
.ml-layer { position: absolute; border-radius: 50%; filter: blur(90px); }
.ml-layer-1 {
  width: 58%; height: 58%; top: -6%; right: -8%;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.55), transparent 65%);
  animation: drift-a 22s ease-in-out infinite alternate;
}
.ml-layer-2 {
  width: 50%; height: 50%; bottom: -4%; left: -6%;
  background: radial-gradient(circle, rgba(236, 72, 153, 0.42), transparent 65%);
  animation: drift-b 26s ease-in-out infinite alternate;
}
.ml-layer-3 {
  width: 42%; height: 42%; top: 38%; left: 34%;
  background: radial-gradient(circle, rgba(56, 189, 248, 0.24), transparent 68%);
  animation: drift-a 30s ease-in-out infinite alternate-reverse;
}
@keyframes drift-a { to { transform: translate(-8%, 10%) scale(1.18); } }
@keyframes drift-b { to { transform: translate(10%, -8%) scale(1.14); } }

.ml-grain {
  position: absolute; inset: 0; pointer-events: none; opacity: 0.2; mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E");
}

/* ---- Card ---- */
.ml-card {
  position: relative; z-index: 10; width: 100%; max-width: 520px;
  border-radius: 28px;
  background: linear-gradient(165deg, rgba(23, 16, 38, 0.72), rgba(10, 6, 18, 0.88));
  backdrop-filter: blur(26px);
  border: 1px solid rgba(255, 255, 255, 0.09);
  box-shadow:
    0 50px 90px -30px rgba(0, 0, 0, 0.9),
    inset 0 1px 0 rgba(255, 255, 255, 0.07);
}
.ml-inner { padding: 40px 22px; }
@media (min-width: 900px) { .ml-inner { padding: 54px 44px; } }

/* ---- Header ---- */
.ml-head { display: flex; flex-direction: column; align-items: center; gap: 16px; }
.ml-tag {
  padding: 6px 15px; border-radius: 100px;
  background: rgba(168, 85, 247, 0.14);
  border: 1px solid rgba(168, 85, 247, 0.25);
  color: #d8b4fe; font-size: 0.72rem; font-weight: 600; letter-spacing: 0.03em;
  overflow-wrap: anywhere;
}
.ml-eyebrow {
  font-size: 0.66rem; letter-spacing: 0.34em; text-transform: uppercase;
  color: rgba(226, 214, 255, 0.45);
}

/* ---- Names: offset stack, tight tracking ---- */
.ml-names { position: relative; margin: 26px 0 30px; text-align: center; }
.ml-name {
  font-family: var(--font-display); font-weight: 600;
  font-size: clamp(2.3rem, 11vw, 3.6rem); line-height: 0.98;
  letter-spacing: -0.03em; color: #fff;
  overflow-wrap: anywhere;
}
.ml-name-a { transform: translateX(-0.18em); }
.ml-name-b {
  transform: translateX(0.18em);
  background: linear-gradient(100deg, #c4b5fd, #f0abfc 55%, #a5b4fc);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.ml-amp {
  display: block; margin: -0.12em 0;
  font-family: var(--font-script, serif);
  font-size: clamp(2rem, 9vw, 2.9rem); line-height: 1;
  color: rgba(232, 121, 249, 0.85);
}

/* ---- Date as numerals ---- */
.ml-date { text-align: center; }
.ml-date-digits {
  display: block;
  font-size: clamp(1.5rem, 6.5vw, 2rem); font-weight: 300;
  font-variant-numeric: tabular-nums; letter-spacing: 0.14em;
  color: rgba(255, 255, 255, 0.92);
}
.ml-date-meta {
  display: inline-flex; align-items: center; gap: 12px; margin-top: 10px;
  font-size: 0.7rem; letter-spacing: 0.22em; text-transform: uppercase;
  color: rgba(226, 214, 255, 0.5);
}
.ml-date-meta i { width: 4px; height: 4px; border-radius: 50%; background: rgba(232, 121, 249, 0.7); }

/* ---- Quote ---- */
.ml-quote {
  position: relative; margin: 28px auto 4px; max-width: 380px;
  padding-left: 16px; text-align: left;
  border-left: 2px solid rgba(168, 85, 247, 0.5);
  font-size: 0.93rem; line-height: 1.75; font-style: italic;
  color: rgba(255, 255, 255, 0.62);
}

/* ---- Venue ---- */
.ml-venue {
  margin: 26px 0 0; padding: 24px 20px; text-align: center;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.ml-label {
  font-size: 0.64rem; letter-spacing: 0.3em; text-transform: uppercase;
  color: rgba(226, 214, 255, 0.45);
}
.ml-venue-name {
  margin-top: 10px; font-family: var(--font-display); font-weight: 600;
  font-size: 1.3rem; line-height: 1.35; color: #fff; overflow-wrap: anywhere;
}
.ml-venue-addr {
  margin-top: 7px; font-size: 0.85rem; line-height: 1.6;
  color: rgba(255, 255, 255, 0.45); overflow-wrap: anywhere;
}
.ml-actions { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-top: 18px; }
.ml-btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 11px 20px; border-radius: 100px; cursor: pointer;
  font-family: inherit; font-size: 0.82rem; font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.05); color: rgba(255, 255, 255, 0.88);
  transition: background 0.25s, border-color 0.25s, transform 0.2s;
}
.ml-btn:hover { background: rgba(255, 255, 255, 0.1); transform: translateY(-1px); }
.ml-btn:focus-visible { outline: 2px solid #c084fc; outline-offset: 3px; }
.ml-btn-primary {
  border-color: transparent;
  background: linear-gradient(120deg, #8b5cf6, #d946ef);
  color: #fff;
  box-shadow: 0 8px 22px -6px rgba(168, 85, 247, 0.65);
}
.ml-btn-primary:hover { background: linear-gradient(120deg, #7c3aed, #c026d3); }

.ml-foot {
  display: flex; align-items: center; justify-content: center; gap: 12px;
  margin-top: 26px; color: rgba(232, 121, 249, 0.6);
}
.ml-foot-rule {
  width: 70px; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 121, 249, 0.5), transparent);
}

/* ---- Entrance ---- */
.ml-inner > * { opacity: 0; transform: translateY(20px); animation: rise 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes rise { to { opacity: 1; transform: none; } }
.ml-inner > *:nth-child(1) { animation-delay: 0.06s; }
.ml-inner > *:nth-child(2) { animation-delay: 0.16s; }
.ml-inner > *:nth-child(3) { animation-delay: 0.26s; }
.ml-inner > *:nth-child(4) { animation-delay: 0.36s; }
.ml-inner > *:nth-child(5) { animation-delay: 0.46s; }
.ml-inner > *:nth-child(6) { animation-delay: 0.56s; }
.ml-inner > *:nth-child(7) { animation-delay: 0.66s; }
.ml-inner > *:nth-child(n+8) { animation-delay: 0.76s; }

@media (max-width: 600px) {
  .ml-inner { padding: 32px 18px; }
  .ml-quote { margin-inline: 0; }
  .ml-actions .ml-btn { flex: 1 1 auto; justify-content: center; }
  /* Three 90px blurs are costly on a phone — keep them still and smaller. */
  .ml-layer { filter: blur(62px); animation: none; }
}

@media (prefers-reduced-motion: reduce) {
  .ml-layer { animation: none; }
  .ml-inner > * { opacity: 1; transform: none; animation: none; }
}
</style>
