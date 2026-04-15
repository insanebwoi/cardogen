<template>
  <div class="template-minimal">
    <div class="minimal-content">
      <div class="minimal-header">
        <div class="minimal-line"></div>
        <span class="minimal-badge">WEDDING INVITATION</span>
        <div class="minimal-line"></div>
      </div>
      <div class="minimal-names">
        <h1>{{ invitation.brideName }}</h1>
        <span class="minimal-amp">&</span>
        <h1>{{ invitation.groomName }}</h1>
      </div>
      <p v-if="invitation.customMessage" class="minimal-quote">{{ invitation.customMessage }}</p>

      <CountdownTimer :date="invitation.weddingDate" :time="invitation.weddingTime" theme="minimal" />
      <div class="minimal-info">
        <div class="mi-row"><span class="mi-label">DATE</span><span class="mi-value">{{ formatDate(invitation.weddingDate) }}</span></div>
        <div class="mi-row"><span class="mi-label">TIME</span><span class="mi-value">{{ formatTime(invitation.weddingTime) }}</span></div>
        <div class="mi-row"><span class="mi-label">VENUE</span><span class="mi-value">{{ invitation.venueName }}<br/><small>{{ invitation.venueAddress }}</small></span></div>
        <a v-if="invitation.venueMapUrl" :href="invitation.venueMapUrl" target="_blank" class="mi-map"><Icon name="MapPin" size="16" /> View on Maps</a>
      </div>
      <RsvpForm :invitationId="invitation.id" theme="minimal" />
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
.template-minimal {
  min-height: 100vh; background: #fafaf9; padding: 60px 20px;
  display: flex; align-items: center; justify-content: center;
  position: relative; overflow: hidden;
}
.template-minimal::before {
  content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
  background: radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, transparent 60%);
  animation: soft-pulse 12s ease-in-out infinite alternate; pointer-events: none; z-index: 0;
}
@keyframes soft-pulse { 0% { opacity: 0.5; transform: scale(0.9); } 100% { opacity: 1; transform: scale(1.1); } }

@media (min-width: 900px) {
  .template-minimal { padding: 80px 40px; background: #f5f5f4; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
  .minimal-content {
    background: #ffffff;
    border: 1px solid #e7e5e4;
    box-shadow: 0 40px 80px -20px rgba(0,0,0,0.1);
    padding: 50px 40px; border-radius: 32px; position: relative; z-index: 10;
    max-width: 480px !important; text-align: center; overflow: hidden;
    margin: 0 auto;
  }
}

.minimal-content {
  max-width: 500px; width: 100%; text-align: center; position: relative; z-index: 10;
  padding: 40px 20px; background: #fff; border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05); margin: 0 auto;
}
@media (max-width: 899px) { .minimal-content { box-shadow: none; background: transparent; padding: 0; border-radius: 0; } }
.minimal-header { display: flex; align-items: center; gap: 16px; justify-content: center; margin-bottom: 30px; }
.minimal-line { width: 60px; height: 1px; background: #d6d3d1; }
.minimal-badge { font-size: 0.7rem; letter-spacing: 0.25em; color: #78716c; font-weight: 700; }
.minimal-names h1 { font-family: var(--font-display); font-size: 3rem; color: #292524; font-weight: 400; letter-spacing: -0.02em; }
.minimal-amp { font-size: 1.2rem; color: #a8a29e; display: block; margin: 8px 0; }
.minimal-quote { color: #78716c; font-style: italic; margin: 24px 0; font-size: 0.95rem; }
.minimal-info { border-top: 1px solid #e7e5e4; border-bottom: 1px solid #e7e5e4; padding: 28px 0; margin: 32px 0; }
.mi-row { padding: 12px 0; display: flex; justify-content: space-between; align-items: flex-start; }
.mi-row + .mi-row { border-top: 1px solid #f5f5f4; }
.mi-label { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.15em; color: #a8a29e; }
.mi-value { font-size: 0.95rem; color: #44403c; text-align: right; }
.mi-value small { font-size: 0.8rem; color: #78716c; }
.mi-map { display: inline-block; color: #78716c; font-size: 0.8rem; margin-top: 12px; }

.minimal-content > * { opacity: 0; transform: translateY(20px); animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }
.minimal-content > *:nth-child(1) { animation-delay: 0.1s; }
.minimal-content > *:nth-child(2) { animation-delay: 0.2s; }
.minimal-content > *:nth-child(3) { animation-delay: 0.3s; }
.minimal-content > *:nth-child(4) { animation-delay: 0.4s; }
.minimal-content > *:nth-child(5) { animation-delay: 0.5s; }
.minimal-content > *:nth-child(6) { animation-delay: 0.6s; }
.minimal-content > *:nth-child(7) { animation-delay: 0.7s; }
.minimal-content > *:nth-child(8) { animation-delay: 0.8s; }
</style>
