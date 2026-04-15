<template>
  <div>
    <h2 class="step-title"><Icon name="Link" size="18" /> Customize Your Link</h2>
    <p class="step-desc">Choose a custom URL for your wedding card — share something memorable!</p>

    <div class="slug-card">
      <div class="slug-preview-bar">
        <span class="slug-full-url">
          <span class="slug-domain">{{ origin }}/w/</span>
          <span class="slug-custom-part">{{ formData.customSlug || suggestedSlug || 'your-link' }}</span>
        </span>
      </div>

      <div class="slug-input-group">
        <label class="slug-field-label">Your Custom Link</label>
        <div class="slug-input-row">
          <span class="slug-prefix">{{ origin }}/w/</span>
          <input
            :value="formData.customSlug"
            @input="onSlugInput"
            class="slug-input"
            :placeholder="suggestedSlug || 'your-custom-link'"
            maxlength="40"
            autocomplete="off"
            spellcheck="false"
          />
          <button v-if="formData.customSlug" type="button" @click="clearSlug" class="slug-clear" title="Clear">
            <Icon name="X" size="16" />
          </button>
        </div>

        <div class="slug-meta">
          <span v-if="validationState === 'checking'" class="slug-status slug-status-checking">
            <span class="slug-spinner"></span> Checking availability…
          </span>
          <span v-else-if="validationState === 'invalid'" class="slug-status slug-status-error">
            <Icon name="AlertCircle" size="14" /> {{ validationMessage }}
          </span>
          <span v-else-if="validationState === 'taken'" class="slug-status slug-status-error">
            <Icon name="AlertCircle" size="14" /> This link is already taken — try a different one
          </span>
          <span v-else-if="validationState === 'available'" class="slug-status slug-status-ok">
            <Icon name="CheckCircle2" size="14" /> Available — it's yours!
          </span>
          <span v-else class="slug-status slug-status-hint">
            <Icon name="Info" size="14" /> Leave blank to get a random short link
          </span>
        </div>
      </div>

      <div v-if="suggestedSlug" class="slug-suggestion-area">
        <p class="sug-label">✨ Suggested link based on your names:</p>
        <button type="button" @click="useSuggestion" class="slug-suggest-btn" :class="{ active: formData.customSlug === suggestedSlug }">
          <Icon name="Wand2" size="14" />
          {{ origin }}/w/<strong>{{ suggestedSlug }}</strong>
        </button>
      </div>

      <div class="slug-tips">
        <h4 class="tips-title"><Icon name="Lightbulb" size="14" /> Tips for a great link</h4>
        <ul class="tips-list">
          <li>Use lowercase letters, numbers, and hyphens only</li>
          <li>Keep it short and memorable (3–40 characters)</li>
          <li>Try combining your names, e.g. <code>sarah-and-john</code></li>
          <li>Avoid special characters and spaces</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { collection, getDocs, query, where, limit } from 'firebase/firestore'
import { db } from '@/config/firebase'

const props = defineProps(['formData'])
const emit = defineEmits(['update'])

const origin = typeof window !== 'undefined' ? window.location.origin : ''

const RESERVED = new Set([
  'admin', 'dashboard', 'login', 'create', 'my-invitations', 'invitation',
  'w', 'api', 'public', 'assets', 'static', 'templates', 'users', 'rsvps'
])

function slugify(s) {
  return (s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

const suggestedSlug = computed(() => {
  const b = slugify(props.formData.brideName)
  const g = slugify(props.formData.groomName)
  if (!b || !g) return ''
  return `${b}-and-${g}`.slice(0, 40)
})

const validationState = ref('idle')
const validationMessage = ref('')
let checkSeq = 0

function validateFormat(slug) {
  if (!slug) return { ok: true }
  if (slug.length < 3) return { ok: false, msg: 'At least 3 characters' }
  if (slug.length > 40) return { ok: false, msg: 'At most 40 characters' }
  if (!/^[a-z0-9-]+$/.test(slug)) return { ok: false, msg: 'Lowercase letters, numbers, hyphens only' }
  if (/^-|-$/.test(slug)) return { ok: false, msg: 'Cannot start or end with a hyphen' }
  if (/--/.test(slug)) return { ok: false, msg: 'No consecutive hyphens' }
  if (RESERVED.has(slug)) return { ok: false, msg: 'This link is reserved' }
  return { ok: true }
}

function onSlugInput(e) {
  const raw = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
  emit('update', { customSlug: raw })
}

function clearSlug() { emit('update', { customSlug: '' }) }
function useSuggestion() { emit('update', { customSlug: suggestedSlug.value }) }

let debounceTimer = null
watch(() => props.formData.customSlug, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer)

  if (!val) {
    validationState.value = 'idle'
    validationMessage.value = ''
    emit('update', { customSlugValid: true })
    return
  }

  const fmt = validateFormat(val)
  if (!fmt.ok) {
    validationState.value = 'invalid'
    validationMessage.value = fmt.msg
    emit('update', { customSlugValid: false })
    return
  }

  validationState.value = 'checking'
  const seq = ++checkSeq
  debounceTimer = setTimeout(async () => {
    try {
      const q = query(collection(db, 'invitations'), where('shortCode', '==', val), limit(1))
      const snap = await getDocs(q)
      if (seq !== checkSeq) return
      if (!snap.empty) {
        validationState.value = 'taken'
        emit('update', { customSlugValid: false })
      } else {
        validationState.value = 'available'
        emit('update', { customSlugValid: true })
      }
    } catch (err) {
      if (seq !== checkSeq) return
      console.warn('slug check failed', err)
      validationState.value = 'available'
      emit('update', { customSlugValid: true })
    }
  }, 400)
}, { immediate: true })
</script>

