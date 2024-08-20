<script setup lang="ts">
import axios, { type AxiosResponse } from "axios";
import Footer from "./components/global/Footer.vue";
import Navbar from "./components/Navbar.vue";
import { onMounted, ref } from "vue";
import cookier from "cookier";
import { SETTINGS, hasLocalStorage } from "./siteSettings";
import NoConnection from "./components/global/NoConnection.vue";
import router from "./router";
import { setLanguage } from "./locales";
import { currentUID } from "./Editor";

if (hasLocalStorage()) {
  localStorage.getItem("favoriteIDs") ??
    localStorage.setItem("favoriteIDs", "[]");
  localStorage.getItem("favorites") ?? localStorage.setItem("favorites", "[]");
  localStorage.getItem("pinnedLists") ??
    localStorage.setItem("pinnedLists", "[]");
  localStorage.getItem("account_info") ??
    localStorage.setItem("pinnedLists", "[]");
  localStorage.getItem("recentlyViewed") ??
    localStorage.setItem("recentlyViewed", "[]");

  localStorage.getItem("settings") ??
    localStorage.setItem("settings", JSON.stringify(SETTINGS.value));

  let loadedSettings: any = JSON.parse(localStorage.getItem("settings")!);
  let loadedSettingsKeys: any = Object.keys(loadedSettings);
  let settingsKeys: any = Object.keys(SETTINGS.value);
  if (loadedSettingsKeys.length < settingsKeys.length) {
    settingsKeys.forEach((setting) => {
      if (!loadedSettingsKeys.includes(setting))
        loadedSettings[setting] = SETTINGS.value[setting];
    });
    localStorage.setItem("settings", JSON.stringify(loadedSettings));
  }
  SETTINGS.value = loadedSettings;
  let lang: 0 | 1 =
    SETTINGS.value.language == -1
      ? ["cz", "sk"].includes(navigator.language) | 0
      : SETTINGS.value.language;
  setLanguage(lang);
  if (SETTINGS.value.language == -1) SETTINGS.value.language = lang;
}

// Redirect to route from which login button pressed
if (hasLocalStorage()) {
  let loginRoute = sessionStorage.getItem("loginRoute");
  if (loginRoute) {
    sessionStorage.removeItem("loginRoute");
    router.replace(loginRoute);
  }
}

const loggedIn = ref<boolean | null>(null);
onMounted(() => {
  if (!hasLocalStorage()) return;
  axios
    .get(import.meta.env.VITE_API + "/accounts.php?check", {
      headers: { Authorization: cookier("access_token").get() },
    })
    .then((res: AxiosResponse) => {
      loggedIn.value = res.data.status == "logged_in";
      if (res.data.status == "logged_in") {
        delete res.data.status
        localStorage.setItem(
          "account_info",
          JSON.stringify(Object.values(res.data))
        );
        currentUID.value = res.data.account_id
      } else {
        localStorage.removeItem("account_info");
      }
    })
    .catch(() => localStorage.removeItem("account_info"));
});

const tabbarOpen = ref(false);
document.body.addEventListener("keyup", (e) => {
  if (e.altKey && e.key == "Control") tabbarOpen.value = false;
});
document.body.addEventListener("keydown", (e) => {
  if (e.altKey && e.key == "Control") tabbarOpen.value = true;
});
</script>

<template>
  <main class="min-h-screen">
    <Navbar :is-logged-in="loggedIn" />
    <NoConnection />
    <section v-if="tabbarOpen" class="absolute left-2 top-14 bg-greenGradient">
      sas
    </section>
    <RouterView :is-logged-in="loggedIn" class="min-h-[90vh]" />
  </main>
  <Footer />
</template>
