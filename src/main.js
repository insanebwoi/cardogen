import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import './style.css'
import Icon from './components/Icon.vue'

const app = createApp(App)
app.component('Icon', Icon)
app.use(createPinia())
app.use(router)
app.use(Toast, {
  position: 'top-center',
  timeout: 3200,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.5,
  showCloseButtonOnHover: true,
  icon: true,
  transition: 'Vue-Toastification__fade',
  maxToasts: 4,
  newestOnTop: true
})
// In dev, a render error otherwise leaves a blank page with nothing on screen.
if (import.meta.env.DEV) {
  app.config.errorHandler = (err, instance, info) => {
    console.error('[vue error]', info, err)
    const el = document.getElementById('app')
    if (el && !el.querySelector('.dev-crash')) {
      const box = document.createElement('pre')
      box.className = 'dev-crash'
      box.style.cssText = 'position:fixed;inset:16px;z-index:9999;overflow:auto;padding:20px;' +
        'background:#1e1b2e;color:#fca5a5;font:12px/1.5 ui-monospace,monospace;border-radius:12px;white-space:pre-wrap'
      box.textContent = `Vue error during ${info}\n\n${err?.stack || err}`
      el.appendChild(box)
    }
  }
  window.addEventListener('error', (e) => console.error('[window error]', e.error || e.message))
  window.addEventListener('unhandledrejection', (e) => console.error('[unhandled rejection]', e.reason))
}

app.mount('#app')
