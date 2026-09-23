<template>
  <div class="royal">
    <div class="rv-orb rv-orb-a" aria-hidden="true"></div>
    <div class="rv-orb rv-orb-b" aria-hidden="true"></div>
    <div class="rv-grain" aria-hidden="true"></div>

    <article class="rv-card">
      <!-- Engraved double rule with corner flourishes -->
      <span class="rv-frame" aria-hidden="true"></span>
      <span class="rv-corner rv-corner-tl" aria-hidden="true"></span>
      <span class="rv-corner rv-corner-tr" aria-hidden="true"></span>
      <span class="rv-corner rv-corner-bl" aria-hidden="true"></span>
      <span class="rv-corner rv-corner-br" aria-hidden="true"></span>

      <div class="rv-inner">
        <header class="rv-header">
          <div class="rv-monogram">
            <span>{{ initial(invitation.brideName) }}</span>
            <i class="rv-mono-amp"><Icon name="Heart" size="13" /></i>
            <span>{{ initial(invitation.groomName) }}</span>
          </div>
          <p class="rv-eyebrow">Together with their families</p>
        </header>

        <div class="rv-names">
          <h1 class="rv-name">{{ invitation.brideName }}</h1>
          <div class="rv-divider">
            <span class="rv-line"></span>
            <span class="rv-amp">&amp;</span>
            <span class="rv-line"></span>
          </div>
          <h1 class="rv-name">{{ invitation.groomName }}</h1>
          <p class="rv-request">request the honour of your presence</p>
        </div>

        <!-- Formal date band: the centrepiece of classic stationery -->
        <div class="rv-dateband">
          <span class="rv-db-side">{{ weekday }}</span>
          <span class="rv-db-rule"></span>
          <span class="rv-db-day">{{ dayNumber }}</span>
          <span class="rv-db-rule"></span>
          <span class="rv-db-side">
            {{ monthName }}
            <em>{{ yearNumber }}</em>
          </span>
        </div>
        <p class="rv-time"><Icon name="Clock" size="13" /> {{ formatTime(invitation.weddingTime) }}</p>

        <p v-if="invitation.customMessage" class="rv-message">“{{ invitation.customMessage }}”</p>

        <div class="rv-seal" aria-hidden="true"><Icon name="Sparkles" size="18" /></div>

        <CountdownTimer :date="invitation.weddingDate" :time="invitation.weddingTime" theme="gold" />

        <section class="rv-venue">
          <p class="rv-venue-label">The Celebration</p>
          <h2 class="rv-venue-name">{{ invitation.venueName }}</h2>
          <p v-if="invitation.venueAddress" class="rv-venue-addr">{{ invitation.venueAddress }}</p>
          <div class="rv-venue-actions">
            <a
              v-if="invitation.venueMapUrl"
              :href="invitation.venueMapUrl"
              target="_blank"
              rel="noopener"
              class="rv-btn"
            >
              <Icon name="MapPin" size="15" /> Directions
            </a>
            <button type="button" class="rv-btn" @click="addToCalendar">
              <Icon name="CalendarPlus" size="15" /> Add to calendar
            </button>
          </div>
        </section>

        <RsvpForm :invitationId="invitation.id" theme="gold" />

        <footer class="rv-footer">
          <span class="rv-line"></span>
          <Icon name="Sparkles" size="13" />
          <span class="rv-line"></span>
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

const weekday = computed(() => weddingDate.value?.toLocaleDateString('en-US', { weekday: 'long' }) || '')
const dayNumber = computed(() => weddingDate.value ? String(weddingDate.value.getDate()).padStart(2, '0') : '')
const monthName = computed(() => weddingDate.value?.toLocaleDateString('en-US', { month: 'long' }) || '')
const yearNumber = computed(() => weddingDate.value?.getFullYear() || '')

function initial(n) { return (n || '?').trim().charAt(0).toUpperCase() }

function formatTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':')
  const d = new Date()
  d.setHours(+h, +m)
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

/** Builds an .ics the guest's calendar app opens — no third-party service. */
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
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Cardogen//Wedding Invitation//EN',
    'BEGIN:VEVENT',
    `UID:${inv.shortCode || Date.now()}@cardogen`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${esc(`${inv.brideName} & ${inv.groomName} — Wedding`)}`,
    `LOCATION:${esc([inv.venueName, inv.venueAddress].filter(Boolean).join(', '))}`,
    `DESCRIPTION:${esc(inv.customMessage || 'We would be honoured by your presence.')}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n')

  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `${(inv.brideName || 'wedding')}-${(inv.groomName || 'invitation')}.ics`.toLowerCase().replace(/\s+/g, '-')
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
</script>

