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
app.use(Toast, { position: 'top-right', timeout: 3000 })
app.mount('#app')
