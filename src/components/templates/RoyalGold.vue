<template>
  <div class="template-royal">
    <div class="royal-ornament top-left"><Icon name="Sparkles" size="16" /></div>
    <div class="royal-ornament top-right"><Icon name="Sparkles" size="16" /></div>
    <div class="royal-ornament bottom-left"><Icon name="Sparkles" size="16" /></div>
    <div class="royal-ornament bottom-right"><Icon name="Sparkles" size="16" /></div>

    <div class="royal-content">
      <p class="royal-invite-text">You Are Cordially Invited</p>
      <div class="royal-divider"></div>
      <div class="royal-names">
        <h1 class="royal-name">{{ invitation.brideName }}</h1>
        <span class="royal-amp">&</span>
        <h1 class="royal-name">{{ invitation.groomName }}</h1>
      </div>
      <p v-if="invitation.customMessage" class="royal-message">"{{ invitation.customMessage }}"</p>

      <CountdownTimer :date="invitation.weddingDate" :time="invitation.weddingTime" theme="gold" />
      <div class="royal-details">
        <div class="royal-detail">
          <span class="detail-label">Date</span>
          <span class="detail-value">{{ formatDate(invitation.weddingDate) }}</span>
        </div>
        <div class="royal-detail">
          <span class="detail-label">Time</span>
          <span class="detail-value">{{ formatTime(invitation.weddingTime) }}</span>
        </div>
        <div class="royal-detail">
          <span class="detail-label">Venue</span>
          <span class="detail-value">{{ invitation.venueName }}</span>
          <span class="detail-sub">{{ invitation.venueAddress }}</span>
          <a v-if="invitation.venueMapUrl" :href="invitation.venueMapUrl" target="_blank" class="map-link"><Icon name="MapPin" size="16" /> View on Maps</a>
        </div>
      </div>
      <RsvpForm :invitationId="invitation.id" theme="gold" />
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
.template-royal {
  min-height: 100vh; position: relative; overflow: hidden;
  background: linear-gradient(160deg, #1a0a00 0%, #2d1810 30%, #1a0a00 60%, #0d0500 100%);
  padding: 48px 20px;
}
.template-royal::before {
  content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
  background: radial-gradient(circle at center, rgba(212,175,55,0.12) 0%, transparent 60%);
  animation: ethereal-glow 15s ease-in-out infinite alternate; pointer-events: none; z-index: 0;
}
@keyframes ethereal-glow { 0% { transform: scale(0.8) translate(5%, 5%); } 100% { transform: scale(1.2) translate(-5%, -5%); } }

@media (min-width: 900px) {
  .template-royal { padding: 80px 40px; background-attachment: fixed; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
  .royal-content {
    background: linear-gradient(145deg, rgba(30,15,5,0.95), rgba(15,5,0,0.95));
    border: 1px solid rgba(212,175,55,0.2);
    box-shadow: 0 40px 80px -20px rgba(0,0,0,0.9), 0 0 0 1px rgba(212,175,55,0.05) inset;
    padding: 50px 40px; border-radius: 32px; position: relative; z-index: 10;
    max-width: 480px !important; text-align: center; margin: 0;
  }
}

.royal-ornament {
  position: absolute; font-size: 3rem; color: rgba(212,175,55,0.15); user-select: none;
}
.top-left { top: 20px; left: 20px; }
.top-right { top: 20px; right: 20px; }
.bottom-left { bottom: 20px; left: 20px; }
.bottom-right { bottom: 20px; right: 20px; }

.royal-content {
  position: relative; z-index: 10; width: 100%; max-width: 500px; margin: 0 auto; text-align: center;
  background: linear-gradient(145deg, rgba(30,15,5,0.95), rgba(15,5,0,0.95)); padding: 40px 20px;
  border-radius: 20px; border: 1px solid rgba(212,175,55,0.2);
}
@media (max-width: 899px) { .royal-content { background: transparent; padding: 0; border: none; } }
.royal-invite-text {
  color: #d4af37; font-size: 0.8rem; letter-spacing: 0.3em; text-transform: uppercase;
  font-weight: 600; margin-bottom: 16px;
}
.royal-divider { width: 80px; height: 1px; background: linear-gradient(90deg, transparent, #d4af37, transparent); margin: 0 auto 32px; }
.royal-names { margin-bottom: 24px; }
.royal-name {
  font-family: var(--font-display); font-size: 2.8rem; color: #f5e6c8;
  font-weight: 700; line-height: 1.2;
}
.royal-amp { font-family: var(--font-script); font-size: 2rem; color: #d4af37; display: block; margin: 8px 0; }
.royal-message {
  font-style: italic; color: rgba(245,230,200,0.7); font-size: 1rem;
  margin-bottom: 32px; line-height: 1.6;
}
.royal-details {
  background: rgba(212,175,55,0.08); border: 1px solid rgba(212,175,55,0.15);
  border-radius: 16px; padding: 28px; margin: 32px 0;
  display: flex; flex-direction: column; gap: 20px;
}
.detail-label { display: block; font-size: 0.7rem; color: #d4af37; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 4px; }
.detail-value { display: block; font-size: 1.1rem; color: #f5e6c8; font-weight: 600; }
.detail-sub { display: block; font-size: 0.8rem; color: rgba(245,230,200,0.5); margin-top: 4px; }
.map-link { display: inline-block; color: #d4af37; font-size: 0.8rem; margin-top: 8px; text-decoration: underline; }

.royal-content > * { opacity: 0; transform: translateY(20px); animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }
.royal-content > *:nth-child(1) { animation-delay: 0.1s; }
.royal-content > *:nth-child(2) { animation-delay: 0.2s; }
.royal-content > *:nth-child(3) { animation-delay: 0.3s; }
.royal-content > *:nth-child(4) { animation-delay: 0.4s; }
.royal-content > *:nth-child(5) { animation-delay: 0.5s; }
.royal-content > *:nth-child(6) { animation-delay: 0.6s; }
.royal-content > *:nth-child(7) { animation-delay: 0.7s; }
.royal-content > *:nth-child(8) { animation-delay: 0.8s; }
</style>
