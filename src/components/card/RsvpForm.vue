<template>
  <div class="rsvp-form" :class="`rsvp-${theme}`">
    <div v-if="submitted" class="rsvp-success">
      <span class="rsvp-success-icon"><Icon name="PartyPopper" size="18" /></span>
      <h3>Thank You!</h3>
      <p>Your response has been recorded.</p>
    </div>
    <form v-else @submit.prevent="handleSubmit" class="rsvp-inner">
      <h3 class="rsvp-title">Will You Join Us? <Icon name="Mail" size="18" /></h3>
      <input v-model="form.guestName" type="text" placeholder="Your Full Name *" required class="rsvp-input" />
      <input v-model="form.guestPhone" type="tel" placeholder="Phone Number (optional)" class="rsvp-input" />
      <div class="rsvp-toggle">
        <button type="button" @click="form.attending = true" class="rsvp-opt" :class="{ active: form.attending }"><Icon name="CheckCircle2" size="16" /> I'll Be There!</button>
        <button type="button" @click="form.attending = false" class="rsvp-opt" :class="{ active: !form.attending, decline: true }">😔 Can't Make It</button>
      </div>
      <div v-if="form.attending" class="rsvp-guests">
        <label>Number of Guests</label>
        <select v-model.number="form.guestCount" class="rsvp-input">
          <option v-for="n in 10" :key="n" :value="n">{{ n }} {{ n === 1 ? 'Guest' : 'Guests' }}</option>
        </select>
      </div>
      <textarea v-model="form.wishesMessage" placeholder="Send your wishes to the couple... 💕" rows="3" class="rsvp-input"></textarea>
      <button type="submit" :disabled="loading || !form.guestName.trim()" class="rsvp-submit">
        <span v-if="loading">Sending...</span>
        <span v-else class="btn-content"><Icon name="Mail" size="18" /> Send My Response</span>
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useToast } from 'vue-toastification'
import { useRsvpStore } from '@/stores/rsvpStore'
const props = defineProps({ invitationId: String, theme: { type: String, default: 'gold' } })
const toast = useToast()
const rsvpStore = useRsvpStore()
const submitted = ref(false)
const loading = ref(false)
const form = reactive({ guestName: '', guestPhone: '', attending: true, guestCount: 1, wishesMessage: '' })

async function handleSubmit() {
  try {
    loading.value = true
    await rsvpStore.submitRsvp(props.invitationId, form)
    submitted.value = true
    toast.success('Response submitted successfully!')
  } catch { toast.error('Failed to submit. Please try again.') }
  finally { loading.value = false }
}
</script>

<style scoped>
.rsvp-form { margin: 32px 0; padding: 28px; border-radius: 16px; max-width: 420px; margin-left: auto; margin-right: auto; }
.rsvp-inner { display: flex; flex-direction: column; gap: 14px; }
.rsvp-title { text-align: center; font-size: 1.15rem; font-weight: 700; margin-bottom: 4px; }
.rsvp-input {
  width: 100%; padding: 13px 16px; border-radius: 10px; border: 1.5px solid transparent;
  font-size: 0.9rem; transition: all 0.2s;
}
.rsvp-input:focus { border-color: currentColor; }
.rsvp-toggle { display: flex; gap: 10px; }
.rsvp-opt {
  flex: 1; padding: 12px; border-radius: 10px; font-weight: 600; font-size: 0.85rem;
  transition: all 0.2s; cursor: pointer;
}
.rsvp-guests label { font-size: 0.8rem; display: block; margin-bottom: 6px; }
.rsvp-submit {
  width: 100%; padding: 14px; border-radius: 12px; font-weight: 700; font-size: 0.95rem;
  cursor: pointer; transition: all 0.3s; display: flex; justify-content: center; align-items: center; gap: 8px;
}
.btn-content { display: flex; align-items: center; justify-content: center; gap: 6px; }
.rsvp-submit:disabled { opacity: 0.5; cursor: not-allowed; }
.rsvp-success { text-align: center; padding: 24px 0; }
.rsvp-success-icon { font-size: 3rem; display: block; margin-bottom: 12px; }
.rsvp-success h3 { font-size: 1.3rem; font-weight: 700; }
.rsvp-success p { font-size: 0.9rem; margin-top: 4px; }

