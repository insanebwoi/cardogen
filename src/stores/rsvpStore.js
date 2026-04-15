import { defineStore } from 'pinia'
import { ref } from 'vue'
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp } from 'firebase/firestore'
import { db } from '@/config/firebase'

export const useRsvpStore = defineStore('rsvp', () => {
  const rsvps = ref([])
  const allRsvps = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function submitRsvp(invitationId, data) {
    try {
      loading.value = true
      const rsvp = {
        invitationId,
        guestName: data.guestName,
        guestPhone: data.guestPhone || '',
        attending: data.attending,
        guestCount: data.guestCount || 1,
        wishesMessage: data.wishesMessage || '',
        respondedAt: serverTimestamp()
      }
      await addDoc(collection(db, 'rsvps'), rsvp)
      return true
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchRsvps(invitationId) {
    try {
      loading.value = true
      error.value = null
      let q
      try {
        q = query(collection(db, 'rsvps'), where('invitationId', '==', invitationId), orderBy('respondedAt', 'desc'))
        const snapshot = await getDocs(q)
        rsvps.value = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      } catch (indexErr) {
        // Fallback: fetch without orderBy if index not ready
        q = query(collection(db, 'rsvps'), where('invitationId', '==', invitationId))
        const snapshot = await getDocs(q)
        rsvps.value = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
        // Sort client-side
        rsvps.value.sort((a, b) => {
          const aTime = a.respondedAt?.seconds || 0
          const bTime = b.respondedAt?.seconds || 0
          return bTime - aTime
        })
      }
      return rsvps.value
    } catch (err) {
      error.value = err.message
      console.error('fetchRsvps error:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchAllRsvps() {
    try {
      loading.value = true
      error.value = null
      const snapshot = await getDocs(collection(db, 'rsvps'))
      allRsvps.value = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      // Sort client-side by respondedAt descending
      allRsvps.value.sort((a, b) => {
        const aTime = a.respondedAt?.seconds || 0
        const bTime = b.respondedAt?.seconds || 0
        return bTime - aTime
      })
      return allRsvps.value
    } catch (err) {
      error.value = err.message
      console.error('fetchAllRsvps error:', err)
    } finally {
      loading.value = false
    }
  }

  function getStats() {
    const total = rsvps.value.length
    const attending = rsvps.value.filter((r) => r.attending)
    const totalGuests = attending.reduce((sum, r) => sum + (r.guestCount || 1), 0)
    return { total, attendingCount: attending.length, totalGuests }
  }

  function getAllStats() {
    const total = allRsvps.value.length
    const attending = allRsvps.value.filter((r) => r.attending)
    const totalGuests = attending.reduce((sum, r) => sum + (r.guestCount || 1), 0)
    return { total, attendingCount: attending.length, totalGuests }
  }

  return { rsvps, allRsvps, loading, error, submitRsvp, fetchRsvps, fetchAllRsvps, getStats, getAllStats }
})
