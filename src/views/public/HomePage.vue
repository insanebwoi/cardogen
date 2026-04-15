<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-bg">
        <div class="hero-shape shape-1"></div>
        <div class="hero-shape shape-2"></div>
        <div class="hero-shape shape-3"></div>
      </div>
      <div class="hero-content">
        <span class="hero-badge"><Icon name="Heart" size="18" /> Digital Wedding Invitations</span>
        <h1 class="hero-title">
          Create <span class="gradient-text">Beautiful</span><br/>Wedding Invitations
        </h1>
        <p class="hero-subtitle">
          Design stunning digital wedding cards, share them instantly via WhatsApp, 
          and track RSVPs — all in minutes, completely free.
        </p>
        <div class="hero-actions">
          <RouterLink to="/login" class="btn btn-primary btn-lg">
            <Icon name="Sparkles" size="16" /> Create Your Invitation
          </RouterLink>
          <a href="#features" class="btn btn-secondary btn-lg">See How It Works</a>
        </div>
        <div class="hero-stats">
          <div class="hero-stat"><strong>500+</strong><span>Invitations Created</span></div>
          <div class="hero-stat"><strong>2K+</strong><span>RSVPs Collected</span></div>
          <div class="hero-stat"><strong>Free</strong><span>Forever</span></div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features" id="features">
      <div class="container">
        <h2 class="section-title">Everything You Need</h2>
        <p class="section-subtitle">Create, share, and track — all in one place</p>
        <div class="features-grid">
          <div class="feature-card" v-for="(f, i) in features" :key="i">
            <div class="feature-icon"><Icon :name="f.icon" size="32" /></div>
            <h3>{{ f.title }}</h3>
            <p>{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="how-it-works">
      <div class="container">
        <h2 class="section-title">How It Works</h2>
        <div class="steps-grid">
          <div class="step-card" v-for="(s, i) in steps" :key="i">
            <div class="step-number">{{ i + 1 }}</div>
            <h3>{{ s.title }}</h3>
            <p>{{ s.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta-section">
      <div class="container text-center">
        <h2>Ready to Create Your Invitation?</h2>
        <p>Join thousands of happy couples who chose Cardogen</p>
        <RouterLink to="/login" class="btn btn-primary btn-lg" style="margin-top: 24px;">
          <Icon name="PartyPopper" size="18" /> Get Started Free
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<script setup>
const features = [
  { icon: 'Palette', title: 'Beautiful Templates', desc: 'Choose from stunning professionally designed templates for every style.' },
  { icon: 'Link', title: 'Shareable Links', desc: 'Generate unique short links and share via WhatsApp, SMS, or social media.' },
  { icon: 'Clock', title: 'Live Countdown', desc: 'Real-time countdown timer that builds excitement for the big day.' },
  { icon: 'ClipboardList', title: 'RSVP Tracking', desc: 'Collect guest responses and know exactly who is attending.' },
  { icon: 'Smartphone', title: 'Mobile First', desc: 'Looks perfect on every device — especially phones where guests view them.' },
  { icon: 'Shield', title: 'Admin Panel', desc: 'Powerful admin dashboard to manage templates, users, and analytics.' }
]

const steps = [
  { title: 'Fill in Details', desc: 'Enter bride & groom names, date, venue, and a personal message.' },
  { title: 'Pick a Template', desc: 'Choose from our gorgeous collection of wedding card designs.' },
  { title: 'Share & Track', desc: 'Get your unique link, share it, and watch RSVPs come in live.' }
]
</script>

<style scoped>
.home-page { overflow: hidden; }

/* Hero */
.hero {
  position: relative; min-height: 92vh; display: flex; align-items: center;
  justify-content: center; padding: 60px 20px; overflow: hidden;
}
.hero-bg { position: absolute; inset: 0; z-index: 0; }
.hero-shape {
  position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.5;
}
.shape-1 { width: 500px; height: 500px; background: var(--rose-200); top: -100px; right: -100px; }
.shape-2 { width: 400px; height: 400px; background: #ddd6fe; bottom: -50px; left: -100px; }
.shape-3 { width: 300px; height: 300px; background: var(--gold-200); top: 40%; left: 50%; }

.hero-content { position: relative; z-index: 1; text-align: center; max-width: 700px; }
.hero-badge {
  display: inline-block; padding: 8px 20px; border-radius: 100px;
  background: var(--rose-100); color: var(--rose-700); font-size: 0.85rem;
  font-weight: 600; margin-bottom: 24px;
}
.hero-title {
  font-family: var(--font-display); font-size: 3.5rem; font-weight: 800;
  line-height: 1.15; color: var(--gray-900); margin-bottom: 20px;
}
.gradient-text {
  background: linear-gradient(135deg, var(--rose-500), #a855f7, var(--gold-500));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}
.hero-subtitle { font-size: 1.15rem; color: var(--gray-500); line-height: 1.7; margin-bottom: 36px; }
.hero-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
.hero-stats {
  display: flex; gap: 40px; justify-content: center; margin-top: 60px;
  padding-top: 40px; border-top: 1px solid var(--gray-200);
}
.hero-stat strong { display: block; font-size: 1.5rem; color: var(--gray-800); }
.hero-stat span { font-size: 0.8rem; color: var(--gray-500); }

/* Features */
.features { padding: 100px 0; background: white; }
.section-title { font-family: var(--font-display); font-size: 2.2rem; text-align: center; color: var(--gray-900); }
.section-subtitle { text-align: center; color: var(--gray-500); margin-top: 8px; margin-bottom: 48px; }
.features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.feature-card {
  padding: 32px; border-radius: var(--radius-lg); border: 1px solid var(--gray-100);
  transition: all 0.3s; text-align: center;
}
.feature-card:hover { border-color: var(--rose-200); box-shadow: var(--shadow); transform: translateY(-4px); }
.feature-icon { font-size: 2.5rem; margin-bottom: 16px; }
.feature-card h3 { font-size: 1.1rem; font-weight: 700; color: var(--gray-800); margin-bottom: 8px; }
.feature-card p { font-size: 0.9rem; color: var(--gray-500); line-height: 1.6; }

/* How it Works */
.how-it-works { padding: 100px 0; background: var(--gray-50); }
.steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; margin-top: 48px; }
.step-card { text-align: center; padding: 32px; }
.step-number {
  width: 56px; height: 56px; border-radius: 50%;
  background: linear-gradient(135deg, var(--rose-500), var(--rose-600));
  color: white; font-size: 1.3rem; font-weight: 800;
  display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;
}
.step-card h3 { font-size: 1.15rem; font-weight: 700; color: var(--gray-800); margin-bottom: 8px; }
.step-card p { font-size: 0.9rem; color: var(--gray-500); }

/* CTA */
.cta-section {
  padding: 80px 20px;
  background: linear-gradient(135deg, var(--gray-900), #1e1b4b);
  color: white;
}
.cta-section h2 { font-family: var(--font-display); font-size: 2rem; }
.cta-section p { color: rgba(255,255,255,0.6); margin-top: 12px; }

@media (max-width: 768px) {
  .hero-title { font-size: 2.2rem; }
  .features-grid, .steps-grid { grid-template-columns: 1fr; }
  .hero-stats { gap: 24px; }
}
</style>
