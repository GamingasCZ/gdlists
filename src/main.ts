import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { i18n, setLanguage } from "./locales"

import "./assets/input.css";
import { SETTINGS } from "./siteSettings";
import { changeTheme, checkSeasonalTheme, saveTheme } from "./themes";


const app = createApp(App);

app.use(i18n);
app.use(router);

let seasonalTheme = checkSeasonalTheme()
if (seasonalTheme != -1) {changeTheme(seasonalTheme); saveTheme(seasonalTheme)}
else changeTheme(SETTINGS.value.selectedTheme || 0)

if (SETTINGS.value.language == -1) SETTINGS.value.language =  +["cz", "sk"].includes(navigator.language)
await setLanguage(SETTINGS.value.language)

app.mount("#app");
