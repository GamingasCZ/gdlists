<script setup lang="ts">
import axios, { type AxiosResponse } from "axios";
import type {
  ListFetchResponse,
  FavoritedLevel,
  ListPreview,
  Level,
} from "@/interfaces";
import CommentSection from "./levelViewer/CommentSection.vue";
import LevelCard from "./global/LevelCard.vue";
// import LevelCardPC from "./global/LevelCardPC.vue";
import SharePopup from "./global/SharePopup.vue";
import ListDescription from "./levelViewer/ListDescription.vue";
import { ref, onMounted, watch, onUnmounted, computed } from "vue";
import { modifyListBG } from "@/Editor";
import chroma, { hsl } from "chroma-js";
import PickerPopup from "./global/PickerPopup.vue";
import router from "@/router";
import MobileExtras from "./levelViewer/MobileExtras.vue";
import { useI18n } from "vue-i18n";
import LikePopup from "./levelViewer/LikePopup.vue";
import ListBackground from "./global/ListBackground.vue";
import GuessingFinished from "./levelViewer/GuessingFinished.vue";
import DiffGuesserHelpDialog from "./levelViewer/DiffGuesserHelpDialog.vue";
import { viewedPopups } from "@/siteSettings";
import ListUploadedDialog from "./levelViewer/ListUploadedDialog.vue";

const props = defineProps({
  listID: { type: String, required: false },
  randomList: Boolean,
});

onUnmounted(() => {
  document.body.style.backgroundImage = '';
});

let gdlists = useI18n().t('other.websiteName')

watch(props, () => main())
onMounted(() => main())

// other way around bruh (private list=false, public=true)
let PRIVATE_LIST: boolean =
  props.randomList ? false : props?.listID?.match(/^\d+$/g)?.length == 1;

const favoritedIDs = ref<string[] | null>();

let addIntoRecentlyViewed = false;
let recentlyViewed: ListPreview[];

const LIST_DATA = ref<ListFetchResponse>({ data: { levels: [] } });
const LIST_CREATOR = ref<string>("");
const LIST_CREATORDATA = ref<{username: string, discord_id: string, avatar_hash: string} | false>()
const LIST_COL = ref<number[]>([0, 0, 0]);
const LEVEL_COUNT = ref(0)

const nonexistentList = ref<boolean>(false)
function main() {
  let listURL = `${!PRIVATE_LIST ? "pid" : "id"}=${props?.listID}`;
  if (props.randomList) {
    listURL = "random";
    PRIVATE_LIST = true
  }

  nonexistentList.value = false

  axios
    .get(import.meta.env.VITE_API + "/getLists.php?" + listURL)
    .then((res: AxiosResponse) => {
      if (res.data == 2) {
        nonexistentList.value = true
        return
      }

      LIST_DATA.value = res.data[0];
      LIST_CREATOR.value = LIST_DATA.value?.creator! || res.data[1][0].username;
      LIST_CREATORDATA.value = res.data[1]?.[0]

      // Use new levelList structure (put levels into 'levels' array)
      if (!LIST_DATA.value?.data.levels) {
        LIST_DATA.value!.data.levels = [];
        Object.keys(LIST_DATA.value?.data!)
          .filter((x: string) => x.match(/\d+/g))
          .forEach((level: string) => {
            LIST_DATA.value?.data.levels.push(LIST_DATA.value.data[level]);
          });
      }

      if (localStorage != undefined) {
        favoritedIDs.value = JSON.parse(localStorage.getItem("favoriteIDs")!);
        recentlyViewed = JSON.parse(localStorage.getItem("recentlyViewed")!) ?? [];

        addIntoRecentlyViewed =
          recentlyViewed.filter((list: ListPreview) => list.id == (!PRIVATE_LIST ? LIST_DATA.value?.hidden! : LIST_DATA.value?.id!))
            .length == 0; // Has not been viewed yet
      }

      if (addIntoRecentlyViewed) {
        recentlyViewed.push({
          creator: LIST_CREATOR.value,
          id: (!PRIVATE_LIST ? LIST_DATA.value?.hidden! : LIST_DATA.value?.id!).toString(),
          name: LIST_DATA.value?.name!,
          uploadDate: Date.now(),
          hidden: "0",
        });
        if (recentlyViewed.length == 10) recentlyViewed.splice(0, 1); // Gets sliced to 3 on homepage
        localStorage.setItem("recentlyViewed", JSON.stringify(recentlyViewed));
      }

      document.title = `${LIST_DATA.value?.name} | ${gdlists}`;

      // Set list colors
      let listColors: [number, number, number] | string = LIST_DATA.value?.data.pageBGcolor!;
      if (typeof listColors == "object") listColors[2] /= 64
      else { listColors = chroma(listColors).hsl() }
      LIST_COL.value = listColors
      
      // Saturation 0
      if (LIST_COL.value[0] == null) LIST_COL.value[0] = 0

      if (LIST_COL.value != undefined && !isNaN(LIST_COL.value[0]))
        modifyListBG(LIST_COL.value);

      // Check pinned status
      if (localStorage) {
        JSON.parse(localStorage.getItem("pinnedLists")!).forEach((pin: ListPreview) => {
          if ([LIST_DATA.value.id, LIST_DATA.value.hidden].includes(pin.id!)) listPinned.value = true
        });
      }

      // Set difficulty guessing
      guessHelpOpened.value = localStorage && !viewedPopups.diffGuesserHelp && LIST_DATA.value.diffGuesser
      LEVEL_COUNT.value = LIST_DATA.value.data.levels.length
      if (LIST_DATA.value.data.diffGuesser?.[0] && !isJumpingFromFaves) cardGuessing.value = 0
    });

}

