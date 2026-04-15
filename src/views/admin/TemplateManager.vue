<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
      <h1 class="page-heading"><Icon name="Palette" size="18" /> Template Manager</h1>
      <button @click="showForm = !showForm" class="btn btn-primary btn-sm">{{ showForm ? '✕ Close' : '+ Add Template' }}</button>
    </div>

    <!-- Add/Edit Form -->
    <Transition name="fade">
      <div v-if="showForm" class="card" style="margin-bottom: 24px;">
        <div class="card-body">
          <h3 style="font-size: 1rem; font-weight: 600; margin-bottom: 16px;">{{ editingId ? '<Icon name="Pencil" size="16" /> Edit Template' : '<Icon name="Sparkles" size="16" /> New Template' }}</h3>
          <form @submit.prevent="handleSave">
            <div class="form-grid">
              <div class="form-group"><label class="form-label">Name</label><input v-model="form.name" class="form-input" required placeholder="Royal Gold" /></div>
              <div class="form-group"><label class="form-label">Slug</label><input v-model="form.slug" class="form-input" required placeholder="royal-gold" /></div>
              <div class="form-group"><label class="form-label">Category</label>
                <select v-model="form.category" class="form-input">
                  <option value="luxury">Luxury</option><option value="romantic">Romantic</option>
                  <option value="modern">Modern</option><option value="classic">Classic</option><option value="trendy">Trendy</option>
                </select>
              </div>
              <div class="form-group"><label class="form-label">Component Name</label><input v-model="form.componentName" class="form-input" required placeholder="RoyalGold" /></div>
            </div>
            <div class="form-group" style="margin-top: 12px;">
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" v-model="form.isActive" /> Active
              </label>
            </div>
            <div style="display: flex; gap: 8px; margin-top: 16px;">
              <button type="submit" class="btn btn-primary btn-sm" :disabled="saving">{{ saving ? 'Saving...' : '<Icon name="Save" size="16" /> Save' }}</button>
              <button type="button" @click="resetForm" class="btn btn-secondary btn-sm">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- Templates List -->
    <div v-if="loading" class="text-center" style="padding: 40px;"><div class="spinner" style="margin: 0 auto;"></div></div>
    <div v-else-if="templates.length === 0" class="empty-state">
      <span><Icon name="Palette" size="18" /></span>
      <h3>No templates</h3>
      <p>Add your first template above.</p>
    </div>
    <div v-else class="table-wrapper">
      <table>
        <thead><tr><th>Name</th><th>Slug</th><th>Category</th><th>Component</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          <tr v-for="t in templates" :key="t.id">
            <td><strong>{{ t.name }}</strong></td>
            <td><code class="slug-code">{{ t.slug }}</code></td>
            <td><span class="badge badge-info">{{ t.category }}</span></td>
            <td><code class="slug-code">{{ t.componentName }}</code></td>
            <td><span :class="t.isActive ? 'badge badge-success' : 'badge badge-danger'">{{ t.isActive ? 'Active' : 'Inactive' }}</span></td>
            <td>
              <div style="display: flex; gap: 6px;">
                <button @click="editTemplate(t)" class="btn btn-ghost btn-sm" title="Edit"><Icon name="Pencil" size="16" /></button>
                <button @click="handleDelete(t.id)" class="btn btn-ghost btn-sm" style="color: #ef4444;" title="Delete"><Icon name="Trash2" size="16" /></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import { useTemplateStore } from '@/stores/templateStore'

const toast = useToast()
const templateStore = useTemplateStore()
const { templates, loading } = storeToRefs(templateStore)
const showForm = ref(false)
const saving = ref(false)
const editingId = ref(null)

const form = reactive({ name: '', slug: '', category: 'luxury', componentName: '', isActive: true })

onMounted(() => { templateStore.fetchAllTemplates() })

function editTemplate(t) {
  editingId.value = t.id
  Object.assign(form, { name: t.name, slug: t.slug, category: t.category, componentName: t.componentName, isActive: t.isActive })
  showForm.value = true
}

function resetForm() {
  editingId.value = null
  Object.assign(form, { name: '', slug: '', category: 'luxury', componentName: '', isActive: true })
  showForm.value = false
}

async function handleSave() {
  try {
    saving.value = true
    if (editingId.value) {
      await templateStore.updateTemplate(editingId.value, form)
      toast.success('Template updated')
    } else {
      await templateStore.createTemplate(form)
      toast.success('Template created')
    }
    resetForm()
  } catch { toast.error('Failed to save') }
  finally { saving.value = false }
}

async function handleDelete(id) {
  if (!confirm('Delete this template? This cannot be undone.')) return
  try { await templateStore.deleteTemplate(id); toast.success('Deleted') }
  catch { toast.error('Failed to delete') }
}
</script>

<style scoped>
.page-heading { font-size: 1.4rem; font-weight: 700; color: var(--gray-900); }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
@media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
.slug-code {
  font-size: 0.8rem;
  background: var(--gray-100);
  padding: 2px 8px;
  border-radius: 4px;
  color: var(--gray-600);
  font-family: monospace;
}
.empty-state { text-align: center; padding: 60px 20px; }
.empty-state span { font-size: 3rem; display: block; margin-bottom: 12px; }
.empty-state h3 { font-size: 1.1rem; color: var(--gray-700); margin-bottom: 4px; }
.empty-state p { color: var(--gray-500); font-size: 0.85rem; }
</style>
