<template>
  <div class="tc">
    <div class="tc-vignette" aria-hidden="true"></div>

    <article class="tc-paper">
      <div class="tc-foxing" aria-hidden="true"></div>
      <span class="tc-rule-outer" aria-hidden="true"></span>
      <span class="tc-corner tc-tl" aria-hidden="true"></span>
      <span class="tc-corner tc-tr" aria-hidden="true"></span>
      <span class="tc-corner tc-bl" aria-hidden="true"></span>
      <span class="tc-corner tc-br" aria-hidden="true"></span>

      <div class="tc-inner">
        <div class="tc-flourish" aria-hidden="true">
          <span class="tc-fl-rule"></span>
          <Icon name="Stars" size="14" />
          <span class="tc-fl-rule"></span>
        </div>

        <p class="tc-bismillah">بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ</p>
        <p class="tc-blessing">With the blessings of the Almighty</p>

        <p class="tc-request">Together with their families<br />request the pleasure of your company<br />at the marriage of</p>

        <div class="tc-names">
          <h1 class="tc-name">{{ invitation.brideName }}</h1>
          <span class="tc-amp">and</span>
          <h1 class="tc-name">{{ invitation.groomName }}</h1>
        </div>

        <!-- Date spelled out, as engraved stationery has always done -->
        <p class="tc-date-words">{{ dateInWords }}</p>
        <p class="tc-time">at {{ formatTime(invitation.weddingTime) }}</p>

        <div class="tc-seal" aria-hidden="true">
          <span class="tc-seal-initials">{{ initials }}</span>
        </div>

        <p v-if="invitation.customMessage" class="tc-message">“{{ invitation.customMessage }}”</p>

        <CountdownTimer :date="invitation.weddingDate" :time="invitation.weddingTime" theme="vintage" />

        <section class="tc-venue">
          <span class="tc-label">The Reception</span>
          <h2 class="tc-venue-name">{{ invitation.venueName }}</h2>
          <p v-if="invitation.venueAddress" class="tc-venue-addr">{{ invitation.venueAddress }}</p>
          <div class="tc-actions">
            <a
              v-if="invitation.venueMapUrl"
              :href="invitation.venueMapUrl"
              target="_blank"
              rel="noopener"
              class="tc-btn"
            >
              <Icon name="MapPin" size="14" /> Directions
            </a>
            <button type="button" class="tc-btn" @click="addToCalendar">
              <Icon name="CalendarPlus" size="14" /> Add to calendar
            </button>
          </div>
        </section>

        <RsvpForm :invitationId="invitation.id" theme="vintage" />

        <div class="tc-flourish tc-flourish-end" aria-hidden="true">
          <span class="tc-fl-rule"></span>
          <Icon name="Stars" size="13" />
          <span class="tc-fl-rule"></span>
        </div>
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

const initials = computed(() => {
  const i = (n) => (n || '').trim().charAt(0).toUpperCase()
  return `${i(props.invitation?.brideName)}${i(props.invitation?.groomName)}`
})

const ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen']
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']
const ORDINALS = {
  one: 'first', two: 'second', three: 'third', five: 'fifth', eight: 'eighth',
  nine: 'ninth', twelve: 'twelfth', twenty: 'twentieth', thirty: 'thirtieth'
}

function words(n) {
  if (n < 20) return ONES[n]
  const t = TENS[Math.floor(n / 10)]
  const o = ONES[n % 10]
  return o ? `${t}-${o}` : t
}

function ordinal(n) {
  const w = words(n)
  const parts = w.split('-')
  const last = parts[parts.length - 1]
  parts[parts.length - 1] = ORDINALS[last] || (last.endsWith('y') ? last.slice(0, -1) + 'ieth' : `${last}th`)
  return parts.join('-')
}

function yearWords(y) {
  if (y >= 2000 && y < 2100) {
    const rest = y - 2000
    return rest ? `two thousand ${words(rest)}` : 'two thousand'
  }
  return String(y)
}

/** "on Saturday, the twenty-second of July, two thousand twenty-six" */
const dateInWords = computed(() => {
  const d = weddingDate.value
  if (!d) return ''
  const day = d.toLocaleDateString('en-US', { weekday: 'long' })
  const month = d.toLocaleDateString('en-US', { month: 'long' })
  return `on ${day}, the ${ordinal(d.getDate())} of ${month}, ${yearWords(d.getFullYear())}`
})

function formatTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':')
  const d = new Date()
  d.setHours(+h, +m)
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

/** Builds the .ics locally; the guest's own calendar app takes it from there. */
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
    `DESCRIPTION:${esc(inv.customMessage || 'We request the pleasure of your company.')}`,
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
/* Deep green baize, as though the card is lying on a table */
.tc {
  position: relative; min-height: 100vh; min-height: 100dvh; overflow: hidden;
  background:
    radial-gradient(ellipse at 50% 0%, #10543a 0%, #0a3a28 55%, #05251a 100%);
  padding: 34px 14px max(34px, env(safe-area-inset-bottom));
  display: flex; align-items: center; justify-content: center;
}
.tc-vignette {
  position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(ellipse at center, transparent 45%, rgba(0, 0, 0, 0.45) 100%);
}

/* ---- The paper ---- */
.tc-paper {
  position: relative; z-index: 5; width: 100%; max-width: 530px;
  background:
    linear-gradient(175deg, #fdf8e9 0%, #f7eed6 48%, #f1e4c6 100%);
  border-radius: 4px;
  box-shadow:
    0 40px 80px -28px rgba(0, 0, 0, 0.7),
    0 2px 0 rgba(255, 255, 255, 0.5) inset,
    0 -18px 40px -20px rgba(120, 85, 35, 0.35) inset;
}
/* Faint age spots, the way old paper foxes */
.tc-foxing {
  position: absolute; inset: 0; border-radius: 4px; pointer-events: none;
  opacity: 0.5;
  background-image:
    radial-gradient(circle at 12% 18%, rgba(150, 110, 50, 0.13) 0, transparent 9%),
    radial-gradient(circle at 84% 12%, rgba(150, 110, 50, 0.1) 0, transparent 7%),
    radial-gradient(circle at 22% 78%, rgba(150, 110, 50, 0.1) 0, transparent 8%),
    radial-gradient(circle at 90% 68%, rgba(150, 110, 50, 0.12) 0, transparent 6%),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='150' height='150' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E");
  mix-blend-mode: multiply;
}

/* Engraved double rule */
.tc-rule-outer {
  position: absolute; inset: 13px; pointer-events: none;
  border: 1.5px solid rgba(20, 83, 45, 0.45);
}
.tc-rule-outer::after {
  content: ''; position: absolute; inset: 5px;
  border: 0.5px solid rgba(154, 123, 63, 0.55);
}
.tc-corner {
  position: absolute; width: 22px; height: 22px; pointer-events: none;
  border-color: #9a7b3f;
}
.tc-tl { top: 7px; left: 7px; border-top: 2px solid; border-left: 2px solid; }
.tc-tr { top: 7px; right: 7px; border-top: 2px solid; border-right: 2px solid; }
.tc-bl { bottom: 7px; left: 7px; border-bottom: 2px solid; border-left: 2px solid; }
.tc-br { bottom: 7px; right: 7px; border-bottom: 2px solid; border-right: 2px solid; }

.tc-inner { position: relative; z-index: 2; padding: 44px 24px; text-align: center; }
@media (min-width: 900px) { .tc-inner { padding: 58px 48px; } }

/* ---- Ornamental rules ---- */
.tc-flourish {
  display: flex; align-items: center; justify-content: center; gap: 12px;
  color: #9a7b3f; margin-bottom: 22px;
}
.tc-flourish-end { margin: 26px 0 0; }
.tc-fl-rule {
  width: 52px; height: 1px;
  background: linear-gradient(90deg, transparent, #9a7b3f, transparent);
}

/* ---- Words ---- */
.tc-bismillah { font-size: 1.45rem; color: #14532d; line-height: 1.9; }
.tc-blessing {
  margin-top: 6px; font-size: 0.68rem; letter-spacing: 0.26em;
  text-transform: uppercase; color: rgba(20, 83, 45, 0.6);
}
.tc-request {
  margin: 28px 0 18px; font-size: 0.82rem; line-height: 2;
  letter-spacing: 0.1em; color: rgba(20, 83, 45, 0.72);
}

.tc-names { margin: 6px 0 22px; }
.tc-name {
  font-family: var(--font-display); font-weight: 600;
  font-size: clamp(2rem, 8vw, 2.8rem); line-height: 1.2;
  color: #14532d; overflow-wrap: anywhere;
  /* Letterpress: a pale edge below the ink, as though pressed into the sheet */
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.85);
}
.tc-amp {
  display: block; margin: 4px 0;
  font-family: var(--font-script, serif); font-size: 1.7rem;
  color: #9a7b3f;
}

.tc-date-words {
  max-width: 34ch; margin: 0 auto; font-style: italic;
  font-size: 0.92rem; line-height: 1.8; color: #14532d;
}
.tc-time {
  margin-top: 8px; font-size: 0.72rem; letter-spacing: 0.24em;
  text-transform: uppercase; color: rgba(20, 83, 45, 0.6);
}

/* ---- Wax seal ---- */
.tc-seal {
  width: 62px; height: 62px; margin: 26px auto 0; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: radial-gradient(circle at 34% 30%, #2a7a52, #14532d 62%, #0c3a1f);
  box-shadow:
    0 6px 14px rgba(12, 58, 31, 0.45),
    0 1px 0 rgba(255, 255, 255, 0.35) inset,
    0 -3px 8px rgba(0, 0, 0, 0.35) inset;
}
.tc-seal-initials {
  font-family: var(--font-display); font-size: 1.05rem; font-weight: 700;
  letter-spacing: 0.06em; color: #f5e6c8;
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.4);
}

.tc-message {
  margin: 24px auto 0; max-width: 36ch; font-style: italic;
  font-size: 0.9rem; line-height: 1.8; color: rgba(20, 83, 45, 0.7);
}

/* ---- Venue ---- */
.tc-venue {
  margin: 26px 0 0; padding: 22px 18px;
  border-top: 1px solid rgba(20, 83, 45, 0.18);
  border-bottom: 1px solid rgba(20, 83, 45, 0.18);
}
.tc-label {
  font-size: 0.64rem; letter-spacing: 0.3em; text-transform: uppercase;
  color: #9a7b3f;
}
.tc-venue-name {
  margin-top: 10px; font-family: var(--font-display); font-weight: 600;
  font-size: 1.22rem; line-height: 1.4; color: #14532d; overflow-wrap: anywhere;
}
.tc-venue-addr {
  margin-top: 6px; font-size: 0.84rem; line-height: 1.65;
  color: rgba(20, 83, 45, 0.6); overflow-wrap: anywhere;
}
.tc-actions { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-top: 16px; }
.tc-btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 10px 18px; cursor: pointer;
  font-family: inherit; font-size: 0.76rem; font-weight: 600;
  letter-spacing: 0.1em; text-transform: uppercase;
  color: #14532d; background: transparent;
  border: 1px solid rgba(20, 83, 45, 0.4);
  transition: background 0.25s, border-color 0.25s;
}
.tc-btn:hover { background: rgba(20, 83, 45, 0.07); border-color: #14532d; }
.tc-btn:focus-visible { outline: 2px solid #9a7b3f; outline-offset: 3px; }

/* ---- Entrance ---- */
.tc-inner > * { opacity: 0; transform: translateY(16px); animation: settle 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes settle { to { opacity: 1; transform: none; } }
.tc-inner > *:nth-child(1) { animation-delay: 0.05s; }
.tc-inner > *:nth-child(2) { animation-delay: 0.12s; }
.tc-inner > *:nth-child(3) { animation-delay: 0.19s; }
.tc-inner > *:nth-child(4) { animation-delay: 0.26s; }
.tc-inner > *:nth-child(5) { animation-delay: 0.33s; }
.tc-inner > *:nth-child(6) { animation-delay: 0.40s; }
.tc-inner > *:nth-child(7) { animation-delay: 0.47s; }
.tc-inner > *:nth-child(8) { animation-delay: 0.54s; }
.tc-inner > *:nth-child(9) { animation-delay: 0.61s; }
.tc-inner > *:nth-child(n+10) { animation-delay: 0.68s; }

@media (max-width: 600px) {
  .tc-inner { padding: 36px 18px; }
  .tc-rule-outer { inset: 10px; }
  .tc-corner { width: 17px; height: 17px; }
  .tc-tl, .tc-tr { top: 5px; }
  .tc-bl, .tc-br { bottom: 5px; }
  .tc-tl, .tc-bl { left: 5px; }
  .tc-tr, .tc-br { right: 5px; }
  .tc-request { font-size: 0.76rem; letter-spacing: 0.06em; }
  .tc-actions .tc-btn { flex: 1 1 auto; justify-content: center; }
}

@media (prefers-reduced-motion: reduce) {
  .tc-inner > * { opacity: 1; transform: none; animation: none; }
}
</style>
