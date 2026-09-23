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
      <!-- Cards on phones: the theme picker is off-screen in an 8-column table. -->
      <div class="inv-cards">
        <article v-for="inv in paginatedInvitations" :key="inv.id" class="inv-card">
          <div class="ic-top">
            <strong class="ic-names">{{ inv.brideName }} &amp; {{ inv.groomName }}</strong>
            <span :class="inv.isActive ? 'badge badge-success' : 'badge badge-danger'">
              {{ inv.isActive ? 'Active' : 'Inactive' }}
            </span>
          </div>

          <div class="ic-meta">
            <span><Icon name="Calendar" size="13" /> {{ inv.weddingDate || '—' }}</span>
            <span><Icon name="Eye" size="13" /> {{ inv.viewCount || 0 }} views</span>
            <span v-if="inv.venueName"><Icon name="MapPin" size="13" /> {{ inv.venueName }}</span>
          </div>

          <code class="short-code ic-code">/w/{{ inv.shortCode }}</code>

          <div class="ic-theme">
            <span class="ic-theme-label">Theme</span>
            <div class="tpl-picker" :class="{ busy: savingId === inv.id }">
              <span class="tpl-dot" :class="`dot-${themeOf(inv.templateId)}`"></span>
              <select
                class="tpl-select"
                :value="inv.templateId"
                :disabled="savingId === inv.id"
                @change="changeTemplate(inv, $event.target.value)"
              >
                <option v-for="(label, id) in templateNames" :key="id" :value="id">{{ label }}</option>
                <option v-if="!templateNames[inv.templateId]" :value="inv.templateId">
                  {{ inv.templateId || 'Unknown' }}
                </option>
              </select>
              <Icon :name="savingId === inv.id ? 'Loader' : 'ChevronDown'" size="13" class="tpl-caret" />
            </div>
          </div>

          <div class="ic-actions">
            <a :href="`/w/${inv.shortCode}`" target="_blank" class="btn btn-secondary btn-sm"><Icon name="Eye" size="15" /> View</a>
            <button @click="toggleStatus(inv)" class="btn btn-secondary btn-sm">
              <Icon :name="inv.isActive ? 'Lock' : 'Unlock'" size="15" />
              {{ inv.isActive ? 'Revoke' : 'Activate' }}
            </button>
            <button @click="handleDelete(inv.id)" class="btn btn-secondary btn-sm ic-del"><Icon name="Trash2" size="15" /></button>
          </div>
        </article>
      </div>

      <div class="table-wrapper inv-table">
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
              <td>
                <div class="tpl-picker" :class="{ busy: savingId === inv.id }">
                  <span class="tpl-dot" :class="`dot-${themeOf(inv.templateId)}`"></span>
                  <select
                    class="tpl-select"
                    :value="inv.templateId"
                    :disabled="savingId === inv.id"
                    @change="changeTemplate(inv, $event.target.value)"
                    title="Change this card's theme"
                  >
                    <option v-for="(label, id) in templateNames" :key="id" :value="id">{{ label }}</option>
                    <option v-if="!templateNames[inv.templateId]" :value="inv.templateId">
                      {{ inv.templateId || 'Unknown' }}
                    </option>
                  </select>
                  <Icon :name="savingId === inv.id ? 'Loader' : 'ChevronDown'" size="13" class="tpl-caret" />
                </div>
              </td>
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
                    <Icon :name="inv.isActive ? 'Lock' : 'Unlock'" size="16" />
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
const savingId = ref(null)

watch([searchQuery, filterStatus], () => { page.value = 1 })