let isJumpingFromFaves = new URLSearchParams(window.location.search).get(
  "goto"
);
const tryJumping = (ind: number, forceJump = false) => {
  if (forceJump) {
    isJumpingFromFaves = ind.toString();
    jumpToPopupOpen.value = false;
    cardGuessing.value = -1
  }
  
  if (isJumpingFromFaves && parseInt(isJumpingFromFaves) == ind) {
    cardGuessing.value = -1
    let jumpedToCard = document.querySelectorAll(".levelCard");

    if (parseInt(isJumpingFromFaves) > 1) {
      jumpedToCard[
        Math.max(0, parseInt(isJumpingFromFaves) - 2)
      ].scrollIntoView();
    }
    (
      jumpedToCard[Math.max(0, parseInt(isJumpingFromFaves))] as HTMLDivElement
    ).style.animation = "flash 0.8s linear forwards";
  }
};

const windowHeight = ref(window.innerHeight)
const cardGuessing = ref(-1)
const guesses = ref<number[]>([])
const guessHelpOpened = ref(false)
const doNextGuess = (result: number) => {
  cardGuessing.value += 1
  guesses.value.push(result)

  let guessingCardElement = document.querySelector(`.levelCard:nth-child(${cardGuessing.value})`) as HTMLDivElement
  window.scrollTo({top: guessingCardElement.offsetTop-windowHeight.value/2+128, behavior: "smooth"})
}

const listPinned = ref<boolean>(false)
const toggleListPin = () => {
  if (localStorage) {
    let pinned: ListPreview[] = JSON.parse(localStorage.getItem('pinnedLists')!)
    if (listPinned.value) { // Remove from pinned
      let i = 0
      pinned.forEach((pin: ListPreview) => {
        if (pin.id == LIST_DATA.value.id) pinned.splice(i, 1)
        i++
      })
    }
    else {
      pinned.push({
        name: LIST_DATA.value.name,
        creator: LIST_CREATOR.value,
        uploadDate: Date.now(),
        id: LIST_DATA.value.id,
        hidden: LIST_DATA.value.hidden,
        isPinned: true
      })
    }
    if (pinned.length > 5) { // Remove last pinned level
      pinned.splice(0, 1)
    }

    listPinned.value = !listPinned.value
    localStorage.setItem("pinnedLists", JSON.stringify(pinned))
  }
}

const getURL = () => `${window.location.host}/gdlists/s/${!PRIVATE_LIST ? LIST_DATA.value?.hidden! : LIST_DATA.value?.id!}`;
const sharePopupOpen = ref(false);
const jumpToPopupOpen = ref(false);
const commentsShowing = ref(false)
const mobileExtrasOpen = ref(false)
const likeNotLoggedInOpen = ref(false)
const uploadedDialogShown = ref(0)
if (sessionStorage) {
  let uploadKey = sessionStorage.getItem("uploadFinished")
  if (uploadKey != null) {
    uploadedDialogShown.value = parseInt(uploadKey) // 1 - upload, 2 - update
    sessionStorage.removeItem("uploadFinished")
  }
}

const listActions = (action: string) => {
  switch (action) {
    case "comments":
      commentsShowing.value = !commentsShowing.value;
      break;
    case "sharePopup":
      sharePopupOpen.value = true;
      break;
    case "jumpPopup":
      jumpToPopupOpen.value = true;
      break;
    case "pinList":
      toggleListPin()
      break;
    case "editList":
      router.push(`/${!PRIVATE_LIST ? LIST_DATA.value?.hidden! : LIST_DATA.value?.id!}/edit`)
      break;
    case "mobileExtras":
      mobileExtrasOpen.value = true
      break;
    case "rateNotLoggedIn":
      likeNotLoggedInOpen.value = true
      break;
  }
};

</script>

