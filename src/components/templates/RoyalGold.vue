<template>
  <div class="royal-v2">
    <div class="rv2-orb rv2-orb-a"></div>
    <div class="rv2-orb rv2-orb-b"></div>

    <article class="rv2-card">
      <header class="rv2-header">
        <div class="rv2-monogram">
          <span>{{ initial(invitation.brideName) }}</span>
          <i class="rv2-mono-amp"><Icon name="Heart" size="14" /></i>
          <span>{{ initial(invitation.groomName) }}</span>
        </div>
        <p class="rv2-eyebrow">The Wedding Of</p>
      </header>

      <div class="rv2-names">
        <h1>{{ invitation.brideName }}</h1>
        <div class="rv2-divider">
          <span class="rv2-line"></span>
          <span class="rv2-amp">&</span>
          <span class="rv2-line"></span>
        </div>
        <h1>{{ invitation.groomName }}</h1>
      </div>

      <p v-if="invitation.customMessage" class="rv2-message">"{{ invitation.customMessage }}"</p>

      <div class="rv2-seal"><Icon name="Sparkles" size="20" /></div>

      <CountdownTimer :date="invitation.weddingDate" :time="invitation.weddingTime" theme="gold" />

      <section class="rv2-details">
        <div class="rv2-detail">
          <Icon name="Calendar" size="18" />
          <div>
            <span>Date</span>
            <strong>{{ formatDate(invitation.weddingDate) }}</strong>
          </div>
        </div>
        <div class="rv2-detail">
          <Icon name="Clock" size="18" />
          <div>
            <span>Time</span>
            <strong>{{ formatTime(invitation.weddingTime) }}</strong>
          </div>
        </div>
        <div class="rv2-detail">
          <Icon name="MapPin" size="18" />
          <div>
            <span>Venue</span>
            <strong>{{ invitation.venueName }}</strong>
            <small>{{ invitation.venueAddress }}</small>
            <a v-if="invitation.venueMapUrl" :href="invitation.venueMapUrl" target="_blank" class="rv2-map">Open in Maps →</a>
          </div>
        </div>
      </section>

      <RsvpForm :invitationId="invitation.id" theme="gold" />

      <footer class="rv2-footer">
        <span class="rv2-line"></span>
        <Icon name="Sparkles" size="14" />
        <span class="rv2-line"></span>
      </footer>
    </article>
  </div>
</template>

<script setup>
import CountdownTimer from '@/components/card/CountdownTimer.vue'
import RsvpForm from '@/components/card/RsvpForm.vue'
defineProps({ invitation: Object })
function initial(n) { return (n || '?').trim().charAt(0).toUpperCase() }
function formatDate(d) { return d ? new Date(d).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '' }
function formatTime(t) { if (!t) return ''; const [h,m] = t.split(':'); const d = new Date(); d.setHours(+h,+m); return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) }
</script>

