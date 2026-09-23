import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref } from 'vue'
import {
  collection, addDoc, getDocs, doc, updateDoc, deleteDoc,
  query, where, limit, increment, serverTimestamp
} from 'firebase/firestore'
import { db } from '@/config/firebase'

/**
 * Shared song library. Any URL a user adds becomes visible to everyone
 * in the "Explore Songs" panel of the create wizard.
 */
export const useMusicStore = defineStore('music', () => {
  const songs = ref([])
  const loading = ref(false)
  const error = ref(null)
  let loadedOnce = false

  function normalizeUrl(url) {
    return (url || '').trim()
  }

  function isValidAudioUrl(url) {
    const u = normalizeUrl(url)
    if (!/^https?:\/\//i.test(u)) return false
    try {
      const parsed = new URL(u)
      // Allow query strings (signed URLs) — check the pathname only.
      return /\.(mp3|m4a|aac|ogg|oga|wav|webm)$/i.test(parsed.pathname) ||
        /firebasestorage|googleapis|cloudinary|dropbox|githubusercontent/i.test(parsed.hostname)
    } catch {
      return false
    }
  }

  async function fetchSongs(force = false) {
    if (loadedOnce && !force) return songs.value
    try {
      loading.value = true
      error.value = null
      const snapshot = await getDocs(collection(db, 'songs'))
      songs.value = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      songs.value.sort((a, b) => (b.useCount || 0) - (a.useCount || 0) ||
        (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      loadedOnce = true
      return songs.value
    } catch (err) {
      error.value = err.message
      console.error('fetchSongs error:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  async function findByUrl(url) {
    const u = normalizeUrl(url)
    const local = songs.value.find((s) => s.url === u)
    if (local) return local
    const snap = await getDocs(query(collection(db, 'songs'), where('url', '==', u), limit(1)))
    if (snap.empty) return null
    return { id: snap.docs[0].id, ...snap.docs[0].data() }
  }

  /** Adds a song to the shared library (or returns the existing one). */
  async function addSong({ name, url, artist = '', user }) {
    const cleanUrl = normalizeUrl(url)
    if (!isValidAudioUrl(cleanUrl)) throw new Error('That does not look like a direct audio (mp3) link')
    if (!name || !name.trim()) throw new Error('Please give the song a name')

    const existing = await findByUrl(cleanUrl)
    if (existing) return existing

    const song = {
      name: name.trim().slice(0, 80),
      artist: artist.trim().slice(0, 80),
      url: cleanUrl,
      addedBy: user?.uid || null,
      addedByName: user?.displayName || user?.email || 'Anonymous',
      useCount: 0,
      createdAt: serverTimestamp()
    }
    const docRef = await addDoc(collection(db, 'songs'), song)
    const created = { id: docRef.id, ...song }
    songs.value.unshift(created)
    return created
  }

  async function incrementUse(songId) {
    if (!songId) return
    try {
      await updateDoc(doc(db, 'songs', songId), { useCount: increment(1) })
      const s = songs.value.find((x) => x.id === songId)
      if (s) s.useCount = (s.useCount || 0) + 1
    } catch (err) {
      console.warn('incrementUse failed', err)
    }
  }

  async function deleteSong(id) {
    await deleteDoc(doc(db, 'songs', id))
    songs.value = songs.value.filter((s) => s.id !== id)
  }

  return { songs, loading, error, fetchSongs, addSong, findByUrl, incrementUse, deleteSong, isValidAudioUrl }
})

// Without this, editing the store leaves the already-created instance stale
// and newly added actions appear undefined until a full page reload.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMusicStore, import.meta.hot))
}
