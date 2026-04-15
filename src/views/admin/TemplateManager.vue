<template>
  <div class="tpl-mgr">
    <div class="tpl-mgr-head">
      <h1 class="page-heading"><Icon name="Palette" size="18" /> Template Manager</h1>
      <div style="display: flex; gap: 8px;">
        <button v-if="mode === 'list'" @click="startNew" class="btn btn-primary btn-sm">+ New Template</button>
        <button v-else @click="backToList" class="btn btn-secondary btn-sm">← Back to list</button>
      </div>
    </div>

    <!-- LIST VIEW -->
    <div v-if="mode === 'list'">
      <div v-if="loading" class="text-center" style="padding: 40px;"><div class="spinner" style="margin: 0 auto;"></div></div>
      <div v-else-if="templates.length === 0" class="empty-state">
        <span><Icon name="Palette" size="18" /></span>
        <h3>No templates</h3>
        <p>Create your first template.</p>
      </div>
      <div v-else class="table-wrapper">
        <table>
          <thead><tr><th>Name</th><th>Slug</th><th>Category</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            <tr v-for="t in templates" :key="t.id">
              <td><strong>{{ t.name }}</strong></td>
              <td><code class="slug-code">{{ t.slug }}</code></td>
              <td><span class="badge badge-info">{{ t.category }}</span></td>
              <td>
                <span v-if="t.html" class="badge badge-success">Custom HTML</span>
                <span v-else class="badge badge-info">Built-in</span>
              </td>
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

    <!-- EDITOR VIEW -->
    <div v-else class="editor-view">
      <div class="editor-meta">
        <div class="form-grid">
          <div class="form-group"><label class="form-label">Name</label><input v-model="form.name" class="form-input" required placeholder="Midnight Bloom" /></div>
          <div class="form-group"><label class="form-label">Slug</label><input v-model="form.slug" class="form-input" required placeholder="midnight-bloom" /></div>
          <div class="form-group">
            <label class="form-label">Category</label>
            <select v-model="form.category" class="form-input">
              <option value="luxury">Luxury</option><option value="romantic">Romantic</option>
              <option value="modern">Modern</option><option value="classic">Classic</option><option value="trendy">Trendy</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Slot Theme</label>
            <select v-model="form.theme" class="form-input">
              <option value="gold">Gold</option><option value="pink">Pink</option><option value="minimal">Minimal</option>
              <option value="green">Green</option><option value="purple">Purple</option>
            </select>
          </div>
        </div>
        <label class="active-toggle">
          <input type="checkbox" v-model="form.isActive" /> Active (visible to users)
        </label>
      </div>

      <div class="ph-help">
        <strong>Placeholders:</strong>
        <span v-for="p in placeholders" :key="p" @click="insertPh(p)" class="ph-chip">{{ phLabel(p) }}</span>
      </div>

      <div class="split">
        <div class="split-pane">
          <div class="tabs">
            <button :class="{ active: tab === 'html' }" @click="tab = 'html'">HTML</button>
            <button :class="{ active: tab === 'css' }" @click="tab = 'css'">CSS</button>
          </div>
          <CodeEditor
            v-show="tab === 'html'"
            v-model="form.html"
            language="html"
            height="560px"
          />
          <CodeEditor
            v-show="tab === 'css'"
            v-model="form.css"
            language="css"
            height="560px"
          />
        </div>
        <div class="split-pane preview-pane">
          <div class="preview-bar">
            <span>Live Preview</span>
            <div class="vp-switch">
              <button :class="{ active: viewport === 'mobile' }" @click="viewport = 'mobile'">📱</button>
              <button :class="{ active: viewport === 'desktop' }" @click="viewport = 'desktop'">🖥️</button>
            </div>
          </div>
          <div class="preview-frame" :class="`vp-${viewport}`">
            <DynamicTemplate :template="previewTemplate" :invitation="sampleInvitation" />
          </div>
        </div>
      </div>

      <div class="editor-actions">
        <button @click="handleSave" class="btn btn-primary" :disabled="saving">
          {{ saving ? 'Saving…' : (editingId ? 'Update Template' : 'Create Template') }}
        </button>
        <button @click="backToList" class="btn btn-secondary">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import { useTemplateStore } from '@/stores/templateStore'
