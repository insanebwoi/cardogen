import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { applySeo } from '@/seo/useSeo'
import { seoForRoute, formatTitle } from '@/seo/routeSeo'
import { STEPS } from '@/seo/content'
import {
  graph, organizationNode, webSiteNode, applicationNode, faqNode, howToNode
} from '@/seo/structuredData'

const routes = [
  { path: '/', name: 'Home', component: () => import('@/views/public/HomePage.vue'), meta: { layout: 'default' } },
  { path: '/login', name: 'Login', component: () => import('@/views/public/LoginPage.vue'), meta: { layout: 'blank', guestOnly: true } },
  { path: '/w/:shortCode', name: 'WeddingCard', component: () => import('@/views/public/WeddingCard.vue'), meta: { layout: 'blank', selfManagedSeo: true } },
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

/**
 * The home page carries the full entity graph; everything else is either
 * private or described well enough by its meta tags alone.
 */
function jsonLdFor(routeName) {
  if (routeName !== 'Home') return null
  return graph([
    organizationNode(),
    webSiteNode(),
    applicationNode(),
    faqNode(),
    howToNode(STEPS)
  ])
}

// afterEach, not beforeEach: the tags describe the route that was actually
// reached, so a redirected navigation never leaves stale meta behind.
router.afterEach((to) => {
  // Views with per-record meta (an individual invitation) set their own.
  if (to.meta.selfManagedSeo) return
  const seo = seoForRoute(to.name)
  applySeo({
    title: formatTitle(seo.title, { bare: seo.bareTitle }),
    description: seo.description,
    path: seo.path || to.path,
    index: seo.index,
    jsonLd: jsonLdFor(to.name)
  })
})

export default router
