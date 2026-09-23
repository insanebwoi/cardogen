<template>
  <div>
    <template v-if="!compact">
      <h2 class="step-title"><Icon name="Music" size="18" /> Invitation Song</h2>
      <p class="step-desc">Pick a song that plays when your guests open the card — or skip it entirely.</p>
    </template>

    <!-- Enable toggle -->
    <label v-if="!compact" class="music-toggle" :class="{ on: formData.musicEnabled }">
      <input type="checkbox" :checked="formData.musicEnabled" @change="toggleMusic($event.target.checked)" />
      <span class="mt-track"><span class="mt-knob"></span></span>
      <span class="mt-text">
        <strong>Play music when the invitation opens</strong>
        <small>The song is downloaded during the opening animation, then fades in.</small>
      </span>
    </label>

    <div v-if="compact || formData.musicEnabled" class="music-body" :class="{ compact }">
      <!-- Tabs -->
      <div class="tabs">
        <button type="button" class="tab" :class="{ active: tab === 'explore' }" @click="tab = 'explore'">
          <Icon name="Compass" size="14" /> Explore Songs
          <span v-if="musicStore.songs.length" class="tab-count">{{ musicStore.songs.length }}</span>
        </button>
        <button type="button" class="tab" :class="{ active: tab === 'add' }" @click="tab = 'add'">
          <Icon name="Plus" size="14" /> Add MP3 Link
        </button>
      </div>

      <!-- EXPLORE -->
      <div v-show="tab === 'explore'" class="pane">
        <div class="search-row">
          <Icon name="Search" size="15" />
          <input v-model="search" class="search-input" placeholder="Search songs everyone has added…" />
          <button type="button" class="refresh-btn" @click="musicStore.fetchSongs(true)" title="Refresh">
            <Icon name="RefreshCw" size="14" />
          </button>
        </div>

        <div v-if="musicStore.loading" class="empty"><span class="spinner"></span> Loading the library…</div>
        <div v-else-if="!filteredSongs.length" class="empty">
          <Icon name="Music2" size="22" />
          <p v-if="search">No song matches “{{ search }}”.</p>
          <p v-else>No songs yet — be the first to add one!</p>
          <button type="button" class="link-btn" @click="tab = 'add'">Add an MP3 link →</button>
        </div>

        <p v-if="playError" class="add-error"><Icon name="AlertCircle" size="14" /> {{ playError }}</p>

        <ul v-if="filteredSongs.length" class="song-list">
          <li v-for="song in filteredSongs" :key="song.id" class="song-item" :class="{ selected: formData.musicUrl === song.url }">
            <button type="button" class="play-btn" @click="togglePreview(song.url)" :title="previewingUrl === song.url && isPlaying ? 'Pause' : 'Preview'">
              <Icon :name="previewingUrl === song.url && isPlaying ? 'Pause' : 'Play'" size="15" />
            </button>
            <div class="song-meta" @click="selectSong(song)">
              <span class="song-name">{{ song.name }}</span>
              <span class="song-sub">
                <template v-if="song.artist">{{ song.artist }} · </template>
                added by {{ song.addedByName || 'Anonymous' }}
                <template v-if="song.useCount"> · used {{ song.useCount }}×</template>
              </span>
            </div>
            <button type="button" class="select-btn" @click="selectSong(song)">
              <Icon :name="formData.musicUrl === song.url ? 'Check' : 'Plus'" size="14" />
              {{ formData.musicUrl === song.url ? 'Selected' : 'Use' }}
            </button>
          </li>
        </ul>
      </div>

      <!-- ADD -->
      <div v-show="tab === 'add'" class="pane">
        <div class="field">
          <label class="field-label">Song name <span class="req">*</span></label>
          <input v-model="newSong.name" class="text-input" placeholder="e.g. Perfect — Ed Sheeran" maxlength="80" />
        </div>
        <div class="field">
          <label class="field-label">Artist <small>(optional)</small></label>
          <input v-model="newSong.artist" class="text-input" placeholder="e.g. Ed Sheeran" maxlength="80" />
        </div>
        <div class="field">
          <label class="field-label">Direct MP3 URL <span class="req">*</span></label>
          <input v-model="newSong.url" class="text-input mono" placeholder="https://example.com/song.mp3" spellcheck="false" />
          <p class="field-hint">
            <Icon name="Info" size="13" />
            Must be a direct link to the audio file (ends in .mp3/.m4a/.ogg/.wav) — not a YouTube or Spotify page.
          </p>
        </div>

        <div class="add-actions">
          <button type="button" class="test-btn" :disabled="!newSong.url" @click="togglePreview(newSong.url)">
            <Icon :name="previewingUrl === newSong.url && isPlaying ? 'Pause' : 'Play'" size="14" />
            Test link
          </button>
          <button type="button" class="btn-save" :disabled="saving || !newSong.name || !newSong.url" @click="saveSong">
            <Icon name="Upload" size="14" />
            {{ saving ? 'Saving…' : 'Save & use this song' }}
          </button>
        </div>
        <p v-if="addError || playError" class="add-error"><Icon name="AlertCircle" size="14" /> {{ addError || playError }}</p>
        <p class="share-note">
          <Icon name="Users" size="13" />
          Songs you save join the shared <strong>Explore</strong> library so other couples can use them too.
        </p>
      </div>

      <!-- SELECTED + TRIM -->
      <div v-if="formData.musicUrl" class="selected-card">
        <div class="sel-head">
          <div class="sel-info">
            <span class="sel-badge"><Icon name="Music" size="12" /> Selected</span>
            <strong class="sel-name">{{ formData.musicName || 'Untitled song' }}</strong>
          </div>
          <button type="button" class="sel-remove" @click="clearSong" title="Remove song"><Icon name="X" size="15" /></button>
        </div>

        <div class="trim-block">
          <div class="trim-head">
            <h4><Icon name="Scissors" size="14" /> Trim the part guests hear</h4>
            <span class="trim-dur" v-if="duration">{{ fmt(trimStart) }} → {{ fmt(trimEnd) }} ({{ fmt(trimEnd - trimStart) }})</span>
            <span class="trim-dur" v-else-if="loadingMeta">loading audio…</span>
          </div>

          <div v-if="duration" class="trim-ui">
            <div class="track" ref="trackEl">
              <div class="track-bars">
                <span v-for="(h, i) in bars" :key="i" class="bar" :style="{ height: h + '%' }"
                      :class="{ inside: (i / bars.length) * duration >= trimStart && (i / bars.length) * duration <= trimEnd }"></span>
              </div>
              <div class="sel-range" :style="{ left: pct(trimStart) + '%', width: (pct(trimEnd) - pct(trimStart)) + '%' }"></div>
              <div class="playhead" v-if="previewingUrl === formData.musicUrl" :style="{ left: pct(currentTime) + '%' }"></div>
              <div class="handle handle-start" :style="{ left: pct(trimStart) + '%' }" @mousedown="startDrag('start', $event)" @touchstart.prevent="startDrag('start', $event)"></div>
              <div class="handle handle-end" :style="{ left: pct(trimEnd) + '%' }" @mousedown="startDrag('end', $event)" @touchstart.prevent="startDrag('end', $event)"></div>
            </div>

            <div class="trim-fields">
              <label class="tf">
                <span>Start</span>
                <input type="number" min="0" :max="Math.floor(trimEnd) - 1" step="1" :value="Math.round(trimStart)"
                       @change="setTrim('start', $event.target.value)" />
                <em>sec</em>
              </label>
              <label class="tf">
                <span>End</span>
                <input type="number" :min="Math.ceil(trimStart) + 1" :max="Math.ceil(duration)" step="1" :value="Math.round(trimEnd)"
                       @change="setTrim('end', $event.target.value)" />
                <em>sec</em>
              </label>
              <button type="button" class="tf-btn" @click="playTrim">
                <Icon :name="previewingUrl === formData.musicUrl && isPlaying ? 'Pause' : 'Play'" size="14" />
                Preview trim
              </button>
              <button type="button" class="tf-btn ghost" @click="resetTrim"><Icon name="RotateCcw" size="14" /> Full song</button>
            </div>

            <label class="loop-row">
              <input type="checkbox" :checked="formData.musicLoop !== false" @change="emit('update', { musicLoop: $event.target.checked })" />
              <span>Loop this portion while the card is open</span>
            </label>
          </div>

          <p v-else-if="!loadingMeta" class="trim-warn">
            <Icon name="AlertCircle" size="14" />
            Couldn't read the audio length — the song will still play in full, but trimming is unavailable.
          </p>
        </div>
      </div>
    </div>

    <audio ref="audioEl" preload="metadata"></audio>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useMusicStore } from '@/stores/musicStore'
