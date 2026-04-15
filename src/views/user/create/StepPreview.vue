<template>
  <div>
    <h2 class="step-title"><Icon name="Eye" size="16" /> Preview Your Invitation</h2>
    <div class="preview-summary">
      <div class="ps-row"><span class="ps-label">Bride</span><span class="ps-value">{{ formData.brideName }}</span></div>
      <div class="ps-row"><span class="ps-label">Groom</span><span class="ps-value">{{ formData.groomName }}</span></div>
      <div class="ps-row"><span class="ps-label">Date</span><span class="ps-value">{{ formatDate(formData.weddingDate) }}</span></div>
      <div class="ps-row"><span class="ps-label">Time</span><span class="ps-value">{{ formData.weddingTime }}</span></div>
      <div class="ps-row"><span class="ps-label">Venue</span><span class="ps-value">{{ formData.venueName }}</span></div>
      <div v-if="formData.venueAddress" class="ps-row"><span class="ps-label">Address</span><span class="ps-value">{{ formData.venueAddress }}</span></div>
      <div v-if="formData.customMessage" class="ps-row"><span class="ps-label">Message</span><span class="ps-value">{{ formData.customMessage }}</span></div>
      <div class="ps-row"><span class="ps-label">Template</span><span class="ps-value badge-tpl">{{ templateName }}</span></div>
    </div>
    <p class="preview-note"><Icon name="CheckCircle2" size="16" /> Everything looks good? Click "Generate Invitation" to create your card!</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps(['formData'])

const templateNames = {
  'royal-gold': '<Icon name="Crown" size="24" /> Royal Gold', 'floral-dream': '<Icon name="Sparkles" size="18" /> Floral Dream',
  'minimal-white': '<Icon name="Sparkles" size="16" /> Minimal White', 'traditional-classic': '<Icon name="MoonStar" size="16" /> Traditional Classic',
  'modern-love': '<Icon name="Heart" size="16" /> Modern Love'
}
const templateName = computed(() => templateNames[props.formData.templateId] || props.formData.templateId)
function formatDate(d) { if (!d) return ''; return new Date(d).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }
</script>

<style scoped>
.step-title { font-size: 1.15rem; font-weight: 700; color: var(--gray-800); margin-bottom: 20px; }
.preview-summary { border: 1px solid var(--gray-100); border-radius: 14px; overflow: hidden; }
.ps-row {
  display: flex; justify-content: space-between; padding: 14px 18px;
  align-items: flex-start; gap: 16px;
}
.ps-row + .ps-row { border-top: 1px solid var(--gray-100); }
.ps-label { font-size: 0.8rem; color: var(--gray-500); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; min-width: 70px; }
.ps-value { font-size: 0.9rem; color: var(--gray-800); text-align: right; }
.badge-tpl { background: var(--rose-50); color: var(--rose-700); padding: 4px 12px; border-radius: 100px; font-size: 0.8rem; }
.preview-note { margin-top: 20px; text-align: center; color: var(--gray-500); font-size: 0.85rem; background: #f0fdf4; padding: 14px; border-radius: 10px; }
</style>