<style scoped>
.royal {
  position: relative; min-height: 100vh; min-height: 100dvh; overflow: hidden;
  background: radial-gradient(ellipse at top, #2d1810 0%, #1a0a00 52%, #0a0400 100%);
  padding: 36px 16px max(36px, env(safe-area-inset-bottom));
  display: flex; align-items: center; justify-content: center;
}

.rv-orb { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; opacity: 0.42; }
.rv-orb-a {
  width: 480px; height: 480px; top: -150px; right: -150px;
  background: radial-gradient(circle, rgba(212,175,55,0.35), transparent 62%);
  animation: drift 20s ease-in-out infinite alternate;
}
.rv-orb-b {
  width: 380px; height: 380px; bottom: -120px; left: -120px;
  background: radial-gradient(circle, rgba(184,107,11,0.3), transparent 62%);
  animation: drift 26s ease-in-out infinite alternate-reverse;
}
@keyframes drift { to { transform: translate(28px, 28px) scale(1.14); } }

/* Faint paper grain keeps the large dark areas from banding. */
.rv-grain {
  position: absolute; inset: 0; z-index: 1; pointer-events: none;
  opacity: 0.16; mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E");
}

.rv-card {
  position: relative; z-index: 10; width: 100%; max-width: 540px;
  background: linear-gradient(160deg, rgba(32,17,6,0.98), rgba(10,4,0,0.99));
  border: 1px solid rgba(212,175,55,0.28);
  border-radius: 26px;
  box-shadow:
    0 60px 110px -35px rgba(0,0,0,0.92),
    0 0 0 1px rgba(212,175,55,0.08) inset,
    0 0 90px rgba(212,175,55,0.07) inset;
}
.rv-inner { padding: 42px 24px; text-align: center; }
@media (min-width: 900px) { .rv-inner { padding: 58px 44px; } }

/* ---- Engraved frame ---- */
.rv-frame {
  position: absolute; inset: 14px;
  border: 1px solid rgba(212,175,55,0.22);
  border-radius: 18px; pointer-events: none;
}
.rv-frame::after {
  content: ''; position: absolute; inset: 5px;
  border: 1px solid rgba(212,175,55,0.1);
  border-radius: 14px;
}
.rv-corner {
  position: absolute; width: 26px; height: 26px; pointer-events: none;
  border-color: rgba(212,175,55,0.55);
}
.rv-corner-tl { top: 9px; left: 9px; border-top: 2px solid; border-left: 2px solid; border-top-left-radius: 14px; }
.rv-corner-tr { top: 9px; right: 9px; border-top: 2px solid; border-right: 2px solid; border-top-right-radius: 14px; }
.rv-corner-bl { bottom: 9px; left: 9px; border-bottom: 2px solid; border-left: 2px solid; border-bottom-left-radius: 14px; }
.rv-corner-br { bottom: 9px; right: 9px; border-bottom: 2px solid; border-right: 2px solid; border-bottom-right-radius: 14px; }

/* ---- Header ---- */
.rv-header { margin-bottom: 26px; }
.rv-monogram {
  display: inline-flex; align-items: center; gap: 9px;
  padding: 12px 20px; margin-bottom: 18px;
  border: 1px solid rgba(212,175,55,0.35);
  border-radius: 100px;
  background: rgba(212,175,55,0.06);
}
.rv-monogram span {
  font-family: var(--font-display); font-size: 1.3rem; font-weight: 700;
  color: #f5e6c8; letter-spacing: 0.05em;
}
.rv-mono-amp { color: #d4af37; display: inline-flex; align-items: center; }
.rv-eyebrow {
  font-size: 0.68rem; letter-spacing: 0.34em; text-transform: uppercase;
  color: rgba(212,175,55,0.85); font-weight: 600;
}

/* ---- Names ---- */
.rv-names { margin: 6px 0 26px; }
.rv-name {
  font-family: var(--font-display); font-weight: 700;
  font-size: clamp(2.2rem, 8vw, 3.1rem); line-height: 1.12; margin: 2px 0;
  letter-spacing: 0.01em;
  background: linear-gradient(100deg, #e8d4a8 0%, #fff6e0 42%, #d4af37 58%, #e8d4a8 100%);
  background-size: 250% 100%;
  -webkit-background-clip: text; background-clip: text; color: transparent;
  animation: sheen 7s ease-in-out infinite;
}
@keyframes sheen {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
.rv-divider { display: flex; align-items: center; justify-content: center; gap: 15px; margin: 6px 0; }
.rv-line { width: 58px; height: 1px; background: linear-gradient(90deg, transparent, #d4af37, transparent); }
.rv-amp { font-family: var(--font-script, serif); font-size: 1.9rem; color: #d4af37; }
.rv-request {
  margin-top: 14px; font-size: 0.78rem; letter-spacing: 0.16em;
  text-transform: uppercase; color: rgba(245,230,200,0.55);
}

/* ---- Date band ---- */
.rv-dateband {
  display: flex; align-items: center; justify-content: center; gap: 16px;
  padding: 16px 10px; margin: 6px auto 10px; max-width: 420px;
  border-top: 1px solid rgba(212,175,55,0.22);
  border-bottom: 1px solid rgba(212,175,55,0.22);
}
.rv-db-side {
  display: flex; flex-direction: column; gap: 3px; flex: 1;
  font-size: 0.72rem; letter-spacing: 0.2em; text-transform: uppercase;
  color: rgba(212,175,55,0.9);
}
.rv-db-side em { font-style: normal; color: rgba(245,230,200,0.6); letter-spacing: 0.14em; }
.rv-db-rule { width: 1px; height: 34px; background: rgba(212,175,55,0.25); }
.rv-db-day {
  font-family: var(--font-display); font-size: clamp(2.1rem, 9vw, 2.8rem);
  font-weight: 700; color: #f5e6c8; line-height: 1; min-width: 2ch;
}
.rv-time {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 0.82rem; color: rgba(245,230,200,0.7); letter-spacing: 0.08em;
}

.rv-message {
  font-style: italic; color: rgba(245,230,200,0.72); font-size: 0.94rem;
  margin: 22px auto 20px; max-width: 370px; line-height: 1.75;
}

.rv-seal {
  width: 50px; height: 50px; border-radius: 50%; margin: 0 auto 6px;
  background: radial-gradient(circle, rgba(212,175,55,0.22), rgba(212,175,55,0.05));
  border: 1px solid rgba(212,175,55,0.3);
  display: flex; align-items: center; justify-content: center; color: #d4af37;
}

/* ---- Venue ---- */
.rv-venue {
  background: rgba(212,175,55,0.05);
  border: 1px solid rgba(212,175,55,0.18);
  border-radius: 18px; padding: 24px 20px; margin: 26px 0;
}
.rv-venue-label {
  font-size: 0.66rem; letter-spacing: 0.3em; text-transform: uppercase;
  color: rgba(212,175,55,0.9); margin-bottom: 10px;
}
.rv-venue-name {
  font-family: var(--font-display); font-size: 1.25rem; font-weight: 600;
  color: #f5e6c8; line-height: 1.35; overflow-wrap: anywhere;
}
.rv-venue-addr {
  margin-top: 7px; font-size: 0.85rem; line-height: 1.6;
  color: rgba(245,230,200,0.6); overflow-wrap: anywhere;
}
.rv-venue-actions { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-top: 18px; }
.rv-btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 11px 20px; border-radius: 100px; cursor: pointer;
  border: 1px solid rgba(212,175,55,0.4);
  background: rgba(212,175,55,0.08); color: #f5e6c8;
  font-family: inherit; font-size: 0.82rem; font-weight: 600; letter-spacing: 0.02em;
  transition: background 0.25s, border-color 0.25s, transform 0.2s;
}
.rv-btn:hover { background: rgba(212,175,55,0.18); border-color: rgba(212,175,55,0.7); transform: translateY(-1px); }
.rv-btn:focus-visible { outline: 2px solid #d4af37; outline-offset: 3px; }

.rv-footer {
  display: flex; align-items: center; justify-content: center; gap: 12px;
  margin-top: 26px; color: #d4af37; opacity: 0.55;
}
.rv-footer .rv-line { width: 78px; }

/* ---- Entrance ---- */
.rv-inner > * { opacity: 0; transform: translateY(18px); animation: fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeUp { to { opacity: 1; transform: none; } }
.rv-inner > *:nth-child(1) { animation-delay: 0.05s; }
.rv-inner > *:nth-child(2) { animation-delay: 0.13s; }
.rv-inner > *:nth-child(3) { animation-delay: 0.21s; }
.rv-inner > *:nth-child(4) { animation-delay: 0.29s; }
.rv-inner > *:nth-child(5) { animation-delay: 0.37s; }
.rv-inner > *:nth-child(6) { animation-delay: 0.45s; }
.rv-inner > *:nth-child(7) { animation-delay: 0.53s; }
.rv-inner > *:nth-child(8) { animation-delay: 0.61s; }
.rv-inner > *:nth-child(9) { animation-delay: 0.69s; }
.rv-inner > *:nth-child(10) { animation-delay: 0.77s; }
.rv-inner > *:nth-child(n+11) { animation-delay: 0.85s; }

@media (max-width: 600px) {
  .rv-inner { padding: 34px 18px; }
  .rv-frame { inset: 10px; }
  .rv-corner { width: 20px; height: 20px; }
  .rv-corner-tl, .rv-corner-tr { top: 6px; }
  .rv-corner-bl, .rv-corner-br { bottom: 6px; }
  .rv-corner-tl, .rv-corner-bl { left: 6px; }
  .rv-corner-tr, .rv-corner-br { right: 6px; }
  .rv-dateband { gap: 10px; padding: 14px 4px; }
  .rv-db-side { font-size: 0.62rem; letter-spacing: 0.14em; }
  .rv-venue-actions .rv-btn { flex: 1 1 auto; justify-content: center; }
  /* Big blurs are expensive on phones — shrink them rather than animate them. */
  .rv-orb { filter: blur(56px); animation: none; }
  .rv-orb-a { width: 300px; height: 300px; }
  .rv-orb-b { width: 240px; height: 240px; }
}

@media (prefers-reduced-motion: reduce) {
  .rv-orb, .rv-name { animation: none; }
  .rv-inner > * { opacity: 1; transform: none; animation: none; }
}
</style>