import { useAuthStore } from '@/stores/authStore'

const props = defineProps(['formData', 'compact'])
const emit = defineEmits(['update'])

const musicStore = useMusicStore()
const authStore = useAuthStore()

const tab = ref('explore')
const search = ref('')
const saving = ref(false)
const addError = ref('')
const newSong = ref({ name: '', artist: '', url: '' })

const audioEl = ref(null)
const trackEl = ref(null)
const previewingUrl = ref('')
const isPlaying = ref(false)
const duration = ref(0)
const currentTime = ref(0)
const loadingMeta = ref(false)
const playError = ref('')

// Static pseudo-waveform — purely decorative, gives the trim slider a shape.
const bars = Array.from({ length: 64 }, (_, i) => 30 + Math.round(55 * Math.abs(Math.sin(i * 0.7) * Math.cos(i * 0.23))))

const trimStart = computed(() => Number(props.formData.musicStart) || 0)
const trimEnd = computed(() => {
  const e = Number(props.formData.musicEnd)
  if (e > 0) return e
  return duration.value || 0
})

const filteredSongs = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return musicStore.songs
  return musicStore.songs.filter((s) =>
    (s.name || '').toLowerCase().includes(q) ||
    (s.artist || '').toLowerCase().includes(q) ||
    (s.addedByName || '').toLowerCase().includes(q))
})

