<script setup lang="ts">
import ListSection from "./homepage/ListSection.vue";
import LoginButton from "./global/LoginButton.vue";
import { computed, ref, watch } from "vue";
import { SETTINGS, hasLocalStorage, loggedIn, viewedPopups } from "@/siteSettings";
import THEMES, { selectedBeforeSave } from "@/themes";
import axios from "axios";
import { i18n } from "@/locales";

document.title = `${i18n.global.t('other.homepage')} | ${i18n.global.t("other.websiteName")}`;

const columns = computed(() => window.innerWidth > 900 ? '1fr '.repeat(SETTINGS.value.homepageColumns) : '1fr')

const localStorg = ref(hasLocalStorage())

const base = import.meta.env.BASE_URL
const api = import.meta.env.VITE_API
const headerBG = ref(`url(${base}/graphics/${THEMES[SETTINGS.value.selectedTheme].graphic}.webp)`)
watch(selectedBeforeSave, () => {
  headerBG.value = `url(${base}/graphics/${THEMES[selectedBeforeSave.value].graphic}.webp)`
})

/*
 * Fetching homepage feeds
 */
const feeds = ref()

const getFeeds = async () => {
  if (loggedIn.value == null) return {lists: [], reviews: [], user: []}
  let f = await axios.get(api + "/getLists.php", {
    params: {
      homepage: 1, feeds: [1,1, +loggedIn.value].join(',')}
    }
  )
  
  if (f.status == 200) {
    return f.data
  }
  return {lists: [], reviews: [], user: []}
}

getFeeds().then(e => feeds.value = e)
watch(loggedIn, () => getFeeds().then(e => feeds.value = e), {once: true})

</script>

<template>
  <header :style="{backgroundImage: headerBG}" class="flex flex-col h-[256px] justify-end items-center bg-no-repeat bg-center">
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

  <main id="homepageSections" class="flex flex-col overflow-clip items-start sm:px-2 mx-auto max-w-[100.5rem]">
    <ListSection :header-name="$t('homepage.pinned')" :empty-text="$t('homepage.noListsPinned')"
      content-type="@pinnedLists" :max-items="5" :list-type="3" />
    <ListSection class :header-name="$t('homepage.newestReviews')" :extra-text="$t('homepage.more')" extra-icon="more"
        :empty-text="$t('homepage.listsUnavailable', [$t('homepage.reviews')])" extra-action="/browse/reviews" :force-content="feeds?.['reviews']" :list-type="2" />
    
    <ListSection :header-name="$t('homepage.newest')" :extra-text="$t('homepage.more')" extra-icon="more"
        :empty-text="$t('homepage.listsUnavailable', [$t('homepage.levels')])" extra-action="/browse/lists" :force-content="feeds?. ['lists']" />

    <ListSection v-if="loggedIn" :header-name="$t('homepage.uploaded')" :extra-text="$t('homepage.more')"
        extra-icon="more" extra-action="/browse/lists?type=user" :empty-text="$t('homepage.noListsUploaded')"
        :force-content="feeds?.['user']" :list-type="2" />

    <ListSection :header-name="$t('homepage.visited')" :extra-text="$t('homepage.clear')" extra-icon="trash" :max-items="4"
      extra-action="@clear" :list-type="2" :empty-text="$t('homepage.noListsVisited')" content-type="@recentlyViewed" />

    <ListSection :header-name="$t('homepage.savedMix')" :extra-text="$t('homepage.more')" extra-icon="more" :max-items="4"
      :empty-text="$t('homepage.noLevelsSaved')" content-type="@favorites" extra-action="/saved" :randomize-content="true"
      :list-type="1" />

    <ListSection :header-name="$t('homepage.official')" :empty-text="$t('homepage.listsNonexistent')"
      content-type="oldLists" />
  </main>
</template>