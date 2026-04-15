import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { auth, googleProvider, db } from '@/config/firebase'

// Admin emails - these users are auto-assigned admin role
const ADMIN_EMAILS = ['brandbyuv@gmail.com']

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const userProfile = ref(null)
  const loading = ref(true)
  const error = ref(null)

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => userProfile.value?.role === 'admin')

  let authInitialized = false
  let resolveAuth
  let rejectAuth

  const authPromise = new Promise((resolve, reject) => {
    resolveAuth = resolve
    rejectAuth = reject
  })

  function initAuth() {
    if (authInitialized) return authPromise
    
    onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          user.value = firebaseUser
          await fetchUserProfile(firebaseUser)
        } else {
          user.value = null
          userProfile.value = null
        }
      } catch (err) {
        console.error('Auth state change error:', err)
        error.value = err.message
      }
      
      loading.value = false
      if (!authInitialized) {
        authInitialized = true
        resolveAuth()
      }
    }, (err) => {
      console.error('Auth listener error:', err)
      loading.value = false
      error.value = err.message
      if (!authInitialized) {
        authInitialized = true
        resolveAuth() // Resolve anyway so the app doesn't hang
      }
    })
    
    // Timeout safety: if auth doesn't respond in 10 seconds, unblock the app
    setTimeout(() => {
      if (!authInitialized) {
        console.warn('Auth initialization timed out')
        loading.value = false
        authInitialized = true
        resolveAuth()
      }
    }, 10000)

    return authPromise
  }

  async function fetchUserProfile(firebaseUser) {
    const isAdminEmail = ADMIN_EMAILS.includes(firebaseUser.email?.toLowerCase())
    try {
      const userRef = doc(db, 'users', firebaseUser.uid)
      const userSnap = await getDoc(userRef)
      if (userSnap.exists()) {
        const data = userSnap.data()
        // Auto-upgrade to admin if email matches and role isn't admin yet
        if (isAdminEmail && data.role !== 'admin') {
          await updateDoc(userRef, { role: 'admin' })
          data.role = 'admin'
        }
        userProfile.value = { id: userSnap.id, ...data }
      } else {
        const newProfile = {
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email || '',
          photoURL: firebaseUser.photoURL || '',
          role: isAdminEmail ? 'admin' : 'user',
          createdAt: serverTimestamp()
        }
        await setDoc(userRef, newProfile)
        userProfile.value = { id: firebaseUser.uid, ...newProfile }
      }
    } catch (err) {
      console.error('Error fetching user profile:', err)
      error.value = err.message
      // Set a minimal profile so the app doesn't break
      userProfile.value = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || 'User',
        email: firebaseUser.email || '',
        photoURL: firebaseUser.photoURL || '',
        role: isAdminEmail ? 'admin' : 'user'
      }
    }
  }

  async function loginWithGoogle() {
    try {
      error.value = null
      const result = await signInWithPopup(auth, googleProvider)
      user.value = result.user
      await fetchUserProfile(result.user)
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  async function logout() {
    try {
      await signOut(auth)
      user.value = null
      userProfile.value = null
    } catch (err) {
      error.value = err.message
    }
  }

  return { user, userProfile, loading, error, isAuthenticated, isAdmin, initAuth, loginWithGoogle, logout }
})