onMounted(() => {
  musicStore.fetchSongs()
  if (props.formData.musicUrl) loadMeta(props.formData.musicUrl)
})

function toggleMusic(on) {
  emit('update', { musicEnabled: on })
  if (!on) stopPreview()
}

function selectSong(song) {
  stopPreview()
  previewingUrl.value = ''
  emit('update', {
    musicUrl: song.url,
    musicName: song.name,
    musicArtist: song.artist || '',
    musicSongId: song.id || '',
    musicStart: 0,
    musicEnd: 0,
    musicLoop: props.formData.musicLoop !== false
  })
  loadMeta(song.url)
}

function clearSong() {
  stopPreview()
  duration.value = 0
  emit('update', { musicUrl: '', musicName: '', musicArtist: '', musicSongId: '', musicStart: 0, musicEnd: 0 })
}

async function saveSong() {
  addError.value = ''
  try {
    saving.value = true
    const song = await musicStore.addSong({ ...newSong.value, user: authStore.user })
    selectSong(song)
    newSong.value = { name: '', artist: '', url: '' }
    tab.value = 'explore'
  } catch (err) {
    addError.value = err.message
  } finally {
    saving.value = false
  }
}

/* ---------- audio preview ---------- */
function loadMeta(url) {
  const a = audioEl.value
  if (!a || !url) return
  loadingMeta.value = true
  playError.value = ''
  duration.value = 0
  a.src = url
  a.load()
}

function onLoadedMeta() {
  loadingMeta.value = false
  playError.value = ''
  const d = audioEl.value?.duration
  duration.value = Number.isFinite(d) ? d : 0
}

function togglePreview(url) {
  const a = audioEl.value
  if (!a || !url) return
  if (previewingUrl.value === url && isPlaying.value) { a.pause(); return }
  if (previewingUrl.value !== url || !a.src) {
    playError.value = ''
    a.src = url
    a.load()
    previewingUrl.value = url
    loadingMeta.value = true
  }
  a.play().catch((e) => {
    // NotSupportedError means the browser never got usable audio bytes back.
    playError.value = e.name === 'NotSupportedError' ? badSourceMessage(url) : 'Could not play: ' + e.message
  })
}

