<script setup lang="ts">
import type { FavoritedLevel, ListPreview } from "@/interfaces";
import ListPrevElement from "@/components/global/ListPreview.vue";
import axios, { type AxiosResponse } from "axios";
import { ref, onMounted } from "vue";
import FavoritePreview from "./FavoritePreview.vue";

const props = defineProps({
  browserName: String,
  search: String,
  onlineBrowser: { type: Boolean, required: true },
});

document.title = `${props.browserName} | GD Seznamy`

const scrollingStart = (i: number) => i + 2;
const scrollingBetween = (i: number) => i + PAGE.value - 1;
const scrollingEnd = (i: number) => maxPages.value - (5 - i);
const listScroll = () =>
  Array.from({ length: Math.min(5, maxPages.value - 1) }, (_, i) =>
    PAGE.value >= 3 && maxPages.value > 4
      ? PAGE.value < maxPages.value - 4
        ? scrollingBetween(i)
        : scrollingEnd(i)
      : scrollingStart(i)
  );

const loadFailed = ref<boolean>(false);
const searchNoResults = ref<boolean>(false);

const LISTS_ON_PAGE = 8;
const PAGE = ref<number>((new URLSearchParams(window.location.search).get("p") || 1)-1);
const maxPages = ref<number>(1);
const pagesArray = ref<number[]>(listScroll());
const LISTS = ref<ListPreview[]>();
const SEARCH_QUERY = ref<string>(props.search ?? "");

function switchPage(setPage: number) {
  if (setPage < 0 || setPage >= maxPages.value) return;
  PAGE.value = setPage;
  window.history.pushState("", "", `?p=${PAGE.value+1}`);

  pagesArray.value = listScroll();
  refreshBrowser();
}

let filtered // Search results from offline browsers
function doSearch() {
  PAGE.value = 0
  searchNoResults.value = false;
  if (!props.onlineBrowser) {

    // Stop using filtered array
    if (SEARCH_QUERY.value == "") {
      filtered = []
      return
    }

    filtered = favoriteLevels.filter(x => x.levelName.includes(SEARCH_QUERY.value))

    LISTS.value = filtered.slice(PAGE.value*LISTS_ON_PAGE, PAGE.value*LISTS_ON_PAGE+LISTS_ON_PAGE)
    maxPages.value = Math.ceil(filtered.length / LISTS_ON_PAGE)
    pagesArray.value = listScroll()
    return
  }

  refreshBrowser();
}

function refreshBrowser() {
  // document.querySelectorAll(".listPreviews").forEach((previews: Element) => previews.remove())
  if (!props.onlineBrowser) {
    if (filtered) {
      LISTS.value = filtered.slice(LISTS_ON_PAGE*PAGE.value, LISTS_ON_PAGE*PAGE.value+LISTS_ON_PAGE)
      maxPages.value = Math.ceil(filtered.length / LISTS_ON_PAGE)
    }
    else {
      LISTS.value = favoriteLevels.slice(LISTS_ON_PAGE*PAGE.value, LISTS_ON_PAGE*PAGE.value+LISTS_ON_PAGE)
      maxPages.value = Math.ceil(favoriteLevels.length / LISTS_ON_PAGE)
    }
    pagesArray.value = listScroll()
    return
  }

  axios
    .get(
      `http://localhost:8000/php/getLists.php?startID=999999&searchQuery=${SEARCH_QUERY.value}&page=${PAGE.value}&path=%2Fphp%2FgetLists.php&fetchAmount=${LISTS_ON_PAGE}&sort=0`
    )
    .then((res: AxiosResponse) => {
      if (res.status != 200) {
        loadFailed.value = true;
        return;
      }
      if (res.data == 3) {
        searchNoResults.value = true;
        LISTS.value = [];
        maxPages.value = 0;
        return;
      }

      maxPages.value = res.data[2].maxPage;
      pagesArray.value = listScroll();
      LISTS.value = res.data[0];
    })
    .catch(() => (loadFailed.value = true));
}

const removeFavoriteLevel = (levelID: string) => {
  let levelIDs: string[] = JSON.parse(localStorage.getItem('favoriteIDs')!)
  let position = levelIDs.indexOf(levelID)
  favoriteLevels.splice(position, 1)
  levelIDs.splice(position, 1)
  if (filtered) {
    let i = 0
    filtered.forEach(x => {
      if (x.levelID == levelID) filtered.splice(i, 1)
      i++
    })
  }
  
  localStorage.setItem('favorites', JSON.stringify(favoriteLevels))
  localStorage.setItem('favoriteIDs', JSON.stringify(levelIDs))
  refreshBrowser()
}

