<template>
  <div v-if="loading" class="card-loading">
    <div class="wedding-loader">
      <div class="ring ring-1"></div>
      <div class="ring ring-2"></div>
      <div class="heart-icon"><Icon name="Heart" size="18" /></div>
    </div>
    <p class="loading-text">Unfolding the invitation...</p>
  </div>
  <div v-else-if="!invitation" class="card-not-found">
    <span><Icon name="HeartCrack" size="32" /></span>
    <h2>Invitation Not Found</h2>
    <p>This invitation may have been removed or is no longer active.</p>
  </div>
  <div v-else class="wedding-card-page">
    <TemplateRenderer :templateId="invitation.templateId" :invitation="invitation" />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useInvitationStore } from '@/stores/invitationStore'
import TemplateRenderer from '@/components/templates/TemplateRenderer.vue'

const route = useRoute()
const invitationStore = useInvitationStore()
const { currentInvitation: invitation, loading } = storeToRefs(invitationStore)

onMounted(async () => {
  await invitationStore.fetchByShortCode(route.params.shortCode)
  if (invitation.value) {
    document.title = `${invitation.value.brideName} & ${invitation.value.groomName} — Wedding Invitation`
  }
})
</script>

<style scoped>
.card-loading, .card-not-found {
  min-height: 100vh; display: flex; flex-direction: column;
  align-items: center; justify-content: center; background: linear-gradient(135deg, #fdf2f8, #fce7f3);
}

.wedding-loader {
  position: relative;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-radius: 50%;
  border-top-color: var(--rose-400);
  border-bottom-color: var(--gold-400);
  animation: spin 2s linear infinite;
}

.ring-2 {
  width: 70%;
  height: 70%;
  border-top-color: var(--gold-400);
  border-bottom-color: var(--rose-400);
  animation: spin-reverse 1.5s linear infinite;
}

.heart-icon {
  font-size: 2rem;
  animation: pulse 1.5s ease-in-out infinite;
}

.loading-text {
  margin-top: 24px;
  color: var(--rose-600);
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-style: italic;
  letter-spacing: 0.05em;
  animation: fade 1.5s ease-in-out infinite;
}

@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
@keyframes spin-reverse { 0% { transform: rotate(360deg); } 100% { transform: rotate(0deg); } }
@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }
@keyframes fade { 0%, 100% { opacity: 0.7; } 50% { opacity: 1; } }

.card-not-found span { font-size: 4rem; }
.card-not-found h2 { margin-top: 16px; font-family: var(--font-display); color: var(--gray-800); }
.card-not-found p { color: var(--gray-500); margin-top: 8px; }
</style>
