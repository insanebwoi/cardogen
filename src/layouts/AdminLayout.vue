<template>
  <div class="layout-admin" :class="{ 'sidebar-open': mobileOpen }">
    <!-- Mobile Overlay -->
    <div v-if="mobileOpen" class="sidebar-overlay" @click="mobileOpen = false"></div>

    <!-- Sidebar -->
    <aside class="admin-sidebar" :class="{ open: mobileOpen }">
      <div class="sidebar-header">
        <span class="logo-icon"><Icon name="Heart" size="18" /></span>
        <span class="logo-text">Cardogen</span>
        <span class="badge-admin">Admin</span>
        <button class="mobile-close" @click="mobileOpen = false">✕</button>
      </div>
      <nav class="sidebar-nav">
        <RouterLink to="/admin" class="sidebar-link" exact-active-class="active" @click="mobileOpen = false">
          <span><Icon name="LayoutDashboard" size="18" /></span> Dashboard
        </RouterLink>
        <RouterLink to="/admin/invitations" class="sidebar-link" active-class="active" @click="mobileOpen = false">
          <span><Icon name="Mail" size="18" /></span> Invitations
        </RouterLink>
        <RouterLink to="/admin/rsvps" class="sidebar-link" active-class="active" @click="mobileOpen = false">
          <span><Icon name="ClipboardList" size="18" /></span> RSVPs
        </RouterLink>
        <RouterLink to="/admin/templates" class="sidebar-link" active-class="active" @click="mobileOpen = false">
          <span><Icon name="Palette" size="18" /></span> Templates
        </RouterLink>
        <RouterLink to="/admin/users" class="sidebar-link" active-class="active" @click="mobileOpen = false">
          <span><Icon name="Users" size="18" /></span> Users
        </RouterLink>
      </nav>
      <div class="sidebar-footer">
        <RouterLink to="/dashboard" class="sidebar-link" @click="mobileOpen = false">
          <span>←</span> Back to App
        </RouterLink>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="admin-main">
      <header class="admin-topbar">
        <div class="topbar-left">
          <button class="hamburger" @click="mobileOpen = true">☰</button>
          <h2 class="topbar-title">Admin Panel</h2>
        </div>
        <div class="topbar-user" v-if="userProfile">
          <img :src="userProfile.photoURL || ''" :alt="userProfile.name" />
          <span class="topbar-username">{{ userProfile.name }}</span>
        </div>
      </header>
      <main class="admin-content"><slot /></main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/authStore'
const { userProfile } = storeToRefs(useAuthStore())
const mobileOpen = ref(false)
</script>

<style scoped>
.layout-admin { display: flex; min-height: 100vh; }

/* Sidebar */
.admin-sidebar {
  width: 250px;
  background: var(--gray-900);
  color: white;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 200;
  transition: transform 0.3s ease;
}
.sidebar-header {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  font-weight: 700;
  font-size: 1.1rem;
}
.badge-admin {
  font-size: 0.6rem;
  background: var(--rose-500);
  padding: 2px 8px;
  border-radius: 100px;
  font-weight: 600;
}
.mobile-close {
  display: none;
  margin-left: auto;
  background: none;
  color: rgba(255,255,255,0.6);
  font-size: 1.2rem;
  cursor: pointer;
}
.sidebar-nav {
  flex: 1;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
}
.sidebar-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 10px;
  color: rgba(255,255,255,0.6);
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
}
.sidebar-link:hover { background: rgba(255,255,255,0.08); color: white; }
.sidebar-link.active { background: rgba(244,63,94,0.2); color: var(--rose-400); }
.sidebar-footer {
  padding: 16px 12px;
  border-top: 1px solid rgba(255,255,255,0.1);
}

/* Main */
.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--gray-50);
  margin-left: 250px;
  min-width: 0;
}
.admin-topbar {
  background: white;
  padding: 16px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--gray-100);
  position: sticky;
  top: 0;
  z-index: 50;
}
.topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.hamburger {
  display: none;
  font-size: 1.3rem;
  background: none;
  color: var(--gray-700);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
}
.hamburger:hover { background: var(--gray-100); }
.topbar-title { font-size: 1.1rem; font-weight: 700; color: var(--gray-800); }
.topbar-user {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.85rem;
  color: var(--gray-600);
}
.topbar-user img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}
.admin-content {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Overlay */
.sidebar-overlay { display: none; }

/* Mobile Responsive */
@media (max-width: 768px) {
  .admin-sidebar {
    transform: translateX(-100%);
    width: 280px;
  }
  .admin-sidebar.open {
    transform: translateX(0);
  }
  .sidebar-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 150;
    backdrop-filter: blur(2px);
  }
  .mobile-close { display: block; }
  .hamburger { display: block; }
  .admin-main { margin-left: 0; }
  .admin-content { padding: 20px 16px; }
  .admin-topbar { padding: 14px 16px; }
  .topbar-username { display: none; }
}
</style>