let favoriteLevels: any
if (!props.onlineBrowser) favoriteLevels = JSON.parse(localStorage.getItem("favorites")!)

onMounted(() => {
  if (props.onlineBrowser) refreshBrowser();
  else {
    // Hardcoded for now, maybe change later
    LISTS.value = favoriteLevels.slice(LISTS_ON_PAGE*PAGE.value, LISTS_ON_PAGE*PAGE.value+LISTS_ON_PAGE);
    maxPages.value = Math.ceil(favoriteLevels.length! / LISTS_ON_PAGE);
    pagesArray.value = listScroll();
  }
});
</script>

<template>
  <section class="mx-auto w-[80rem] max-w-[95vw] translate-y-16 text-white">
    <h2 class="text-3xl text-center">{{ browserName }}</h2>

    <main class="mt-3">
      <header class="flex gap-3 justify-center" v-show="false">
        <button
          class="button rounded-full border-[0.1rem] border-solid border-green-800 bg-greenGradient px-4 py-0.5"
        >
          Nejnovější
        </button>
        <button
          class="button rounded-full border-[0.1rem] border-solid border-green-800 px-4 py-0.5"
        >
          Moje
        </button>
        <button
          class="button box-border rounded-full border-[0.1rem] border-solid border-green-800"
        >
          <img class="p-1 w-7" src="@/images/hidden.svg" alt="" />
        </button>
      </header>
      <header
        class="flex gap-3 justify-between max-sm:flex-col max-sm:items-center"
      >
        <form
          action=""
          class="flex gap-2 items-center"
          @submit.prevent="doSearch"
        >
          <input
            v-model="SEARCH_QUERY"
            type="text"
            max="30"
            class="px-3 w-64 h-11 text-xl bg-white bg-opacity-10 rounded-full"
            placeholder="Hledat..."
          />
          <button
            type="submit"
            class="box-border rounded-full bg-greenGradient"
          >
            <img src="@/images/searchOpaque.svg" alt="" class="p-2 w-11" />
          </button>
        </form>
        <div class="flex gap-2 items-center" v-if="maxPages > 1">
          <button class="mr-2 button" @click="switchPage(PAGE - 1)">
            <img src="@/images/showCommsL.svg" class="w-4" alt="" />
          </button>
          <button
            class="w-8 bg-white bg-opacity-5 rounded-md button"
            :class="{ 'bg-greenGradient': PAGE == 0 }"
            @click="switchPage(0)"
          >
            1
          </button>
          <hr
            v-if="PAGE > 3"
            class="w-1 h-4 rounded-full border-none bg-greenGradient"
          />
          <button
            class="w-8 bg-white bg-opacity-5 rounded-md button"
            :class="{ 'bg-greenGradient': index - 1 == PAGE }"
            @click="switchPage(index - 1)"
            v-for="index in pagesArray"
          >
            {{ index }}
          </button>
          <hr
            v-if="PAGE < maxPages - 4"
            class="w-1 h-4 rounded-full border-none bg-greenGradient"
          />
          <button
            v-if="maxPages > 4"
            class="w-8 bg-white bg-opacity-5 rounded-md button"
            :class="{ 'bg-greenGradient': PAGE == maxPages - 1 }"
            @click="switchPage(maxPages - 1)"
          >
            {{ maxPages }}
          </button>
          <button class="ml-2 button" @click="switchPage(PAGE + 1)">
            <img src="@/images/showComms.svg" class="w-4" alt="" />
          </button>
        </div>
      </header>
      <main class="flex flex-col gap-3 items-center mt-6">
        <div
          v-if="searchNoResults"
          class="flex flex-col gap-3 justify-center items-center"
        >
          <img src="@/images/searchOpaque.svg" alt="" class="w-48 opacity-25" />
          <p class="text-xl opacity-90">Žádné výsledky!</p>
        </div>
        <div
          v-if="loadFailed"
          class="flex flex-col gap-3 justify-center items-center"
        >
          <img src="@/images/listError.svg" alt="" class="w-48 opacity-25" />
          <p class="text-xl opacity-90">Nepodařilo se načíst obsah!</p>
          <button
            class="flex gap-3 items-center px-2 rounded-md button bg-greenGradient"
          >
            <img src="@/images/replay.svg" class="w-10 text-2xl" alt="" />Načíst
            znova
          </button>
        </div>
        <component
          :is="onlineBrowser ? ListPrevElement : FavoritePreview"
          class="min-w-full listPreviews"
          v-for="(list, index) in LISTS"
          v-bind="list"
          @remove-level="removeFavoriteLevel"
        ></component>
      </main>
    </main>
  </section>
</template>
