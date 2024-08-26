<script setup lang="ts">
import ListSection from "./homepage/ListSection.vue";
import LoginButton from "./global/LoginButton.vue";
import LoggedInPopup from "./homepage/LoggedInPopup.vue";
import cookier from "cookier";
import { computed, onMounted, ref, watch } from "vue";
import { SETTINGS, hasLocalStorage, viewedPopups } from "@/siteSettings";
import { useI18n } from "vue-i18n";
import DialogVue from "./global/Dialog.vue";
import { dialog } from "./ui/sizes";
import { RouterLink } from "vue-router";
import CommunityLists from "@/components/CommunityLists.vue";
import SavedLists from "./SavedLists.vue";


document.title = useI18n().t("other.websiteName");

const props = defineProps<{
  isLoggedIn: boolean
  cpt: any
}>();

const returnedFromLogin = ref<boolean>(false);
const firstTimeUser = ref<boolean>(false);

const returnfromLoginPFP = ref<string>("");
const returnfromLoginName = ref<string>("");

onMounted(() => {
  let get = new URLSearchParams(location.search)
  if (get.has("loginerr")) {
    let errorToast = document.getElementById("loginErrorToast");
    errorToast?.classList.add("popout");
  }
  
  let loginCookie = cookier("logindata").get();
  if (loginCookie != null) {
    returnedFromLogin.value = true;
  
    loginCookie = JSON.parse(loginCookie);
    returnfromLoginName.value = loginCookie[0];
  
    // first-time user
    firstTimeUser.value = loginCookie[2];
    if (!firstTimeUser.value) {
      let loginToast = document.getElementById("loginToast");
      loginToast?.classList.add("popout");
    }
  
    returnfromLoginPFP.value = loginCookie[1]
  
    cookier("logindata").remove();
  }
})


const localStorg = ref(hasLocalStorage())

const closeTwitterAd = () => {
  viewedPopups.twitterAd = true
  localStorage.setItem("popupsViewed", JSON.stringify(viewedPopups))
  document.querySelector("#twitterAd")?.remove()
}

</script>

<template>
  <DialogVue :width="dialog.large" :open="firstTimeUser" header-disabled>
    <LoggedInPopup @close-popup="firstTimeUser = false" :username="returnfromLoginName" :pfplink="returnfromLoginPFP" />
  </DialogVue>
  
  <div id="loginToast" v-if="!firstTimeUser && localStorg"
    class="absolute top-16 left-1/2 p-2 px-6 text-xl text-white bg-black bg-opacity-80 rounded-md transition-transform duration-75 -translate-x-1/2 -translate-y-24">
    {{ $t('homepage.welcomeBack') }} <b>{{ returnfromLoginName }}</b>!
  </div>

  <div id="loginErrorToast" v-if="!firstTimeUser && localStorg"
    class="flex absolute top-16 left-1/2 gap-3 p-2 px-6 text-xl bg-black bg-opacity-80 rounded-md transition-transform duration-75 -translate-x-1/2 -translate-y-24">
    <img src="@/images/warn.svg" alt="" class="w-8">
    <span class="text-white">{{ $t('homepage.loginFail') }}</span>
  </div>

  <!-- <section class="flex justify-center">
    <div v-if="isLoggedIn == false && localStorg"
      class="flex gap-3 justify-center items-center px-2 py-1 mx-4 mt-6 max-w-4xl text-white rounded-md bg-greenGradient">
      <img src="../images/info.svg" alt="" class="w-6" />
      <div>
        <p class="text-xl font-bold leading-tight max-sm:text-xs">{{ $t("homepage.welcomeToGDL") }}</p>
        <p class="mr-4 text-sm max-md:hidden">{{ $t("homepage.connectDiscord") }}</p>
      </div>
      <LoginButton class="ml-auto" />
    </div>
    <div v-if="!localStorg"
      class="flex gap-3 justify-center items-center px-2 py-1 mx-4 mt-6 max-w-4xl text-white rounded-md bg-greenGradient">
      <img src="../images/disCookies.svg" alt="" class="w-6" />
      <div>
        <p class="max-sm:text-xs">{{ $t('homepage.cookies1') }}</p>
        <p class="max-md:hidden">{{ $t('homepage.cookies2') }}</p>
      </div>
    </div>
  </section> -->
  <main class="flex p-2">
    <aside class="flex gap-5 items-start text-2xl text-left text-white max-sm:absolute sm:flex-col">
      <RouterLink to="/"><span>{{ $t('navbar.home') }}</span></RouterLink>
      <RouterLink to="/browse/lists"><span>{{ $t('navbar.lists') }}</span></RouterLink>
      <RouterLink to="/saved"><span>{{ $t('navbar.saved') }}</span></RouterLink>
      <RouterLink to="/uploads"><span>{{ $t('navbar.uploads') }}</span></RouterLink>
      <button><span>{{ $t('other.settings') }}</span></button>
    </aside>
    
    <component v-if="cpt !== undefined" :is="[CommunityLists, SavedLists][cpt]" />
    <section v-else class="flex flex-col grow sm:mr-2">
      <ListSection :style="{gridColumn: `1 / span ${SETTINGS.homepageColumns}`}" :header-name="$t('homepage.newestReviews')" :extra-text="$t('homepage.more')" extra-icon="more"
        :empty-text="$t('homepage.listsUnavailable', [$t('homepage.reviews')])" extra-action="/browse/reviews" content-type="/getLists.php?homepage=2" :list-type="2" />
      
      <ListSection :header-name="$t('homepage.newest')" :extra-text="$t('homepage.more')" extra-icon="more"
        :empty-text="$t('homepage.listsUnavailable', [$t('homepage.levels')])" extra-action="/browse/lists" content-type="/getLists.php?homepage=1" />
  
      <ListSection v-if="isLoggedIn" :header-name="$t('homepage.uploaded')" :extra-text="$t('homepage.more')"
        extra-icon="more" extra-action="/browse/lists?type=user" :empty-text="$t('homepage.noListsUploaded')"
        content-type="/getLists.php?homeUser" />
  
      <ListSection :header-name="$t('homepage.visited')" :extra-text="$t('homepage.clear')" extra-icon="trash"
        extra-action="@clear" :empty-text="$t('homepage.noListsVisited')" content-type="@recentlyViewed" />
  
      <ListSection :header-name="$t('homepage.official')" :empty-text="$t('homepage.listsNonexistent')"
        content-type="oldLists" />
    </section>
  </main>
</template>

<style>
@keyframes slideTop {
  0% {@apply -translate-y-24}
  5% {@apply translate-y-0}
  95% {@apply translate-y-0}
  100% {@apply -translate-y-24}
}

.popout {
  animation: slideTop 5s ease forwards;
}
</style>