<template>
  <div :class="scopeClass" class="dynamic-template-root">
    <component
      v-for="(part, i) in parts"
      :key="i"
      :is="partComponent(part)"
      v-bind="partProps(part)"
    />
  </div>
</template>

<script setup>
import { computed, h } from 'vue'
import CountdownTimer from '@/components/card/CountdownTimer.vue'
import RsvpForm from '@/components/card/RsvpForm.vue'

const props = defineProps({
  template: { type: Object, required: true }, // { html, css, id, slug }
  invitation: { type: Object, required: true }
})

const scopeClass = computed(() => `tpl-${(props.template.id || props.template.slug || 'x').replace(/[^a-z0-9_-]/gi, '')}`)

function formatDate(d) {
  if (!d) return ''
  try { return new Date(d).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }
  catch { return d }
}
function formatTime(t) {
  if (!t) return ''
  try { const [h,m] = String(t).split(':'); const d = new Date(); d.setHours(+h,+m); return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) }
  catch { return t }
}

const dataMap = computed(() => {
  const inv = props.invitation || {}
  return {
    brideName: inv.brideName || 'Bride Name',
    groomName: inv.groomName || 'Groom Name',
    weddingDate: inv.weddingDate || '',
    weddingTime: inv.weddingTime || '',
    weddingDateFormatted: formatDate(inv.weddingDate),
    weddingTimeFormatted: formatTime(inv.weddingTime),
    venueName: inv.venueName || 'Venue Name',
    venueAddress: inv.venueAddress || 'Venue Address',
    venueMapUrl: inv.venueMapUrl || '#',
    customMessage: inv.customMessage || '',
    hashtag: `#${(inv.brideName || '').replace(/\s+/g, '')}Weds${(inv.groomName || '').replace(/\s+/g, '')}`,
    coupleNames: `${inv.brideName || ''} & ${inv.groomName || ''}`
  }
})

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}

// Substitute {{key}} with escaped data. Leave slot markers alone.
const SLOT_KEYS = new Set(['countdown', 'rsvp'])
function substitute(raw) {
  return raw.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (m, key) => {
    if (SLOT_KEYS.has(key)) return m
    const v = dataMap.value[key]
    return v === undefined ? '' : escapeHtml(v)
  })
}

// Scope CSS by prefixing every selector with .scopeClass
function scopeCss(css, scope) {
  if (!css) return ''
  // Strip comments
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '')
  // Split on top-level braces; naive but works for flat rule sets and @media
  return clean.replace(/(^|\})\s*([^{}@]+)\{/g, (match, brace, selectors) => {
    const scoped = selectors.split(',').map(s => {
      const t = s.trim()
      if (!t) return t
      // Avoid scoping keyframes selectors like "from", "to", "50%"
      if (/^(from|to|\d+%)$/i.test(t)) return t
      return `.${scope} ${t}`
    }).join(', ')
    return `${brace} ${scoped} {`
  })
}

// Parse HTML into parts: { type: 'html', html } or { type: 'slot', name }
const parts = computed(() => {
  const html = substitute(props.template.html || '')
  const styleTag = props.template.css
    ? `<style>${scopeCss(props.template.css, scopeClass.value)}</style>`
    : ''
  const full = styleTag + html
  const result = []
  const re = /\{\{\s*(countdown|rsvp)\s*\}\}/g
  let last = 0
  let m
  while ((m = re.exec(full)) !== null) {
    if (m.index > last) result.push({ type: 'html', html: full.slice(last, m.index) })
    result.push({ type: 'slot', name: m[1] })
    last = re.lastIndex
  }
  if (last < full.length) result.push({ type: 'html', html: full.slice(last) })
  return result
})

function partComponent(part) {
  if (part.type === 'html') {
    return { render: () => h('div', { innerHTML: part.html, class: 'dt-frag' }) }
  }
  if (part.name === 'countdown') return CountdownTimer
  if (part.name === 'rsvp') return RsvpForm
  return { render: () => null }
}

function partProps(part) {
  if (part.type === 'slot' && part.name === 'countdown') {
    return { date: props.invitation.weddingDate, time: props.invitation.weddingTime, theme: props.template.theme || 'gold' }
  }
  if (part.type === 'slot' && part.name === 'rsvp') {
    return { invitationId: props.invitation.id, theme: props.template.theme || 'gold' }
  }
  return {}
}
</script>

<style scoped>
.dynamic-template-root { min-height: 100vh; }
.dynamic-template-root :deep(.dt-frag) { display: contents; }
</style>
