<script setup lang="ts">
import axios, { type AxiosResponse } from "axios";
import Footer from "./components/global/Footer.vue";
import Navbar from "./components/Navbar.vue";
import { onMounted, ref } from "vue";
import cookier from "cookier";
import { SETTINGS } from "./siteSettings";
import router from "./router";
import NoConnection from "./components/global/NoConnection.vue";

if (localStorage) {
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
    settingsKeys.forEach(setting => {
      if (!loadedSettingsKeys.includes(setting)) loadedSettings[setting] = SETTINGS.value[setting]
    })
    localStorage.setItem("settings", JSON.stringify(loadedSettings))
  }
  SETTINGS.value = loadedSettings
}

const loggedIn = ref<boolean>(false);
onMounted(() => {
  axios
    .get(import.meta.env.VITE_API + "/accounts.php?check", {
      headers: { Authorization: cookier("access_token").get() },
    })
    .then((res: AxiosResponse) => {
      loggedIn.value = res.data.status == "logged_in";
      if (res.data.status == "logged_in") {
        localStorage.setItem(
          "account_info",
          JSON.stringify([
            res.data.account_name,
            res.data.account_id,
            res.data.pfp_hash,
          ])
        );
      } else {
        localStorage.removeItem("account_info");
      }
    })
    .catch(() => localStorage.removeItem("account_info"));
});
</script>

<template>
  <main class="min-h-screen">
    <Navbar :is-logged-in="loggedIn" />
    <NoConnection />
    <RouterView :is-logged-in="loggedIn" class="min-h-[90vh]" />
  </main>
  <Footer />
</template>
