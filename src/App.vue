<template>
  <div v-if="loading" class="app-loader">
    <div class="spinner"></div>
  </div>
  <component v-else :is="currentLayout">
    <RouterView v-slot="{ Component, route }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" :key="route.path" />
      </Transition>
    </RouterView>
  </component>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import BlankLayout from '@/layouts/BlankLayout.vue'

const route = useRoute()
const authStore = useAuthStore()
const { loading } = storeToRefs(authStore)

const layouts = { default: DefaultLayout, admin: AdminLayout, blank: BlankLayout }
const currentLayout = computed(() => layouts[route.meta.layout || 'default'])

onMounted(() => { authStore.initAuth() })
</script>

<style>
.app-loader {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--gray-50);
}
</style>
