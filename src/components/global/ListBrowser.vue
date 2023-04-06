<script setup lang="ts">
import type { ListPreview } from "@/interfaces";
import ListPrevElement from "@/components/global/ListPreview.vue";
import axios, { type AxiosResponse } from "axios";
import { ref, onMounted } from "vue";
import FavoritePreview from "./FavoritePreview.vue";

const props = defineProps({
  browserName: String,
  search: String,
  onlineBrowser: { type: Boolean, required: true },
});

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
const PAGE = ref<number>(0);
const maxPages = ref<number>(1);
const pagesArray = ref<number[]>(listScroll());
const LISTS = ref<ListPreview[]>();
const SEARCH_QUERY = ref<string>(props.search ?? "");

function switchPage(setPage: number) {
  if (setPage < 0 || setPage >= maxPages.value) return;
  PAGE.value = setPage;

  pagesArray.value = listScroll();
  refreshBrowser();
}

function doSearch() {
  searchNoResults.value = false;
  refreshBrowser();
}

function refreshBrowser() {
  // document.querySelectorAll(".listPreviews").forEach((previews: Element) => previews.remove())

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

onMounted(() => {
  if (props.onlineBrowser) refreshBrowser();
  else {
    // Hardcoded for now, maybe change later
    LISTS.value = JSON.parse(localStorage.getItem("favorites")!);
    maxPages.value = Math.ceil(LISTS.value?.length! / LISTS_ON_PAGE);
    pagesArray.value = listScroll();
  }
});
</script>

<template>
  <section class="mx-auto w-[80rem] max-w-[95vw] translate-y-16 text-white">
    <h2 class="text-center text-3xl">{{ browserName }}</h2>

    <main class="mt-3">
      <header class="flex justify-center gap-3" v-show="false">
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
          <img class="w-7 p-1" src="@/images/hidden.svg" alt="" />
        </button>
      </header>
      <header
        class="flex justify-between gap-3 max-sm:flex-col max-sm:items-center"
      >
        <form
          action=""
          class="flex items-center gap-2"
          @submit.prevent="doSearch"
        >
          <input
            v-model="SEARCH_QUERY"
            type="text"
            max="30"
            class="h-11 w-64 rounded-full bg-white bg-opacity-10 px-3 text-xl"
            placeholder="Hledat..."
          />
          <button
            type="submit"
            class="box-border rounded-full bg-greenGradient"
          >
            <img src="@/images/searchOpaque.svg" alt="" class="w-11 p-2" />
          </button>
        </form>
        <div class="flex items-center gap-2" v-if="maxPages > 1">
          <button class="button mr-2" @click="switchPage(PAGE - 1)">
            <img src="@/images/showCommsL.svg" class="w-4" alt="" />
          </button>
          <button
            class="button w-8 rounded-md bg-white bg-opacity-5"
            :class="{ 'bg-greenGradient': PAGE == 0 }"
            @click="switchPage(0)"
          >
            1
          </button>
          <hr
            v-if="PAGE > 3"
            class="h-4 w-1 rounded-full border-none bg-greenGradient"
          />
          <button
            class="button w-8 rounded-md bg-white bg-opacity-5"
            :class="{ 'bg-greenGradient': index - 1 == PAGE }"
            @click="switchPage(index - 1)"
            v-for="index in pagesArray"
          >
            {{ index }}
          </button>
          <hr
            v-if="PAGE < maxPages - 4"
            class="h-4 w-1 rounded-full border-none bg-greenGradient"
          />
          <button
            v-if="maxPages > 4"
            class="button w-8 rounded-md bg-white bg-opacity-5"
            :class="{ 'bg-greenGradient': PAGE == maxPages - 1 }"
            @click="switchPage(maxPages - 1)"
          >
            {{ maxPages }}
          </button>
          <button class="button ml-2" @click="switchPage(PAGE + 1)">
            <img src="@/images/showComms.svg" class="w-4" alt="" />
          </button>
        </div>
      </header>
      <main class="mt-6 flex flex-col items-center gap-3">
        <div
          v-if="searchNoResults"
          class="flex flex-col items-center justify-center gap-3"
        >
          <img src="@/images/searchOpaque.svg" alt="" class="w-48 opacity-25" />
          <p class="text-xl opacity-90">Žádné výsledky!</p>
        </div>
        <div
          v-if="loadFailed"
          class="flex flex-col items-center justify-center gap-3"
        >
          <img src="@/images/listError.svg" alt="" class="w-48 opacity-25" />
          <p class="text-xl opacity-90">Nepodařilo se načíst obsah!</p>
          <button
            class="button flex items-center gap-3 rounded-md bg-greenGradient px-2"
          >
            <img src="@/images/replay.svg" class="w-10 text-2xl" alt="" />Načíst
            znova
          </button>
        </div>
        <component
          :is="onlineBrowser ? ListPrevElement : FavoritePreview"
          class="listPreviews min-w-full"
          v-for="list in LISTS"
          v-bind="list"
        ></component>
      </main>
    </main>
  </section>
</template>
