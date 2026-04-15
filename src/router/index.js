import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const routes = [
  { path: '/', name: 'Home', component: () => import('@/views/public/HomePage.vue'), meta: { layout: 'default' } },
  { path: '/login', name: 'Login', component: () => import('@/views/public/LoginPage.vue'), meta: { layout: 'blank', guestOnly: true } },
  { path: '/w/:shortCode', name: 'WeddingCard', component: () => import('@/views/public/WeddingCard.vue'), meta: { layout: 'blank' } },
  { path: '/dashboard', name: 'Dashboard', component: () => import('@/views/user/DashboardPage.vue'), meta: { layout: 'default', requiresAuth: true } },
  { path: '/my-invitations', name: 'MyInvitations', component: () => import('@/views/user/MyInvitations.vue'), meta: { layout: 'default', requiresAuth: true } },
  { path: '/invitation/:id', name: 'InvitationDetails', component: () => import('@/views/user/InvitationDetails.vue'), meta: { layout: 'default', requiresAuth: true } },
  { path: '/create', name: 'CreateInvitation', component: () => import('@/views/user/create/CreateWizard.vue'), meta: { layout: 'default', requiresAuth: true } },
  // Admin routes
  { path: '/admin', name: 'AdminDashboard', component: () => import('@/views/admin/AdminDashboard.vue'), meta: { layout: 'admin', requiresAuth: true, requiresAdmin: true } },
  { path: '/admin/templates', name: 'TemplateManager', component: () => import('@/views/admin/TemplateManager.vue'), meta: { layout: 'admin', requiresAuth: true, requiresAdmin: true } },
  { path: '/admin/users', name: 'UserManager', component: () => import('@/views/admin/UserManager.vue'), meta: { layout: 'admin', requiresAuth: true, requiresAdmin: true } },
  { path: '/admin/rsvps', name: 'RsvpManager', component: () => import('@/views/admin/RsvpManager.vue'), meta: { layout: 'admin', requiresAuth: true, requiresAdmin: true } },
  { path: '/admin/invitations', name: 'InvitationManager', component: () => import('@/views/admin/InvitationManager.vue'), meta: { layout: 'admin', requiresAuth: true, requiresAdmin: true } },
  // Catch-all
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('@/views/public/NotFound.vue'), meta: { layout: 'blank' } }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() { return { top: 0 } }
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  // Wait for auth to be initialized before guarding routes
  if (authStore.loading) await authStore.initAuth()
  if (to.meta.guestOnly && authStore.isAuthenticated) return next({ name: 'Dashboard' })
  if (to.meta.requiresAuth && !authStore.isAuthenticated) return next({ name: 'Login', query: { redirect: to.fullPath } })
  if (to.meta.requiresAdmin && !authStore.isAdmin) return next({ name: 'Dashboard' })
  next()
})

export default router
