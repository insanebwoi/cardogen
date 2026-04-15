<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
      <h1 class="page-heading"><Icon name="Mail" size="18" /> Invitation Manager</h1>
      <div class="filter-row">
        <input v-model="searchQuery" type="text" placeholder="Search couple..." class="search-input" />
        <select v-model="filterStatus" class="filter-select">
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="text-center" style="padding: 40px;"><div class="spinner" style="margin: 0 auto;"></div></div>
    <div v-else-if="filteredInvitations.length === 0" class="empty-state">
      <span><Icon name="Mail" size="18" /></span>
      <h3>No invitations found</h3>
      <p>Invitations created by users will appear here.</p>
    </div>
    <div v-else>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Couple</th>
              <th>Date</th>
              <th>Venue</th>
              <th>Template</th>
              <th>Status</th>
              <th>Views</th>
              <th>Short Code</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="inv in paginatedInvitations" :key="inv.id">
              <td>
                <strong>{{ inv.brideName }} & {{ inv.groomName }}</strong>
              </td>
              <td class="date-cell">{{ inv.weddingDate || '—' }}</td>
              <td>{{ inv.venueName || '—' }}</td>
              <td><span class="badge badge-info">{{ getTemplateName(inv.templateId) }}</span></td>
              <td>
                <span :class="inv.isActive ? 'badge badge-success' : 'badge badge-danger'">
                  {{ inv.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>{{ inv.viewCount || 0 }}</td>
              <td>
                <code class="short-code">{{ inv.shortCode }}</code>
              </td>
              <td>
                <div style="display: flex; gap: 6px;">
                  <a :href="`/w/${inv.shortCode}`" target="_blank" class="btn btn-ghost btn-sm" title="View Card"><Icon name="Eye" size="16" /></a>
                  <button @click="toggleStatus(inv)" class="btn btn-ghost btn-sm" :title="inv.isActive ? 'Deactivate' : 'Activate'">
                    {{ inv.isActive ? '<Icon name="Lock" size="16" />' : '<Icon name="Unlock" size="16" />' }}
                  </button>
                  <button @click="handleDelete(inv.id)" class="btn btn-ghost btn-sm" style="color: #ef4444;" title="Delete"><Icon name="Trash2" size="16" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Pagination -->
      <div v-if="filteredInvitations.length > pageSize" class="pagination">
        <button @click="page = Math.max(1, page - 1)" :disabled="page === 1" class="btn btn-ghost btn-sm">← Prev</button>
        <span class="page-info">Page {{ page }} of {{ totalPages }}</span>
        <button @click="page = Math.min(totalPages, page + 1)" :disabled="page >= totalPages" class="btn btn-ghost btn-sm">Next →</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { useInvitationStore } from '@/stores/invitationStore'
import { storeToRefs } from 'pinia'

const toast = useToast()
const invitationStore = useInvitationStore()
const { allInvitations, loading } = storeToRefs(invitationStore)

const searchQuery = ref('')
const filterStatus = ref('all')
const page = ref(1)
const pageSize = 15

watch([searchQuery, filterStatus], () => { page.value = 1 })

const templateNames = {
  'royal-gold': 'Royal Gold',
  'floral-dream': 'Floral Dream',
  'minimal-white': 'Minimal White',
  'traditional-classic': 'Traditional',
  'modern-love': 'Modern Love'
}

const filteredInvitations = computed(() => {
  let list = [...allInvitations.value]
  if (filterStatus.value === 'active') list = list.filter(i => i.isActive)
  if (filterStatus.value === 'inactive') list = list.filter(i => !i.isActive)
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(i =>
      (i.brideName || '').toLowerCase().includes(q) ||
      (i.groomName || '').toLowerCase().includes(q) ||
      (i.venueName || '').toLowerCase().includes(q) ||
      (i.shortCode || '').toLowerCase().includes(q)
    )
  }
  return list
})

const totalPages = computed(() => Math.ceil(filteredInvitations.value.length / pageSize))
const paginatedInvitations = computed(() => {
  const start = (page.value - 1) * pageSize
  return filteredInvitations.value.slice(start, start + pageSize)
})

onMounted(() => {
  invitationStore.fetchAllInvitations()
})

function getTemplateName(id) {
  return templateNames[id] || id || '—'
}

async function toggleStatus(inv) {
  try {
    await invitationStore.toggleActive(inv.id, !inv.isActive)
    toast.success(inv.isActive ? 'Invitation deactivated' : 'Invitation activated')
  } catch {
    toast.error('Failed to update status')
  }
}

async function handleDelete(id) {
  if (!confirm('Are you sure you want to delete this invitation? This action cannot be undone.')) return
  try {
    await invitationStore.deleteInvitation(id)
    toast.success('Invitation deleted')
  } catch {
    toast.error('Failed to delete')
  }
}
</script>

<style scoped>
.page-heading { font-size: 1.4rem; font-weight: 700; color: var(--gray-900); }
.filter-row { display: flex; gap: 10px; flex-wrap: wrap; }
.search-input {
  padding: 8px 14px;
  border-radius: 10px;
  border: 1.5px solid var(--gray-200);
  font-size: 0.85rem;
  background: white;
  min-width: 180px;
  transition: border-color 0.2s;
}
.search-input:focus { border-color: var(--rose-400); }
.filter-select {
  padding: 8px 14px;
  border-radius: 10px;
  border: 1.5px solid var(--gray-200);
  font-size: 0.85rem;
  font-weight: 500;
  background: white;
  color: var(--gray-700);
  cursor: pointer;
}
.short-code {
  font-size: 0.75rem;
  background: var(--gray-100);
  padding: 3px 8px;
  border-radius: 6px;
  color: var(--gray-600);
  font-family: monospace;
}
.empty-state { text-align: center; padding: 60px 20px; }
.empty-state span { font-size: 3rem; display: block; margin-bottom: 12px; }
.empty-state h3 { font-size: 1.1rem; color: var(--gray-700); margin-bottom: 4px; }
.empty-state p { color: var(--gray-500); font-size: 0.85rem; }
.date-cell { white-space: nowrap; font-size: 0.85rem; }
.pagination {
  display: flex; align-items: center; justify-content: center;
  gap: 16px; padding: 16px 0; margin-top: 8px;
}
.page-info { font-size: 0.8rem; color: var(--gray-500); font-weight: 600; }
</style>
