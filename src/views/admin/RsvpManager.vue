<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
      <h1 class="page-heading"><Icon name="ClipboardList" size="18" /> RSVP Manager</h1>
      <div class="filter-row">
        <select v-model="filterStatus" class="filter-select">
          <option value="all">All Responses</option>
          <option value="attending">Attending</option>
          <option value="declined">Declined</option>
        </select>
        <select v-model="filterInvitation" class="filter-select">
          <option value="all">All Invitations</option>
          <option v-for="inv in invitations" :key="inv.id" :value="inv.id">
            {{ inv.brideName }} & {{ inv.groomName }}
          </option>
        </select>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="rsvp-summary">
      <div class="rs-item">
        <span class="rs-value">{{ filteredRsvps.length }}</span>
        <span class="rs-label">Total</span>
      </div>
      <div class="rs-item rs-attending">
        <span class="rs-value">{{ attendingCount }}</span>
        <span class="rs-label">Attending</span>
      </div>
      <div class="rs-item rs-declined">
        <span class="rs-value">{{ declinedCount }}</span>
        <span class="rs-label">Declined</span>
      </div>
      <div class="rs-item rs-guests">
        <span class="rs-value">{{ totalGuestCount }}</span>
        <span class="rs-label">Total Guests</span>
      </div>
    </div>

    <div v-if="loading" class="text-center" style="padding: 40px;"><div class="spinner" style="margin: 0 auto;"></div></div>
    <div v-else-if="filteredRsvps.length === 0" class="empty-state">
      <span><Icon name="Mailbox" size="32" /></span>
      <h3>No RSVP responses</h3>
      <p>Responses will appear here once guests RSVP to wedding invitations.</p>
    </div>
    <div v-else>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Guest Name</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Guests</th>
              <th>Wishes</th>
              <th>Invitation</th>
              <th>Responded</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in paginatedRsvps" :key="r.id">
              <td><strong>{{ r.guestName }}</strong></td>
              <td>{{ r.guestPhone || '—' }}</td>
              <td>
                <span :class="r.attending ? 'badge badge-success' : 'badge badge-danger'">
                  <Icon :name="r.attending ? 'CheckCircle2' : 'XCircle'" size="14" />
                  {{ r.attending ? 'Attending' : 'Declined' }}
                </span>
              </td>
              <td>{{ r.guestCount || 1 }}</td>
              <td class="wishes-cell">
                <span v-if="r.wishesMessage" :title="r.wishesMessage">{{ r.wishesMessage }}</span>
                <span v-else style="color: var(--gray-400);">—</span>
              </td>
              <td>
                <span class="badge badge-info">{{ getInvLabel(r.invitationId) }}</span>
              </td>
              <td class="date-cell">{{ formatTs(r.respondedAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Pagination -->
      <div v-if="filteredRsvps.length > pageSize" class="pagination">
        <button @click="page = Math.max(1, page - 1)" :disabled="page === 1" class="btn btn-ghost btn-sm">← Prev</button>
        <span class="page-info">Page {{ page }} of {{ totalPages }}</span>
        <button @click="page = Math.min(totalPages, page + 1)" :disabled="page >= totalPages" class="btn btn-ghost btn-sm">Next →</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useRsvpStore } from '@/stores/rsvpStore'
import { storeToRefs } from 'pinia'

const rsvpStore = useRsvpStore()
const { allRsvps, loading } = storeToRefs(rsvpStore)

const invitations = ref([])
const invMap = ref({})
const filterStatus = ref('all')
const filterInvitation = ref('all')
const page = ref(1)
const pageSize = 20

// Reset page when filters change
watch([filterStatus, filterInvitation], () => { page.value = 1 })

const filteredRsvps = computed(() => {
  let list = [...allRsvps.value]
  if (filterStatus.value === 'attending') list = list.filter(r => r.attending)
  if (filterStatus.value === 'declined') list = list.filter(r => !r.attending)
  if (filterInvitation.value !== 'all') list = list.filter(r => r.invitationId === filterInvitation.value)
  return list
})

const attendingCount = computed(() => filteredRsvps.value.filter(r => r.attending).length)
const declinedCount = computed(() => filteredRsvps.value.filter(r => !r.attending).length)
const totalGuestCount = computed(() => filteredRsvps.value.filter(r => r.attending).reduce((s, r) => s + (r.guestCount || 1), 0))

const totalPages = computed(() => Math.ceil(filteredRsvps.value.length / pageSize))
const paginatedRsvps = computed(() => {
  const start = (page.value - 1) * pageSize
  return filteredRsvps.value.slice(start, start + pageSize)
})

onMounted(async () => {
  // Fetch invitations for cross-reference
  try {
    const snap = await getDocs(collection(db, 'invitations'))
    invitations.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    invitations.value.forEach(inv => { invMap.value[inv.id] = inv })
  } catch (e) { console.error(e) }

  // Fetch all RSVPs
  await rsvpStore.fetchAllRsvps()
})

function getInvLabel(invId) {
  const inv = invMap.value[invId]
  return inv ? `${inv.brideName} & ${inv.groomName}` : (invId?.slice(0, 8) || '—')
}

function formatTs(ts) {
  if (!ts) return '—'
  const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<style scoped>
.page-heading { font-size: 1.4rem; font-weight: 700; color: var(--gray-900); }
.filter-row { display: flex; gap: 10px; flex-wrap: wrap; }
.filter-select {
  padding: 8px 14px;
  border-radius: 10px;
  border: 1.5px solid var(--gray-200);
  font-size: 0.85rem;
  font-weight: 500;
  background: white;
  color: var(--gray-700);
  cursor: pointer;
  min-width: 140px;
}
.filter-select:focus { border-color: var(--rose-400); }

.rsvp-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 24px;
}
.rs-item {
  background: white;
  border-radius: var(--radius);
  padding: 16px;
  text-align: center;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--gray-100);
}
.rs-value { display: block; font-size: 1.5rem; font-weight: 800; color: var(--gray-800); }
.rs-label { font-size: 0.7rem; color: var(--gray-500); text-transform: uppercase; letter-spacing: 0.04em; font-weight: 600; }
.rs-attending .rs-value { color: #059669; }
.rs-declined .rs-value { color: #dc2626; }
.rs-guests .rs-value { color: #7c3aed; }

.empty-state { text-align: center; padding: 60px 20px; }
.empty-state span { font-size: 3rem; display: block; margin-bottom: 12px; }
.empty-state h3 { font-size: 1.1rem; color: var(--gray-700); margin-bottom: 4px; }
.empty-state p { color: var(--gray-500); font-size: 0.85rem; }

.wishes-cell { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.date-cell { white-space: nowrap; font-size: 0.8rem; color: var(--gray-500); }

.pagination {
  display: flex; align-items: center; justify-content: center;
  gap: 16px; padding: 16px 0; margin-top: 8px;
}
.page-info { font-size: 0.8rem; color: var(--gray-500); font-weight: 600; }

@media (max-width: 600px) {
  .rsvp-summary { grid-template-columns: repeat(2, 1fr); }
  .filter-select { min-width: 100px; }
}
</style>
