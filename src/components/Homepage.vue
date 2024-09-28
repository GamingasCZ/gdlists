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
import { summonNotification } from "./imageUpload";
import { i18n } from "@/locales";
import THEMES, { selectedBeforeSave } from "@/themes";

document.title = useI18n().t("other.websiteName");

defineProps({
  isLoggedIn: Boolean,
});

const returnedFromLogin = ref<boolean>(false);
const firstTimeUser = ref<boolean>(false);

const returnfromLoginPFP = ref<string>("");
const returnfromLoginName = ref<string>("");

const columns = computed(() => window.innerWidth > 900 ? '1fr '.repeat(SETTINGS.value.homepageColumns) : '1fr')

onMounted(() => {
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
})


const localStorg = ref(hasLocalStorage())

const closeTwitterAd = () => {
  viewedPopups.twitterAd = true
  localStorage.setItem("popupsViewed", JSON.stringify(viewedPopups))
  document.querySelector("#twitterAd")?.remove()
}

const base = import.meta.env.BASE_URL
const headerBG = ref(`url(${base}/graphics/${THEMES[SETTINGS.value.selectedTheme].graphic}.webp)`)
watch(selectedBeforeSave, () => {
  headerBG.value = `url(${base}/graphics/${THEMES[selectedBeforeSave.value].graphic}.webp)`
})

</script>

<template>
  <DialogVue :width="dialog.large" :open="firstTimeUser" header-disabled>
    <LoggedInPopup @close-popup="firstTimeUser = false" :username="returnfromLoginName" :pfplink="returnfromLoginPFP" />
  </DialogVue>
  
  <header :style="{backgroundImage: headerBG}" class="flex flex-col h-[256px] justify-end items-center bg-no-repeat bg-center">
    <!-- Twitter notif -->
    <div v-if="!viewedPopups.twitterAd && localStorg" id="twitterAd" class="flex absolute right-2 top-14 gap-2 items-center p-2 text-white bg-black bg-opacity-80 rounded-md backdrop-blur-md">
      <img src="@/images/socials/twitter.svg" class="w-6" alt="">
      <span>{{ $t('homepage.tAd1') }} <a @click="closeTwitterAd" target="_blank" href="https://twitter.com/geodlists" class="underline">@GDLists</a> {{ $t('homepage.tAd2') }}</span>
      <button @click="closeTwitterAd" class="ml-3 text-xl text-white text-opacity-40">X</button>
    </div>

    <form action="./browse/lists" method="get" class="flex relative gap-2 items-start text-white">
      <div class="relative">
        <input type="text" name="q"
          class="px-1 py-2 pr-10 w-full rounded-md border-4 border-lof-300 bg-greenGradient outline-transparent placeholder:text-xl"
          :placeholder="$t('homepage.searchLists')" />

        <RouterLink to="/random" class="absolute top-3 right-3 z-10 min-w-max button selectOutline">
          <img src="../images/dice.svg" alt="" class="w-6" />
        </RouterLink>

        <div class="flex gap-2 pt-2 w-full text-base text-white">
          <RouterLink to="/make/list" class="flex gap-4 items-center px-2 py-3 w-full min-w-max rounded-md grow button bg-lof-300 selectOutline">
            <img src="../images/browseMobHeader.svg" alt="" class="w-6" />{{
              $t("homepage.createList")
            }}
          </RouterLink>
          <RouterLink to="/make/review" class="flex gap-4 items-center px-2 py-3 w-full min-w-max rounded-md button grow bg-lof-300 selectOutline">
            <img src="../images/reviews.svg" alt="" class="w-6" />{{ $t('homepage.writeReview') }}
          </RouterLink>
        </div>
      </div>
      <button type="submit" class="box-border p-3 w-12 rounded-full max-sm:hidden button bg-greenGradient">
        <img src="../images/searchOpaque.svg" alt="" />
      </button>
    </form>
  </header>

  <section class="flex justify-center">
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
  </section>

  <main id="homepageSections" class="grid sm:mr-2" :style="{ gridTemplateColumns: columns }">
    <ListSection :style="{gridColumn: `1 / span ${SETTINGS.homepageColumns}`}" :header-name="$t('homepage.newestReviews')" :extra-text="$t('homepage.more')" extra-icon="more"
      :empty-text="$t('homepage.listsUnavailable', [$t('homepage.reviews')])" extra-action="/browse/reviews" content-type="/getLists.php?homepage=2" :list-type="2" />
    
    <ListSection :header-name="$t('homepage.newest')" :extra-text="$t('homepage.more')" extra-icon="more"
      :empty-text="$t('homepage.listsUnavailable', [$t('homepage.levels')])" extra-action="/browse/lists" content-type="/getLists.php?homepage=1" />

    <ListSection :header-name="$t('homepage.pinned')" :empty-text="$t('homepage.noListsPinned')"
      content-type="@pinnedLists" :max-items="5" />

    <ListSection v-if="isLoggedIn" :header-name="$t('homepage.uploaded')" :extra-text="$t('homepage.more')"
      extra-icon="more" extra-action="/browse/lists?type=user" :empty-text="$t('homepage.noListsUploaded')"
      content-type="/getLists.php?homeUser" />

    <ListSection :header-name="$t('homepage.visited')" :extra-text="$t('homepage.clear')" extra-icon="trash"
      extra-action="@clear" :empty-text="$t('homepage.noListsVisited')" content-type="@recentlyViewed" />

    <ListSection :header-name="$t('homepage.savedMix')" :extra-text="$t('homepage.more')" extra-icon="more"
      :empty-text="$t('homepage.noLevelsSaved')" content-type="@favorites" extra-action="/saved" :randomize-content="true"
      :list-type="1" />

    <ListSection :header-name="$t('homepage.official')" :empty-text="$t('homepage.listsNonexistent')"
      content-type="oldLists" />
  </main>
</template>