<template>
  <div>
    <h2 class="step-title"><Icon name="MapPin" size="16" /> Venue Details</h2>
    <div class="form-group">
      <label class="form-label">Venue Name *</label>
      <input :value="formData.venueName" @input="$emit('update', { venueName: $event.target.value })" type="text" placeholder="e.g. Grand Palace Hall" class="form-input" />
    </div>
    <div class="form-group">
      <label class="form-label">Address</label>
      <input :value="formData.venueAddress" @input="$emit('update', { venueAddress: $event.target.value })" type="text" placeholder="Full address" class="form-input" />
    </div>
    <div class="form-group">
      <label class="form-label">Google Maps Link (optional)</label>
      <input :value="formData.venueMapUrl" @input="$emit('update', { venueMapUrl: $event.target.value })" type="url" placeholder="https://maps.google.com/..." class="form-input" />
    </div>
  </div>
</template>
<script setup>
defineProps(['formData']); defineEmits(['update'])
</script>
<style scoped>
.step-title { font-size: 1.15rem; font-weight: 700; color: var(--gray-800); margin-bottom: 20px; }
</style>
