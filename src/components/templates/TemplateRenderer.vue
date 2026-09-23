<template>
  <!-- Every card renders through here, so the credit lives in one place. -->
  <DynamicTemplate v-if="dynamicTemplate" :template="dynamicTemplate" :invitation="invitation" />
  <component v-else :is="templateComponent" :invitation="invitation" />
  <PoweredBy :theme="theme" />
</template>

<script setup>
import { computed, defineAsyncComponent, ref, watch } from 'vue'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/config/firebase'
import DynamicTemplate from './DynamicTemplate.vue'
import PoweredBy from '@/components/card/PoweredBy.vue'

const props = defineProps({ templateId: String, invitation: Object })

const templateMap = {
  'royal-gold': defineAsyncComponent(() => import('./RoyalGold.vue')),
  'floral-dream': defineAsyncComponent(() => import('./FloralDream.vue')),
  'minimal-white': defineAsyncComponent(() => import('./MinimalWhite.vue')),
  'traditional-classic': defineAsyncComponent(() => import('./TraditionalClassic.vue')),
  'modern-love': defineAsyncComponent(() => import('./ModernLove.vue')),
  'ios-glass': defineAsyncComponent(() => import('./IosGlass.vue'))
}

const dynamicTemplate = ref(null)

async function resolveDynamic(id) {
  dynamicTemplate.value = null
  if (!id || templateMap[id]) return
  // Try slug first, then document id
  try {
    const q = query(collection(db, 'templates'), where('slug', '==', id))
    const snap = await getDocs(q)
    if (!snap.empty) {
      const d = snap.docs[0]
      const data = d.data()
      if (data.html) dynamicTemplate.value = { id: d.id, ...data }
    }
  } catch (e) { console.warn('resolveDynamic failed', e) }
}

watch(() => props.templateId, (id) => resolveDynamic(id), { immediate: true })

const templateComponent = computed(() => templateMap[props.templateId] || templateMap['royal-gold'])

const TEMPLATE_THEME = {
  'royal-gold': 'gold',
  'floral-dream': 'pink',
  'minimal-white': 'minimal',
  'traditional-classic': 'green',
  'modern-love': 'purple',
  'ios-glass': 'glass'
}
const theme = computed(() =>
  TEMPLATE_THEME[props.templateId] || dynamicTemplate.value?.theme || 'gold')
</script>
