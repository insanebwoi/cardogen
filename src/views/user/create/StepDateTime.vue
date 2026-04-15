<template>
  <div>
    <h2 class="step-title"><Icon name="Calendar" size="16" /> Date & Time</h2>
    <div class="step-grid">
      <div class="form-group">
        <label class="form-label">Wedding Date</label>
        <input :value="formData.weddingDate" @input="$emit('update', { weddingDate: $event.target.value })" type="date" :min="today" class="form-input" />
      </div>
      <div class="form-group">
        <label class="form-label">Wedding Time</label>
        <input :value="formData.weddingTime" @input="$emit('update', { weddingTime: $event.target.value })" type="time" class="form-input" />
      </div>
    </div>
  </div>
</template>
<script setup>
defineProps(['formData']); defineEmits(['update'])
const today = new Date().toISOString().split('T')[0]
</script>
<style scoped>
.step-title { font-size: 1.15rem; font-weight: 700; color: var(--gray-800); margin-bottom: 20px; }
.step-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media (max-width: 500px) { .step-grid { grid-template-columns: 1fr; } }
</style>