/* Gold theme */
.rsvp-gold { background: rgba(212,175,55,0.08); border: 1px solid rgba(212,175,55,0.15); }
.rsvp-gold .rsvp-title { color: #f5e6c8; }
.rsvp-gold .rsvp-input { background: rgba(255,255,255,0.06); color: #f5e6c8; border-color: rgba(212,175,55,0.2); }
.rsvp-gold .rsvp-input::placeholder { color: rgba(245,230,200,0.4); }
.rsvp-gold .rsvp-opt { background: rgba(255,255,255,0.05); color: rgba(245,230,200,0.5); }
.rsvp-gold .rsvp-opt.active { background: #d4af37; color: #1a0a00; transform: scale(1.03); }
.rsvp-gold .rsvp-opt.active.decline { background: #ef4444; color: white; }
.rsvp-gold .rsvp-submit { background: linear-gradient(135deg, #d4af37, #b8860b); color: #1a0a00; }
.rsvp-gold .rsvp-success h3 { color: #f5e6c8; }
.rsvp-gold .rsvp-success p { color: rgba(245,230,200,0.6); }

/* Pink theme */
.rsvp-pink { background: rgba(255,255,255,0.7); backdrop-filter: blur(8px); border: 1px solid rgba(244,114,182,0.2); }
.rsvp-pink .rsvp-title { color: #9d174d; }
.rsvp-pink .rsvp-input { background: white; color: #831843; border-color: #fce7f3; }
.rsvp-pink .rsvp-opt { background: #fdf2f8; color: #9d174d; }
.rsvp-pink .rsvp-opt.active { background: #ec4899; color: white; }
.rsvp-pink .rsvp-opt.active.decline { background: #ef4444; color: white; }
.rsvp-pink .rsvp-submit { background: linear-gradient(135deg, #ec4899, #be185d); color: white; }
.rsvp-pink .rsvp-success h3 { color: #9d174d; }
.rsvp-pink .rsvp-success p { color: #be185d; }

/* Minimal theme */
.rsvp-minimal { background: white; border: 1px solid #e7e5e4; }
.rsvp-minimal .rsvp-title { color: #292524; }
.rsvp-minimal .rsvp-input { background: #fafaf9; color: #292524; border-color: #e7e5e4; }
.rsvp-minimal .rsvp-opt { background: #f5f5f4; color: #78716c; }
.rsvp-minimal .rsvp-opt.active { background: #292524; color: white; }
.rsvp-minimal .rsvp-opt.active.decline { background: #ef4444; color: white; }
.rsvp-minimal .rsvp-submit { background: #292524; color: white; }

/* Green theme */
.rsvp-green { background: rgba(255,255,255,0.06); border: 1px solid rgba(110,231,183,0.15); }
.rsvp-green .rsvp-title { color: #ecfdf5; }
.rsvp-green .rsvp-input { background: rgba(255,255,255,0.06); color: #ecfdf5; border-color: rgba(110,231,183,0.2); }
.rsvp-green .rsvp-input::placeholder { color: rgba(167,243,208,0.4); }
.rsvp-green .rsvp-opt { background: rgba(255,255,255,0.05); color: rgba(167,243,208,0.5); }
.rsvp-green .rsvp-opt.active { background: #10b981; color: white; }
.rsvp-green .rsvp-opt.active.decline { background: #ef4444; color: white; }
.rsvp-green .rsvp-submit { background: linear-gradient(135deg, #10b981, #059669); color: white; }
.rsvp-green .rsvp-success h3 { color: #ecfdf5; }
.rsvp-green .rsvp-success p { color: #6ee7b7; }

/* Purple theme */
.rsvp-purple { background: rgba(168,85,247,0.08); border: 1px solid rgba(168,85,247,0.15); }
.rsvp-purple .rsvp-title { color: white; }
.rsvp-purple .rsvp-input { background: rgba(255,255,255,0.06); color: white; border-color: rgba(168,85,247,0.2); }
.rsvp-purple .rsvp-input::placeholder { color: rgba(255,255,255,0.3); }
.rsvp-purple .rsvp-opt { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.4); }
.rsvp-purple .rsvp-opt.active { background: #a855f7; color: white; }
.rsvp-purple .rsvp-opt.active.decline { background: #ef4444; color: white; }
.rsvp-purple .rsvp-submit { background: linear-gradient(135deg, #a855f7, #7c3aed); color: white; }
.rsvp-purple .rsvp-success h3 { color: white; }
.rsvp-purple .rsvp-success p { color: #c084fc; }

/* Select option fix for dark themes */
.rsvp-gold select option, .rsvp-green select option, .rsvp-purple select option { color: #333; background: white; }
</style>
