<script setup lang="ts">
import type { ListCreatorInfo, ListPreview } from "@/interfaces";
import CommentPreview from "@/components/levelViewer/CommentPreview.vue";
import ListPrevElement from "@/components/global/ListPreview.vue";
import axios, { type AxiosResponse } from "axios";
import { ref, onMounted, watch } from "vue";
import FavoritePreview from "./FavoritePreview.vue";
import cookier from "cookier";
import { SETTINGS } from "@/siteSettings";
import { useI18n } from "vue-i18n";

const emit = defineEmits<{
  (e: "switchBrowser", browser: "" | "user" | "hidden"): void;
  (e: "refreshedBrowser", objectAmount: number): void;
}>();

const props = defineProps({
  browserName: String,
  search: String,
  onlineBrowser: { type: Boolean, required: true },
  onlineType: { type: String, default: "", immediate: true },
  isLoggedIn: Boolean,
  hideSearch: {type: Boolean, default: false},
  commentID: {type: String, default: 0},
  refreshButton: {type: Boolean, default: false}
});

// Page title
if (props.browserName) {
  document.title = `${props.browserName} | ${useI18n().t('other.websiteName')}`;
}

// Infinite scrolling / Pages watch
const usingPagesScrolling = ref<boolean>(Boolean(SETTINGS.value.scrolling))
watch(SETTINGS.value, () => {
  usingPagesScrolling.value = Boolean(SETTINGS.value.scrolling)
  PAGE.value = 0
  LISTS.value = []
  refreshBrowser()
})

const scrollingStart = (i: number) => i + 2;
const scrollingBetween = (i: number) => i + PAGE.value! - 1;
const scrollingEnd = (i: number) => maxPages.value - (5 - i);
const listScroll = () =>
  Array.from({ length: Math.min(5, maxPages.value - 1) }, (_, i) =>
    PAGE.value! >= 3 && maxPages.value > 4
      ? PAGE.value! < maxPages.value - 4
        ? scrollingBetween(i)
        : scrollingEnd(i)
      : scrollingStart(i)
  );

const loadFailed = ref<boolean>(false);
const searchNoResults = ref<boolean>(false);
const loading = ref<boolean>(false)

const LISTS_ON_PAGE = 8;
const PAGE = ref<number>(
  usingPagesScrolling.value ? (parseInt(new URLSearchParams(window.location.search).get("p")!) || 1) - 1 : 0
  );
const maxPages = ref<number>(1);
const pagesArray = ref<number[]>(listScroll());
const USERS = ref<ListCreatorInfo[]>([]);
const LISTS = ref<ListPreview[]>([]);
const SEARCH_QUERY = ref<String>(props.search ?? "");

function switchPage(setPage: number) {
  if (setPage < 0 || setPage >= maxPages.value) return;
  if (usingPagesScrolling.value) LISTS.value = [] // Do not clear when using infinite scrolling
  PAGE.value = setPage;
  // window.history.pushState("", "", `?p=${PAGE.value + 1}`);

  pagesArray.value = listScroll();
  refreshBrowser();
}

let filtered; // Search results from offline browsers
function doSearch() {
  PAGE.value = 0;
  searchNoResults.value = false;
  LISTS.value = []
  if (!props.onlineBrowser) {
    filtered = favoriteLevels.filter((x) =>
      x.levelName.includes(SEARCH_QUERY.value)
    );

    LISTS.value = filtered.slice(
      PAGE.value * LISTS_ON_PAGE,
      PAGE.value * LISTS_ON_PAGE + LISTS_ON_PAGE
    );
    maxPages.value = Math.ceil(filtered.length / LISTS_ON_PAGE);
    pagesArray.value = listScroll();
    return;
  }

  refreshBrowser();
}

