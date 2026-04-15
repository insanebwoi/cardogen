<template>
  <div class="template-floral">
    <div class="floral-petals">
      <span v-for="i in 12" :key="i" class="petal" :style="{ '--i': i }"><Icon name="Sparkles" size="18" /></span>
    </div>
    <div class="floral-content">
      <p class="floral-top-text">Together with their families</p>
      <div class="floral-names">
        <h1>{{ invitation.brideName }}</h1>
        <span class="floral-and">and</span>
        <h1>{{ invitation.groomName }}</h1>
      </div>
      <p class="floral-invite">Request the pleasure of your company at their wedding celebration</p>
      <p v-if="invitation.customMessage" class="floral-message">"{{ invitation.customMessage }}"</p>

      <CountdownTimer :date="invitation.weddingDate" :time="invitation.weddingTime" theme="pink" />
      <div class="floral-details">
        <div class="fd-item"><span class="fd-icon"><Icon name="Calendar" size="16" /></span><strong>{{ formatDate(invitation.weddingDate) }}</strong></div>
        <div class="fd-item"><span class="fd-icon"><Icon name="Clock" size="16" /></span><strong>{{ formatTime(invitation.weddingTime) }}</strong></div>
        <div class="fd-item"><span class="fd-icon"><Icon name="MapPin" size="16" /></span><strong>{{ invitation.venueName }}</strong><small>{{ invitation.venueAddress }}</small></div>
        <a v-if="invitation.venueMapUrl" :href="invitation.venueMapUrl" target="_blank" class="map-btn">View on Google Maps →</a>
      </div>
      <RsvpForm :invitationId="invitation.id" theme="pink" />
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
.template-floral {
  min-height: 100vh; position: relative; overflow: hidden;
  background: linear-gradient(180deg, #fff5f7 0%, #fdf2f8 50%, #fce7f3 100%);
  padding: 48px 20px;
}
.template-floral::before {
  content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
  background: radial-gradient(circle at center, rgba(244,114,182,0.1) 0%, transparent 60%);
  animation: ethereal-glow 15s ease-in-out infinite alternate; pointer-events: none; z-index: 0;
}
@keyframes ethereal-glow { 0% { transform: scale(0.8) translate(5%, 5%); } 100% { transform: scale(1.2) translate(-5%, -5%); } }

@media (min-width: 900px) {
  .template-floral { padding: 80px 40px; background-attachment: fixed; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
  .floral-content {
    background: rgba(255,255,255,0.95);
    border: 1px solid rgba(244,114,182,0.3);
    box-shadow: 0 40px 80px -20px rgba(244,114,182,0.15), 0 0 0 8px rgba(255,255,255,0.4) inset;
    padding: 50px 40px; border-radius: 32px; position: relative; z-index: 10;
    max-width: 480px !important; text-align: center;
  }
}

.floral-petals { position: absolute; inset: 0; pointer-events: none; overflow: hidden; z-index: 0; }
.petal {
  position: absolute; font-size: 1.5rem; opacity: 0.15;
  animation: fall 8s linear infinite;
  animation-delay: calc(var(--i) * 0.6s);
  left: calc(var(--i) * 8%);
  top: -30px;
}
@keyframes fall {
  to { transform: translateY(110vh) rotate(360deg); opacity: 0; }
}
.floral-content {
  position: relative; z-index: 10; width: 100%; max-width: 500px; margin: 0 auto; text-align: center;
  background: rgba(255,255,255,0.85); backdrop-filter: blur(10px); padding: 40px 20px;
  border-radius: 20px; border: 1px solid rgba(244,114,182,0.2);
}
@media (max-width: 899px) { .floral-content { background: transparent; backdrop-filter: none; padding: 0; border: none; } }
.floral-top-text { color: #be185d; font-size: 0.85rem; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 24px; }
.floral-names h1 { font-family: var(--font-script); font-size: 3rem; color: #9d174d; line-height: 1.2; }
.floral-and { font-family: var(--font-body); font-size: 1rem; color: #f472b6; display: block; margin: 4px 0; }
.floral-invite { font-size: 0.95rem; color: #831843; margin: 24px 0; line-height: 1.6; }
.floral-message { font-style: italic; color: #be185d; font-size: 0.9rem; margin-bottom: 24px; }
.floral-details {
  background: rgba(255,255,255,0.7); backdrop-filter: blur(10px);
  border-radius: 16px; padding: 24px; margin: 32px 0;
  border: 1px solid rgba(244,114,182,0.2);
}
.fd-item { padding: 10px 0; display: flex; align-items: center; gap: 12px; flex-direction: column; }
.fd-item + .fd-item { border-top: 1px solid rgba(244,114,182,0.1); }
.fd-icon { font-size: 1.2rem; }
.fd-item strong { color: #831843; font-size: 1rem; }
.fd-item small { color: #9d174d; font-size: 0.8rem; opacity: 0.7; }
.map-btn { display: inline-block; color: #be185d; font-size: 0.85rem; margin-top: 8px; font-weight: 600; }

.floral-content > * { opacity: 0; transform: translateY(20px); animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }
.floral-content > *:nth-child(1) { animation-delay: 0.1s; }
.floral-content > *:nth-child(2) { animation-delay: 0.2s; }
.floral-content > *:nth-child(3) { animation-delay: 0.3s; }
.floral-content > *:nth-child(4) { animation-delay: 0.4s; }
.floral-content > *:nth-child(5) { animation-delay: 0.5s; }
.floral-content > *:nth-child(6) { animation-delay: 0.6s; }
.floral-content > *:nth-child(7) { animation-delay: 0.7s; }
.floral-content > *:nth-child(8) { animation-delay: 0.8s; }
</style>
