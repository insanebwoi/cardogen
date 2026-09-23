import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref } from 'vue'
import {
  collection, addDoc, getDocs, getDoc, updateDoc, deleteDoc,
  doc, query, where, orderBy, serverTimestamp
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import { nanoid } from 'nanoid'

export const useInvitationStore = defineStore('invitation', () => {
  const invitations = ref([])
  const allInvitations = ref([])
  const currentInvitation = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function createInvitation(data, userId) {
    try {
      loading.value = true
      error.value = null
      // Use custom slug if provided and valid, otherwise generate a random one
      const shortCode = data.customSlug && data.customSlug.trim() ? data.customSlug.trim() : nanoid(8)

      const invitation = {
        userId,
        shortCode,
        brideName: data.brideName,
        groomName: data.groomName,
        weddingDate: data.weddingDate,
        weddingTime: data.weddingTime,
        venueName: data.venueName,
        venueAddress: data.venueAddress,
        venueMapUrl: data.venueMapUrl || '',
        customMessage: data.customMessage || '',
        templateId: data.templateId,
        musicEnabled: !!(data.musicEnabled && data.musicUrl),
        musicUrl: data.musicUrl || '',
        musicName: data.musicName || '',
        musicArtist: data.musicArtist || '',
        musicSongId: data.musicSongId || '',
        musicStart: Number(data.musicStart) || 0,
        musicEnd: Number(data.musicEnd) || 0,
        musicLoop: data.musicLoop !== false,
        isActive: true,
        viewCount: 0,
        createdAt: serverTimestamp()
      }

      const docRef = await addDoc(collection(db, 'invitations'), invitation)
      const created = { id: docRef.id, ...invitation }
      invitations.value.unshift(created)
      return created
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchMyInvitations(userId) {
    try {
      loading.value = true
      error.value = null
      let snapshot
      try {
        const q = query(
          collection(db, 'invitations'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        )
        snapshot = await getDocs(q)
      } catch (indexErr) {
        // Fallback: fetch without orderBy if composite index not ready
        const q = query(
          collection(db, 'invitations'),
          where('userId', '==', userId)
        )
        snapshot = await getDocs(q)
      }
      invitations.value = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      // Sort client-side for consistency
      invitations.value.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0
        const bTime = b.createdAt?.seconds || 0
        return bTime - aTime
      })
    } catch (err) {
      error.value = err.message
      console.error('fetchMyInvitations error:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchAllInvitations() {
    try {
      loading.value = true
      error.value = null
      const snapshot = await getDocs(collection(db, 'invitations'))
      allInvitations.value = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      // Sort client-side
      allInvitations.value.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0
        const bTime = b.createdAt?.seconds || 0
        return bTime - aTime
      })
      return allInvitations.value
    } catch (err) {
      error.value = err.message
      console.error('fetchAllInvitations error:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchByShortCode(shortCode) {
    try {
      loading.value = true
      error.value = null
      let snapshot
      try {
        // Unfiltered so a revoked card can show "no longer available"
        // instead of looking like a broken link.
        snapshot = await getDocs(query(
          collection(db, 'invitations'),
          where('shortCode', '==', shortCode)
        ))
      } catch (permErr) {
        // Security rules that gate reads on isActive reject the query above
        // outright; fall back to the filtered form they do allow.
        console.warn('Unfiltered shortCode lookup rejected, retrying active-only:', permErr)
        snapshot = await getDocs(query(
          collection(db, 'invitations'),
          where('shortCode', '==', shortCode),
          where('isActive', '==', true)
        ))
      }
      if (!snapshot.empty) {
        const d = snapshot.docs[0]
        currentInvitation.value = { id: d.id, ...d.data() }
        // Only count views of a live card
        if (currentInvitation.value.isActive) {
          try {
            await updateDoc(d.ref, { viewCount: (currentInvitation.value.viewCount || 0) + 1 })
          } catch (updateErr) {
            console.warn('Failed to update view count:', updateErr)
          }
        }
        return currentInvitation.value
      }
      return null
    } catch (err) {
      error.value = err.message
      console.error('fetchByShortCode error:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  async function fetchById(id) {
    try {
      loading.value = true
      error.value = null
      const docSnap = await getDoc(doc(db, 'invitations', id))
      if (docSnap.exists()) {
        currentInvitation.value = { id: docSnap.id, ...docSnap.data() }
        return currentInvitation.value
      }
      return null
    } catch (err) {
      error.value = err.message
      console.error('fetchById error:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  /** Updates the song settings of an existing invitation. */
  async function updateMusic(id, music) {
    const payload = {
      musicEnabled: !!(music.musicEnabled && music.musicUrl),
      musicUrl: music.musicUrl || '',
      musicName: music.musicName || '',
      musicArtist: music.musicArtist || '',
      musicSongId: music.musicSongId || '',
      musicStart: Number(music.musicStart) || 0,
      musicEnd: Number(music.musicEnd) || 0,
      musicLoop: music.musicLoop !== false
    }
    await updateDoc(doc(db, 'invitations', id), payload)
    if (currentInvitation.value?.id === id) {
      currentInvitation.value = { ...currentInvitation.value, ...payload }
    }
    const idx = invitations.value.findIndex((inv) => inv.id === id)
    if (idx !== -1) invitations.value[idx] = { ...invitations.value[idx], ...payload }
    return payload
  }

  /** Switches which template (theme) an invitation renders with. */
  async function updateTemplate(id, templateId) {
    await updateDoc(doc(db, 'invitations', id), { templateId })
    const sync = (list) => {
      const i = list.findIndex((inv) => inv.id === id)
      if (i !== -1) list[i] = { ...list[i], templateId }
    }
    sync(allInvitations.value)
    sync(invitations.value)
    if (currentInvitation.value?.id === id) currentInvitation.value.templateId = templateId
  }

  async function toggleActive(id, isActive) {
    try {
      await updateDoc(doc(db, 'invitations', id), { isActive })
      const idx = allInvitations.value.findIndex((inv) => inv.id === id)
      if (idx !== -1) allInvitations.value[idx].isActive = isActive
      const mine = invitations.value.findIndex((inv) => inv.id === id)
      if (mine !== -1) invitations.value[mine].isActive = isActive
      if (currentInvitation.value?.id === id) currentInvitation.value.isActive = isActive
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  async function deleteInvitation(id) {
    try {
      await deleteDoc(doc(db, 'invitations', id))
      invitations.value = invitations.value.filter((inv) => inv.id !== id)
      allInvitations.value = allInvitations.value.filter((inv) => inv.id !== id)
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  return {
    invitations, allInvitations, currentInvitation, loading, error,
    createInvitation, fetchMyInvitations, fetchAllInvitations,
    fetchByShortCode, fetchById, toggleActive, deleteInvitation, updateMusic, updateTemplate
  }
})

// Without this, editing the store leaves the already-created instance stale
// and newly added actions appear undefined until a full page reload.
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useInvitationStore, import.meta.hot))
}