/** Seeks once the element actually has metadata — seeks before that are dropped. */
function seekTo(a, time) {
  return new Promise((resolve) => {
    const apply = () => {
      try { a.currentTime = time } catch { /* not seekable */ }
      resolve()
    }
    if (a.readyState >= 1) return apply()
    a.addEventListener('loadedmetadata', apply, { once: true })
    a.addEventListener('error', resolve, { once: true })
    setTimeout(resolve, 5000)
  })
}

async function playTrim() {
  const a = audioEl.value
  if (!a || !props.formData.musicUrl) return
  if (previewingUrl.value === props.formData.musicUrl && isPlaying.value) { a.pause(); return }

  if (previewingUrl.value !== props.formData.musicUrl || !a.src) {
    playError.value = ''
    a.src = props.formData.musicUrl
    a.load()
    previewingUrl.value = props.formData.musicUrl
    loadingMeta.value = true
  }

  await seekTo(a, trimStart.value)
  try {
    await a.play()
    // A host without byte-range support ignores the seek; report it rather than
    // playing the wrong part of the song silently.
    if (trimStart.value > 1 && a.currentTime < trimStart.value - 1.5) {
      playError.value = 'This host does not allow seeking, so the trim cannot be previewed here. It will still be applied on the invitation, where the file is downloaded first.'
    }
  } catch (e) {
    playError.value = e.name === 'NotSupportedError'
      ? badSourceMessage(props.formData.musicUrl)
      : 'Could not play: ' + e.message
  }
}

function stopPreview() {
  const a = audioEl.value
  if (a) { a.pause(); a.currentTime = 0 }
  isPlaying.value = false
}

/** Explains the most common reasons a pasted link yields no audio. */
function badSourceMessage(url) {
  let host = ''
  try { host = new URL(url).hostname.replace(/^www\./, '') } catch {}
  if (/youtube|youtu\.be|spotify|soundcloud|apple\.com/i.test(host))
    return `${host} pages are not audio files — you need a direct link ending in .mp3`
  if (/drive\.google\.com/i.test(host))
    return 'Google Drive share links return a web page. Use the direct download form: https://drive.google.com/uc?export=download&id=FILE_ID'
  if (/dropbox\.com/i.test(host))
    return 'Dropbox links need ?raw=1 at the end (change dl=0 to raw=1) to serve the actual file'
  return 'That link did not return a playable audio file — check it opens the mp3 directly in a browser tab, and that the host allows hotlinking'
}

function onTimeUpdate() {
  const a = audioEl.value
  if (!a) return
  currentTime.value = a.currentTime
  // Keep the preview inside the trimmed window.
  if (previewingUrl.value === props.formData.musicUrl && trimEnd.value > 0 && a.currentTime >= trimEnd.value) {
    if (props.formData.musicLoop !== false) a.currentTime = trimStart.value
    else a.pause()
  }
}

