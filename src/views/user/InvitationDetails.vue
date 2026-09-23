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
            <label class="vis-switch" :class="{ on: invitation.isActive, busy: savingVisibility }" :title="invitation.isActive ? 'Card is live — click to revoke the link' : 'Card is revoked — click to make it live'">
              <input type="checkbox" :checked="invitation.isActive" :disabled="savingVisibility" @change="toggleVisibility($event.target.checked)" />
              <span class="vs-track"><span class="vs-knob"></span></span>
              <span class="vs-label">{{ invitation.isActive ? 'Live' : 'Revoked' }}</span>
            </label>
          </div>
        </div>
        <p v-if="!invitation.isActive" class="vis-warning">
          <Icon name="Lock" size="15" />
          The link is revoked. Anyone opening it sees a "no longer available" message instead of your card — turn it back on to restore it.
        </p>

        <div class="det-link-box">
          <input :value="shareLink" readonly class="det-link-input" />
          <button @click="copyLink" class="btn btn-sm" style="background: var(--gray-800); color: white; white-space: nowrap;">
            <Icon :name="copied ? 'CheckCircle2' : 'ClipboardList'" size="16" />
            {{ copied ? 'Copied!' : 'Copy' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Card theme -->
    <div class="card" style="margin-top: 20px;">
      <div class="card-body">
        <div class="thm-head">
          <div>
            <h2 class="thm-title"><Icon name="Palette" size="18" /> Card Theme</h2>
            <p class="thm-sub">
              Change how your invitation looks at any time — your link, RSVPs and music stay exactly as they are.
            </p>
          </div>
          <span v-if="savingTheme" class="thm-saving"><span class="spinner-sm"></span> Saving…</span>
        </div>

        <div class="thm-grid">
          <button
            v-for="t in TEMPLATES"
            :key="t.id"
            type="button"
            class="thm-card"
            :class="{ selected: invitation.templateId === t.id }"
            :disabled="savingTheme"
            @click="changeTheme(t)"
          >
            <span class="thm-preview" :style="{ background: t.gradient }">
              <Icon :name="t.icon" size="30" color="rgba(255,255,255,0.85)" />
            </span>
            <span class="thm-info">
              <strong>{{ t.name }}</strong>
              <small>{{ t.category }}</small>
            </span>
            <span v-if="invitation.templateId === t.id" class="thm-check"><Icon name="Check" size="14" /></span>
          </button>
        </div>

        <a :href="`/w/${invitation.shortCode}`" target="_blank" class="thm-preview-link">
          <Icon name="ExternalLink" size="14" /> Preview your card
        </a>
      </div>
    </div>

    <!-- Invitation music -->
    <div class="card music-card" style="margin-top: 20px;">
      <div class="card-body">
        <div class="mus-head">
          <div class="mus-info">
            <h2 class="mus-title"><Icon name="Music" size="18" /> Invitation Music</h2>
            <p v-if="invitation.musicUrl" class="mus-sub">
              <strong>{{ invitation.musicName || 'Untitled song' }}</strong>
              <template v-if="invitation.musicArtist"> · {{ invitation.musicArtist }}</template>
              <span v-if="invitation.musicEnd" class="mus-trim">{{ fmtSec(invitation.musicStart || 0) }}–{{ fmtSec(invitation.musicEnd) }}</span>
            </p>
            <p v-else class="mus-sub mus-none">No song yet — guests open the card in silence.</p>
          </div>

          <div class="mus-controls">
            <label v-if="invitation.musicUrl" class="mus-switch" :class="{ on: invitation.musicEnabled, busy: savingMusic }">
              <input type="checkbox" :checked="invitation.musicEnabled" :disabled="savingMusic" @change="toggleMusic($event.target.checked)" />
              <span class="ms-track"><span class="ms-knob"></span></span>
              <span class="ms-label">{{ invitation.musicEnabled ? 'On' : 'Off' }}</span>
            </label>
            <button class="btn btn-sm btn-secondary" @click="openEditor">
              <Icon name="Pencil" size="15" />
              {{ invitation.musicUrl ? 'Change song' : 'Add a song' }}
            </button>
          </div>
        </div>

        <Teleport to="body">
          <Transition name="fade">
            <div v-if="editingMusic" class="sheet-overlay" @click.self="closeEditor">
              <div class="sheet" role="dialog" aria-modal="true" aria-label="Choose invitation music">
                <header class="sheet-head">
                  <div>
                    <h3><Icon name="Music" size="16" /> Invitation music</h3>
                    <p>Pick from the shared library or add your own MP3 link.</p>
                  </div>
                  <button class="sheet-close" @click="closeEditor" aria-label="Close"><Icon name="X" size="18" /></button>
                </header>

                <div class="sheet-body">
                  <StepMusic :formData="musicDraft" compact @update="updateMusicDraft" />
                </div>

                <footer class="sheet-foot">
                  <button v-if="invitation.musicUrl" class="btn btn-sm sheet-remove" @click="removeMusic" :disabled="savingMusic">
                    <Icon name="Trash2" size="15" /> Remove
                  </button>
                  <button class="btn btn-sm btn-secondary" @click="closeEditor" :disabled="savingMusic">Cancel</button>
                  <button class="btn btn-sm btn-primary" @click="saveMusic" :disabled="savingMusic || !musicDraft.musicUrl">
                    <Icon name="Check" size="15" /> {{ savingMusic ? 'Saving…' : 'Save song' }}
                  </button>
                </footer>
              </div>
            </div>
          </Transition>
        </Teleport>
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
      <div v-else-if="rsvpError" class="text-center" style="padding: 40px; color: #ef4444;">
        <p><Icon name="XCircle" size="18" /> {{ rsvpError }}</p>
      </div>
      <div v-else-if="rsvps.length === 0" class="text-center" style="padding: 40px; color: var(--gray-400);">
        <p>No responses yet. Share your link! <Icon name="Mail" size="18" /></p>
      </div>
      <template v-else>
        <!-- Cards on phones: a table cannot fit six columns on a small screen. -->
        <div class="rsvp-cards">
          <article v-for="r in visibleRsvps" :key="r.id" class="rsvp-card">
            <div class="rc-top">
              <strong class="rc-name">{{ r.guestName }}</strong>
              <span :class="r.attending ? 'badge badge-success' : 'badge badge-danger'">
                <Icon :name="r.attending ? 'CheckCircle2' : 'XCircle'" size="13" />
                {{ r.attending ? 'Yes' : 'No' }}
              </span>
            </div>
            <div class="rc-meta">
              <span><Icon name="Users" size="13" /> {{ r.guestCount || 1 }} guest{{ (r.guestCount || 1) > 1 ? 's' : '' }}</span>
              <span v-if="r.guestPhone"><Icon name="Phone" size="13" /> {{ r.guestPhone }}</span>
              <span><Icon name="Calendar" size="13" /> {{ formatTimestamp(r.respondedAt) }}</span>
            </div>
            <p v-if="r.wishesMessage" class="rc-wish">“{{ r.wishesMessage }}”</p>
          </article>

          <button v-if="rsvps.length > PREVIEW_COUNT" class="rc-more" @click="showAllRsvps = true">
            <Icon name="ChevronDown" size="15" />
            Show all {{ rsvps.length }} responses
          </button>
        </div>

        <!-- Table on wider screens, where it reads better. -->
        <div class="table-wrapper rsvp-table">
          <table>
            <thead><tr><th>Name</th><th>Phone</th><th>Status</th><th>Guests</th><th>Wishes</th><th>Date</th></tr></thead>
            <tbody>
              <tr v-for="r in rsvps" :key="r.id">
                <td><strong>{{ r.guestName }}</strong></td>
                <td>{{ r.guestPhone || '—' }}</td>
                <td><span :class="r.attending ? 'badge badge-success' : 'badge badge-danger'"><Icon :name="r.attending ? 'CheckCircle2' : 'XCircle'" size="14" /> {{ r.attending ? 'Yes' : 'No' }}</span></td>
                <td>{{ r.guestCount || 1 }}</td>
                <td class="wishes-cell" :title="r.wishesMessage || ''">{{ r.wishesMessage || '—' }}</td>
                <td class="date-cell">{{ formatTimestamp(r.respondedAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </div>

    <!-- All responses, in full, with nothing truncated. -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showAllRsvps" class="rsvp-modal" @click.self="showAllRsvps = false">
          <div class="rm-sheet" role="dialog" aria-modal="true" aria-label="All guest responses">
            <header class="rm-head">
              <div>
                <h3>All responses</h3>
                <p>{{ rsvps.length }} total · {{ stats.attendingCount }} attending · {{ stats.totalGuests }} guests</p>
              </div>
              <button class="rm-close" @click="showAllRsvps = false" aria-label="Close"><Icon name="X" size="18" /></button>
            </header>

            <div class="rm-body">
              <article v-for="r in rsvps" :key="r.id" class="rsvp-card rm-card">
                <div class="rc-top">
                  <strong class="rc-name">{{ r.guestName }}</strong>
                  <span :class="r.attending ? 'badge badge-success' : 'badge badge-danger'">
                    <Icon :name="r.attending ? 'CheckCircle2' : 'XCircle'" size="13" />
                    {{ r.attending ? 'Yes' : 'No' }}
                  </span>
                </div>
                <div class="rc-meta">
                  <span><Icon name="Users" size="13" /> {{ r.guestCount || 1 }} guest{{ (r.guestCount || 1) > 1 ? 's' : '' }}</span>
                  <span v-if="r.guestPhone"><Icon name="Phone" size="13" /> {{ r.guestPhone }}</span>
                  <span><Icon name="Calendar" size="13" /> {{ formatTimestamp(r.respondedAt) }}</span>
                </div>
                <p v-if="r.wishesMessage" class="rc-wish rc-wish-full">“{{ r.wishesMessage }}”</p>
              </article>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
  <div v-else-if="loading" class="text-center" style="padding: 60px;"><div class="spinner" style="margin: 0 auto;"></div></div>
  <div v-else class="text-center" style="padding: 60px; color: var(--gray-500);">
    <span style="font-size: 3rem; display: block; margin-bottom: 12px;"><Icon name="Frown" size="32" /></span>
    <h3>Invitation not found</h3>
    <RouterLink to="/dashboard" class="btn btn-primary" style="margin-top: 16px;">← Back to Dashboard</RouterLink>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useToast } from 'vue-toastification'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useInvitationStore } from '@/stores/invitationStore'
import { useRsvpStore } from '@/stores/rsvpStore'
import { useMusicStore } from '@/stores/musicStore'
import StepMusic from '@/views/user/create/StepMusic.vue'

const route = useRoute()
const invitationStore = useInvitationStore()
const rsvpStore = useRsvpStore()
const { currentInvitation: invitation, loading } = storeToRefs(invitationStore)
const { rsvps } = storeToRefs(rsvpStore)
const copied = ref(false)
const rsvpLoading = ref(true)
const rsvpError = ref('')
const stats = reactive({ total: 0, attendingCount: 0, totalGuests: 0 })
const shareLink = ref('')

const TEMPLATES = [
  { id: 'royal-gold', name: 'Royal Gold', category: 'Luxury', icon: 'Crown', gradient: 'linear-gradient(135deg, #1a0a00, #2d1810)' },
  { id: 'floral-dream', name: 'Floral Dream', category: 'Romantic', icon: 'Sparkles', gradient: 'linear-gradient(135deg, #fbcfe8, #f9a8d4)' },
  { id: 'minimal-white', name: 'Minimal White', category: 'Modern', icon: 'Sparkles', gradient: 'linear-gradient(135deg, #d6d3d1, #a8a29e)' },
  { id: 'traditional-classic', name: 'Traditional', category: 'Classic', icon: 'MoonStar', gradient: 'linear-gradient(135deg, #064e3b, #047857)' },
  { id: 'modern-love', name: 'Modern Love', category: 'Trendy', icon: 'Heart', gradient: 'linear-gradient(135deg, #1e1b4b, #7c3aed)' },
  { id: 'ios-glass', name: 'iOS Glass', category: 'Frosted', icon: 'Droplets', gradient: 'linear-gradient(135deg, #a5c8ff, #e5b8ff 55%, #ffc2d1)' }
]
const savingTheme = ref(false)

const PREVIEW_COUNT = 4
const showAllRsvps = ref(false)
const visibleRsvps = computed(() => rsvps.value.slice(0, PREVIEW_COUNT))

const toast = useToast()
const musicStore = useMusicStore()
const savingVisibility = ref(false)
const editingMusic = ref(false)
const savingMusic = ref(false)

// Stop the page behind either sheet from scrolling while it is open.
watch([showAllRsvps, editingMusic], ([a, b]) => {
  document.body.style.overflow = (a || b) ? 'hidden' : ''
})
onBeforeUnmount(() => { document.body.style.overflow = '' })
const musicDraft = ref({ musicEnabled: true, musicUrl: '', musicName: '', musicArtist: '', musicSongId: '', musicStart: 0, musicEnd: 0, musicLoop: true })

onMounted(async () => {
  await invitationStore.fetchById(route.params.id)
  if (invitation.value) {
    shareLink.value = `${window.location.origin}/w/${invitation.value.shortCode}`
    try {
      await rsvpStore.fetchRsvps(invitation.value.id)
      Object.assign(stats, rsvpStore.getStats())
    } catch (err) {
      rsvpError.value = err.message || 'Could not load responses.'
    }
  }
  rsvpLoading.value = false
})

/** Swaps the template the card renders with; nothing else about it changes. */
async function changeTheme(t) {
  if (t.id === invitation.value.templateId) return
  try {
    savingTheme.value = true
    await invitationStore.updateTemplate(invitation.value.id, t.id)
    toast.success(`Theme changed to ${t.name}`)
  } catch (err) {
    toast.error('Could not change the theme: ' + err.message)
  } finally {
    savingTheme.value = false
  }
}

/** Revokes or restores the public /w/ link. */
async function toggleVisibility(on) {
  try {
    savingVisibility.value = true
    await invitationStore.toggleActive(invitation.value.id, on)
    toast.success(on ? 'Card is live again' : 'Link revoked — guests can no longer open the card')
  } catch (err) {
    toast.error('Could not change visibility: ' + err.message)
  } finally {
    savingVisibility.value = false
  }
}

function openEditor() {
  const inv = invitation.value
  musicDraft.value = {
    musicEnabled: true,
    musicUrl: inv.musicUrl || '',
    musicName: inv.musicName || '',
    musicArtist: inv.musicArtist || '',
    musicSongId: inv.musicSongId || '',
    musicStart: inv.musicStart || 0,
    musicEnd: inv.musicEnd || 0,
    musicLoop: inv.musicLoop !== false
  }
  editingMusic.value = true
}

function updateMusicDraft(u) { musicDraft.value = { ...musicDraft.value, ...u } }
function closeEditor() { if (!savingMusic.value) editingMusic.value = false }

/** Flips playback on/off without touching the chosen song. */
async function toggleMusic(on) {
  try {
    savingMusic.value = true
    await invitationStore.updateMusic(invitation.value.id, { ...invitation.value, musicEnabled: on })
    toast.success(on ? 'Music turned on' : 'Music turned off')
  } catch (err) {
    toast.error('Could not update music: ' + err.message)
  } finally {
    savingMusic.value = false
  }
}

async function saveMusic() {
  try {
    savingMusic.value = true
    await invitationStore.updateMusic(invitation.value.id, { ...musicDraft.value, musicEnabled: true })
    if (musicDraft.value.musicSongId) musicStore.incrementUse(musicDraft.value.musicSongId)
    editingMusic.value = false
    toast.success('Song updated')
  } catch (err) {
    toast.error('Could not save song: ' + err.message)
  } finally {
    savingMusic.value = false
  }
}

async function removeMusic() {
  try {
    savingMusic.value = true
    await invitationStore.updateMusic(invitation.value.id, { musicEnabled: false, musicUrl: '' })
    editingMusic.value = false
    toast.success('Music removed')
  } catch (err) {
    toast.error('Could not remove music: ' + err.message)
  } finally {
    savingMusic.value = false
  }
}

function fmtSec(s) { return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` }

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

/* Card theme picker */
.thm-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; flex-wrap: wrap; }
.thm-title { font-size: 1.1rem; font-weight: 700; display: flex; align-items: center; gap: 8px; margin: 0; }
.thm-sub { font-size: 0.82rem; color: var(--gray-500); margin-top: 6px; max-width: 52ch; }
.thm-saving { display: inline-flex; align-items: center; gap: 7px; font-size: 0.78rem; color: var(--gray-500); font-weight: 600; }
.spinner-sm {
  width: 13px; height: 13px; border: 2px solid var(--gray-200);
  border-top-color: var(--rose-500); border-radius: 50%;
  animation: spin 0.7s linear infinite; display: inline-block;
}

.thm-grid {
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px;
  margin-top: 18px;
}
.thm-card {
  position: relative; display: flex; flex-direction: column;
  border: 2.5px solid var(--gray-200); border-radius: 14px;
  background: white; overflow: hidden; cursor: pointer; padding: 0;
  transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
  text-align: center;
}
.thm-card:hover:not(:disabled) { border-color: var(--rose-300); transform: translateY(-2px); box-shadow: var(--shadow); }
.thm-card.selected { border-color: var(--rose-500); box-shadow: 0 0 0 3px rgba(244, 63, 94, 0.15); }
.thm-card:disabled { opacity: 0.6; cursor: not-allowed; }
.thm-preview { height: 78px; display: flex; align-items: center; justify-content: center; }
.thm-info { padding: 10px 6px; }
.thm-info strong { display: block; font-size: 0.78rem; color: var(--gray-800); }
.thm-info small { font-size: 0.66rem; color: var(--gray-500); }
.thm-check {
  position: absolute; top: 7px; right: 7px; width: 22px; height: 22px;
  border-radius: 50%; background: var(--rose-500); color: white;
  display: flex; align-items: center; justify-content: center;
}
.thm-preview-link {
  display: inline-flex; align-items: center; gap: 6px; margin-top: 16px;
  font-size: 0.82rem; font-weight: 600; color: var(--rose-600);
}
.thm-preview-link:hover { text-decoration: underline; }

@media (max-width: 900px) { .thm-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 520px) {
  .thm-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .thm-preview { height: 66px; }
  .thm-sub { font-size: 0.78rem; }
}

/* Visibility switch */
.vis-switch { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; user-select: none; }
.vis-switch.busy { opacity: 0.6; pointer-events: none; }
.vis-switch input { display: none; }
.vs-track { width: 42px; height: 24px; border-radius: 99px; background: #ef4444; position: relative; transition: background 0.2s; }
.vis-switch.on .vs-track { background: #10b981; }
.vs-knob { position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: white; box-shadow: 0 1px 4px rgba(0,0,0,0.25); transition: transform 0.2s; }
.vis-switch.on .vs-knob { transform: translateX(18px); }
.vs-label { font-size: 0.78rem; font-weight: 700; letter-spacing: 0.02em; }
.vis-switch.on .vs-label { color: #059669; }
.vis-switch:not(.on) .vs-label { color: #dc2626; }

.vis-warning {
  display: flex; align-items: flex-start; gap: 8px;
  margin-top: 16px; padding: 12px 14px; border-radius: 10px;
  background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c;
  font-size: 0.82rem; line-height: 1.5;
}

/* Music panel */
.mus-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; }
.mus-title { font-size: 1.1rem; font-weight: 700; display: flex; align-items: center; gap: 8px; margin: 0; }
.mus-sub { font-size: 0.85rem; color: var(--gray-600); margin-top: 6px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.mus-none { color: var(--gray-400); }
.mus-trim { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.75rem; color: var(--rose-600); background: var(--rose-50); padding: 2px 8px; border-radius: 99px; }
.mus-controls { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }

.mus-switch { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; user-select: none; }
.mus-switch.busy { opacity: 0.6; pointer-events: none; }
.mus-switch input { display: none; }
.ms-track { width: 42px; height: 24px; border-radius: 99px; background: var(--gray-200, #e5e7eb); position: relative; transition: background 0.2s; }
.mus-switch.on .ms-track { background: #10b981; }
.ms-knob { position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: white; box-shadow: 0 1px 4px rgba(0,0,0,0.25); transition: transform 0.2s; }
.mus-switch.on .ms-knob { transform: translateX(18px); }
.ms-label { font-size: 0.8rem; font-weight: 700; color: var(--gray-600); min-width: 22px; }

.mus-editor { margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--gray-100); }
.mus-editor-actions { display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap; }
.mus-remove { background: #fef2f2; color: #dc2626; margin-left: auto; }
.mus-remove:hover { background: #fee2e2; }

@media (max-width: 600px) {
  .det-header { flex-direction: column; align-items: stretch; }
  .det-title { font-size: 1.25rem; }
  .det-actions { justify-content: space-between; }
  .det-link-box { flex-direction: column; align-items: stretch; padding: 12px; }
  .det-link-input { width: 100%; font-size: 0.78rem; }
  .det-link-box .btn { width: 100%; }

  .mus-head { flex-direction: column; align-items: stretch; gap: 14px; }
  .mus-controls { justify-content: space-between; }
  .mus-editor-actions { flex-direction: column; align-items: stretch; }
  .mus-editor-actions .btn { width: 100%; }
  .mus-remove { margin-left: 0; }
  .vis-warning { font-size: 0.78rem; }
  .wishes-cell { max-width: 130px; }
}

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
/* ---- Guest responses: cards on phones, table on desktop ---- */
.rsvp-cards { display: none; flex-direction: column; gap: 12px; padding: 0 16px 18px; }
.rsvp-table { display: block; }

/* Must come after the base rules above: equal specificity, so source order decides. */
@media (max-width: 768px) {
  .rsvp-cards { display: flex; }
  .rsvp-table { display: none; }
}

.rsvp-card {
  border: 1px solid var(--gray-100); border-radius: 14px;
  padding: 14px; background: white;
}
.rc-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.rc-name { font-size: 0.95rem; color: var(--gray-800); overflow-wrap: anywhere; }
.rc-meta {
  display: flex; flex-wrap: wrap; gap: 6px 14px; margin-top: 8px;
  font-size: 0.76rem; color: var(--gray-500);
}
.rc-meta span { display: inline-flex; align-items: center; gap: 5px; }
.rc-wish {
  margin-top: 10px; padding-top: 10px; border-top: 1px dashed var(--gray-100);
  font-size: 0.84rem; color: var(--gray-600); font-style: italic; line-height: 1.55;
  overflow-wrap: anywhere;
  /* Three lines, then it clips — the full text lives in the sheet. */
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
}
.rc-wish-full { display: block; overflow: visible; }

.rc-more {
  display: inline-flex; align-items: center; justify-content: center; gap: 7px;
  width: 100%; padding: 12px; margin-top: 2px;
  border: 1.5px dashed var(--rose-200); border-radius: 12px;
  background: var(--rose-50); color: var(--rose-600);
  font-size: 0.85rem; font-weight: 600; cursor: pointer;
}
.rc-more:active { background: var(--rose-100); }

/* ---- Generic bottom sheet (music picker) ---- */
.sheet-overlay {
  position: fixed; inset: 0; z-index: 210;
  display: flex; align-items: flex-end; justify-content: center;
  background: rgba(17, 24, 39, 0.55); backdrop-filter: blur(3px);
}
.sheet {
  display: flex; flex-direction: column;
  width: 100%; max-width: 560px;
  height: 92vh; height: 92dvh;
  background: var(--gray-50);
  border-radius: 22px 22px 0 0;
  box-shadow: var(--shadow-xl);
  overflow: hidden;
  animation: rm-rise 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}
.sheet-head {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;
  padding: 16px 16px 14px; background: white;
  border-bottom: 1px solid var(--gray-200); flex: none;
}
.sheet-head h3 {
  font-size: 0.98rem; font-weight: 700; color: var(--gray-800);
  display: flex; align-items: center; gap: 7px;
}
.sheet-head p { font-size: 0.76rem; color: var(--gray-500); margin-top: 3px; }
.sheet-close {
  flex: none; width: 34px; height: 34px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: var(--gray-100); color: var(--gray-600); border: none; cursor: pointer;
}
.sheet-close:hover { background: var(--gray-200); }

.sheet-body {
  flex: 1; min-height: 0;
  overflow-y: auto; -webkit-overflow-scrolling: touch;
  overflow-x: hidden;              /* the trim handles sit slightly proud of the track */
  padding: 16px;
}

.sheet-foot {
  flex: none; display: flex; gap: 10px; align-items: center;
  padding: 12px 16px max(12px, env(safe-area-inset-bottom));
  background: white; border-top: 1px solid var(--gray-200);
}
.sheet-foot .btn-primary { flex: 1; }
.sheet-remove { background: #fef2f2; color: #dc2626; }
.sheet-remove:hover { background: #fee2e2; }

@media (min-width: 769px) {
  .sheet-overlay { align-items: center; padding: 20px; }
  .sheet { height: auto; max-height: 86vh; border-radius: 20px; }
}

/* ---- All-responses sheet ---- */
.rsvp-modal {
  position: fixed; inset: 0; z-index: 200;
  display: flex; align-items: flex-end; justify-content: center;
  background: rgba(17, 24, 39, 0.55); backdrop-filter: blur(3px);
}
.rm-sheet {
  width: 100%; max-width: 560px; max-height: 88vh; max-height: 88dvh;
  display: flex; flex-direction: column;
  background: var(--gray-50);
  border-radius: 22px 22px 0 0;
  box-shadow: var(--shadow-xl);
  animation: rm-rise 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}
@keyframes rm-rise { from { transform: translateY(6%); opacity: 0.6; } to { transform: none; opacity: 1; } }

.rm-head {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;
  padding: 18px 18px 14px; border-bottom: 1px solid var(--gray-200);
  background: white; border-radius: 22px 22px 0 0;
}
.rm-head h3 { font-size: 1rem; font-weight: 700; color: var(--gray-800); }
.rm-head p { font-size: 0.78rem; color: var(--gray-500); margin-top: 3px; }
.rm-close {
  flex: none; width: 34px; height: 34px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: var(--gray-100); color: var(--gray-600); border: none; cursor: pointer;
}
.rm-close:hover { background: var(--gray-200); }

.rm-body {
  flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch;
  padding: 14px 14px max(20px, env(safe-area-inset-bottom));
  display: flex; flex-direction: column; gap: 10px;
}
.rm-card { box-shadow: var(--shadow-sm); }

@media (min-width: 769px) {
  .rsvp-modal { align-items: center; padding: 20px; }
  .rm-sheet { border-radius: 20px; }
  .rm-head { border-radius: 20px 20px 0 0; }
}

/* A long wish must never widen the table — it truncates, with the full text on hover. */
.wishes-cell {
  max-width: 220px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.date-cell { white-space: nowrap; font-size: 0.8rem; color: var(--gray-500); }
@media (max-width: 600px) { .dash-stats { grid-template-columns: repeat(2, 1fr); } }
</style>