<style scoped>
.royal-v2 {
  min-height: 100vh; position: relative; overflow: hidden;
  background: radial-gradient(ellipse at top, #2d1810 0%, #1a0a00 50%, #0d0500 100%);
  padding: 40px 18px;
  display: flex; align-items: center; justify-content: center;
}
.rv2-orb { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; opacity: 0.4; }
.rv2-orb-a { width: 500px; height: 500px; top: -150px; right: -150px; background: radial-gradient(circle, rgba(212,175,55,0.35), transparent 60%); animation: drift 18s ease-in-out infinite alternate; }
.rv2-orb-b { width: 400px; height: 400px; bottom: -120px; left: -120px; background: radial-gradient(circle, rgba(184,107,11,0.3), transparent 60%); animation: drift 22s ease-in-out infinite alternate-reverse; }
@keyframes drift { to { transform: translate(30px, 30px) scale(1.15); } }

.rv2-card {
  position: relative; z-index: 10; width: 100%; max-width: 520px; text-align: center;
  background: linear-gradient(160deg, rgba(30,15,5,0.98), rgba(12,5,0,0.98));
  border: 1px solid rgba(212,175,55,0.3);
  border-radius: 28px;
  padding: 48px 28px;
  box-shadow: 0 60px 100px -30px rgba(0,0,0,0.9), 0 0 0 1px rgba(212,175,55,0.1) inset, 0 0 80px rgba(212,175,55,0.08) inset;
}
@media (min-width: 900px) { .rv2-card { padding: 64px 44px; } }

.rv2-header { margin-bottom: 32px; }
.rv2-monogram {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 14px 22px;
  border: 1px solid rgba(212,175,55,0.35);
  border-radius: 100px;
  background: rgba(212,175,55,0.06);
  margin-bottom: 20px;
}
.rv2-monogram span {
  font-family: var(--font-display); font-size: 1.4rem; font-weight: 700;
  color: #f5e6c8; letter-spacing: 0.05em;
}
.rv2-mono-amp { color: #d4af37; display: inline-flex; align-items: center; }
.rv2-eyebrow {
  font-size: 0.75rem; letter-spacing: 0.4em; text-transform: uppercase;
  color: #d4af37; font-weight: 600;
}

.rv2-names { margin: 8px 0 24px; }
.rv2-names h1 {
  font-family: var(--font-display); font-size: clamp(2.4rem, 7vw, 3.2rem);
  color: #f5e6c8; font-weight: 700; line-height: 1.1; margin: 4px 0;
  background: linear-gradient(135deg, #f5e6c8 0%, #d4af37 50%, #f5e6c8 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.rv2-divider { display: flex; align-items: center; justify-content: center; gap: 16px; margin: 4px 0; }
.rv2-line { width: 60px; height: 1px; background: linear-gradient(90deg, transparent, #d4af37, transparent); }
.rv2-amp { font-family: var(--font-script, serif); font-size: 1.8rem; color: #d4af37; font-style: italic; }

.rv2-message {
  font-style: italic; color: rgba(245,230,200,0.7); font-size: 0.95rem;
  margin: 0 auto 24px; max-width: 360px; line-height: 1.7;
}

.rv2-seal {
  width: 52px; height: 52px; border-radius: 50%; margin: 0 auto 8px;
  background: radial-gradient(circle, rgba(212,175,55,0.2), rgba(212,175,55,0.05));
  border: 1px solid rgba(212,175,55,0.3);
  display: flex; align-items: center; justify-content: center;
  color: #d4af37;
}

.rv2-details {
  background: rgba(212,175,55,0.05);
  border: 1px solid rgba(212,175,55,0.18);
  border-radius: 18px; padding: 8px 4px; margin: 28px 0;
  display: flex; flex-direction: column;
}
.rv2-detail {
  display: flex; align-items: flex-start; gap: 16px; text-align: left;
  padding: 18px 20px; color: #d4af37;
}
.rv2-detail + .rv2-detail { border-top: 1px dashed rgba(212,175,55,0.15); }
.rv2-detail > div { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.rv2-detail span { font-size: 0.7rem; color: #d4af37; text-transform: uppercase; letter-spacing: 0.2em; }
.rv2-detail strong { color: #f5e6c8; font-size: 1rem; font-weight: 600; }
.rv2-detail small { color: rgba(245,230,200,0.55); font-size: 0.8rem; margin-top: 2px; }
.rv2-map { color: #d4af37; font-size: 0.8rem; margin-top: 8px; text-decoration: none; border-bottom: 1px solid rgba(212,175,55,0.4); display: inline-block; width: fit-content; }

.rv2-footer { display: flex; align-items: center; justify-content: center; gap: 12px; margin-top: 28px; color: #d4af37; opacity: 0.6; }
.rv2-footer .rv2-line { width: 80px; }

.rv2-card > * { opacity: 0; transform: translateY(20px); animation: fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }
.rv2-card > *:nth-child(1) { animation-delay: 0.05s; }
.rv2-card > *:nth-child(2) { animation-delay: 0.15s; }
.rv2-card > *:nth-child(3) { animation-delay: 0.25s; }
.rv2-card > *:nth-child(4) { animation-delay: 0.35s; }
.rv2-card > *:nth-child(5) { animation-delay: 0.45s; }
.rv2-card > *:nth-child(6) { animation-delay: 0.55s; }
.rv2-card > *:nth-child(7) { animation-delay: 0.65s; }
.rv2-card > *:nth-child(8) { animation-delay: 0.75s; }
</style>