/* ---------- trim handles ---------- */
function pct(t) { return duration.value ? Math.min(100, Math.max(0, (t / duration.value) * 100)) : 0 }
function fmt(s) {
  if (!Number.isFinite(s) || s < 0) s = 0
  const m = Math.floor(s / 60)
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

function setTrim(which, value) {
  const v = Math.max(0, Math.min(duration.value, Number(value) || 0))
  if (which === 'start') {
    const start = Math.max(0, Math.min(v, trimEnd.value - 1))
    emit('update', { musicStart: start })
    const a = audioEl.value
    if (a && isPlaying.value && a.currentTime < start) a.currentTime = start
  } else {
    emit('update', { musicEnd: Math.max(v, trimStart.value + 1) })
  }
}

let dragging = null
function startDrag(which, e) {
  dragging = which
  window.addEventListener('mousemove', onDrag)
  window.addEventListener('touchmove', onDrag, { passive: false })
  window.addEventListener('mouseup', endDrag)
  window.addEventListener('touchend', endDrag)
  onDrag(e)
}
function onDrag(e) {
  if (!dragging || !trackEl.value || !duration.value) return
  if (e.cancelable) e.preventDefault()
  const rect = trackEl.value.getBoundingClientRect()
  const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left
  const t = Math.max(0, Math.min(duration.value, (x / rect.width) * duration.value))
  setTrim(dragging, t)
}
function endDrag() {
  dragging = null
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('touchmove', onDrag)
  window.removeEventListener('mouseup', endDrag)
  window.removeEventListener('touchend', endDrag)
}

watch(audioEl, (a) => {
  if (!a) return
  a.addEventListener('loadedmetadata', onLoadedMeta)
  a.addEventListener('timeupdate', onTimeUpdate)
  a.addEventListener('play', () => { isPlaying.value = true })
  a.addEventListener('pause', () => { isPlaying.value = false })
  a.addEventListener('ended', () => { isPlaying.value = false })
  a.addEventListener('error', () => {
    loadingMeta.value = false
    if (a.src) playError.value = badSourceMessage(a.src)
  })
})

onBeforeUnmount(() => { stopPreview(); endDrag() })
</script>

<style scoped>
.step-title { font-size: 1.15rem; font-weight: 700; color: var(--gray-800); margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
.step-desc { color: var(--gray-500); font-size: 0.85rem; margin-bottom: 22px; }

/* Toggle */
.music-toggle {
  display: flex; align-items: center; gap: 14px; cursor: pointer;
  padding: 16px 18px; border: 1.5px solid var(--gray-200, #e5e7eb); border-radius: 14px;
  transition: all 0.2s; background: white;
}
.music-toggle.on { border-color: #f43f5e; background: var(--rose-50, #fff1f2); }
.music-toggle input { display: none; }
.mt-track { width: 44px; height: 26px; border-radius: 99px; background: var(--gray-200, #e5e7eb); flex: none; position: relative; transition: background 0.2s; }
.music-toggle.on .mt-track { background: #f43f5e; }
.mt-knob { position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%; background: white; box-shadow: 0 1px 4px rgba(0,0,0,0.2); transition: transform 0.2s; }
.music-toggle.on .mt-knob { transform: translateX(18px); }
.mt-text { display: flex; flex-direction: column; gap: 3px; }
.mt-text strong { font-size: 0.9rem; color: var(--gray-800); }
.mt-text small { font-size: 0.76rem; color: var(--gray-500); }

.music-body { margin-top: 22px; display: flex; flex-direction: column; gap: 18px; }
.music-body.compact { margin-top: 0; }

/* Inside the sheet the panel owns the full width and must never exceed it. */
.music-body, .pane, .field, .song-item, .search-row, .selected-card { min-width: 0; max-width: 100%; }
.text-input, .search-input { width: 100%; max-width: 100%; }
/* The sheet scrolls, so the inner list shouldn't scroll separately. */
.music-body.compact .song-list { max-height: none; overflow: visible; }
/* Handles sit half outside the track; the inset keeps them on screen at 0% and 100%. */
.music-body.compact .track { margin: 0 11px; }

/* Tabs */
.tabs { display: flex; gap: 6px; background: #f5f5f4; padding: 5px; border-radius: 12px; }
.tab {
  flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  padding: 9px 12px; border: none; background: transparent; border-radius: 9px; cursor: pointer;
  font-size: 0.83rem; font-weight: 600; color: var(--gray-500); transition: all 0.18s;
}
.tab.active { background: white; color: #f43f5e; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
.tab-count { background: var(--rose-50, #fff1f2); color: #f43f5e; border-radius: 99px; padding: 1px 7px; font-size: 0.7rem; }

.pane { display: flex; flex-direction: column; gap: 14px; }

/* Search */
.search-row {
  display: flex; align-items: center; gap: 8px; padding: 0 12px;
  border: 1.5px solid var(--gray-200, #e5e7eb); border-radius: 10px; color: var(--gray-400);
}
.search-row:focus-within { border-color: #f43f5e; }
.search-input { flex: 1; border: none; outline: none; padding: 11px 0; font-size: 0.88rem; background: transparent; color: var(--gray-900); }
.refresh-btn { border: none; background: transparent; cursor: pointer; color: var(--gray-400); padding: 6px; display: flex; }
.refresh-btn:hover { color: #f43f5e; }

/* Song list */
.song-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; max-height: 320px; overflow-y: auto; }
.song-item {
  display: flex; align-items: center; gap: 12px; padding: 10px 12px;
  border: 1.5px solid var(--gray-100, #f3f4f6); border-radius: 12px; transition: all 0.16s; background: white;
}
.song-item:hover { border-color: var(--rose-200, #fecdd3); }
.song-item.selected { border-color: #f43f5e; background: var(--rose-50, #fff1f2); }
.play-btn {
  flex: none; width: 34px; height: 34px; border-radius: 50%; border: none; cursor: pointer;
  background: #1e1b2e; color: white; display: flex; align-items: center; justify-content: center;
}
.play-btn:hover { background: #f43f5e; }
.song-meta { flex: 1; min-width: 0; cursor: pointer; display: flex; flex-direction: column; gap: 2px; }
.song-name { font-size: 0.88rem; font-weight: 600; color: var(--gray-800); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.song-sub { font-size: 0.73rem; color: var(--gray-500); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.select-btn {
  flex: none; display: inline-flex; align-items: center; gap: 5px; padding: 7px 12px;
  border-radius: 99px; border: 1.5px solid var(--gray-200, #e5e7eb); background: white;
  font-size: 0.76rem; font-weight: 600; color: var(--gray-600); cursor: pointer; transition: all 0.16s;
}
.song-item.selected .select-btn { background: #f43f5e; border-color: #f43f5e; color: white; }

.empty {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 36px 16px; color: var(--gray-500); font-size: 0.85rem; text-align: center;
  border: 1px dashed var(--gray-200, #e5e7eb); border-radius: 12px;
}
.empty p { margin: 0; }
.link-btn { background: none; border: none; color: #f43f5e; font-weight: 600; cursor: pointer; font-size: 0.82rem; }

/* Add form */
.field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 0.78rem; font-weight: 700; color: var(--gray-700); text-transform: uppercase; letter-spacing: 0.04em; }
.field-label small { text-transform: none; font-weight: 500; color: var(--gray-400); letter-spacing: 0; }
.req { color: #f43f5e; }
.text-input {
  border: 1.5px solid var(--gray-200, #e5e7eb); border-radius: 10px; padding: 11px 13px;
  font-size: 0.88rem; outline: none; color: var(--gray-900); background: white;
}
.text-input:focus { border-color: #f43f5e; box-shadow: 0 0 0 3px rgba(244,63,94,0.12); }
.text-input.mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.8rem; }
.field-hint { display: flex; align-items: flex-start; gap: 6px; font-size: 0.75rem; color: var(--gray-500); margin: 0; }
.add-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.test-btn, .btn-save {
  display: inline-flex; align-items: center; gap: 6px; padding: 10px 16px;
  border-radius: 10px; font-size: 0.83rem; font-weight: 600; cursor: pointer; border: 1.5px solid var(--gray-200, #e5e7eb);
  background: white; color: var(--gray-700);
}
.btn-save { background: #f43f5e; border-color: #f43f5e; color: white; }
.btn-save:disabled, .test-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.add-error { display: flex; align-items: center; gap: 6px; color: #dc2626; font-size: 0.8rem; font-weight: 600; margin: 0; }
.share-note { display: flex; align-items: center; gap: 6px; font-size: 0.76rem; color: var(--gray-500); margin: 0; }

/* Selected + trim */
.selected-card { border: 1.5px solid #f43f5e; border-radius: 14px; overflow: hidden; }
.sel-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 16px; background: var(--rose-50, #fff1f2); }
.sel-info { display: flex; align-items: center; gap: 10px; min-width: 0; }
.sel-badge { display: inline-flex; align-items: center; gap: 4px; background: #f43f5e; color: white; padding: 3px 9px; border-radius: 99px; font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; flex: none; }
.sel-name { font-size: 0.9rem; color: var(--gray-800); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sel-remove { border: none; background: transparent; cursor: pointer; color: var(--gray-400); display: flex; padding: 4px; }
.sel-remove:hover { color: #dc2626; }

.trim-block { padding: 16px; display: flex; flex-direction: column; gap: 14px; }
.trim-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.trim-head h4 { margin: 0; font-size: 0.82rem; font-weight: 700; color: var(--gray-700); display: flex; align-items: center; gap: 6px; }
.trim-dur { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.76rem; color: #f43f5e; font-weight: 600; }

.track { position: relative; height: 70px; background: #faf9f8; border-radius: 10px; padding: 0 2px; user-select: none; touch-action: none; }
.track-bars { position: absolute; inset: 0; display: flex; align-items: center; gap: 1px; padding: 0 2px; }
.bar { flex: 1; background: var(--gray-200, #e5e7eb); border-radius: 2px; transition: background 0.15s; }
.bar.inside { background: #fda4af; }
.sel-range { position: absolute; top: 0; bottom: 0; background: rgba(244,63,94,0.10); border-left: 2px solid #f43f5e; border-right: 2px solid #f43f5e; pointer-events: none; }
.playhead { position: absolute; top: 0; bottom: 0; width: 2px; background: #1e1b2e; pointer-events: none; }
.handle {
  position: absolute; top: 50%; width: 16px; height: 34px; margin-left: -8px;
  transform: translateY(-50%); background: #f43f5e; border-radius: 5px; cursor: ew-resize;
  box-shadow: 0 2px 6px rgba(244,63,94,0.4);
}
.handle::after { content: ''; position: absolute; inset: 12px 6px; border-left: 1px solid rgba(255,255,255,0.7); border-right: 1px solid rgba(255,255,255,0.7); }

.trim-fields { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.tf { display: inline-flex; align-items: center; gap: 6px; font-size: 0.78rem; color: var(--gray-600); font-weight: 600; }
.tf input { width: 68px; border: 1.5px solid var(--gray-200, #e5e7eb); border-radius: 8px; padding: 7px 8px; font-size: 0.8rem; outline: none; }
.tf input:focus { border-color: #f43f5e; }
.tf em { font-style: normal; color: var(--gray-400); font-weight: 500; }
.tf-btn {
  display: inline-flex; align-items: center; gap: 5px; padding: 8px 13px; border-radius: 9px;
  border: 1.5px solid #f43f5e; background: #f43f5e; color: white; font-size: 0.78rem; font-weight: 600; cursor: pointer;
}
.tf-btn.ghost { background: white; color: var(--gray-600); border-color: var(--gray-200, #e5e7eb); }
.loop-row { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: var(--gray-600); cursor: pointer; }
.trim-warn { display: flex; align-items: center; gap: 6px; font-size: 0.78rem; color: #b45309; margin: 0; }

.spinner { width: 14px; height: 14px; border: 2px solid #e5e7eb; border-top-color: #f43f5e; border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 768px) {
  .tabs { position: sticky; top: 0; z-index: 2; }
  .song-item { gap: 9px; padding: 9px; }
  .select-btn { padding: 7px 10px; font-size: 0.72rem; }
  .song-list { max-height: 48vh; }
  .trim-fields { gap: 8px; }
  .tf input { width: 60px; }
  .tf-btn { flex: 1 1 auto; justify-content: center; }
  .add-actions { flex-direction: column; }
  .add-actions .test-btn, .add-actions .btn-save { width: 100%; justify-content: center; }
  .track { height: 60px; }
  .handle { width: 22px; margin-left: -11px; height: 40px; }
  .mt-text small { font-size: 0.72rem; }

  /* Labels wrap rather than push the row wider. */
  .tab { font-size: 0.78rem; padding: 9px 6px; }
  .tab-count { display: none; }
  .sel-head { flex-wrap: wrap; }
  .trim-head { gap: 6px; }
  .field-hint { font-size: 0.72rem; }
  .share-note { font-size: 0.72rem; }
}
</style>
