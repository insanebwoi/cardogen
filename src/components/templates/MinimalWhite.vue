<template>
  <div class="min-v2">
    <article class="mv2-card">
      <header class="mv2-head">
        <span class="mv2-dot"></span>
        <span class="mv2-badge">Wedding Invitation</span>
        <span class="mv2-dot"></span>
      </header>

      <section class="mv2-hero">
        <h1 class="mv2-name">{{ invitation.brideName }}</h1>
        <div class="mv2-amp-row">
          <span class="mv2-amp-line"></span>
          <span class="mv2-amp">&</span>
          <span class="mv2-amp-line"></span>
        </div>
        <h1 class="mv2-name">{{ invitation.groomName }}</h1>
      </section>

      <p v-if="invitation.customMessage" class="mv2-quote">“{{ invitation.customMessage }}”</p>

      <CountdownTimer :date="invitation.weddingDate" :time="invitation.weddingTime" theme="minimal" />

      <section class="mv2-info">
        <div class="mv2-row">
          <span class="mv2-label">Date</span>
          <span class="mv2-value">{{ formatDate(invitation.weddingDate) }}</span>
        </div>
        <div class="mv2-row">
          <span class="mv2-label">Time</span>
          <span class="mv2-value">{{ formatTime(invitation.weddingTime) }}</span>
        </div>
        <div class="mv2-row">
          <span class="mv2-label">Venue</span>
          <span class="mv2-value">
            {{ invitation.venueName }}
            <small>{{ invitation.venueAddress }}</small>
            <a v-if="invitation.venueMapUrl" :href="invitation.venueMapUrl" target="_blank">Open in Maps</a>
          </span>
        </div>
      </section>

      <RsvpForm :invitationId="invitation.id" theme="minimal" />

      <footer class="mv2-foot">
        <span>With love, forever</span>
      </footer>
    </article>
  </div>
</template>

<script setup>
import CountdownTimer from '@/components/card/CountdownTimer.vue'
import RsvpForm from '@/components/card/RsvpForm.vue'
defineProps({ invitation: Object })
function formatDate(d) { return d ? new Date(d).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '' }
function formatTime(t) { if (!t) return ''; const [h,m] = t.split(':'); const d = new Date(); d.setHours(+h,+m); return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) }
</script>

<style scoped>
.min-v2 {
  min-height: 100vh; background: #f6f5f2; padding: 40px 18px;
  display: flex; align-items: center; justify-content: center;
}
.mv2-card {
  width: 100%; max-width: 520px; background: #fff;
  border: 1px solid #e7e5e4; border-radius: 2px;
  padding: 56px 28px; text-align: center;
  box-shadow: 0 40px 80px -40px rgba(0,0,0,0.2);
  position: relative;
}
.mv2-card::before, .mv2-card::after {
  content: ''; position: absolute; left: 16px; right: 16px; height: 1px; background: #111; opacity: 0.4;
}
.mv2-card::before { top: 16px; }
.mv2-card::after { bottom: 16px; }
@media (min-width: 900px) { .mv2-card { padding: 72px 56px; } }

.mv2-head { display: flex; align-items: center; justify-content: center; gap: 14px; margin-bottom: 36px; }
.mv2-dot { width: 4px; height: 4px; background: #292524; border-radius: 50%; }
.mv2-badge { font-size: 0.7rem; letter-spacing: 0.35em; color: #292524; font-weight: 700; text-transform: uppercase; }

.mv2-hero { margin: 8px 0 20px; }
.mv2-name {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(2.6rem, 8vw, 3.6rem);
  color: #1c1917; font-weight: 400; letter-spacing: -0.02em; line-height: 1.05;
}
.mv2-amp-row { display: flex; align-items: center; justify-content: center; gap: 16px; margin: 12px 0; }
.mv2-amp-line { width: 40px; height: 1px; background: #a8a29e; }
.mv2-amp { font-style: italic; font-size: 1.6rem; color: #78716c; font-family: 'Playfair Display', serif; }

.mv2-quote {
  font-family: 'Playfair Display', serif; font-style: italic;
  font-size: 1rem; color: #57534e; margin: 28px auto; max-width: 380px; line-height: 1.7;
}

.mv2-info {
  border-top: 1px solid #e7e5e4; border-bottom: 1px solid #e7e5e4;
  padding: 8px 0; margin: 36px 0;
}
.mv2-row { padding: 18px 4px; display: grid; grid-template-columns: 100px 1fr; align-items: start; text-align: left; gap: 16px; }
.mv2-row + .mv2-row { border-top: 1px solid #f5f5f4; }
.mv2-label { font-size: 0.7rem; letter-spacing: 0.2em; color: #a8a29e; text-transform: uppercase; font-weight: 700; padding-top: 2px; }
.mv2-value { font-size: 0.95rem; color: #292524; display: flex; flex-direction: column; gap: 4px; }
.mv2-value small { font-size: 0.8rem; color: #78716c; }
.mv2-value a { font-size: 0.8rem; color: #292524; text-decoration: underline; margin-top: 4px; width: fit-content; }

.mv2-foot { margin-top: 24px; font-family: 'Playfair Display', serif; font-style: italic; color: #a8a29e; font-size: 0.9rem; }

.mv2-card > * { opacity: 0; transform: translateY(16px); animation: mv2-up 0.7s cubic-bezier(0.16,1,0.3,1) forwards; }
@keyframes mv2-up { to { opacity: 1; transform: translateY(0); } }
.mv2-card > *:nth-child(1) { animation-delay: 0.05s; }
.mv2-card > *:nth-child(2) { animation-delay: 0.15s; }
.mv2-card > *:nth-child(3) { animation-delay: 0.25s; }
.mv2-card > *:nth-child(4) { animation-delay: 0.35s; }
.mv2-card > *:nth-child(5) { animation-delay: 0.45s; }
.mv2-card > *:nth-child(6) { animation-delay: 0.55s; }
.mv2-card > *:nth-child(7) { animation-delay: 0.65s; }
</style>
