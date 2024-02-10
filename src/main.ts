import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { i18n,setLanguage } from "./locales"

import "./assets/input.css";
import { SETTINGS } from "./siteSettings";


const app = createApp(App);

app.use(i18n);
app.use(router);
setLanguage((['cz', 'sk'].includes(navigator.language) | 0))

app.mount("#app");