<style scoped>
.step-title { font-size: 1.15rem; font-weight: 700; color: var(--gray-800); margin-bottom: 8px; }
.step-desc { color: var(--gray-500); font-size: 0.85rem; margin-bottom: 24px; }

.slug-card {
  display: flex; flex-direction: column; gap: 20px;
}

/* Live preview bar */
.slug-preview-bar {
  background: linear-gradient(135deg, #1e1b2e 0%, #2d2545 100%);
  border-radius: 12px;
  padding: 16px 20px;
  overflow-x: auto;
}
.slug-full-url {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.88rem;
  white-space: nowrap;
}
.slug-domain { color: rgba(255,255,255,0.5); }
.slug-custom-part { color: #f9a8d4; font-weight: 600; }

/* Input group */
.slug-input-group {
  display: flex; flex-direction: column; gap: 8px;
}
.slug-field-label {
  font-size: 0.8rem; font-weight: 700; color: var(--gray-700);
  text-transform: uppercase; letter-spacing: 0.05em;
}
.slug-input-row {
  display: flex; align-items: stretch;
  background: white; border: 1.5px solid var(--gray-200, #e5e7eb);
  border-radius: 10px; overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.slug-input-row:focus-within {
  border-color: #f43f5e;
  box-shadow: 0 0 0 3px rgba(244,63,94,0.12);
}
.slug-prefix {
  padding: 12px 14px;
  background: #f5f5f4; color: var(--gray-400);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.78rem; white-space: nowrap;
  border-right: 1px solid var(--gray-100);
  display: flex; align-items: center;
}
.slug-input {
  flex: 1; min-width: 0; border: none; outline: none;
  padding: 12px 14px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.92rem; color: var(--gray-900);
  background: transparent;
}
.slug-input::placeholder { color: var(--gray-300); }
.slug-clear {
  padding: 0 14px; background: transparent; border: none; cursor: pointer;
  color: var(--gray-400); display: flex; align-items: center;
  transition: color 0.15s;
}
.slug-clear:hover { color: var(--gray-700); }

/* Validation messages */
.slug-meta {
  display: flex; align-items: center; gap: 8px;
  min-height: 22px; flex-wrap: wrap;
}
.slug-status { display: inline-flex; align-items: center; gap: 5px; font-size: 0.8rem; }
.slug-status-hint { color: var(--gray-500); }
.slug-status-checking { color: var(--gray-500); }
.slug-status-ok { color: #059669; font-weight: 600; }
.slug-status-error { color: #dc2626; font-weight: 600; }

.slug-spinner {
  width: 14px; height: 14px; border: 2px solid #e5e7eb;
  border-top-color: var(--gray-500); border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Suggestion area */
.slug-suggestion-area {
  padding: 16px;
  background: var(--rose-50, #fff1f2);
  border: 1px dashed var(--rose-200, #fecdd3);
  border-radius: 12px;
}
.slug-suggestion-area .sug-label {
  font-size: 0.8rem; color: var(--gray-600); margin: 0 0 10px 0;
}
.slug-suggest-btn {
  display: inline-flex; align-items: center; gap: 8px;
  background: white; border: 1.5px solid var(--rose-200, #fecdd3);
  color: var(--gray-700); padding: 10px 16px; border-radius: 10px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.82rem; cursor: pointer;
  transition: all 0.2s;
}
.slug-suggest-btn:hover {
  border-color: #f43f5e; color: #f43f5e;
  box-shadow: 0 2px 8px rgba(244,63,94,0.1);
}
.slug-suggest-btn.active {
  background: #f43f5e; color: white; border-color: #f43f5e;
}
.slug-suggest-btn strong { font-weight: 700; }

/* Tips */
.slug-tips {
  background: #f8fafc;
  border: 1px solid var(--gray-100);
  border-radius: 12px;
  padding: 16px 20px;
}
.tips-title {
  font-size: 0.8rem; font-weight: 700; color: var(--gray-600);
  margin: 0 0 10px 0; display: flex; align-items: center; gap: 6px;
}
.tips-list {
  margin: 0; padding: 0 0 0 18px;
  font-size: 0.8rem; color: var(--gray-500);
  line-height: 1.8;
}
.tips-list code {
  background: var(--rose-50); color: var(--rose-700);
  padding: 2px 6px; border-radius: 4px; font-size: 0.78rem;
}

@media (max-width: 500px) {
  .slug-prefix { font-size: 0.7rem; padding: 10px 8px; }
  .slug-input { font-size: 0.82rem; padding: 10px 8px; }
  .slug-full-url { font-size: 0.75rem; }
}
</style>
