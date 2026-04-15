<template>
  <div class="dashboard">
    <div class="dash-header">
      <div>
        <h1 class="dash-title">Welcome back, {{ userProfile?.name?.split(' ')[0] }} <Icon name="Hand" size="24" /></h1>
        <p class="dash-subtitle">Manage your wedding invitations</p>
      </div>
      <RouterLink to="/create" class="btn btn-primary">+ Create Invitation</RouterLink>
    </div>

    <div class="dash-stats">
      <div class="stat-card">
        <span class="stat-value" style="color: var(--rose-500);">{{ invitations.length }}</span>
        <span class="stat-label">Invitations</span>
      </div>
      <div class="stat-card">
        <span class="stat-value" style="color: #8b5cf6;">{{ totalViews }}</span>
        <span class="stat-label">Total Views</span>
      </div>
      <div class="stat-card">
        <span class="stat-value" style="color: #10b981;">{{ totalRsvps }}</span>
        <span class="stat-label">RSVPs</span>
      </div>
    </div>

    <div class="dash-section">
      <h2>Your Invitations</h2>
      <div v-if="loading" class="text-center" style="padding: 40px;"><div class="spinner" style="margin: 0 auto;"></div></div>
      <div v-else-if="invitations.length === 0" class="dash-empty">
        <span><Icon name="Mail" size="18" /></span>
        <h3>No invitations yet</h3>
        <p>Create your first beautiful wedding invitation</p>
        <RouterLink to="/create" class="btn btn-primary" style="margin-top: 16px;">Create Now</RouterLink>
      </div>
      <div v-else class="inv-grid">
        <div v-for="inv in invitations" :key="inv.id" class="inv-card card">
          <div class="inv-card-top" :style="{ background: getGradient(inv.templateId) }">
            <span class="inv-template-icon"><Icon :name="getIcon(inv.templateId)" size="40" color="rgba(255,255,255,0.8)" /></span>
          </div>
          <div class="card-body">
            <h3 class="inv-names">{{ inv.brideName }} & {{ inv.groomName }}</h3>
            <p class="inv-date"><Icon name="Calendar" size="16" /> {{ formatDate(inv.weddingDate) }}</p>
            <p class="inv-venue"><Icon name="MapPin" size="16" /> {{ inv.venueName }}</p>
            <div class="inv-stats-row">
              <span class="badge badge-info"><Icon name="Eye" size="16" /> {{ inv.viewCount || 0 }} views</span>
              <span :class="inv.isActive ? 'badge badge-success' : 'badge badge-danger'" style="margin-left: 6px;">
                {{ inv.isActive ? 'Active' : 'Inactive' }}
              </span>
            </div>
            <div class="inv-actions">
              <RouterLink :to="{ name: 'InvitationDetails', params: { id: inv.id } }" class="btn btn-primary btn-sm" style="flex:1;">View Details</RouterLink>
              <button @click="copyLink(inv.shortCode)" class="btn btn-secondary btn-sm" title="Copy Link"><Icon name="Link" size="16" /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/authStore'
import { useInvitationStore } from '@/stores/invitationStore'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/config/firebase'

const toast = useToast()
const authStore = useAuthStore()
const invitationStore = useInvitationStore()
const { userProfile } = storeToRefs(authStore)
const { invitations, loading } = storeToRefs(invitationStore)

const totalViews = computed(() => invitations.value.reduce((s, i) => s + (i.viewCount || 0), 0))
const totalRsvps = ref(0)

onMounted(async () => {
  await invitationStore.fetchMyInvitations(authStore.user.uid)

  // Count RSVPs across all user invitations
  try {
    let rsvpCount = 0
    for (const inv of invitations.value) {
      try {
        const q = query(collection(db, 'rsvps'), where('invitationId', '==', inv.id))
        const snap = await getDocs(q)
        rsvpCount += snap.size
      } catch (e) {
        console.warn('RSVP count error for invitation:', inv.id, e)
      }
    }
    totalRsvps.value = rsvpCount
  } catch (e) {
    console.error('RSVP count error:', e)
  }
})

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
function getGradient(id) {
  const g = { 'royal-gold': 'linear-gradient(135deg,#1a0a00,#2d1810)', 'floral-dream': 'linear-gradient(135deg,#fff5f7,#fce7f3)', 'minimal-white': 'linear-gradient(135deg,#fafaf9,#f5f5f4)', 'traditional-classic': 'linear-gradient(135deg,#064e3b,#047857)', 'modern-love': 'linear-gradient(135deg,#0f0a1a,#1e1b4b)' }
  return g[id] || g['royal-gold']
}
function getIcon(id) {
  const i = { 'royal-gold': 'Crown', 'floral-dream': 'Sparkles', 'minimal-white': 'Sparkles', 'traditional-classic': 'MoonStar', 'modern-love': 'Heart' }
  return i[id] || 'Heart'
}
async function copyLink(code) {
  try { await navigator.clipboard.writeText(`${window.location.origin}/w/${code}`); toast.success('Link copied!') }
  catch { toast.error('Copy failed') }
}
</script>

<style scoped>
.dash-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; flex-wrap: wrap; gap: 16px; }
.dash-title { font-family: var(--font-display); font-size: 1.8rem; color: var(--gray-900); }
.dash-subtitle { color: var(--gray-500); font-size: 0.9rem; margin-top: 4px; }
.dash-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 40px; }
.dash-section h2 { font-size: 1.2rem; font-weight: 700; color: var(--gray-800); margin-bottom: 20px; }
.dash-empty { text-align: center; padding: 60px 20px; background: white; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); }
.dash-empty span { font-size: 3rem; }
.dash-empty h3 { font-size: 1.2rem; color: var(--gray-700); margin-top: 12px; }
.dash-empty p { color: var(--gray-500); font-size: 0.9rem; margin-top: 4px; }
.inv-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
.inv-card-top { height: 80px; display: flex; align-items: center; justify-content: center; }
.inv-template-icon { font-size: 2rem; }
.inv-names { font-family: var(--font-display); font-size: 1.1rem; color: var(--gray-800); }
.inv-date, .inv-venue { font-size: 0.8rem; color: var(--gray-500); margin-top: 4px; }
.inv-stats-row { margin: 12px 0; }
.inv-actions { display: flex; gap: 8px; margin-top: 12px; }
@media (max-width: 600px) {
  .dash-stats { grid-template-columns: 1fr; }
  .inv-grid { grid-template-columns: 1fr; }
  .dash-title { font-size: 1.4rem; }
}
</style>
