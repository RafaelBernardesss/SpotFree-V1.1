import { createApp } from 'vue'
import App from './App.vue'
import router from './config/RouterConfiguration.js'


createApp(App).use(router).mount('#app')