const templateNames = {
  'royal-gold': 'Royal Gold',
  'floral-dream': 'Floral Dream',
  'minimal-white': 'Minimal White',
  'traditional-classic': 'Traditional',
  'modern-love': 'Modern Love',
  'ios-glass': 'iOS Glass'
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

// Matches the loader/brand palettes used on the card itself.
const TEMPLATE_THEME = {
  'royal-gold': 'gold',
  'floral-dream': 'pink',
  'minimal-white': 'minimal',
  'traditional-classic': 'green',
  'modern-love': 'purple',
  'ios-glass': 'glass'
}
function themeOf(templateId) { return TEMPLATE_THEME[templateId] || 'pink' }

/** Guests see the new theme on their next visit — no re-share needed. */
async function changeTemplate(inv, templateId) {
  if (!templateId || templateId === inv.templateId) return
  const previous = inv.templateId
  try {
    savingId.value = inv.id
    await invitationStore.updateTemplate(inv.id, templateId)
    toast.success(`Theme changed to ${getTemplateName(templateId)}`)
  } catch (err) {
    inv.templateId = previous
    toast.error('Could not change the theme: ' + err.message)
  } finally {
    savingId.value = null
  }
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

/* ---- Card list (phones) ---- */
.inv-cards { display: none; flex-direction: column; gap: 12px; }
.inv-table { display: block; }

.inv-card {
  border: 1px solid var(--gray-100); border-radius: 14px;
  padding: 14px; background: white; box-shadow: var(--shadow-sm);
}
.ic-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.ic-names { font-size: 0.95rem; color: var(--gray-800); overflow-wrap: anywhere; }
.ic-meta {
  display: flex; flex-wrap: wrap; gap: 6px 14px; margin-top: 10px;
  font-size: 0.76rem; color: var(--gray-500);
}
.ic-meta span { display: inline-flex; align-items: center; gap: 5px; }
.ic-code { display: inline-block; margin-top: 10px; overflow-wrap: anywhere; }
.ic-theme {
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  margin-top: 12px; padding-top: 12px; border-top: 1px dashed var(--gray-100);
}
.ic-theme-label {
  font-size: 0.7rem; font-weight: 700; color: var(--gray-500);
  text-transform: uppercase; letter-spacing: 0.05em;
}
.ic-actions { display: flex; gap: 8px; margin-top: 12px; }
.ic-actions .btn { flex: 1; }
.ic-del { flex: 0 0 auto !important; color: #dc2626; }

/* Theme picker in the Template column */
.tpl-picker {
  position: relative; display: inline-flex; align-items: center; gap: 7px;
  padding: 4px 26px 4px 9px;
  border: 1.5px solid var(--gray-200); border-radius: 99px;
  background: white; transition: border-color 0.2s;
}
.tpl-picker:hover { border-color: var(--rose-300); }
.tpl-picker.busy { opacity: 0.55; pointer-events: none; }
.tpl-select {
  border: none; background: transparent; outline: none;
  font-size: 0.78rem; font-weight: 600; color: var(--gray-700);
  cursor: pointer; appearance: none; padding-right: 2px;
}
.tpl-caret { position: absolute; right: 9px; color: var(--gray-400); pointer-events: none; }
.tpl-dot { width: 10px; height: 10px; border-radius: 50%; flex: none; box-shadow: 0 0 0 2px rgba(0,0,0,0.04); }
.dot-gold { background: linear-gradient(135deg, #d4af37, #8b6914); }
.dot-pink { background: linear-gradient(135deg, #f9a8d4, #ec4899); }
.dot-minimal { background: linear-gradient(135deg, #e7e5e4, #44403c); }
.dot-green { background: linear-gradient(135deg, #10b981, #047857); }
.dot-purple { background: linear-gradient(135deg, #a855f7, #6d28d9); }
.dot-glass { background: linear-gradient(135deg, #a5c8ff, #e5b8ff 55%, #ffc2d1); }

/* After the base rules above — equal specificity, so source order decides. */
@media (max-width: 768px) {
  .inv-cards { display: flex; }
  .inv-table { display: none; }
}

@media (max-width: 600px) {
  .page-heading { font-size: 1.15rem; }
  .filter-row { width: 100%; }
  .search-input { flex: 1 1 100%; min-width: 0; }
  .filter-select { flex: 1 1 auto; }
}
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