import CodeEditor from '@/components/common/CodeEditor.vue'
import DynamicTemplate from '@/components/templates/DynamicTemplate.vue'

const toast = useToast()
const templateStore = useTemplateStore()
const { templates, loading } = storeToRefs(templateStore)

const mode = ref('list')
const tab = ref('html')
const viewport = ref('mobile')
const saving = ref(false)
const editingId = ref(null)

const placeholders = [
  'brideName', 'groomName', 'coupleNames', 'hashtag',
  'weddingDate', 'weddingDateFormatted', 'weddingTime', 'weddingTimeFormatted',
  'venueName', 'venueAddress', 'venueMapUrl', 'customMessage',
  'countdown', 'rsvp'
]

const STARTER_HTML = `<section class="card">
  <p class="eyebrow">You are cordially invited</p>
  <h1 class="names">{{brideName}}<span class="amp">&amp;</span>{{groomName}}</h1>
  <p class="msg">{{customMessage}}</p>

  {{countdown}}

  <div class="meta">
    <div><span>Date</span><strong>{{weddingDateFormatted}}</strong></div>
    <div><span>Time</span><strong>{{weddingTimeFormatted}}</strong></div>
    <div><span>Venue</span><strong>{{venueName}}</strong><small>{{venueAddress}}</small></div>
  </div>
  <a class="map" href="{{venueMapUrl}}" target="_blank">View on Maps</a>

  {{rsvp}}
</section>`

const STARTER_CSS = `.card {
  min-height: 100vh; padding: 60px 24px; text-align: center;
  background: linear-gradient(160deg, #1a0a00, #2d1810);
  color: #f5e6c8; font-family: system-ui, sans-serif;
}
.eyebrow { letter-spacing: .3em; text-transform: uppercase; color: #d4af37; font-size: .75rem; }
.names { font-size: 2.8rem; margin: 24px 0; font-weight: 700; line-height: 1.1; }
.amp { display: block; color: #d4af37; font-size: 1.4rem; margin: 6px 0; }
.msg { font-style: italic; opacity: .75; max-width: 420px; margin: 0 auto 32px; }
.meta { background: rgba(212,175,55,.08); border: 1px solid rgba(212,175,55,.2); border-radius: 16px; padding: 24px; max-width: 420px; margin: 28px auto; display: flex; flex-direction: column; gap: 16px; }
.meta > div { display: flex; flex-direction: column; }
.meta span { font-size: .7rem; color: #d4af37; text-transform: uppercase; letter-spacing: .15em; }
.meta strong { font-size: 1rem; margin-top: 4px; }
.meta small { font-size: .8rem; opacity: .6; }
.map { display: inline-block; color: #d4af37; margin-bottom: 24px; }`

const form = reactive({
  name: '', slug: '', category: 'luxury', componentName: '',
  html: '', css: '', theme: 'gold', isActive: true
})

const sampleInvitation = {
  id: 'preview',
  brideName: 'Ayesha',
  groomName: 'Rahil',
  weddingDate: new Date(Date.now() + 45 * 86400_000).toISOString().slice(0, 10),
  weddingTime: '18:30',
  venueName: 'The Grand Ballroom',
  venueAddress: '123 Celebration Ave, City',
  venueMapUrl: 'https://maps.google.com',
  customMessage: 'Together with our families, we invite you to share in our joy.'
}

const previewTemplate = computed(() => ({
  id: editingId.value || 'preview',
  slug: form.slug || 'preview',
  html: form.html,
  css: form.css,
  theme: form.theme
}))

onMounted(() => { templateStore.fetchAllTemplates() })

function resetForm() {
  editingId.value = null
  Object.assign(form, {
    name: '', slug: '', category: 'luxury', componentName: '',
    html: STARTER_HTML, css: STARTER_CSS, theme: 'gold', isActive: true
  })
  tab.value = 'html'
}

function startNew() {
  resetForm()
  mode.value = 'editor'
}

function editTemplate(t) {
  editingId.value = t.id
  Object.assign(form, {
    name: t.name || '',
    slug: t.slug || '',
    category: t.category || 'luxury',
    componentName: t.componentName || '',
    html: t.html || STARTER_HTML,
    css: t.css || STARTER_CSS,
    theme: t.theme || 'gold',
    isActive: t.isActive ?? true
  })
  mode.value = 'editor'
  tab.value = 'html'
}