<template>
  <div v-if="LIST_DATA?.data.titleImg?.[4]" :style="{
    backgroundImage: `linear-gradient(#00000040, transparent)`,
  }" class="absolute w-full h-full -z-20"></div>

  <Transition name="fade"><LikePopup v-if="likeNotLoggedInOpen" @close-popup="likeNotLoggedInOpen = false" /></Transition>
  <SharePopup v-show="sharePopupOpen" @close-popup="sharePopupOpen = false" :share-text="getURL()" />
  <PickerPopup @select-option="tryJumping(LIST_DATA?.data.levels.indexOf($event)!, true)" v-show="jumpToPopupOpen"
    picker-data-type="level" :picker-data="LIST_DATA.data.levels" @close-popup="jumpToPopupOpen = false"
    :browser-name="$t('listViewer.jumpTo')" :outer-error="cardGuessing > -1 && cardGuessing < LEVEL_COUNT" :outer-error-text="$t('listViewer.noGuessJumping')"/>

  <!-- Mobile options popup -->
  <MobileExtras v-if="mobileExtrasOpen" @do-list-action="listActions" @close-popup="mobileExtrasOpen = false" :list-pinned="listPinned"/>

  <DiffGuesserHelpDialog v-if="guessHelpOpened" @close-popup="guessHelpOpened = false"/>
  <Transition name="fade">
    <ListUploadedDialog
      v-if="LIST_DATA.name != undefined && uploadedDialogShown"
      :list-i-d="!PRIVATE_LIST ? LIST_DATA?.hidden : LIST_DATA?.id.toString()"
      :is-updating="uploadedDialogShown == 2"
      @do-edit="listActions('editList')"
      @close-popup="uploadedDialogShown = 0"
    />
  </Transition>

  <section class="mt-12 text-white">
    <header>
      <div class=""></div>
      <ListDescription @do-list-action="listActions" v-bind="LIST_DATA" :creator="LIST_CREATOR" :creator-data="LIST_CREATORDATA!"
        :id="!PRIVATE_LIST ? LIST_DATA?.hidden : LIST_DATA?.id.toString()" :list-pinned="listPinned" class="mb-8"
        v-if="LIST_DATA.name != undefined && !nonexistentList" />
    </header>
    <main class="flex flex-col gap-4">

      <!-- Nonexistent list -->
      <section v-if="nonexistentList" class="flex flex-col items-center my-20 text-white">
        <img src="@/images/listError.svg" class="w-56 opacity-60" alt="">
        <h2 class="mt-2 text-2xl font-bold opacity-60">{{ $t('listViewer.nonexistentList') }}</h2>
        <div class="flex gap-3 mt-5 max-sm:flex-col">
          <RouterLink to="/random">
            <button class="p-2 w-full rounded-md bg-greenGradient button"><img src="@/images/dice.svg" class="inline mr-3 w-8"
                alt="">{{ $t('listViewer.goToRandom') }}</button>
          </RouterLink>
          <RouterLink to="/">
            <button class="p-2 w-full text-left rounded-md bg-greenGradient button"><img src="@/images/browseMobHeader.svg"
                class="inline mr-3 w-8" alt="">{{ $t('listViewer.goHome') }}</button>
          </RouterLink>
        </div>
      </section>

      <Teleport to="#app">
        <ListBackground :image-data="LIST_DATA.data.titleImg ?? []" :list-color="LIST_COL" />
      </Teleport>

      <!-- List -->
      <LevelCard v-for="(level, index) in LIST_DATA?.data.levels.slice(0, cardGuessing == -1 ? LEVEL_COUNT : cardGuessing+1)"
        class="levelCard"
        :style="{animationDelay: `${LIST_DATA?.diffGuesser ? 0 : index/25}s`}"
        v-show="!commentsShowing"
        v-bind="level"
        :favorited="favoritedIDs?.includes(level.levelID!)"
        :level-index="index"
        :list-i-d="!PRIVATE_LIST ? LIST_DATA?.hidden : LIST_DATA?.id.toString()"
        :list-name="LIST_DATA?.name!"
        :translucent-card="LIST_DATA?.data.translucent!" 
        :disable-stars="false" 
        :guessing-now="cardGuessing == index"
        :diff-guess-array="LIST_DATA.data.diffGuesser ?? [false, false, false]"
        @vnode-mounted="tryJumping(index)"
        @next-guess="doNextGuess($event)"
      />

      <!-- Guessing bottom padding -->
      <div :style="{height: `${windowHeight}px`}" class="w-4" v-if="LIST_DATA.diffGuesser && cardGuessing != -1 && cardGuessing != LEVEL_COUNT && !commentsShowing"></div>

      <GuessingFinished
        v-if="LIST_DATA?.id != undefined && cardGuessing == LEVEL_COUNT && !commentsShowing"
        :guesses="guesses"
        :list-creator="LIST_CREATOR"
        :list-name="LIST_DATA.name"
        :list-i-d="!PRIVATE_LIST ? LIST_DATA?.hidden: LIST_DATA?.id.toString()"
        :both-modes-enabled="LIST_DATA.data.diffGuesser[1] && LIST_DATA.data.diffGuesser[2]"
        @replay-list="guesses = []; cardGuessing = 0"
      />

      <CommentSection v-show="commentsShowing" v-if="LIST_DATA?.id != undefined" :comm-amount="LIST_DATA.commAmount"
        :list-i-d="!PRIVATE_LIST ? LIST_DATA?.hidden : LIST_DATA?.id.toString()" :showing="commentsShowing"/>
    </main>
  </section>
</template>

<style scoped>
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(10rem);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.levelCard {
  animation: slideIn 0.4s ease forwards;
  opacity: 0;
}
</style>