import { createApp } from 'vue'
import './style/style.css'
import App from './App.vue'
import router from './router.js'
import axios from './axios-config'  // Import de l'instance configurée
import { createPinia } from 'pinia'  // Import de Pinia

const app = createApp(App)

// Rendre l'instance Axios accessible globalement via $axios
app.config.globalProperties.$axios = axios

// Créer et utiliser l'instance de Pinia
const pinia = createPinia();
app.use(pinia)

// Enregistrer le router avant de monter l'app
app.use(router)

// Puis monter l'application
app.mount('#app')