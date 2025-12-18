<script setup lang="ts">
import type { FavoritedLevel, Level, ListCreatorInfo, ListPreview, ReviewDetailsResponse, SavedCollab, selectedList } from "@/interfaces";
import axios, { type AxiosResponse } from "axios";
import { ref, onMounted, watch } from "vue";
import cookier from "cookier";
import { hasLocalStorage, SETTINGS } from "@/siteSettings";
import { useI18n } from "vue-i18n";
import { isOnline, makeColor } from "@/Editor";
import { onUnmounted } from "vue";

const emit = defineEmits<{
  (e: "switchBrowser", browser: "" | "user" | "hidden" | "collabs"): void;
  (e: "refreshedBrowser", objectAmount: number): void;
  (e: "selectedPostOption", data: [selectedList, string]): void;
}>();

const props = defineProps<{
  browserName: string
  search: string
  onlineBrowser: boolean
  onlineType: string
  onlineSubtype: string
  isLoggedIn: boolean
  hideSearch: boolean
  hideTabs: boolean
  commentID: {type: 'list' | 'review', objectID: number}
  refreshButton: boolean
  component: object
  picking: false | 1 | 2
  displayInRows: boolean
}>()

// Page title
if (props.browserName) {
  document.title = `${props.browserName} | ${useI18n().t('other.websiteName')}`;
}

const scrollingStart = (i: number) => i + 2;
const scrollingBetween = (i: number) => i + PAGE.value! - 1;
const scrollingEnd = (i: number) => maxPages.value - (5 - i);
const listScroll = () =>
  Array.from({ length: Math.min(5, maxPages.value - 1) }, (_, i) =>
    PAGE.value! >= 3 && maxPages.value > 6
      ? PAGE.value! < maxPages.value - 4
        ? scrollingBetween(i)
        : scrollingEnd(i)
      : scrollingStart(i)
  );

const loadFailed = ref<boolean>(false);
const searchNoResults = ref<boolean>(false);
const loading = ref<boolean>(false)
const unrolled = ref<boolean>(-1)

const LISTS_ON_PAGE = 9;
const PAGE = ref<number>((parseInt(new URLSearchParams(window.location.search).get("p")!) || 1) - 1);
const maxPages = ref<number>(1);
const pagesArray = ref<number[]>(listScroll());
const USERS = ref<ListCreatorInfo[]>([]);
const LISTS = ref<ListPreview[]>([]);
const REVIEW_DETAILS = ref<ReviewDetailsResponse[]>([]);
const SEARCH_QUERY = ref<String>(props.search ?? "");

const main = ref<HTMLDivElement>()
function switchPage(setPage: number) {
  if (setPage < 0 || setPage >= maxPages.value) return;
  // LISTS.value = [] // Do not clear when using infinite scrolling
  PAGE.value = setPage;
  // window.history.pushState("", "", `?p=${PAGE.value + 1}`);

  if (!props.picking) {
    window.scrollTo({top: main.value?.offsetTop-100, behavior: "instant"})
  }
  
  pagesArray.value = listScroll();
  refreshBrowser();
}

let filtered; // Search results from offline browsers
const lastSearch = ref("")

watch(SEARCH_QUERY, doSearch())
function doSearch() {
  if (lastSearch.value == SEARCH_QUERY.value) return

  PAGE.value = 0;
  lastSearch.value = SEARCH_QUERY.value
  searchNoResults.value = false;
  LISTS.value = []
  if (!props.onlineBrowser) {
    if (props.onlineType == 'collabs') {
      filtered = favoriteCollabs.filter((x: SavedCollab) => x.collabName.includes(SEARCH_QUERY.value));
    }
    else {  
      filtered = favoriteLevels.filter(x => x.levelName.includes(SEARCH_QUERY.value));
    }

    LISTS.value = filtered.slice(
      PAGE.value * LISTS_ON_PAGE,
      PAGE.value * LISTS_ON_PAGE + LISTS_ON_PAGE
    );

    if (SEARCH_QUERY.value == "") filtered = undefined

    searchNoResults.value = LISTS.value.length == 0
    maxPages.value = Math.ceil(filtered.length / LISTS_ON_PAGE);
    pagesArray.value = listScroll();
    return;
  }

  refreshBrowser();
}

