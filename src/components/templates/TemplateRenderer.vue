<template>
  <component :is="templateComponent" :invitation="invitation" />
</template>

<script setup>
import { computed, defineAsyncComponent } from 'vue'

const props = defineProps({ templateId: String, invitation: Object })

const templateMap = {
  'royal-gold': defineAsyncComponent(() => import('./RoyalGold.vue')),
  'floral-dream': defineAsyncComponent(() => import('./FloralDream.vue')),
  'minimal-white': defineAsyncComponent(() => import('./MinimalWhite.vue')),
  'traditional-classic': defineAsyncComponent(() => import('./TraditionalClassic.vue')),
  'modern-love': defineAsyncComponent(() => import('./ModernLove.vue'))
}

const templateComponent = computed(() => templateMap[props.templateId] || templateMap['royal-gold'])
</script>
