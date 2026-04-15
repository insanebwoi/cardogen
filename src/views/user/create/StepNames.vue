<template>
  <div>
    <h2 class="step-title">💑 Bride & Groom Details</h2>
    <div class="step-grid">
      <div class="form-group">
        <label class="form-label">👰 Bride's Name</label>
        <input :value="formData.brideName" @input="$emit('update', { brideName: $event.target.value })" type="text" placeholder="Enter bride's name" class="form-input" />
      </div>
      <div class="form-group">
        <label class="form-label">🤵 Groom's Name</label>
        <input :value="formData.groomName" @input="$emit('update', { groomName: $event.target.value })" type="text" placeholder="Enter groom's name" class="form-input" />
      </div>
    </div>
  </div>
</template>
<script setup>
defineProps(['formData']); defineEmits(['update'])
</script>
<style scoped>
.step-title { font-size: 1.15rem; font-weight: 700; color: var(--gray-800); margin-bottom: 20px; }
.step-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media (max-width: 500px) { .step-grid { grid-template-columns: 1fr; } }
</style>
