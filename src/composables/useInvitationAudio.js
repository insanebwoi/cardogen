import { ref, shallowRef, onBeforeUnmount } from 'vue'

/**
 * Downloads the invitation song up-front (so it starts instantly and gaplessly
 * when the card opens) and plays the trimmed portion on the first user gesture,
 * or immediately when the browser allows autoplay.
 */
export function useInvitationAudio() {
  const progress = ref(0)        // 0..1 download progress
  const downloading = ref(false)
  const ready = ref(false)
  const streaming = ref(false)   // host blocks CORS: playing straight from the URL
  const failed = ref(false)
  const playing = ref(false)
  const needsGesture = ref(false)

  const audio = shallowRef(null)
  let objectUrl = null
  let config = { start: 0, end: 0, loop: true }
  let gestureBound = false
  let unbindGesture = null

  /** Fetches the whole file so playback never stalls mid-song. */
  async function prepare(url, { start = 0, end = 0, loop = true } = {}) {
    if (!url) return false
    config = { start: Number(start) || 0, end: Number(end) || 0, loop: loop !== false }
    downloading.value = true
    failed.value = false

    let src = url
    try {
      const res = await fetch(url, { mode: 'cors' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const total = Number(res.headers.get('content-length')) || 0
      if (res.body && total) {
        const reader = res.body.getReader()
        const chunks = []
        let received = 0
        for (;;) {
          const { done, value } = await reader.read()
          if (done) break
          chunks.push(value)
          received += value.length
          progress.value = Math.min(1, received / total)
        }
        objectUrl = URL.createObjectURL(new Blob(chunks, { type: res.headers.get('content-type') || 'audio/mpeg' }))
      } else {
        objectUrl = URL.createObjectURL(await res.blob())
      }
      src = objectUrl
      progress.value = 1
    } catch {
      // Most hosts don't send Access-Control-Allow-Origin, so the file cannot be
      // pre-downloaded. Playing straight from the URL still works — the browser
      // just buffers it itself, and seeking depends on the host's range support.
      streaming.value = true
      progress.value = 0
    }

    const el = new Audio()
    el.src = src
    el.preload = 'auto'
    el.loop = false // looping is handled manually so the trim window is respected
    el.volume = 0
    el.addEventListener('play', () => { playing.value = true })
    el.addEventListener('pause', () => { playing.value = false })
    el.addEventListener('timeupdate', onTimeUpdate)
    el.addEventListener('ended', onEnded)
    el.addEventListener('error', () => { failed.value = true })
    el.addEventListener('progress', () => {
      if (!streaming.value || !el.buffered.length) return
      const end = el.buffered.end(el.buffered.length - 1)
      const total = Number.isFinite(el.duration) && el.duration > 0 ? el.duration : 0
      if (total) progress.value = Math.min(1, end / total)
    })
    audio.value = el

    await new Promise((resolve) => {
      if (el.readyState >= 2) return resolve()
      const done = () => resolve()
      el.addEventListener('canplay', done, { once: true })
      el.addEventListener('error', done, { once: true })
      setTimeout(done, 6000) // never hold the card hostage to a slow host
    })

    downloading.value = false
    ready.value = !failed.value
    return ready.value
  }

  function onTimeUpdate() {
    const el = audio.value
    if (!el) return
    if (config.end > 0 && el.currentTime >= config.end) {
      if (config.loop) el.currentTime = config.start
      else el.pause()
    }
  }

  function onEnded() {
    const el = audio.value
    if (el && config.loop) { el.currentTime = config.start; el.play().catch(() => {}) }
  }

  function fadeTo(target, ms = 4000) {
    const el = audio.value
    if (!el) return
    const from = el.volume
    const startedAt = performance.now()
    const step = (now) => {
      const t = Math.min(1, (now - startedAt) / ms)
      el.volume = Math.max(0, Math.min(1, from + (target - from) * t))
      if (t < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }

  /**
   * Starts the song automatically with a slow fade-in. If the browser blocks
   * autoplay we silently arm the first interaction instead of nagging the guest.
   */
  async function start() {
    const el = audio.value
    if (!el) return
    el.volume = 0
    // Armed before the attempt so a tap that lands during the autoplay
    // round-trip is not lost.
    needsGesture.value = true
    bindGesture()
    try {
      el.currentTime = config.start
      await el.play()
      needsGesture.value = false
      unbindGesture?.()   // autoplay worked — stop listening for taps
      fadeTo(1, 5000)
    } catch {
      // Autoplay refused — the gesture listeners above take over.
    }
  }

  const GESTURE_EVENTS = ['pointerdown', 'touchstart', 'mousedown', 'click', 'keydown', 'scroll']

  /**
   * Arms the first interaction anywhere on the card. play() is called
   * synchronously inside the handler — iOS only honours it from within the
   * gesture's own call stack, not from an await or a .then().
   */
  function bindGesture() {
    if (gestureBound) return
    gestureBound = true

    const handler = (e) => {
      // The mute button drives playback itself; don't fight it.
      if (e.target?.closest?.('[data-music-control]')) return
      const el = audio.value
      if (!el) return
      // Already playing (or deliberately paused by the guest): never restart.
      if (!el.paused) { unbind(); return }
      try { el.currentTime = config.start } catch {}
      el.volume = 0
      const p = el.play()
      if (p && p.then) {
        p.then(() => {
          needsGesture.value = false
          fadeTo(1, 5000)
          unbind()
        }).catch(() => { /* still blocked — stay armed for the next gesture */ })
      } else {
        needsGesture.value = false
        fadeTo(1, 5000)
        unbind()
      }
    }

    const unbind = () => {
      gestureBound = false
      unbindGesture = null
      GESTURE_EVENTS.forEach((ev) => window.removeEventListener(ev, handler, true))
    }
    unbindGesture = unbind
    // Capture phase so this runs before any component's own click handling.
    GESTURE_EVENTS.forEach((ev) => window.addEventListener(ev, handler, true))
  }

  function toggle() {
    const el = audio.value
    if (!el) return
    // An explicit tap on the control supersedes the armed auto-start.
    unbindGesture?.()
    needsGesture.value = false
    if (el.paused) {
      if (config.end > 0 && (el.currentTime < config.start || el.currentTime >= config.end)) el.currentTime = config.start
      el.volume = 0
      el.play().then(() => { needsGesture.value = false; fadeTo(1, 3000) }).catch(() => {})
    } else {
      fadeTo(0, 400)
      setTimeout(() => el.pause(), 400)
    }
  }

  function destroy() {
    unbindGesture?.()
    const el = audio.value
    if (el) { el.pause(); el.src = '' }
    if (objectUrl) { URL.revokeObjectURL(objectUrl); objectUrl = null }
    audio.value = null
  }

  onBeforeUnmount(destroy)

  return {
    progress, downloading, streaming, ready, failed, playing, needsGesture,
    prepare, start, toggle, destroy
  }
}
