<script setup lang="ts">
import axios, { type AxiosResponse } from "axios";
import Footer from "./components/global/Footer.vue";
import Navbar from "./components/Navbar.vue";
import { defineAsyncComponent, onMounted, ref } from "vue";
import cookier from "cookier";
import { SETTINGS, hasLocalStorage, loggedIn } from "./siteSettings";
import NoConnection from "./components/global/NoConnection.vue";
import router from "./router";
import { i18n, setLanguage } from "./locales";
import { currentCutout, currentUID } from "./Editor";
import NotificationStack from "./components/global/NotificationStack.vue";
import { summonNotification } from "./components/imageUpload";
import { dialog } from "./components/ui/sizes";
import Dialog from "./components/global/Dialog.vue";
import { currentUnread } from "@/components/global/profiles";

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
}

// Redirect to route from which login button pressed
if (hasLocalStorage()) {
  let loginRoute = sessionStorage.getItem("loginRoute");
  if (loginRoute) {
    sessionStorage.removeItem("loginRoute");
    router.replace(loginRoute);
  }
}

const debugModeEnabled = ref(false)

const returnedFromLogin = ref<boolean>(false);
const firstTimeUser = ref<boolean>(false);

const returnfromLoginPFP = ref<string>("");
const returnfromLoginName = ref<string>("");

const LoggedInPopup = defineAsyncComponent(() => import("@/components/homepage/LoggedInPopup.vue"))

if (!hasLocalStorage()) loggedIn.value = false;
else {

  /*
    New user popup!!
  */
  let get = new URLSearchParams(location.search)
  if (get.has("loginerr")) {
    summonNotification(i18n.global.t('other.error'), i18n.global.t('homepage.loginFail'), 'error')
  }
  
  let loginCookie = cookier("logindata").get();
  if (loginCookie != null) {
    returnedFromLogin.value = true;
  
    loginCookie = JSON.parse(loginCookie);
    returnfromLoginName.value = loginCookie[0];
  
    // first-time user
    firstTimeUser.value = loginCookie[2];
    if (!firstTimeUser.value) {
      summonNotification(i18n.global.t('homepage.welcomeBack'), returnfromLoginName.value, 'check')
    }
  
    returnfromLoginPFP.value = loginCookie[1]
  
    cookier("logindata").remove();
  }

  // Logging in
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
        currentCutout.value = res.data.cutout
        currentUnread.value = res.data.unread_notif
        if (res.data.debug) debugModeEnabled.value = true
      } else {
        localStorage.removeItem("account_info");
      }
    })
    .catch(() => localStorage.removeItem("account_info"));
}

// const tabbarOpen = ref(false);
// document.body.addEventListener("keyup", (e) => {
//   if (e.altKey && e.key == "Control") tabbarOpen.value = false;
// });
// document.body.addEventListener("keydown", (e) => {
//   if (e.altKey && e.key == "Control") tabbarOpen.value = true;
// });

const debugMenu = defineAsyncComponent({loader: () => import('@/components/global/DebugDialog.vue')})
const debugMenuOpen = ref(false)
</script>

<template>
  <main class="min-h-screen">

    <Navbar :is-logged-in="loggedIn" />

    <!-- Notification when not online -->
    <NoConnection />

    <!-- New user popup-->
    <Dialog :width="dialog.large" :open="firstTimeUser" header-disabled>
      <component :is="LoggedInPopup" @close-popup="firstTimeUser = false" :username="returnfromLoginName" :pfplink="returnfromLoginPFP" />
    </Dialog>

    <Suspense>
      <RouterView :is-logged-in="loggedIn" class="min-h-[90vh]" />
    </Suspense>

    <div class="fixed top-1 left-14 z-50 p-1 text-black bg-yellow-100 rounded-md" @click="debugMenuOpen = true" v-if="debugModeEnabled"><span class="opacity-40">Debug</span> <component @close-popup="debugModeOpen = false" v-if="debugMenuOpen" :is="debugMenu"></component></div>
  </main>
  <NotificationStack />
  <Footer />
</template>
