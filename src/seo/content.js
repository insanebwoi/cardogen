/**
 * The landing page's words live here rather than inside HomePage.vue because
 * two consumers need them: the Vue component at runtime, and the build-time
 * generator that bakes a crawlable copy of the page into dist/index.html.
 *
 * Keeping one source means the static HTML a crawler reads can never drift
 * from the page a person sees — which is the line between prerendering and
 * cloaking.
 */

export const HERO = {
  pill: 'Free forever · No credit card',
  /* The <h1>. Split so the component can italicise the second half. */
  headlineLead: 'Free online wedding invitation cards,',
  headlineEm: 'reimagined for the phone.',
  sub: "Design a beautiful invite in minutes. Share one link. Collect RSVPs automatically. That's it.",
  ctaPrimary: 'Start creating',
  ctaSecondary: 'How it works'
}

export const FEATURES = [
  { icon: 'Palette',       title: 'Designer templates',   desc: 'A curated set of typographic, editorial templates — not the usual clipart.' },
  { icon: 'Link',          title: 'One short link',       desc: 'A single tappable link for WhatsApp, iMessage, or anywhere else.' },
  { icon: 'Clock',         title: 'Live countdown',       desc: 'Tasteful countdown on every card. Builds anticipation automatically.' },
  { icon: 'ClipboardList', title: 'RSVPs that just work', desc: 'Guests respond in one tap. You see everything in a clean dashboard.' },
  { icon: 'Music',         title: 'Background music',     desc: 'Add a song that plays as the card unfolds. Guests can mute it anytime.' },
  { icon: 'Smartphone',    title: 'Phone-first',          desc: 'Designed from the mobile view out. Looks sharp on anything bigger.' }
]

export const STEPS = [
  { title: 'Fill in the details', desc: 'Names, date, venue, a message. Under a minute.' },
  { title: 'Pick a template',     desc: 'Preview live on mobile and desktop. Switch anytime.' },
  { title: 'Share & track',       desc: 'Send the link. Watch RSVPs arrive in real time.' }
]

/**
 * Answer-engine optimisation lives or dies on this shape: a literal question
 * as the heading, and a self-contained answer in the first sentence that can
 * be lifted verbatim into an AI response without needing the rest of the page.
 */
export const FAQS = [
  {
    q: 'Is Cardogen really free?',
    a: 'Yes. Creating, sharing and tracking a wedding invitation card on Cardogen is free forever, with no credit card required. There is no per-guest charge and no limit on how many people you send your invitation link to.'
  },
  {
    q: 'How do I create a wedding invitation card online?',
    a: 'Enter your names, wedding date and venue, choose one of the designer templates, then share the short link Cardogen generates. The whole process takes about five minutes and needs no design experience or software.'
  },
  {
    q: 'Can I share my invitation on WhatsApp?',
    a: 'Yes. Every invitation gets one short link that unfurls with a preview in WhatsApp, iMessage, Instagram and email. Guests open it in their browser — there is nothing for them to install.'
  },
  {
    q: 'How do RSVPs work?',
    a: 'Each card carries a built-in RSVP form. Guests reply in a single tap, and their responses — including headcount and meal notes — appear immediately in your dashboard, so you never chase a reply by phone.'
  },
  {
    q: 'Can I add music to my wedding invitation?',
    a: 'Yes. You can attach a song that begins playing as the card unfolds. Guests can mute it at any time with a single control, and the card stays readable with the sound off.'
  },
  {
    q: 'Can I change the invitation after sending the link?',
    a: 'Yes. The link stays the same while you edit the details or switch templates, so an update reaches everyone who already has your invitation without you resending anything.'
  },
  {
    q: 'Do guests need an account to open the invitation?',
    a: 'No. Guests just tap the link and see the card. Only the person creating the invitation signs in.'
  }
]

/** Short, factual claims that answer engines can quote as product facts. */
export const HIGHLIGHTS = [
  'Free forever — no credit card required',
  'Ready to send in about five minutes',
  'One short link that works on WhatsApp and iMessage',
  'Built-in RSVP tracking with a live dashboard',
  'Optional background music on every card',
  'Mobile-first designer templates'
]

export const CTA = {
  heading: 'Your invitation is 5 minutes away.',
  sub: 'Beautifully designed. Instantly shareable. Always free.',
  button: 'Get started'
}