function refreshBrowser() {
  if (!props.onlineBrowser) {
    let hasSearch = [favoriteLevels, filtered][filtered | 0]
    if (usingPagesScrolling.value) {
      LISTS.value = hasSearch.slice(
        LISTS_ON_PAGE * PAGE.value!,
        LISTS_ON_PAGE * PAGE.value! + LISTS_ON_PAGE
      );
    }
    else {
      hasSearch.slice(
        LISTS_ON_PAGE * PAGE.value!,
        LISTS_ON_PAGE * PAGE.value! + LISTS_ON_PAGE
        ).forEach((x: ListPreview) => LISTS.value!.push(x))
      infiniteListsLoading = false
    }
    maxPages.value = Math.ceil(hasSearch.length / LISTS_ON_PAGE);
    pagesArray.value = listScroll();
    return;
  }
  
  loading.value = true
  let fetchURI: string
  let fetchQuery: Object
  if (props?.onlineType != 'comments') {
    fetchURI = `${import.meta.env.VITE_API}/getLists.php`
    fetchQuery = {
      startID: 999999,
      searchQuery: SEARCH_QUERY.value,
      page: PAGE.value,
      path: "/getLists.php",
      fetchAmount: LISTS_ON_PAGE,
      sort: 0
    }
    if (props?.onlineType) fetchQuery[props.onlineType] = 1
  }
  else {
    fetchURI = `${import.meta.env.VITE_API}/getComments.php`
    fetchQuery = {
      page: PAGE.value,
      startID: 999999,
      path: "/getComments.php",
      fetchAmount: LISTS_ON_PAGE,
      listid: props.commentID
    }
  }

  axios
    .get(fetchURI,
      { headers: { Authorization: cookier("access_token").get() }, params: fetchQuery }
    )
    .then((res: AxiosResponse) => {
      if (res.status != 200) {
        loadFailed.value = true;
        LISTS.value = [];
        maxPages.value = 0;
        emit("refreshedBrowser", 0)
        return;
      }
      if (res.data == 3) {
        searchNoResults.value = true;
        LISTS.value = [];
        maxPages.value = 0;
        emit("refreshedBrowser", 0)
        return;
      }

      maxPages.value = res.data[2].maxPage;
      pagesArray.value = listScroll();

      if (usingPagesScrolling.value) LISTS.value = res.data[0];
      else {
        res.data[0].forEach((x: ListPreview) => LISTS.value!.push(x))
        infiniteListsLoading = false
      }

      emit("refreshedBrowser", LISTS.value.length)
      loading.value = false
      USERS.value?.push(...res.data[1]);
      loadFailed.value = false;
    })
    .catch(e => {
      emit("refreshedBrowser", 0)
      loading.value = false
      LISTS.value = [];
      loadFailed.value = true;
      maxPages.value = 0;
    });
}

const doRefresh = () => {
  PAGE.value = 0
  LISTS.value = []
  loadFailed.value = false
  refreshBrowser()
}

const removeFavoriteLevel = (levelID: string) => {
  let levelIDs: string[] = JSON.parse(localStorage.getItem("favoriteIDs")!);
  let position = levelIDs.indexOf(levelID);
  favoriteLevels.splice(position, 1);
  levelIDs.splice(position, 1);
  for (let i = 0; i < LISTS.value.length; i++) {
    console.table({"id":LISTS.value[i].levelID, "removed": levelID})
    if (LISTS.value[i].levelID == levelID) {
      LISTS.value.splice(i, 1)
      break
    }
  }
  
  localStorage.setItem("favorites", JSON.stringify(favoriteLevels));
  localStorage.setItem("favoriteIDs", JSON.stringify(levelIDs));
};

let favoriteLevels: any;
if (!props.onlineBrowser)
  favoriteLevels = JSON.parse(localStorage.getItem("favorites")!);

onMounted(() => {
  if (props.onlineBrowser) refreshBrowser();
  else {
    // Hardcoded for now, maybe change later
    LISTS.value = favoriteLevels.slice(
      LISTS_ON_PAGE * PAGE.value!,
      LISTS_ON_PAGE * PAGE.value! + LISTS_ON_PAGE
    );
    maxPages.value = Math.ceil(favoriteLevels.length! / LISTS_ON_PAGE);
    pagesArray.value = listScroll();
  }
});

// Changing browser types with browser buttons
watch(props, (newBrowser) => {
  LISTS.value = []
  PAGE.value = 0
  filtered = []
  refreshBrowser();
});

let infiniteListsLoading = false
function infiniteScroll() {
  if (!infiniteListsLoading && !usingPagesScrolling.value) {
    let page = document.documentElement
    if (page.scrollTop+page.clientHeight+page.clientHeight/2 > page.scrollHeight) {
      infiniteListsLoading = true
      switchPage(PAGE.value! + 1)
    }
  }
}

window.addEventListener("scroll", infiniteScroll)
</script>

