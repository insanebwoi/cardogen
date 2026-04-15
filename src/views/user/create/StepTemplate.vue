<template>
  <div>
    <h2 class="step-title"><Icon name="Palette" size="18" /> Choose a Template</h2>
    <div class="template-grid">
      <div
        v-for="t in templates" :key="t.id"
        @click="$emit('update', { templateId: t.id })"
        class="tmpl-card" :class="{ selected: formData.templateId === t.id }"
      >
        <div class="tmpl-preview" :style="{ background: t.gradient }">
          <span class="tmpl-icon"><Icon :name="t.icon" size="40" color="rgba(255,255,255,0.8)" /></span>
        </div>
        <div class="tmpl-info">
          <strong>{{ t.name }}</strong>
          <small>{{ t.category }}</small>
        </div>
        <div v-if="formData.templateId === t.id" class="tmpl-check"><Icon name="Check" size="16" /></div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps(['formData']); defineEmits(['update'])

const templates = [
  { id: 'royal-gold', name: 'Royal Gold', category: 'Luxury', icon: 'Crown', gradient: 'linear-gradient(135deg, #1a0a00, #2d1810)' },
  { id: 'floral-dream', name: 'Floral Dream', category: 'Romantic', icon: 'Sparkles', gradient: 'linear-gradient(135deg, #fff5f7, #fce7f3)' },
  { id: 'minimal-white', name: 'Minimal White', category: 'Modern', icon: 'Sparkles', gradient: 'linear-gradient(135deg, #fafaf9, #f5f5f4)' },
  { id: 'traditional-classic', name: 'Traditional', category: 'Classic', icon: 'MoonStar', gradient: 'linear-gradient(135deg, #064e3b, #047857)' },
  { id: 'modern-love', name: 'Modern Love', category: 'Trendy', icon: 'Heart', gradient: 'linear-gradient(135deg, #0f0a1a, #1e1b4b)' }
]
</script>

<style scoped>
.step-title { font-size: 1.15rem; font-weight: 700; color: var(--gray-800); margin-bottom: 20px; }
.template-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
@media (max-width: 500px) { .template-grid { grid-template-columns: repeat(2, 1fr); } }
.tmpl-card {
  position: relative; border-radius: 14px; overflow: hidden; cursor: pointer;
  border: 2.5px solid var(--gray-200); transition: all 0.25s;
}
.tmpl-card:hover { border-color: var(--rose-300); transform: translateY(-2px); box-shadow: var(--shadow); }
.tmpl-card.selected { border-color: var(--rose-500); box-shadow: 0 0 0 3px rgba(244,63,94,0.15); }
.tmpl-preview {
  height: 120px; display: flex; align-items: center; justify-content: center;
}
.tmpl-icon { font-size: 2.5rem; }
.tmpl-info { padding: 12px; text-align: center; }
.tmpl-info strong { display: block; font-size: 0.85rem; color: var(--gray-800); }
.tmpl-info small { font-size: 0.7rem; color: var(--gray-500); }
.tmpl-check {
  position: absolute; top: 8px; right: 8px; width: 26px; height: 26px;
  border-radius: 50%; background: var(--rose-500); color: white;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.8rem; font-weight: 700;
}
</style>
