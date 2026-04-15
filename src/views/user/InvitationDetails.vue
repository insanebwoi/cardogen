<template>
  <div v-if="invitation" class="details-page">
    <div class="card">
      <div class="card-body">
        <div class="det-header">
          <div>
            <h1 class="det-title">{{ invitation.brideName }} & {{ invitation.groomName }}</h1>
            <p class="det-date">{{ formatDate(invitation.weddingDate) }} at {{ invitation.weddingTime }}</p>
            <p class="det-venue"><Icon name="MapPin" size="16" /> {{ invitation.venueName }}</p>
          </div>
          <div class="det-actions">
            <a :href="`/w/${invitation.shortCode}`" target="_blank" class="btn btn-primary btn-sm"><Icon name="Link" size="16" /> Open Card</a>
            <span :class="invitation.isActive ? 'badge badge-success' : 'badge badge-danger'">
              {{ invitation.isActive ? 'Active' : 'Inactive' }}
            </span>
          </div>
        </div>
        <div class="det-link-box">
          <input :value="shareLink" readonly class="det-link-input" />
          <button @click="copyLink" class="btn btn-sm" style="background: var(--gray-800); color: white; white-space: nowrap;">
            {{ copied ? '<Icon name="CheckCircle2" size="16" /> Copied!' : '<Icon name="ClipboardList" size="18" /> Copy' }}
          </button>
        </div>
      </div>
    </div>

    <div class="dash-stats" style="margin-top: 20px;">
      <div class="stat-card"><span class="stat-value" style="color: #3b82f6;">{{ invitation.viewCount || 0 }}</span><span class="stat-label">Views</span></div>
      <div class="stat-card"><span class="stat-value" style="color: #8b5cf6;">{{ stats.total }}</span><span class="stat-label">RSVPs</span></div>
      <div class="stat-card"><span class="stat-value" style="color: #10b981;">{{ stats.attendingCount }}</span><span class="stat-label">Attending</span></div>
      <div class="stat-card"><span class="stat-value" style="color: var(--rose-500);">{{ stats.totalGuests }}</span><span class="stat-label">Total Guests</span></div>
    </div>

    <div class="card" style="margin-top: 20px;">
      <div class="card-body">
        <h2 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 16px;"><Icon name="ClipboardList" size="18" /> Guest Responses</h2>
      </div>
      <div v-if="rsvpLoading" class="text-center" style="padding: 32px;"><div class="spinner" style="margin: 0 auto;"></div></div>
      <div v-else-if="rsvps.length === 0" class="text-center" style="padding: 40px; color: var(--gray-400);">
        <p>No responses yet. Share your link! <Icon name="Mail" size="18" /></p>
      </div>
      <div v-else class="table-wrapper">
        <table>
          <thead><tr><th>Name</th><th>Phone</th><th>Status</th><th>Guests</th><th>Wishes</th><th>Date</th></tr></thead>
          <tbody>
            <tr v-for="r in rsvps" :key="r.id">
              <td><strong>{{ r.guestName }}</strong></td>
              <td>{{ r.guestPhone || '—' }}</td>
              <td><span :class="r.attending ? 'badge badge-success' : 'badge badge-danger'">{{ r.attending ? '<Icon name="CheckCircle2" size="16" /> Yes' : '<Icon name="XCircle" size="16" /> No' }}</span></td>
              <td>{{ r.guestCount || 1 }}</td>
              <td style="max-width: 200px;">{{ r.wishesMessage || '—' }}</td>
              <td class="date-cell">{{ formatTimestamp(r.respondedAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  <div v-else-if="loading" class="text-center" style="padding: 60px;"><div class="spinner" style="margin: 0 auto;"></div></div>
  <div v-else class="text-center" style="padding: 60px; color: var(--gray-500);">
    <span style="font-size: 3rem; display: block; margin-bottom: 12px;"><Icon name="Frown" size="32" /></span>
    <h3>Invitation not found</h3>
    <RouterLink to="/dashboard" class="btn btn-primary" style="margin-top: 16px;">← Back to Dashboard</RouterLink>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useInvitationStore } from '@/stores/invitationStore'
import { useRsvpStore } from '@/stores/rsvpStore'

const route = useRoute()
const invitationStore = useInvitationStore()
const rsvpStore = useRsvpStore()
const { currentInvitation: invitation, loading } = storeToRefs(invitationStore)
const { rsvps } = storeToRefs(rsvpStore)
const copied = ref(false)
const rsvpLoading = ref(true)
const stats = reactive({ total: 0, attendingCount: 0, totalGuests: 0 })
const shareLink = ref('')

onMounted(async () => {
  await invitationStore.fetchById(route.params.id)
  if (invitation.value) {
    shareLink.value = `${window.location.origin}/w/${invitation.value.shortCode}`
    await rsvpStore.fetchRsvps(invitation.value.id)
    Object.assign(stats, rsvpStore.getStats())
    rsvpLoading.value = false
  } else {
    rsvpLoading.value = false
  }
})

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

function formatTimestamp(ts) {
  if (!ts) return '—'
  const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

async function copyLink() {
  try { await navigator.clipboard.writeText(shareLink.value) } catch {}
  copied.value = true; setTimeout(() => copied.value = false, 2000)
}
</script>

<style scoped>
.details-page { max-width: 900px; margin: 0 auto; }
.det-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; }
.det-title { font-family: var(--font-display); font-size: 1.5rem; color: var(--gray-900); }
.det-date { color: var(--gray-500); font-size: 0.85rem; margin-top: 4px; }
.det-venue { color: var(--gray-600); font-size: 0.85rem; margin-top: 2px; }
.det-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.det-link-box {
  display: flex; gap: 10px; align-items: center; margin-top: 20px;
  background: var(--gray-50); padding: 12px 16px; border-radius: 12px;
}
.det-link-input { flex: 1; background: transparent; border: none; font-family: monospace; font-size: 0.85rem; color: var(--gray-700); min-width: 0; }
.dash-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.date-cell { white-space: nowrap; font-size: 0.8rem; color: var(--gray-500); }
@media (max-width: 600px) { .dash-stats { grid-template-columns: repeat(2, 1fr); } }
</style>