function backToList() { mode.value = 'list'; editingId.value = null }

function phLabel(key) { return '\u007b\u007b' + key + '\u007d\u007d' }

function insertPh(key) {
  const token = `{{${key}}}`
  if (tab.value === 'html') form.html = (form.html || '') + token
  else form.css = (form.css || '') + `/* ${token} */`
}

async function handleSave() {
  if (!form.name.trim() || !form.slug.trim()) { toast.error('Name and slug required'); return }
  try {
    saving.value = true
    if (editingId.value) {
      await templateStore.updateTemplate(editingId.value, form)
      toast.success('Template updated')
    } else {
      await templateStore.createTemplate(form)
      toast.success('Template created')
    }
    backToList()
  } catch (e) { console.error(e); toast.error('Failed to save') }
  finally { saving.value = false }
}

async function handleDelete(id) {
  if (!confirm('Delete this template? This cannot be undone.')) return
  try { await templateStore.deleteTemplate(id); toast.success('Deleted') }
  catch { toast.error('Failed to delete') }
}
</script>

<style scoped>
.tpl-mgr-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
.page-heading { font-size: 1.4rem; font-weight: 700; color: var(--gray-900); display: flex; align-items: center; gap: 8px; }
.form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
@media (max-width: 800px) { .form-grid { grid-template-columns: 1fr; } }
.slug-code { font-size: 0.8rem; background: var(--gray-100); padding: 2px 8px; border-radius: 4px; color: var(--gray-600); font-family: monospace; }
.empty-state { text-align: center; padding: 60px 20px; }
.empty-state span { font-size: 3rem; display: block; margin-bottom: 12px; }
.empty-state h3 { font-size: 1.1rem; color: var(--gray-700); margin-bottom: 4px; }
.empty-state p { color: var(--gray-500); font-size: 0.85rem; }

.editor-view { display: flex; flex-direction: column; gap: 16px; }
.editor-meta { background: white; padding: 16px; border-radius: 12px; border: 1px solid var(--gray-200, #e5e7eb); }
.active-toggle { display: inline-flex; align-items: center; gap: 8px; margin-top: 10px; font-size: 0.9rem; cursor: pointer; }

.ph-help { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; padding: 12px; background: #fafaf9; border-radius: 10px; border: 1px solid var(--gray-200, #e5e7eb); font-size: 0.8rem; }
.ph-chip { background: white; border: 1px solid #e5e7eb; padding: 3px 8px; border-radius: 6px; font-family: monospace; cursor: pointer; transition: background 0.15s; }
.ph-chip:hover { background: #fef3c7; }

.split { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media (max-width: 1100px) { .split { grid-template-columns: 1fr; } }
.split-pane { display: flex; flex-direction: column; background: white; border-radius: 12px; border: 1px solid var(--gray-200, #e5e7eb); overflow: hidden; }
.tabs { display: flex; border-bottom: 1px solid #e5e7eb; }
.tabs button { padding: 10px 16px; background: transparent; border: none; cursor: pointer; font-size: 0.85rem; color: var(--gray-600); border-bottom: 2px solid transparent; }
.tabs button.active { color: var(--gray-900); border-bottom-color: #f43f5e; font-weight: 600; }

.preview-pane { display: flex; flex-direction: column; }
.preview-bar { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; border-bottom: 1px solid #e5e7eb; font-size: 0.85rem; font-weight: 600; color: var(--gray-700); }
.vp-switch { display: flex; gap: 4px; }
.vp-switch button { background: transparent; border: 1px solid #e5e7eb; padding: 4px 8px; border-radius: 6px; cursor: pointer; }
.vp-switch button.active { background: #111827; color: white; border-color: #111827; }
.preview-frame { flex: 1; overflow: auto; background: #f3f4f6; padding: 16px; }
.preview-frame.vp-mobile > * { max-width: 420px; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border-radius: 16px; overflow: hidden; }
.preview-frame.vp-desktop > * { box-shadow: 0 10px 30px rgba(0,0,0,0.08); border-radius: 12px; overflow: hidden; }

.editor-actions { display: flex; gap: 10px; justify-content: flex-end; padding-top: 4px; }
</style>