function refreshBrowser() {
  if (!props.onlineBrowser) {
    let hasSearch = [[favoriteLevels, favoriteCollabs], filtered][filtered != undefined | 0]
    let ind = props.onlineType == "collabs" | 0
    LISTS.value = hasSearch[ind].slice(
      LISTS_ON_PAGE * PAGE.value!,
      LISTS_ON_PAGE * PAGE.value! + LISTS_ON_PAGE
    );
    
    maxPages.value = Math.ceil(hasSearch[ind].length / LISTS_ON_PAGE);
    pagesArray.value = listScroll();
    return;
  }
  else if (props.onlineType == "collabs") return

  loading.value = true
  let fetchURI: string
  let fetchQuery: Object
  if (props?.onlineType != 'comments') {
    let listsMod = props.onlineSubtype == 'list' ? LISTS_ON_PAGE : 9
    fetchURI = `${import.meta.env.VITE_API}/getLists.php`
    fetchQuery = {
      startID: 999999,
      searchQuery: SEARCH_QUERY.value,
      page: PAGE.value,
      path: "/getLists.php",
      fetchAmount: listsMod,
      sort: 0,
      type: props.onlineSubtype
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
    }
    if (props.commentID.type == "list") fetchQuery.listID = props.commentID.objectID
    else fetchQuery.reviewID = props.commentID.objectID
  }

  axios
    .get(fetchURI,
      { headers: { Authorization: cookier("access_token").get() }, params: fetchQuery }
    )
    .then((res: AxiosResponse) => {
      if (res.status != 200) {
        loadFailed.value = true;
        loading.value = false
        LISTS.value = [];
        maxPages.value = 0;
        emit("refreshedBrowser", 0)
        return;
      }
      if (res.data == 3) {
        searchNoResults.value = true;
        LISTS.value = [];
        loading.value = false
        maxPages.value = 0;
        emit("refreshedBrowser", 0)
        return;
      }

      // load favorites             
      if (props.onlineSubtype == 'levels') {
        if (!favoriteLevels) {
          favoriteLevels = JSON.parse(localStorage.getItem("favorites")!) || []
          favoriteLevelIDs.value = JSON.parse(localStorage.getItem("favoriteIDs")!) || []
        }
      }

      maxPages.value = res.data[2].maxPage;
      pagesArray.value = listScroll();

      LISTS.value = res.data[0];

      if (props.onlineType == 'comments')
        emit("refreshedBrowser", res.data[2].commAmount)
      else
        emit("refreshedBrowser", LISTS.value.length)
      loading.value = false
      USERS.value = res.data[1];
      REVIEW_DETAILS.value = res.data[4]
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

const favoriteLevel = (level: FavoritedLevel) => {
  if (!hasLocalStorage()) return
  if (favoriteLevelIDs.value.includes(level.levelID)) {
    return removeFavoriteLevel(level.levelID)
  }

  favoriteLevelIDs.value.splice(0, 0, level.levelID)
  favoriteLevels.splice(0, 0, level)

  localStorage.setItem("favorites", JSON.stringify(favoriteLevels));
  localStorage.setItem("favoriteIDs", JSON.stringify(favoriteLevelIDs.value));
}

const removeFavoriteLevel = (levelID: string) => {
  let levelIDs: string[] = JSON.parse(localStorage.getItem("favoriteIDs")!);
  let position = levelIDs.indexOf(levelID);
  favoriteLevels.splice(position, 1);
  favoriteLevelIDs.value.splice(position, 1);
  levelIDs.splice(position, 1);

  localStorage.setItem("favorites", JSON.stringify(favoriteLevels));
  localStorage.setItem("favoriteIDs", JSON.stringify(levelIDs));
  
  if (!props.onlineBrowser) {
    for (let i = 0; i < LISTS.value.length; i++) {
      if (LISTS.value[i].levelID == levelID) {
        LISTS.value.splice(i, 1)
        break
      }
    }
    
    refreshBrowser()
  }


};

const removeCollab = (obj: SavedCollab) => {
  let position = favoriteCollabs.findIndex((x: SavedCollab) => x.timestamp == obj.timestamp)
  let savedCollabIDs = JSON.parse(localStorage.getItem("savedCollabIDs")!)
  favoriteCollabs.splice(position, 1);
  savedCollabIDs.splice(position, 1);

  localStorage.setItem("savedCollabs", JSON.stringify(favoriteCollabs));
  localStorage.setItem("savedCollabIDs", JSON.stringify(savedCollabIDs));

  refreshBrowser()
};


let favoriteLevelIDs = ref<number[]>([]);
let favoriteLevels: FavoritedLevel[];
let favoriteCollabs: any;
if (!props.onlineBrowser) {
  favoriteLevels = JSON.parse(localStorage.getItem("favorites")!) ?? [];
  favoriteCollabs = JSON.parse(localStorage.getItem("savedCollabs")!) ?? [];
}

onMounted(() => {
  if (!props.onlineBrowser && props.onlineType == '') { // saved level not collabs TODO: add collabs
    // Hardcoded for now, maybe change later
    LISTS.value = favoriteLevels.slice(
      LISTS_ON_PAGE * PAGE.value!,
      LISTS_ON_PAGE * PAGE.value! + LISTS_ON_PAGE
    );
    maxPages.value = Math.ceil(favoriteLevels.length! / LISTS_ON_PAGE);
    pagesArray.value = listScroll();
  }
  else if (props.onlineType == "collabs") {
    LISTS.value = favoriteCollabs.slice(
      LISTS_ON_PAGE * PAGE.value!,
      LISTS_ON_PAGE * PAGE.value! + LISTS_ON_PAGE
    );
    maxPages.value = Math.ceil(favoriteCollabs.length! / LISTS_ON_PAGE);
    pagesArray.value = listScroll();
  }

  let gotoPage = [0, 'unknown']
  if (hasLocalStorage()) {
    let pageLast = JSON.parse(sessionStorage.getItem("pageLast")!)
    if (pageLast)
      gotoPage = pageLast
  }
  if (props.onlineType == gotoPage[1]) PAGE.value = gotoPage[0]

  refreshBrowser();
});

// Changing browser types with browser buttons
watch(props, (newBrowser) => {
  LISTS.value = []
  PAGE.value = 0
  unrolled.value = -1
  SEARCH_QUERY.value = props.search
  filtered = undefined
  refreshBrowser();
});

onUnmounted(() => {
  if (hasLocalStorage())
    sessionStorage.setItem("pageLast", JSON.stringify([PAGE.value, props.onlineType]))
})

defineExpose({
  doRefresh
})

</script>

<template>
  <section ref="main" class="mx-auto w-full text-white" :class="{'max-w-[59rem]': onlineType == 'comments', 'max-w-[80rem]': onlineType != 'comments'}">
    <main>
      <div v-if="!hideTabs" class="flex justify-between items-center max-sm:flex-col">
        <header class="flex gap-3 justify-center mb-2" v-show="onlineBrowser" v-if="isLoggedIn">
          <button class="button rounded-md border-[0.1rem] border-solid border-lof-300 focus-within:border-lof-400 px-4 py-0.5"
            :class="{ 'bg-lof-300': onlineType == '' }" @click="emit('switchBrowser', '')">
            {{ $t('other.newest') }}
          </button>
          <button class="button rounded-md border-[0.1rem] border-solid border-lof-300 focus-within:border-lof-400 px-4 py-0.5"
            v-show="onlineSubtype != 'levels'"
            :class="{ 'bg-lof-300': onlineType == 'user' }" @click="emit('switchBrowser', 'user')">
            {{ $t('other.myLists', [onlineSubtype == 'lists' ? $t('other.lists') : $t('other.reviews')]) }}
          </button>
          <button class="button box-border rounded-md border-[0.1rem] border-solid border-lof-300 focus-within:border-lof-400"
            v-show="onlineSubtype != 'levels'"
            :class="{ 'bg-lof-300': onlineType == 'hidden' }" @click="emit('switchBrowser', 'hidden')">
            <img class="p-1 w-7" src="@/images/hidden.svg" alt="" />
          </button>
        </header>
        <header class="flex gap-3 justify-center mb-3" v-if="!onlineBrowser">
          <button class="button rounded-md border-[0.1rem] border-solid border-lof-300 focus-within:border-lof-400 px-4 py-0.5"
            :class="{ 'bg-lof-300': onlineType == '' }" @click="emit('switchBrowser', '')">
            {{ $t('editor.levels') }}
          </button>
          <button class="button rounded-md border-[0.1rem] border-solid border-lof-300 focus-within:border-lof-400 px-4 py-0.5"
            :class="{ 'bg-lof-300': onlineType == 'collabs' }" @click="emit('switchBrowser', 'collabs')">
            {{ $t('collabTools.collabs') }}
          </button>
        </header>
        <!-- Search box -->
        <form action="" class="flex items-center" @submit.prevent="doSearch"
          v-if="!hideSearch && (maxPages != 0 || lastSearch != '')">
          <input v-model="SEARCH_QUERY" type="text" max="30" autofocus autocomplete="off"
            class="px-3 w-64 h-8 text-lg bg-white bg-opacity-5 rounded-l-md outline-none focus-within:bg-opacity-10" :placeholder="$t('other.search') + '...'" />
          <button type="submit" class="box-border rounded-r-md bg-lof-300">
            <img src="@/images/searchOpaque.svg" alt="" class="p-1.5 w-8" />
          </button>
        </form>
      </div>
      <main
        class="flex relative flex-col gap-3 items-center mt-4 transition-opacity duration-75 min-h-72"
        :class="{'!grid md:grid-cols-3': !displayInRows && !LISTS.length == 0, 'opacity-60 pointer-events-none': loading, 'md:!grid-cols-2': picking}">
        <!-- No saved levels, hardcoded to offline browsers!!! (fix later) -->
        <div v-if="!onlineBrowser && LISTS.length == 0 && !filtered && onlineType == ''"
          class="flex flex-col gap-3 justify-center items-center">
          <img src="@/images/savedMobHeader.svg" alt="" class="w-48 opacity-25" />
          <p class="min-w-max text-xl opacity-90">{{ $t('other.noSavedLevels') }}</p>
          <RouterLink to="/random">
            <button class="flex gap-3 items-center px-2 rounded-md button bg-greenGradient">
              <img src="@/images/dice.svg" class="box-border p-1 w-10 text-2xl" alt="" />{{ $t('listViewer.goToRandom') }}
            </button>
          </RouterLink>
        </div>

        <!-- No saved collabs -->
        <div v-else-if="!onlineBrowser && LISTS.length == 0 && !filtered && onlineType == 'collabs'"
          class="flex flex-col gap-3 justify-center items-center">
          <img src="@/images/collabDudes.svg" alt="" class="w-72 opacity-25" />
          <div class="text-center">
          <p class="min-w-max text-xl opacity-90">{{ $t('collabTools.noSaved') }}</p>
            <p class="text-sm opacity-70">{{ $t('collabTools.noSavedSub') }}</p>
          </div>
          <RouterLink to="/make/list">
            <button class="flex gap-3 items-center px-2 rounded-md button bg-greenGradient">
              <img src="@/images/editorMobHeader.svg" class="box-border p-1 w-10 text-2xl" alt="" />{{
                $t('collabTools.startBuilding') }}
            </button>
          </RouterLink>
        </div>

        <!-- No results BG -->
        <div v-else-if="searchNoResults && LISTS.length == 0 && !loading"
          class="flex absolute top-0 left-1/2 flex-col gap-3 justify-center items-center -translate-x-1/2">
          <img src="@/images/searchOpaque.svg" alt="" class="w-48 opacity-25" />
          <p class="min-w-max text-xl opacity-90">{{ $t('other.noSearchResults') }}</p>
        </div>

        <!-- Loading error BG -->
        <div v-else-if="loadFailed && !loading" class="flex absolute top-0 left-1/2 flex-col gap-3 justify-center items-center -translate-x-1/2">
          <img src="@/images/listError.svg" alt="" class="w-48 opacity-25" />
          <p class="min-w-max text-xl opacity-90">{{ $t('other.failedLoad') }}</p>
          <button class="flex gap-3 items-center px-2 rounded-md button bg-greenGradient" @click="refreshBrowser()">
            <img src="@/images/replay.svg" class="p-1 w-10 text-2xl" alt="" />{{ $t('other.reload') }}
          </button>
        </div>

        <!-- Loading -->
        <div v-else-if="loading" class="flex absolute left-1/2 z-10 flex-col gap-4 items-center mt-24 drop-shadow-lg -translate-x-1/2">
          <img src="@/images/loading.webp" alt="" class="w-24 opacity-80 animate-spin">
          <p class="min-w-max text-xl text-opacity-80">{{ $t('other.loading') }}...</p>
        </div>

        <!-- No lists/comments BG -->
        <div v-else-if="LISTS.length == 0 && !searchNoResults && !loading"
          class="flex absolute top-0 left-1/2 flex-col gap-3 justify-center items-center -translate-x-1/2">

          <div class="flex flex-col gap-6 items-center" v-if="onlineType != 'comments'">
            <img src="@/images/listEmpty.svg" alt="" class="w-48 opacity-25" />
            <p class="min-w-max text-xl opacity-90">{{ $t('other.noListsHere') }}</p>
          </div>

          <div class="flex flex-col gap-6 items-center" v-else>
            <img src="@/images/noComments.svg" alt="" class="w-48 opacity-25" />
            <p class="min-w-max text-xl opacity-90">{{ $t('other.noCommentsHere') }}</p>
          </div>

          <button class="flex gap-3 items-center px-2 rounded-md button bg-greenGradient" @click="refreshBrowser()">
            <img src="@/images/replay.svg" class="box-border p-1 w-10 text-2xl" alt="" id="listRefreshButton" />{{
              $t('other.reload') }}
          </button>
        </div>

        <component
          :is="component"
          v-for="(list, index) in LISTS" v-bind="list"
          class="min-w-full listPreviews"
          :key="list?.name ?? list?.levelName ?? list?.comID ?? PAGE"
          :in-use="false"
          :on-saves-page="true"
          :coll-index="index"
          :save="list"
          :user-array="USERS"
          :index="index"
          :hide-remove="onlineBrowser"
          :unrolled-options="unrolled == index"
          :disable-link="picking"
          :review-details="REVIEW_DETAILS"
          :is-pinned="false"
          :favorited="favoriteLevelIDs.includes(list.levelID)"
          :is-list="onlineSubtype == 'lists'"
          :disable-fave="picking"
          @clicked-option="emit('selectedPostOption', [$event, list.name])"
          @selected="unrolled = (unrolled == -1 || index != unrolled) ? index : -1"
          @remove-level="removeFavoriteLevel"
          @remove-collab="removeCollab"
          @favorite="favoriteLevel"
        />

        </main>
        <!-- Page Switcher -->
        <div class="flex gap-2 items-center mx-auto mt-2 w-max" v-if="maxPages > 1 && !loading && !picking">
          <button class="mr-2 button" @click="switchPage(PAGE! - 1)">
            <img src="@/images/showCommsL.svg" class="w-4" alt="" />
          </button>
          <button class="w-8 bg-white bg-opacity-5 rounded-md button" :class="{ 'bg-greenGradient': PAGE == 0 }"
            @click="switchPage(0)">
            1
          </button>

          <hr v-if="PAGE! > 3 && maxPages > 6" class="w-1 h-4 rounded-full border-none bg-greenGradient" />

          <button class="w-8 bg-white bg-opacity-5 rounded-md button" :class="{ 'bg-greenGradient': index - 1 == PAGE }"
            @click="switchPage(index - 1)" v-for="index in pagesArray">
            {{ index }}
          </button>

          <hr v-if="PAGE! < maxPages - 4 && maxPages > 6" class="w-1 h-4 rounded-full border-none bg-greenGradient" />

          <!-- Last page -->
          <button v-if="maxPages > 6" class="w-8 bg-white bg-opacity-5 rounded-md button"
            :class="{ 'bg-greenGradient': PAGE == maxPages - 1 }" @click="switchPage(maxPages - 1)">
            {{ maxPages }}
          </button>

          <!-- Page +1 -->
          <button class="ml-2 button" @click="switchPage(PAGE! + 1)">
            <img src="@/images/showComms.svg" class="w-4" alt="" />
          </button>
      </div>
      <div v-if="maxPages > 1 && !loading && picking" class="flex">
        <div class="grid grid-cols-2 w-full">
          <button :disabled="PAGE == 0" @click="switchPage(PAGE! - 1)" class="flex gap-2 justify-center p-1 mx-4 my-2 bg-black bg-opacity-40 rounded-md disabled:opacity-20 hover:bg-opacity-60 grow">
            <img src="@/images/showCommsL.svg" alt="" class="w-2">
            {{ $t('other.prevP') }}
          </button>
          <button :disabled="PAGE == maxPages - 1" @click="switchPage(PAGE! + 1)" class="flex gap-2 justify-center p-1 mx-4 my-2 bg-black bg-opacity-40 rounded-md disabled:opacity-20 hover:bg-opacity-60 grow">
          <img src="@/images/showComms.svg" alt="" class="w-2">
            {{ $t('other.nextP') }}
          </button>
        </div>
      </div>
    </main>
  </section>
</template>
