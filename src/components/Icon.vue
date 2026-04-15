<template>
  <component :is="iconComponent" :size="size" :color="color" :class="className" :stroke-width="strokeWidth" />
</template>

<script setup>
import { computed } from 'vue'
import * as icons from 'lucide-vue-next'

const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 20 },
  color: { type: String, default: 'currentColor' },
  strokeWidth: { type: [Number, String], default: 2 },
  className: { type: String, default: '' }
})

const iconComponent = computed(() => {
  return icons[props.name] || icons.HelpCircle
})
</script>
