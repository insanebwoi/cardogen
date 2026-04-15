<template>
  <div class="not-found">
    <div class="nf-content">
      <span class="nf-icon"><Icon name="HeartCrack" size="32" /></span>
      <h1>Page Not Found</h1>
      <p>The page you're looking for doesn't exist or has been removed.</p>
      <RouterLink to="/" class="btn btn-primary">← Back to Home</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  background: var(--gray-50); text-align: center; padding: 20px;
}
.nf-icon { font-size: 4rem; display: block; margin-bottom: 20px; }
.nf-content h1 { font-family: var(--font-display); font-size: 2rem; color: var(--gray-800); margin-bottom: 8px; }
.nf-content p { color: var(--gray-500); margin-bottom: 32px; }
</style>
