import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  collection, addDoc, getDocs, updateDoc, deleteDoc,
  doc, query, where, orderBy, serverTimestamp
} from 'firebase/firestore'
import { db } from '@/config/firebase'

export const useTemplateStore = defineStore('template', () => {
  const templates = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchActiveTemplates() {
    try {
      loading.value = true
      error.value = null
      let snapshot
      try {
        const q = query(collection(db, 'templates'), where('isActive', '==', true), orderBy('createdAt', 'desc'))
        snapshot = await getDocs(q)
      } catch {
        // Fallback: fetch without orderBy if composite index not ready
        const q = query(collection(db, 'templates'), where('isActive', '==', true))
        snapshot = await getDocs(q)
      }
      templates.value = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      // Sort client-side
      templates.value.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0
        const bTime = b.createdAt?.seconds || 0
        return bTime - aTime
      })
    } catch (err) {
      error.value = err.message
      console.error('fetchActiveTemplates error:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchAllTemplates() {
    try {
      loading.value = true
      error.value = null
      let snapshot
      try {
        const q = query(collection(db, 'templates'), orderBy('createdAt', 'desc'))
        snapshot = await getDocs(q)
      } catch {
        // Fallback: fetch all without orderBy
        snapshot = await getDocs(collection(db, 'templates'))
      }
      templates.value = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      // Sort client-side
      templates.value.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0
        const bTime = b.createdAt?.seconds || 0
        return bTime - aTime
      })
    } catch (err) {
      error.value = err.message
      console.error('fetchAllTemplates error:', err)
    } finally {
      loading.value = false
    }
  }

  async function createTemplate(data) {
    try {
      loading.value = true
      const template = {
        name: data.name,
        slug: data.slug,
        category: data.category,
        componentName: data.componentName || '',
        html: data.html || '',
        css: data.css || '',
        theme: data.theme || 'gold',
        thumbnailColor: data.thumbnailColor || '#f43f5e',
        isActive: data.isActive ?? true,
        createdAt: serverTimestamp()
      }
      const docRef = await addDoc(collection(db, 'templates'), template)
      templates.value.unshift({ id: docRef.id, ...template })
      return docRef.id
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateTemplate(id, data) {
    try {
      loading.value = true
      const templateRef = doc(db, 'templates', id)
      const updates = {
        name: data.name, slug: data.slug, category: data.category,
        componentName: data.componentName || '',
        html: data.html || '', css: data.css || '', theme: data.theme || 'gold',
        isActive: data.isActive
      }
      await updateDoc(templateRef, updates)
      const index = templates.value.findIndex((t) => t.id === id)
      if (index !== -1) templates.value[index] = { ...templates.value[index], ...updates }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteTemplate(id) {
    try {
      await deleteDoc(doc(db, 'templates', id))
      templates.value = templates.value.filter((t) => t.id !== id)
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  return { templates, loading, error, fetchActiveTemplates, fetchAllTemplates, createTemplate, updateTemplate, deleteTemplate }
})
