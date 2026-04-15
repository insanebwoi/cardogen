<template>
  <div class="template-modern">
    <div class="modern-gradient"></div>
    <div class="modern-gradient-2"></div>
    <div class="modern-content">
      <span class="modern-tag">#{{ invitation.brideName }}Weds{{ invitation.groomName }}</span>
      <div class="modern-names">
        <h1>{{ invitation.brideName }}</h1>
        <div class="modern-divider"><span><Icon name="Heart" size="20" /></span></div>
        <h1>{{ invitation.groomName }}</h1>
      </div>
      <p v-if="invitation.customMessage" class="modern-quote">{{ invitation.customMessage }}</p>

      <CountdownTimer :date="invitation.weddingDate" :time="invitation.weddingTime" theme="purple" />
      <div class="modern-cards">
        <div class="mc-item"><span class="mc-emoji"><Icon name="Calendar" size="16" /></span><small>Date</small><strong>{{ formatDate(invitation.weddingDate) }}</strong></div>
        <div class="mc-item"><span class="mc-emoji"><Icon name="Clock" size="16" /></span><small>Time</small><strong>{{ formatTime(invitation.weddingTime) }}</strong></div>
        <div class="mc-item"><span class="mc-emoji"><Icon name="MapPin" size="16" /></span><small>Venue</small><strong>{{ invitation.venueName }}</strong><p>{{ invitation.venueAddress }}</p></div>
      </div>
      <a v-if="invitation.venueMapUrl" :href="invitation.venueMapUrl" target="_blank" class="modern-map-btn"><Icon name="MapPin" size="16" /> Open in Google Maps</a>
      <RsvpForm :invitationId="invitation.id" theme="purple" />
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
.template-modern {
  min-height: 100vh; position: relative; background: #0f0a1a; padding: 48px 20px;
  display: flex; align-items: center; justify-content: center; overflow: hidden;
}
.modern-gradient {
  position: absolute; top: 0; right: -20%; width: 600px; height: 600px;
  background: radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 60%);
  border-radius: 50%; pointer-events: none;
  animation: float-blob 15s ease-in-out infinite alternate;
}
.modern-gradient-2 {
  position: absolute; bottom: 0; left: -20%; width: 500px; height: 500px;
  background: radial-gradient(circle, rgba(236,72,153,0.3) 0%, transparent 60%);
  border-radius: 50%; pointer-events: none;
  animation: float-blob 12s ease-in-out infinite alternate-reverse;
}
@keyframes float-blob { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(-10%, 10%) scale(1.2); } }

@media (min-width: 900px) {
  .template-modern { padding: 80px 40px; background-attachment: fixed; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
  .modern-content {
    background: rgba(15,10,26,0.6); backdrop-filter: blur(25px);
    border: 1px solid rgba(255,255,255,0.08);
    box-shadow: 0 40px 80px -20px rgba(0,0,0,0.9), inset 0 0 0 1px rgba(168,85,247,0.15);
    padding: 50px 40px; border-radius: 32px; position: relative; z-index: 10;
    max-width: 480px !important; text-align: center;
  }
}

.modern-content {
  position: relative; z-index: 10; width: 100%; max-width: 500px; text-align: center; margin: 0 auto;
  background: rgba(15,10,26,0.5); backdrop-filter: blur(20px); padding: 40px 20px; border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.08);
}
@media (max-width: 899px) { .modern-content { background: transparent; backdrop-filter: none; padding: 0; border: none; } }
.modern-tag {
  display: inline-block; padding: 6px 18px; border-radius: 100px;
  background: rgba(168,85,247,0.15); color: #c084fc; font-size: 0.8rem;
  font-weight: 600; margin-bottom: 32px; letter-spacing: 0.05em;
}
.modern-names h1 { font-family: var(--font-display); font-size: 3rem; color: white; font-weight: 700; }
.modern-divider { color: #e879f9; font-size: 1.5rem; margin: 12px 0; }
.modern-quote { color: rgba(255,255,255,0.5); font-style: italic; margin: 20px 0 32px; font-size: 0.95rem; }
.modern-cards { display: flex; flex-direction: column; gap: 12px; margin: 32px 0; }
.mc-item {
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px; padding: 20px; text-align: center;
}
.mc-emoji { font-size: 1.3rem; display: block; margin-bottom: 8px; }
.mc-item small { color: rgba(255,255,255,0.4); font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; }
.mc-item strong { display: block; color: white; font-size: 1rem; margin-top: 4px; }
.mc-item p { color: rgba(255,255,255,0.4); font-size: 0.8rem; margin-top: 4px; }
.modern-map-btn {
  display: inline-block; color: #c084fc; font-size: 0.85rem; font-weight: 600;
  margin-bottom: 24px;
}

.modern-content > * { opacity: 0; transform: translateY(20px); animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }
.modern-content > *:nth-child(1) { animation-delay: 0.1s; }
.modern-content > *:nth-child(2) { animation-delay: 0.2s; }
.modern-content > *:nth-child(3) { animation-delay: 0.3s; }
.modern-content > *:nth-child(4) { animation-delay: 0.4s; }
.modern-content > *:nth-child(5) { animation-delay: 0.5s; }
.modern-content > *:nth-child(6) { animation-delay: 0.6s; }
.modern-content > *:nth-child(7) { animation-delay: 0.7s; }
.modern-content > *:nth-child(8) { animation-delay: 0.8s; }
</style>
