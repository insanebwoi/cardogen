<template>
  <div class="floral-v2">
    <div class="fv2-petals">
      <span v-for="i in 16" :key="i" class="fv2-petal" :style="petalStyle(i)">✿</span>
    </div>

    <article class="fv2-card">
      <div class="fv2-wreath">
        <Icon name="Flower2" size="20" />
        <span class="fv2-wreath-line"></span>
        <Icon name="Heart" size="16" />
        <span class="fv2-wreath-line"></span>
        <Icon name="Flower2" size="20" />
      </div>

      <p class="fv2-eyebrow">With the blessings of our families</p>

      <h1 class="fv2-bride">{{ invitation.brideName }}</h1>
      <p class="fv2-and">and</p>
      <h1 class="fv2-groom">{{ invitation.groomName }}</h1>

      <p class="fv2-invite">request the pleasure of your company<br/>at their wedding celebration</p>

      <p v-if="invitation.customMessage" class="fv2-message">"{{ invitation.customMessage }}"</p>

      <CountdownTimer :date="invitation.weddingDate" :time="invitation.weddingTime" theme="pink" />

      <section class="fv2-details">
        <div class="fv2-row">
          <Icon name="Calendar" size="18" /><strong>{{ formatDate(invitation.weddingDate) }}</strong>
        </div>
        <div class="fv2-row">
          <Icon name="Clock" size="18" /><strong>{{ formatTime(invitation.weddingTime) }}</strong>
        </div>
        <div class="fv2-row fv2-row-venue">
          <Icon name="MapPin" size="18" />
          <div>
            <strong>{{ invitation.venueName }}</strong>
            <small>{{ invitation.venueAddress }}</small>
          </div>
        </div>
        <a v-if="invitation.venueMapUrl" :href="invitation.venueMapUrl" target="_blank" class="fv2-map">Open in Google Maps →</a>
      </section>

      <RsvpForm :invitationId="invitation.id" theme="pink" />
    </article>
  </div>
</template>

<script setup>
import CountdownTimer from '@/components/card/CountdownTimer.vue'
import RsvpForm from '@/components/card/RsvpForm.vue'
defineProps({ invitation: Object })
function formatDate(d) { return d ? new Date(d).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '' }
function formatTime(t) { if (!t) return ''; const [h,m] = t.split(':'); const d = new Date(); d.setHours(+h,+m); return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) }
function petalStyle(i) {
  const left = (i * 6.25) % 100
  const delay = (i * 0.7) % 10
  const dur = 9 + (i % 5)
  const size = 14 + (i % 4) * 4
  return { left: `${left}%`, animationDelay: `${delay}s`, animationDuration: `${dur}s`, fontSize: `${size}px` }
}
</script>

<style scoped>
.floral-v2 {
  min-height: 100vh; position: relative; overflow: hidden;
  background: linear-gradient(180deg, #fff1f5 0%, #fde4ef 45%, #fbd0e1 100%);
  padding: 40px 18px; display: flex; align-items: center; justify-content: center;
}
.floral-v2::before {
  content: ''; position: absolute; inset: 0;
  background:
    radial-gradient(circle at 20% 15%, rgba(244,114,182,0.18), transparent 45%),
    radial-gradient(circle at 80% 85%, rgba(251,113,133,0.15), transparent 45%);
  pointer-events: none;
}

.fv2-petals { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.fv2-petal {
  position: absolute; top: -30px; color: #f472b6; opacity: 0.4;
  animation: fv2-fall linear infinite;
}
@keyframes fv2-fall {
  0% { transform: translateY(0) rotate(0deg); opacity: 0; }
  10% { opacity: 0.5; }
  100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
}

.fv2-card {
  position: relative; z-index: 10; width: 100%; max-width: 500px;
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(244,114,182,0.25);
  border-radius: 28px; padding: 44px 26px; text-align: center;
  box-shadow: 0 40px 80px -20px rgba(244,114,182,0.25);
}
@media (min-width: 900px) { .fv2-card { padding: 60px 40px; } }

.fv2-wreath { display: flex; align-items: center; justify-content: center; gap: 10px; color: #ec4899; margin-bottom: 24px; }
.fv2-wreath-line { flex: 0 0 40px; height: 1px; background: linear-gradient(90deg, transparent, #f472b6, transparent); }

.fv2-eyebrow { color: #be185d; font-size: 0.8rem; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 20px; font-weight: 600; }
.fv2-bride, .fv2-groom {
  font-family: var(--font-script, 'Georgia', serif);
  font-size: clamp(2.5rem, 8vw, 3.4rem);
  color: #831843; line-height: 1.1; font-weight: 600;
}
.fv2-and { font-style: italic; color: #ec4899; font-size: 1rem; margin: 4px 0; }

.fv2-invite { color: #9d174d; font-size: 0.95rem; margin: 24px 0 16px; line-height: 1.7; }
.fv2-message { font-style: italic; color: #be185d; font-size: 0.9rem; margin: 12px auto 8px; max-width: 360px; line-height: 1.6; }

.fv2-details {
  background: rgba(255,255,255,0.75);
  border: 1px solid rgba(244,114,182,0.2);
  border-radius: 18px; padding: 22px; margin: 28px 0;
  display: flex; flex-direction: column; gap: 14px;
}
.fv2-row { display: flex; align-items: center; gap: 14px; color: #be185d; text-align: left; }
.fv2-row strong { color: #831843; font-weight: 600; font-size: 0.95rem; }
.fv2-row-venue { align-items: flex-start; }
.fv2-row-venue > div { display: flex; flex-direction: column; gap: 2px; }
.fv2-row-venue small { color: #9d174d; opacity: 0.7; font-size: 0.8rem; }
.fv2-map { display: inline-block; color: #ec4899; font-size: 0.85rem; margin-top: 6px; font-weight: 600; }

.fv2-card > * { opacity: 0; transform: translateY(16px); animation: fv2-fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) forwards; }
@keyframes fv2-fadeUp { to { opacity: 1; transform: translateY(0); } }
.fv2-card > *:nth-child(1) { animation-delay: 0.05s; }
.fv2-card > *:nth-child(2) { animation-delay: 0.15s; }
.fv2-card > *:nth-child(3) { animation-delay: 0.25s; }
.fv2-card > *:nth-child(4) { animation-delay: 0.35s; }
.fv2-card > *:nth-child(5) { animation-delay: 0.45s; }
.fv2-card > *:nth-child(6) { animation-delay: 0.55s; }
.fv2-card > *:nth-child(7) { animation-delay: 0.65s; }
.fv2-card > *:nth-child(8) { animation-delay: 0.75s; }
.fv2-card > *:nth-child(9) { animation-delay: 0.85s; }
</style>