<template>
  <section class="mx-auto mt-4 w-[80rem] max-w-[95vw] text-white">
    <h2 class="text-3xl text-center">{{ browserName }}</h2>

    <main class="mt-3">
      <header
        class="flex gap-3 justify-center mb-3"
        v-show="onlineBrowser"
        v-if="isLoggedIn"
      >
        <button
          class="button rounded-full border-[0.1rem] border-solid border-green-800 px-4 py-0.5"
          :class="{ 'bg-greenGradient': onlineType == '' }"
          @click="emit('switchBrowser', '')"
        >
          {{ $t('homepage.newest') }}
        </button>
        <button
          class="button rounded-full border-[0.1rem] border-solid border-green-800 px-4 py-0.5"
          :class="{ 'bg-greenGradient': onlineType == 'user' }"
          @click="emit('switchBrowser', 'user')"
        >
          {{ $t('other.myLists') }}
        </button>
        <button
          class="button box-border rounded-full border-[0.1rem] border-solid border-green-800"
          :class="{ 'bg-greenGradient': onlineType == 'hidden' }"
          @click="emit('switchBrowser', 'hidden')"
        >
          <img class="p-1 w-7" src="@/images/hidden.svg" alt="" />
        </button>
      </header>
      <header
        class="flex gap-3 justify-between max-sm:flex-col max-sm:items-center"
        id="browserHeader"
      >

        <!-- Search box -->
        <form
          action=""
          class="flex gap-2 items-center"
          @submit.prevent="doSearch"
          v-if="(!hideSearch && maxPages > 1) || SEARCH_QUERY.length > 0"
        >
          <input
            v-model="SEARCH_QUERY"
            type="text"
            max="30"
            class="px-3 w-64 h-11 text-xl bg-white bg-opacity-10 rounded-full"
            :placeholder="$t('other.search')+'...'"
          />
          <button
            type="submit"
            class="box-border rounded-full bg-greenGradient"
          >
            <img src="@/images/searchOpaque.svg" alt="" class="p-2 w-11" />
          </button>
        </form>

        <!-- Refresh Button -->
        <button class="box-border rounded-md sm:pr-2 button bg-greenGradient" id="listRefreshButton" @click="doRefresh()" v-if="refreshButton && LISTS.length > 0 && !loadFailed">
          <img src="@/images/replay.svg" class="inline p-1 w-10 sm:mr-1" alt=""><label class="max-sm:hidden">{{ $t('other.refresh') }}</label>
        </button>

        <!-- Page Switcher -->
        <div class="flex gap-2 items-center" v-if="maxPages > 1 && usingPagesScrolling">
          <button class="mr-2 button" @click="switchPage(PAGE! - 1)">
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
            v-if="PAGE! > 3"
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
            v-if="PAGE! < maxPages - 4"
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
          <button class="ml-2 button" @click="switchPage(PAGE! + 1)">
            <img src="@/images/showComms.svg" class="w-4" alt="" />
          </button>
        </div>
      </header>
      <main class="flex flex-col gap-3 items-center mt-6">

        <!-- No results BG -->
        <div
          v-if="searchNoResults && LISTS.length == 0 && !loading"
          class="flex flex-col gap-3 justify-center items-center"
        >
          <img src="@/images/searchOpaque.svg" alt="" class="w-48 opacity-25" />
          <p class="text-xl opacity-90">{{ $t('other.noSearchResults') }}</p>
        </div>

        <!-- Loading error BG -->
        <div
          v-else-if="loadFailed && !loading"
          class="flex flex-col gap-3 justify-center items-center"
        >
          <img src="@/images/listError.svg" alt="" class="w-48 opacity-25" />
          <p class="text-xl opacity-90">{{ $t('other.failedLoad') }}</p>
          <button
            class="flex gap-3 items-center px-2 rounded-md button bg-greenGradient"
            @click="refreshBrowser()"
          >
            <img src="@/images/replay.svg" class="w-10 text-2xl" alt="" />{{ $t('other.reload') }}
          </button>
        </div>

        <!-- Loading -->
        <div v-else-if="loading && usingPagesScrolling" class="flex flex-col gap-4 items-center">
          <img src="@/images/loading.webp" alt="" class="w-24 opacity-40 animate-spin">
          <p class="text-xl text-opacity-40">{{ $t('other.loading') }}...</p>
        </div>

        <!-- No lists/comments BG -->
        <div
          v-else-if="LISTS.length == 0 && !searchNoResults && !loading"
          class="flex flex-col gap-3 justify-center items-center"
        >
          
          <div class="flex flex-col gap-6 items-center" v-if="onlineType != 'comments'">
            <img src="@/images/listEmpty.svg" alt="" class="w-48 opacity-25" />
            <p class="text-xl opacity-90">{{ $t('other.noListsHere') }}</p>
          </div>

          <div class="flex flex-col gap-6 items-center" v-else>
            <img src="@/images/noComments.svg" alt="" class="w-48 opacity-25" />
            <p class="text-xl opacity-90">{{ $t('other.noCommentsHere') }}</p>
          </div>

          <button
            class="flex gap-3 items-center px-2 rounded-md button bg-greenGradient"
            @click="refreshBrowser()"
          >
            <img src="@/images/replay.svg" class="w-10 text-2xl" alt="" id="listRefreshButton" />{{ $t('other.reload') }}
          </button>
        </div>

        <!-- Previews -->
        <component
          :is="onlineType == 'comments' ? CommentPreview : (onlineBrowser ? ListPrevElement : FavoritePreview)"
          class="min-w-full listPreviews"
          v-for="(list, index) in LISTS"
          v-bind="list"
          :user-array="USERS"
          :index="index"
          :is-pinned="false"
          @remove-level="removeFavoriteLevel"
          :key="Math.random()"
        />
      </main>
    </main>
  </section>
</template>
