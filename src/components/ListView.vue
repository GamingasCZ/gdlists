<script setup lang="ts">
import axios, { type AxiosResponse } from "axios";
import type {
  ListFetchResponse,
  FavoritedLevel,
  ListPreview,
  Level,
SavedCollab,
CollabHumans,
CollabData,
} from "@/interfaces";
import CommentSection from "./levelViewer/CommentSection.vue";
import LevelCard from "./global/LevelCard.vue";
// import LevelCardPC from "./global/LevelCardPC.vue";
import SharePopup from "./global/SharePopup.vue";
import ListDescription from "./levelViewer/ListDescription.vue";
import { ref, onMounted, watch, onUnmounted, computed, provide } from "vue";
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
import { SETTINGS, hasLocalStorage, viewedPopups } from "@/siteSettings";
import ListUploadedDialog from "./levelViewer/ListUploadedDialog.vue";
import TagViewerPopup from "./levelViewer/TagViewerPopup.vue";
import CollabViewer from "./editor/CollabViewer.vue";
import DialogVue from "./global/Dialog.vue";
import ViewModePicker from "./global/ViewModePicker.vue";
import LevelCardTable from "./global/LevelCardTable.vue";
import Notification from "./global/Notification.vue";
import LevelCardCompact from "./global/LevelCardCompact.vue";


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
const listErrorLoading = ref(false)

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
      try {
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

        if (hasLocalStorage()) {
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
        else if (listColors) { listColors = chroma(listColors).hsl() }
        LIST_COL.value = listColors
        
        // Saturation 0
        if (LIST_COL?.value?.[0] == null) LIST_COL.value[0] = 0

        if (LIST_COL.value != undefined && !isNaN(LIST_COL.value[0]))
          modifyListBG(LIST_COL.value);

        // Check pinned status
        if (hasLocalStorage()) {
          JSON.parse(localStorage.getItem("pinnedLists")!).forEach((pin: ListPreview) => {
            if ([LIST_DATA.value.id, LIST_DATA.value.hidden].includes(pin.id!)) listPinned.value = true
          });
        }

        // Set difficulty guessing
        guessHelpOpened.value = hasLocalStorage() && !viewedPopups.diffGuesserHelp && LIST_DATA.value.diffGuesser
        LEVEL_COUNT.value = LIST_DATA.value.data.levels.length
        if (LIST_DATA.value.data.diffGuesser?.[0] && !isJumpingFromFaves) cardGuessing.value = 0
      } catch (e) {
        listErrorLoading.value = true
      }
    })
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
const guessHelpOpened = ref(false)
const tagViewerOpened = ref(-1)
const uploadedDialogShown = ref(0)
if (hasLocalStorage()) {
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

const collabData = ref({
  levelName: "",
  levelColor: [0,0,0],
  collabData: null,
  index: 0,
  levelID: 0
})
const openCollabTools = (ind: number, col: [number, number, number]) => {
  if (typeof LIST_DATA.value?.data.levels[ind].creator == "string") return

  collabData.value.levelName = LIST_DATA.value?.data.levels[ind].levelName
  collabData.value.levelColor = col
  collabData.value.index = ind
  collabData.value.levelID = LIST_DATA.value?.data.levels[ind].levelID
  collabData.value.collabData = LIST_DATA.value?.data.levels[ind].creator

}
const saveCollab = (ind: number) => {
  if (typeof LIST_DATA.value?.data.levels[ind].creator == "string") return
  if (!hasLocalStorage()) return

  let currSavedIDs: string[] = JSON.parse(localStorage.getItem("savedCollabIDs")!) ?? []
  let currSaved: SavedCollab[] = JSON.parse(localStorage.getItem("savedCollabs")!) ?? []
  if (currSavedIDs.includes(LIST_DATA.value?.data.levels[ind].levelID!)) { // Smazat collab
    let remInd = currSavedIDs.indexOf(LIST_DATA.value?.data.levels[ind].levelID!)
    currSavedIDs.splice(remInd, 1)
    currSaved.splice(remInd, 1)
  }
  else { // Nesmazat collab, naopak přidat hihi :D
    let c: CollabData = LIST_DATA.value?.data.levels[ind].creator
    let collab: SavedCollab = {
      levelID: LIST_DATA.value?.data.levels[ind].levelID,
      collabID: Math.floor(Math.random() * 1000000),
      collabName: LIST_DATA.value?.data.levels[ind].levelName,
      data: c,
      memberCount: c[2].length,
      timestamp: Date.now(),
      collabHost: c[0]?.[0]?.name ? c[0][0].name : c[0][0],
      listID: [PRIVATE_LIST ? LIST_DATA.value.id : LIST_DATA.value.hidden, ind]
    }
    currSaved.push(collab)
    currSavedIDs.push(collab.levelID as string)
  }

  localStorage.setItem("savedCollabs", JSON.stringify(currSaved))
  localStorage.setItem("savedCollabIDs", JSON.stringify(currSavedIDs))
}

provide("saveCollab", saveCollab)

const copyStamp = ref(Date.now())
const copyID = (id: string) => {
  navigator.clipboard.writeText(id!);
  copyStamp.value = Date.now()
};
provide("idCopyTimestamp", copyID)

</script>

<template>
  <div v-if="LIST_DATA?.data.titleImg?.[4]" :style="{
    backgroundImage: `linear-gradient(#00000040, transparent)`,
  }" class="absolute w-full h-full -z-20"></div>

  <Notification :title="$t('level.idCopied')" content="" icon="check" :stamp="copyStamp" />

  <DialogVue :open="likeNotLoggedInOpen" @close-popup="likeNotLoggedInOpen = false">
    <LikePopup @close-popup="likeNotLoggedInOpen = false" />
  </DialogVue>
  
  <DialogVue :open="sharePopupOpen" @close-popup="sharePopupOpen = false">
    <SharePopup @close-popup="sharePopupOpen = false" :share-text="getURL()" />
  </DialogVue>
  
  <DialogVue :open="jumpToPopupOpen" @close-popup="jumpToPopupOpen = false">
    <PickerPopup @select-option="tryJumping(LIST_DATA?.data.levels.indexOf($event)!, true)"
      picker-data-type="level" :picker-data="LIST_DATA.data.levels" @close-popup="jumpToPopupOpen = false"
      :browser-name="$t('listViewer.jumpTo')" :outer-error="cardGuessing > -1 && cardGuessing < LEVEL_COUNT" :outer-error-text="$t('listViewer.noGuessJumping')"/>
  </DialogVue>

  <!-- Mobile options popup -->
  <DialogVue :open="mobileExtrasOpen" @close-popup="mobileExtrasOpen = false">
    <MobileExtras @do-list-action="listActions" @close-popup="mobileExtrasOpen = false" :list-pinned="listPinned"/>
  </DialogVue>

  <DialogVue :open="guessHelpOpened" @close-popup="guessHelpOpened = false">
    <DiffGuesserHelpDialog @close-popup="guessHelpOpened = false"/>
  </DialogVue>

  <DialogVue :open="tagViewerOpened > -1" @close-popup="tagViewerOpened = -1">
    <TagViewerPopup v-if="tagViewerOpened > -1" @close-popup="tagViewerOpened = -1" :level-i-d="LIST_DATA.data.levels[tagViewerOpened].levelID" :video="LIST_DATA.data.levels[tagViewerOpened].video" :tags="LIST_DATA.data.levels[tagViewerOpened].tags"/>
  </DialogVue>
  
  <DialogVue :open="LIST_DATA.name != undefined && uploadedDialogShown" @close-popup="uploadedDialogShown = 0">
    <ListUploadedDialog
      :list-i-d="!PRIVATE_LIST ? LIST_DATA?.hidden : LIST_DATA?.id.toString()"
      :is-updating="uploadedDialogShown == 2"
      @do-edit="listActions('editList')"
      @close-popup="uploadedDialogShown = 0"
    />
  </DialogVue>

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

      <section v-if="listErrorLoading" class="flex flex-col items-center my-20 text-white">
        <img src="@/images/listError.svg" class="w-56 opacity-60" alt="">
        <h2 class="mt-2 text-2xl font-bold opacity-60">{{ $t('listViewer.failLoad') }}</h2>
        <div class="flex gap-3 mt-5 max-sm:flex-col">
          <RouterLink to="/">
            <button class="p-2 w-full text-left rounded-md bg-greenGradient button"><img src="@/images/browseMobHeader.svg"
                class="inline mr-3 w-8" alt="">{{ $t('listViewer.goHome') }}</button>
          </RouterLink>
        </div>
      </section>

      <Teleport to="#app">
        <ListBackground :image-data="LIST_DATA.data.titleImg ?? []" :list-color="LIST_COL" />
      </Teleport>

      <DialogVue :open="collabData.collabData != null" @close-popup="collabData.collabData = null">
        <CollabViewer v-bind="collabData" :translucent="LIST_DATA?.data.translucent!" @close-popup="collabData.collabData = null"/>
      </DialogVue>

      <!-- List view picker -->
      <ViewModePicker />

      <!-- List -->
      <div v-if="SETTINGS.levelViewMode == 0 || LIST_DATA.diffGuesser" class="flex flex-col gap-4" v-show="!commentsShowing">
        <LevelCard v-for="(level, index) in LIST_DATA?.data.levels.slice(0, cardGuessing == -1 ? LEVEL_COUNT : cardGuessing+1)"
          class="levelCard"
          :style="{animationDelay: `${LIST_DATA?.diffGuesser ? 0 : index/25}s`}"
          v-bind="level"
          :favorited="favoritedIDs?.includes(level.levelID!)"
          :level-index="index"
          :list-i-d="!PRIVATE_LIST ? LIST_DATA?.hidden : LIST_DATA?.id.toString()"
          :list-name="LIST_DATA?.name!"
          :translucent-card="LIST_DATA?.data.translucent!" 
          :disable-stars="false" 
          @vue:mounted="tryJumping(index)"
          @next-guess="doNextGuess($event)"
          @open-collab="openCollabTools"
          @error="listErrorLoading = true"
        />
      </div>
      <div v-else-if="SETTINGS.levelViewMode == 1" class="flex flex-col gap-4">
        <LevelCardCompact v-for="(level, index) in LIST_DATA?.data.levels"
          class="levelCard"
          :style="{animationDelay: `${LIST_DATA?.diffGuesser ? 0 : index/25}s`}"
          v-bind="level"
          :favorited="favoritedIDs?.includes(level.levelID!)"
          :level-index="index"
          :list-i-d="!PRIVATE_LIST ? LIST_DATA?.hidden : LIST_DATA?.id.toString()"
          :list-name="LIST_DATA?.name!"
          :translucent-card="LIST_DATA?.data.translucent!" 
          :disable-stars="false" 
          :guessing-now="cardGuessing == index"
          :diff-guess-array="LIST_DATA.data.diffGuesser ?? [false, false, false]"
          @vue:mounted="tryJumping(index)"
          @next-guess="doNextGuess($event)"
          @open-tags="tagViewerOpened = $event"
          @open-collab="openCollabTools"
          @error="listErrorLoading = true"
        />
      </div>
      <div v-else-if="SETTINGS.levelViewMode == 2" class="max-w-[95vw] overflow-auto mx-auto w-[70rem]">
        <table class="overflow-auto mx-auto w-full bg-gray-900 bg-opacity-80 rounded-md backdrop-blur-sm" >
          <th></th>
          <th>{{ $t('other.name') }}</th>
          <th>{{ $t('level.creator') }}</th>
          <th>ID</th>
          <th>{{ $t('other.links') }}</th>
          <th></th>
          <LevelCardTable v-for="(level, index) in LIST_DATA?.data.levels"
            class="levelCard"
            v-bind="level"
            :favorited="favoritedIDs?.includes(level.levelID!)"
            :level-index="index"
            :list-i-d="!PRIVATE_LIST ? LIST_DATA?.hidden : LIST_DATA?.id.toString()"
            :list-name="LIST_DATA?.name!"
            :translucent-card="LIST_DATA?.data.translucent!" 
            :disable-stars="false" 
            @vue:mounted="tryJumping(index)"
            @open-collab="openCollabTools"
            @open-tags="tagViewerOpened = $event"
            @error="listErrorLoading = true"
          />
        </table>
      </div>

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

      <CommentSection
        v-show="commentsShowing"
        v-if="LIST_DATA?.id != undefined"
        :comm-amount="LIST_DATA.commAmount"
        :list-i-d="!PRIVATE_LIST ? LIST_DATA?.hidden : LIST_DATA?.id.toString()"
        :showing="commentsShowing"
        :comments-disabled="LIST_DATA.data.disComments"  
      />
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

@media (prefers-reduced-motion: no-preference) {
  .levelCard {
    animation: slideIn 0.4s ease forwards;
    opacity: 0;
  }
}
</style>