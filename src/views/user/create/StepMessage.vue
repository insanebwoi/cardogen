<template>
  <div>
    <h2 class="step-title"><Icon name="Mail" size="18" /> Custom Message</h2>
    <p class="step-desc">Add a personal touch to your invitation (optional)</p>
    <div class="form-group">
      <textarea :value="formData.customMessage" @input="$emit('update', { customMessage: $event.target.value })" placeholder="e.g. Two souls, one heart — we'd love you to be a part of our special day..." rows="4" class="form-input"></textarea>
    </div>
    <div class="msg-suggestions">
      <p class="sug-label">💡 Quick suggestions:</p>
      <button v-for="(s, i) in suggestions" :key="i" @click="$emit('update', { customMessage: s })" class="sug-chip">{{ s }}</button>
    </div>
  </div>
</template>
<script setup>
defineProps(['formData']); defineEmits(['update'])
const suggestions = [
  'Two souls, one heart — join us as we begin our forever.',
  'With love and joy, we invite you to celebrate our union.',
  'Every love story is beautiful, but ours is our favorite.',
  'Together is a wonderful place to be.'
]
</script>
<style scoped>
.step-title { font-size: 1.15rem; font-weight: 700; color: var(--gray-800); margin-bottom: 8px; }
.step-desc { color: var(--gray-500); font-size: 0.85rem; margin-bottom: 20px; }
.msg-suggestions { margin-top: 20px; }
.sug-label { font-size: 0.8rem; color: var(--gray-500); margin-bottom: 10px; }
.sug-chip {
  display: inline-block; padding: 8px 14px; margin: 4px; border-radius: 100px;
  background: var(--rose-50); color: var(--rose-700); font-size: 0.8rem;
  cursor: pointer; border: 1px solid var(--rose-100); transition: all 0.2s;
}
.sug-chip:hover { background: var(--rose-100); }
</style>
