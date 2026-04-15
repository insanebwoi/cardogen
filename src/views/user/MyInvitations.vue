<template>
  <div>
    <h1 style="font-family: var(--font-display); font-size: 1.6rem; margin-bottom: 24px;"><Icon name="ClipboardList" size="18" /> My Invitations</h1>
    <div v-if="loading" class="text-center" style="padding: 40px;"><div class="spinner" style="margin: 0 auto;"></div></div>
    <div v-else-if="invitations.length === 0" class="text-center" style="padding: 60px; color: var(--gray-500);">
      <p>No invitations yet. <RouterLink to="/create" style="color: var(--rose-500); font-weight: 600;">Create one →</RouterLink></p>
    </div>
    <div v-else class="table-wrapper">
      <table>
        <thead><tr><th>Couple</th><th>Date</th><th>Template</th><th>Views</th><th>Actions</th></tr></thead>
        <tbody>
          <tr v-for="inv in invitations" :key="inv.id">
            <td><strong>{{ inv.brideName }} & {{ inv.groomName }}</strong></td>
            <td>{{ new Date(inv.weddingDate).toLocaleDateString() }}</td>
            <td><span class="badge badge-info">{{ inv.templateId }}</span></td>
            <td>{{ inv.viewCount || 0 }}</td>
            <td>
              <div style="display: flex; gap: 6px;">
                <RouterLink :to="{ name: 'InvitationDetails', params: { id: inv.id } }" class="btn btn-ghost btn-sm">View</RouterLink>
                <button @click="handleDelete(inv.id)" class="btn btn-ghost btn-sm" style="color: #ef4444;">Delete</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/authStore'
import { useInvitationStore } from '@/stores/invitationStore'

const toast = useToast()
const authStore = useAuthStore()
const invitationStore = useInvitationStore()
const { invitations, loading } = storeToRefs(invitationStore)

onMounted(() => { invitationStore.fetchMyInvitations(authStore.user.uid) })

async function handleDelete(id) {
  if (!confirm('Delete this invitation?')) return
  try { await invitationStore.deleteInvitation(id); toast.success('Deleted') }
  catch { toast.error('Failed to delete') }
}
</script>
