<template>
  <div class="template-traditional">
    <div class="trad-border">
      <div class="trad-inner">
          <div class="trad-ornaments">
            <span><Icon name="Stars" size="16" /></span><span><Icon name="Stars" size="16" /></span><span><Icon name="Stars" size="16" /></span>
          </div>
          <p class="trad-bismillah">بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ</p>
          <p class="trad-subtitle">With the blessings of the Almighty</p>
          <div class="trad-names">
            <h1>{{ invitation.brideName }}</h1>
            <div class="trad-heart"><Icon name="Heart" size="16" /></div>
            <h1>{{ invitation.groomName }}</h1>
          </div>
          <p class="trad-invite">You are warmly invited to celebrate the union</p>
          <p v-if="invitation.customMessage" class="trad-message">"{{ invitation.customMessage }}"</p>
          <CountdownTimer :date="invitation.weddingDate" :time="invitation.weddingTime" theme="green" />
          <div class="trad-details">
            <div class="td-row"><span><Icon name="Calendar" size="16" /></span><div><strong>{{ formatDate(invitation.weddingDate) }}</strong></div></div>
            <div class="td-row"><span><Icon name="MoonStar" size="16" /></span><div><strong>{{ formatTime(invitation.weddingTime) }}</strong></div></div>
            <div class="td-row"><span><Icon name="MapPin" size="16" /></span><div><strong>{{ invitation.venueName }}</strong><br/><small>{{ invitation.venueAddress }}</small></div></div>
          </div>
          <a v-if="invitation.venueMapUrl" :href="invitation.venueMapUrl" target="_blank" class="trad-map">View on Google Maps →</a>
          <RsvpForm :invitationId="invitation.id" theme="green" />
      </div>
    </div>
  </div>
</template>

<script setup>
import CountdownTimer from '@/components/card/CountdownTimer.vue'
import RsvpForm from '@/components/card/RsvpForm.vue'
defineProps({ invitation: Object })
function formatDate(d) { return new Date(d).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }
function formatTime(t) { const [h,m] = t.split(':'); const d = new Date(); d.setHours(+h,+m); return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) }
</script>

<style scoped>
.template-traditional {
  min-height: 100vh; position: relative; overflow: hidden;
  background: linear-gradient(160deg, #064e3b, #065f46, #047857); padding: 32px 16px;
  display: flex; align-items: center; justify-content: center;
}
.template-traditional::before {
  content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
  background: radial-gradient(circle at center, rgba(110,231,183,0.15) 0%, transparent 60%);
  animation: ethereal-glow 15s ease-in-out infinite alternate; pointer-events: none; z-index: 0;
}
@keyframes ethereal-glow { 0% { transform: scale(0.8) translate(5%, 5%); } 100% { transform: scale(1.2) translate(-5%, -5%); } }

@media (min-width: 900px) {
  .template-traditional { padding: 80px 40px; background-attachment: fixed; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
  .trad-border {
    background: rgba(4,120,87,0.3); backdrop-filter: blur(10px);
    box-shadow: 0 40px 80px -20px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(110,231,183,0.2);
    width: 100%; max-width: 480px !important; border-radius: 32px; padding: 12px; margin: 0;
  }
}
.trad-border { position: relative; z-index: 10; border: 2px solid rgba(167,243,208,0.3); border-radius: 20px; padding: 8px; width: 100%; max-width: 520px; }
.trad-inner { background: rgba(0,0,0,0.2); border-radius: 16px; padding: 40px 24px; text-align: center; backdrop-filter: blur(4px); margin: 0; }
.trad-ornaments { margin-bottom: 16px; color: #6ee7b7; font-size: 1.2rem; letter-spacing: 16px; }
.trad-bismillah { font-size: 1.6rem; color: #a7f3d0; margin-bottom: 8px; }
.trad-subtitle { color: #6ee7b7; font-size: 0.8rem; letter-spacing: 0.1em; margin-bottom: 32px; }
.trad-names h1 { font-family: var(--font-display); font-size: 2.6rem; color: #ecfdf5; font-weight: 700; }
.trad-heart { font-size: 1.5rem; color: #f43f5e; margin: 8px 0; }
.trad-invite { color: #a7f3d0; font-size: 0.9rem; margin-top: 20px; }
.trad-message { color: rgba(167,243,208,0.7); font-style: italic; margin: 16px 0; }
.trad-details {
  background: rgba(255,255,255,0.08); border-radius: 14px; padding: 24px; margin: 28px 0;
  display: flex; flex-direction: column; gap: 16px;
}
.td-row { display: flex; align-items: flex-start; gap: 12px; text-align: left; }
.td-row span { font-size: 1.2rem; margin-top: 2px; }
.td-row strong { color: #ecfdf5; font-size: 0.95rem; }
.td-row small { color: #6ee7b7; font-size: 0.8rem; }
.trad-map { display: inline-block; color: #6ee7b7; font-size: 0.85rem; margin-bottom: 24px; font-weight: 600; }

.trad-inner > * { opacity: 0; transform: translateY(20px); animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }
.trad-inner > *:nth-child(1) { animation-delay: 0.1s; }
.trad-inner > *:nth-child(2) { animation-delay: 0.15s; }
.trad-inner > *:nth-child(3) { animation-delay: 0.2s; }
.trad-inner > *:nth-child(4) { animation-delay: 0.25s; }
.trad-inner > *:nth-child(5) { animation-delay: 0.3s; }
.trad-inner > *:nth-child(6) { animation-delay: 0.35s; }
.trad-inner > *:nth-child(7) { animation-delay: 0.4s; }
.trad-inner > *:nth-child(8) { animation-delay: 0.45s; }
.trad-inner > *:nth-child(9) { animation-delay: 0.5s; }
.trad-inner > *:nth-child(10) { animation-delay: 0.55s; }
.trad-inner > *:nth-child(11) { animation-delay: 0.6s; }
</style>
