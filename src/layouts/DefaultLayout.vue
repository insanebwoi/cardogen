<template>
  <div class="layout-default">
    <nav class="navbar">
      <div class="nav-inner container">
        <RouterLink to="/" class="nav-logo">
          <span class="logo-icon"><Icon name="Heart" size="18" /></span>
          <span class="logo-text">Cardogen</span>
        </RouterLink>
        <div class="nav-links">
          <template v-if="isAuthenticated">
            <RouterLink to="/dashboard" class="nav-link hide-mobile">Dashboard</RouterLink>
            <RouterLink to="/create" class="btn btn-primary btn-sm">+ Create</RouterLink>
            <div class="nav-avatar" @click.stop="showMenu = !showMenu">
              <img :src="userProfile?.photoURL || ''" :alt="userProfile?.name" />
              <Transition name="fade">
                <div v-if="showMenu" class="nav-dropdown" @click.stop>
                  <div class="dropdown-header">
                    <strong>{{ userProfile?.name }}</strong>
                    <small>{{ userProfile?.email }}</small>
                  </div>
                  <RouterLink to="/dashboard" class="dropdown-item" @click="showMenu = false"><Icon name="LayoutDashboard" size="18" /> Dashboard</RouterLink>
                  <RouterLink v-if="isAdmin" to="/admin" class="dropdown-item" @click="showMenu = false"><Icon name="Shield" size="16" /> Admin Panel</RouterLink>
                  <RouterLink to="/my-invitations" class="dropdown-item" @click="showMenu = false"><Icon name="ClipboardList" size="18" /> My Invitations</RouterLink>
                  <button @click="logout" class="dropdown-item dropdown-danger"><Icon name="LogOut" size="16" /> Logout</button>
                </div>
              </Transition>
            </div>
          </template>
          <template v-else>
            <RouterLink to="/login" class="btn btn-primary btn-sm">Get Started</RouterLink>
          </template>
        </div>
      </div>
    </nav>
    <main class="main-content container">
      <slot />
    </main>
    <footer class="app-footer">
      <div class="container">
        <p>© 2026 <strong>Cardogen</strong> — Beautiful Digital Wedding Invitations</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const { userProfile, isAuthenticated, isAdmin } = storeToRefs(authStore)
const showMenu = ref(false)

function logout() { authStore.logout(); showMenu.value = false }

// Close dropdown when clicking outside
function handleClickOutside() { showMenu.value = false }
onMounted(() => { document.addEventListener('click', handleClickOutside) })
onBeforeUnmount(() => { document.removeEventListener('click', handleClickOutside) })
</script>

<style scoped>
.layout-default { min-height: 100vh; display: flex; flex-direction: column; }
.navbar {
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--gray-100);
  position: sticky;
  top: 0;
  z-index: 100;
}
.nav-inner { display: flex; align-items: center; justify-content: space-between; height: 64px; }
.nav-logo { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 1.25rem; }
.logo-icon { font-size: 1.5rem; }
.logo-text { background: linear-gradient(135deg, var(--rose-500), var(--rose-700)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.nav-links { display: flex; align-items: center; gap: 16px; }
.nav-link { color: var(--gray-600); font-weight: 500; font-size: 0.9rem; transition: color 0.2s; }
.nav-link:hover { color: var(--rose-600); }
.nav-avatar { position: relative; cursor: pointer; }
.nav-avatar img { width: 36px; height: 36px; border-radius: 50%; border: 2px solid var(--rose-200); object-fit: cover; }
.nav-dropdown {
  position: absolute; right: 0; top: 48px; background: white; border-radius: var(--radius); box-shadow: var(--shadow-lg);
  min-width: 220px; overflow: hidden; border: 1px solid var(--gray-100); z-index: 200;
}
.dropdown-header { padding: 16px; border-bottom: 1px solid var(--gray-100); }
.dropdown-header strong { display: block; font-size: 0.9rem; }
.dropdown-header small { color: var(--gray-500); font-size: 0.75rem; }
.dropdown-item {
  display: block; width: 100%; padding: 12px 16px; font-size: 0.85rem; color: var(--gray-700);
  background: none; text-align: left; transition: background 0.15s; cursor: pointer;
}
.dropdown-item:hover { background: var(--gray-50); }
.dropdown-danger { color: #ef4444; }
.main-content { flex: 1; padding: 40px 20px; }
.app-footer { padding: 24px; text-align: center; color: var(--gray-400); font-size: 0.8rem; border-top: 1px solid var(--gray-100); }

@media (max-width: 600px) {
  .hide-mobile { display: none; }
  .main-content { padding: 24px 16px; }
}
</style>
