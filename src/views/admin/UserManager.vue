<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
      <h1 class="page-heading"><Icon name="Users" size="18" /> User Manager</h1>
      <div class="filter-row">
        <input v-model="searchQuery" type="text" placeholder="Search users..." class="search-input" />
        <select v-model="filterRole" class="filter-select">
          <option value="all">All Roles</option>
          <option value="admin">Admins</option>
          <option value="user">Users</option>
        </select>
      </div>
    </div>

    <!-- Summary -->
    <div class="user-summary">
      <div class="us-item">
        <span class="us-value">{{ users.length }}</span>
        <span class="us-label">Total Users</span>
      </div>
      <div class="us-item us-admins">
        <span class="us-value">{{ adminCount }}</span>
        <span class="us-label">Admins</span>
      </div>
      <div class="us-item us-regular">
        <span class="us-value">{{ users.length - adminCount }}</span>
        <span class="us-label">Regular Users</span>
      </div>
    </div>

    <div v-if="loading" class="text-center" style="padding: 40px;"><div class="spinner" style="margin: 0 auto;"></div></div>
    <div v-else-if="filteredUsers.length === 0" class="empty-state">
      <span><Icon name="User" size="16" /></span>
      <h3>No users found</h3>
      <p>Users will appear here after they sign in.</p>
    </div>
    <div v-else class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Role</th>
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in filteredUsers" :key="u.id">
            <td>
              <div class="user-cell">
                <img v-if="u.photoURL" :src="u.photoURL" class="user-avatar" alt="" />
                <div v-else class="user-avatar-placeholder">{{ (u.name || 'U')[0].toUpperCase() }}</div>
                <strong>{{ u.name }}</strong>
              </div>
            </td>
            <td class="email-cell">{{ u.email }}</td>
            <td>
              <span :class="u.role === 'admin' ? 'badge badge-warning' : 'badge badge-info'">
                <Icon :name="u.role === 'admin' ? 'Shield' : 'User'" size="14" />
                {{ u.role === 'admin' ? 'Admin' : 'User' }}
              </span>
            </td>
            <td class="date-cell">{{ formatTimestamp(u.createdAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '@/config/firebase'

const users = ref([])
const loading = ref(true)
const searchQuery = ref('')
const filterRole = ref('all')

const adminCount = computed(() => users.value.filter(u => u.role === 'admin').length)

const filteredUsers = computed(() => {
  let list = [...users.value]
  if (filterRole.value !== 'all') list = list.filter(u => u.role === filterRole.value)
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(u =>
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q)
    )
  }
  return list
})

onMounted(async () => {
  try {
    let snapshot
    try {
      snapshot = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')))
    } catch {
      // Fallback if index not ready
      snapshot = await getDocs(collection(db, 'users'))
    }
    users.value = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
    // Sort client-side
    users.value.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0
      const bTime = b.createdAt?.seconds || 0
      return bTime - aTime
    })
  } catch (e) { console.error('User fetch error:', e) }
  finally { loading.value = false }
})

function formatTimestamp(ts) {
  if (!ts) return '—'
  const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
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
  min-width: 160px;
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

.user-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-bottom: 24px;
}
.us-item {
  background: white;
  border-radius: var(--radius);
  padding: 16px;
  text-align: center;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--gray-100);
}
.us-value { display: block; font-size: 1.5rem; font-weight: 800; color: var(--gray-800); }
.us-label { font-size: 0.7rem; color: var(--gray-500); text-transform: uppercase; letter-spacing: 0.04em; font-weight: 600; }
.us-admins .us-value { color: #d97706; }
.us-regular .us-value { color: #3b82f6; }

.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}
.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
.user-avatar-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--rose-100);
  color: var(--rose-700);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.85rem;
  flex-shrink: 0;
}
.email-cell { font-size: 0.85rem; color: var(--gray-600); }
.date-cell { white-space: nowrap; font-size: 0.8rem; color: var(--gray-500); }

.empty-state { text-align: center; padding: 60px 20px; }
.empty-state span { font-size: 3rem; display: block; margin-bottom: 12px; }
.empty-state h3 { font-size: 1.1rem; color: var(--gray-700); margin-bottom: 4px; }
.empty-state p { color: var(--gray-500); font-size: 0.85rem; }

@media (max-width: 600px) {
  .user-summary { grid-template-columns: 1fr; }
}
</style>
