import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from "axios";

import './assets/input.css'

import { createI18n } from 'vue-i18n'
import { messages } from './translations'

const app = createApp(App)
const i18n = createI18n({
  locale: 'cs',
  messages
})

app.use(i18n)
app.use(router)
app.use(axios)

app.mount('#app')
