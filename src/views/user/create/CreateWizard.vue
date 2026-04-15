<template>
  <div class="wizard-page">
    <h1 class="wizard-title"><Icon name="Sparkles" size="16" /> Create Your Wedding Invitation</h1>
    <p class="wizard-subtitle">Fill in the details and generate your beautiful card</p>
    <StepIndicator :steps="steps" :currentStep="currentStep" />
    <div class="wizard-card">
      <Transition name="slide" mode="out-in">
        <component :is="stepComponents[currentStep]" :key="currentStep" :formData="formData" @update="updateFormData" />
      </Transition>
      <div class="wizard-nav">
        <button v-if="currentStep > 0" @click="currentStep--" class="btn btn-secondary">← Previous</button>
        <div v-else></div>
        <button v-if="currentStep < steps.length - 1" @click="nextStep" :disabled="!isStepValid" class="btn btn-primary">Next →</button>
        <button v-else @click="handleSubmit" :disabled="submitting" class="btn btn-success" style="display:flex; align-items:center; gap:8px;">
          <Icon v-if="!submitting" name="PartyPopper" size="18" />
          {{ submitting ? 'Creating...' : 'Generate Invitation' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useInvitationStore } from '@/stores/invitationStore'
import { useAuthStore } from '@/stores/authStore'
import StepIndicator from '@/components/common/StepIndicator.vue'
import StepNames from './StepNames.vue'
import StepDateTime from './StepDateTime.vue'
import StepVenue from './StepVenue.vue'
import StepMessage from './StepMessage.vue'
import StepTemplate from './StepTemplate.vue'
import StepPreview from './StepPreview.vue'

const router = useRouter()
const toast = useToast()
const invitationStore = useInvitationStore()
const authStore = useAuthStore()
const currentStep = ref(0)
const submitting = ref(false)

const steps = [
  { label: 'Names', icon: 'Heart' }, { label: 'Date', icon: 'Calendar' },
  { label: 'Venue', icon: 'MapPin' }, { label: 'Message', icon: 'Mail' },
  { label: 'Template', icon: 'Palette' }, { label: 'Preview', icon: 'Eye' }
]
const stepComponents = [StepNames, StepDateTime, StepVenue, StepMessage, StepTemplate, StepPreview]

const formData = ref({
  brideName: '', groomName: '', weddingDate: '', weddingTime: '',
  venueName: '', venueAddress: '', venueMapUrl: '', customMessage: '', templateId: null
})

const isStepValid = computed(() => {
  const d = formData.value
  switch (currentStep.value) {
    case 0: return d.brideName.trim() && d.groomName.trim()
    case 1: return d.weddingDate && d.weddingTime
    case 2: return d.venueName.trim()
    case 3: return true
    case 4: return d.templateId !== null
    case 5: return true
    default: return false
  }
})

function updateFormData(u) { formData.value = { ...formData.value, ...u } }
function nextStep() { if (isStepValid.value && currentStep.value < steps.length - 1) currentStep.value++ }

async function handleSubmit() {
  try {
    submitting.value = true
    const inv = await invitationStore.createInvitation(formData.value, authStore.user.uid)
    toast.success('🎉 Invitation created!')
    router.push({ name: 'InvitationDetails', params: { id: inv.id } })
  } catch (err) { toast.error('Failed: ' + err.message) }
  finally { submitting.value = false }
}
</script>

<style scoped>
.wizard-page { max-width: 680px; margin: 0 auto; }
.wizard-title { font-family: var(--font-display); font-size: 1.8rem; text-align: center; color: var(--gray-900); }
.wizard-subtitle { text-align: center; color: var(--gray-500); font-size: 0.9rem; margin: 8px 0 32px; }
.wizard-card { background: white; border-radius: var(--radius-lg); box-shadow: var(--shadow); padding: 36px; margin-top: 36px; }
.wizard-nav { display: flex; justify-content: space-between; margin-top: 32px; padding-top: 24px; border-top: 1px solid var(--gray-100); }
</style>
