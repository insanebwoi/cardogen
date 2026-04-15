<template>
  <div class="admin-dash">
    <h1 class="page-heading"><Icon name="LayoutDashboard" size="18" /> Dashboard Overview</h1>

    <!-- Stats Grid -->
    <div class="dash-stats">
      <div class="stat-card stat-invitations">
        <div class="stat-icon-wrap"><span><Icon name="Mail" size="18" /></span></div>
        <div class="stat-info">
          <span class="stat-value">{{ totalInvitations }}</span>
          <span class="stat-label">Total Invitations</span>
        </div>
      </div>
      <div class="stat-card stat-users">
        <div class="stat-icon-wrap"><span><Icon name="Users" size="18" /></span></div>
        <div class="stat-info">
          <span class="stat-value">{{ totalUsers }}</span>
          <span class="stat-label">Registered Users</span>
        </div>
      </div>
      <div class="stat-card stat-templates">
        <div class="stat-icon-wrap"><span><Icon name="Palette" size="18" /></span></div>
        <div class="stat-info">
          <span class="stat-value">{{ totalTemplates }}</span>
          <span class="stat-label">Templates</span>
        </div>
      </div>
      <div class="stat-card stat-rsvps">
        <div class="stat-icon-wrap"><span><Icon name="ClipboardList" size="18" /></span></div>
        <div class="stat-info">
          <span class="stat-value">{{ totalRsvps }}</span>
          <span class="stat-label">RSVP Responses</span>
        </div>
      </div>
    </div>

    <!-- RSVP Summary -->
    <div class="dash-row">
      <div class="dash-col">
        <div class="card">
          <div class="card-body">
            <div class="section-header">
              <h2><Icon name="ClipboardList" size="18" /> All RSVP Responses</h2>
              <span class="badge badge-info">{{ allRsvps.length }} total</span>
            </div>
            <div v-if="rsvpLoading" class="text-center" style="padding: 32px;"><div class="spinner" style="margin: 0 auto;"></div></div>
            <div v-else-if="allRsvps.length === 0" class="empty-state">
              <span><Icon name="Mailbox" size="32" /></span>
              <p>No RSVP responses yet</p>
            </div>
            <div v-else class="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Guest Name</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Guests</th>
                    <th>Wishes</th>
                    <th>Invitation</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="r in paginatedRsvps" :key="r.id">
                    <td><strong>{{ r.guestName }}</strong></td>
                    <td>{{ r.guestPhone || '—' }}</td>
                    <td>
                      <span :class="r.attending ? 'badge badge-success' : 'badge badge-danger'">
                        {{ r.attending ? '<Icon name="CheckCircle2" size="16" /> Attending' : '<Icon name="XCircle" size="16" /> Declined' }}
                      </span>
                    </td>
                    <td>{{ r.guestCount || 1 }}</td>
                    <td class="wishes-cell">{{ r.wishesMessage || '—' }}</td>
                    <td>
                      <span class="badge badge-info">{{ getInvitationLabel(r.invitationId) }}</span>
                    </td>
                    <td class="date-cell">{{ formatTimestamp(r.respondedAt) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <!-- Pagination -->
            <div v-if="allRsvps.length > rsvpPageSize" class="pagination">
              <button
                @click="rsvpPage = Math.max(1, rsvpPage - 1)"
                :disabled="rsvpPage === 1"
                class="btn btn-ghost btn-sm"
              >← Prev</button>
              <span class="page-info">Page {{ rsvpPage }} of {{ totalRsvpPages }}</span>
              <button
                @click="rsvpPage = Math.min(totalRsvpPages, rsvpPage + 1)"
                :disabled="rsvpPage >= totalRsvpPages"
                class="btn btn-ghost btn-sm"
              >Next →</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Invitations -->
    <div class="card" style="margin-top: 24px;">
      <div class="card-body">
        <div class="section-header">
          <h2><Icon name="Mail" size="18" /> Recent Invitations</h2>
          <RouterLink to="/admin/invitations" class="btn btn-ghost btn-sm" v-if="recentInvitations.length > 0">View All →</RouterLink>
        </div>
        <div v-if="invLoading" class="text-center" style="padding: 32px;"><div class="spinner" style="margin: 0 auto;"></div></div>
        <div v-else-if="recentInvitations.length === 0" class="empty-state">
          <span><Icon name="Mail" size="18" /></span>
          <p>No invitations created yet</p>
        </div>
        <div v-else class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Couple</th>
                <th>Date</th>
                <th>Template</th>
                <th>Status</th>
                <th>Views</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="inv in recentInvitations" :key="inv.id">
                <td><strong>{{ inv.brideName }} & {{ inv.groomName }}</strong></td>
                <td>{{ inv.weddingDate || '—' }}</td>
                <td><span class="badge badge-info">{{ getTemplateName(inv.templateId) }}</span></td>
                <td>
                  <span :class="inv.isActive ? 'badge badge-success' : 'badge badge-danger'">
                    {{ inv.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td>{{ inv.viewCount || 0 }}</td>
                <td class="date-cell">{{ formatTimestamp(inv.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useRsvpStore } from '@/stores/rsvpStore'
import { useInvitationStore } from '@/stores/invitationStore'
import { storeToRefs } from 'pinia'

const rsvpStore = useRsvpStore()
const invitationStore = useInvitationStore()
const { allRsvps } = storeToRefs(rsvpStore)

const totalInvitations = ref(0)
const totalUsers = ref(0)
const totalTemplates = ref(0)
const totalRsvps = computed(() => allRsvps.value.length)
const recentInvitations = ref([])
const invitationsMap = ref({})
const invLoading = ref(true)
const rsvpLoading = ref(true)

// RSVP Pagination
const rsvpPage = ref(1)
const rsvpPageSize = 15
const totalRsvpPages = computed(() => Math.ceil(allRsvps.value.length / rsvpPageSize))
const paginatedRsvps = computed(() => {
  const start = (rsvpPage.value - 1) * rsvpPageSize
  return allRsvps.value.slice(start, start + rsvpPageSize)
})

const templateNames = {
  'royal-gold': 'Royal Gold',
  'floral-dream': 'Floral Dream',
  'minimal-white': 'Minimal White',
  'traditional-classic': 'Traditional Classic',
  'modern-love': 'Modern Love'
}

onMounted(async () => {
  try {
    // Fetch all counts in parallel
    const [invSnap, userSnap, tmplSnap] = await Promise.all([
      getDocs(collection(db, 'invitations')),
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'templates'))
    ])

    totalInvitations.value = invSnap.size
    totalUsers.value = userSnap.size
    totalTemplates.value = tmplSnap.size

    // Build invitations map for RSVP cross-referencing
    const allInvs = invSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    allInvs.forEach(inv => { invitationsMap.value[inv.id] = inv })

    // Sort by createdAt and take recent 10
    allInvs.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0
      const bTime = b.createdAt?.seconds || 0
      return bTime - aTime
    })
    recentInvitations.value = allInvs.slice(0, 10)
    invLoading.value = false

    // Fetch all RSVPs
    await rsvpStore.fetchAllRsvps()
    rsvpLoading.value = false
  } catch (e) {
    console.error('Admin dashboard load error:', e)
    invLoading.value = false
    rsvpLoading.value = false
  }
})

function getInvitationLabel(invId) {
  const inv = invitationsMap.value[invId]
  if (inv) return `${inv.brideName} & ${inv.groomName}`
  return invId?.slice(0, 8) || '—'
}

function getTemplateName(id) {
  return templateNames[id] || id || '—'
}

function formatTimestamp(ts) {
  if (!ts) return '—'
  const date = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts)
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<style scoped>
.admin-dash { max-width: 1200px; }
.page-heading {
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 28px;
  color: var(--gray-900);
}

/* Stats Grid */
.dash-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 28px;
}
.stat-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--gray-100);
  transition: all 0.3s;
}
.stat-card:hover {
  box-shadow: var(--shadow);
  transform: translateY(-2px);
}
.stat-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  flex-shrink: 0;
}
.stat-invitations .stat-icon-wrap { background: var(--rose-50); }
.stat-users .stat-icon-wrap { background: #dbeafe; }
.stat-templates .stat-icon-wrap { background: #d1fae5; }
.stat-rsvps .stat-icon-wrap { background: #ede9fe; }
.stat-info { display: flex; flex-direction: column; }
.stat-value {
  font-size: 1.6rem;
  font-weight: 800;
  line-height: 1;
  color: var(--gray-900);
}
.stat-label {
  font-size: 0.75rem;
  color: var(--gray-500);
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 600;
}

/* Section Headers */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.section-header h2 {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--gray-800);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--gray-400);
}
.empty-state span {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 12px;
}
.empty-state p {
  font-size: 0.9rem;
}

/* Wishes cell */
.wishes-cell {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.date-cell {
  white-space: nowrap;
  font-size: 0.8rem;
  color: var(--gray-500);
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 16px 0 4px;
  border-top: 1px solid var(--gray-100);
  margin-top: 12px;
}
.page-info {
  font-size: 0.8rem;
  color: var(--gray-500);
  font-weight: 600;
}

/* Responsive */
@media (max-width: 900px) {
  .dash-stats { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 500px) {
  .dash-stats { grid-template-columns: 1fr; }
}
</style>
