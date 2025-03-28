<script setup lang="ts">
import axios, { all, type AxiosResponse } from "axios";
import type {
  ListFetchResponse,
  ListPreview,
SavedCollab,
CollabData,
LevelList,
ReviewList,
ReviewContainer,
} from "@/interfaces";
import CommentSection from "./levelViewer/CommentSection.vue";
import LevelCard from "./global/LevelCard.vue";
import SharePopup from "./global/SharePopup.vue";
import ListDescription from "./levelViewer/ListDescription.vue";
import { ref, onMounted, watch, onUnmounted, provide, computed, defineAsyncComponent } from "vue";
import { modifyListBG, selectedLevels } from "@/Editor";
import chroma, { hsl } from "chroma-js";
import PickerPopup from "./global/PickerPopup.vue";
import router from "@/router";
import MobileExtras from "./levelViewer/MobileExtras.vue";
import { useI18n } from "vue-i18n";
import ListBackground from "./global/ListBackground.vue";
import GuessingFinished from "./levelViewer/GuessingFinished.vue";
import DiffGuesserHelpDialog from "./levelViewer/DiffGuesserHelpDialog.vue";
import { SETTINGS, hasLocalStorage, loggedIn, viewedPopups } from "@/siteSettings";
import ListUploadedDialog from "./levelViewer/ListUploadedDialog.vue";
import TagViewerPopup from "./levelViewer/TagViewerPopup.vue";
import CollabViewer from "./editor/CollabViewer.vue";
import DialogVue from "./global/Dialog.vue";
import CONTAINERS from "./writer/containers";
import { dialog } from "./ui/sizes";
import DataContainer from "./writer/DataContainer.vue";
import { DEFAULT_REVIEWDATA, flexNames, getEmbeds, parseReviewContainers, pickFont, resetIndentation } from "@/Reviews";
import LevelBubble from "./global/LevelBubble.vue";
import FormattingBubble from "./global/FormattingBubble.vue";
import LevelCardTable from "./global/LevelCardTable.vue";
import Notification from "./global/Notification.vue";
import LevelCardCompact from "./global/LevelCardCompact.vue";
import ImageViewer from "./global/ImageViewer.vue";
import LevelCardTableTable from "./global/LevelCardTableTable.vue";
import { summonNotification } from "./imageUpload";
import { i18n } from "@/locales";
import WriterViewer from "./writer/WriterViewer.vue";
import TemporaryList from "./global/TemporaryList.vue";

const props = defineProps<{
  listID?: string
  isReview: boolean
  randomList: boolean
}>()

let gdlists = useI18n().t('other.websiteName')

let lastScroll = 0
const postContent = ref<HTMLDivElement>()
const loadContent = async () => {
  let randomData = null
  if (props.randomList) {
    randomData = (await axios.get(import.meta.env.VITE_API+"/getLists.php", {params: {random: props.isReview}})).data
  }
  props.isReview ? await loadReview(randomData) : await loadList(randomData)
  if (SETTINGS.value.autoComments) {
    window.addEventListener("scroll", (e: MouseEvent) => {
      if (nonexistentList.value || listErrorLoading.value || reviewLevelsOpen.value || cardGuessing.value > -1 || !loggedIn.value) return
      let postBottom = postContent.value?.clientHeight+postContent.value?.clientTop
      let currentScroll = document.documentElement.clientHeight + document.documentElement.scrollTop
      
      if (currentScroll < postBottom + 100 && currentScroll - lastScroll < 0 && scrolledToEnd.value)
        scrolledToEnd.value = false
      else if (currentScroll > postBottom + 150)
        scrolledToEnd.value = true
      lastScroll = currentScroll
    })
  }

  if (window.location.search.includes("comment")) commentsShowing.value = true
}

watch(props, loadContent)
onMounted(loadContent)

const NONPRIVATE_LIST = computed<boolean>(() => {
  if (props.randomList) return true
  if (props.listID?.includes("-")) return true
  return props?.listID?.match(/^\d+$/g)?.length == 1
})

const favoritedIDs = ref<string[] | null>();

let addIntoRecentlyViewed = false;
let recentlyViewed: ListPreview[];

const LIST_DATA = ref<ListFetchResponse>({ data: { levels: [] } });
const LIST_CREATOR = ref<string>("");
const LIST_CREATORDATA = ref<{username: string, discord_id: string} | false>()
const LIST_COL = ref<number[]>([0, 0, 0]);
const LEVEL_COUNT = ref(0)
const LIST_RATING = ref([0,0]);
const listErrorLoading = ref(false)

const backToReview = ref()

const nonexistentList = ref<boolean>(false)
async function loadList(loadedData: LevelList | null) {
  let listURL = `${!NONPRIVATE_LIST.value ? "pid" : "id"}=${props?.listID}`;

  nonexistentList.value = false

  let res: LevelList | number;
  if (loadedData) res = loadedData
  else
    res = await axios.get(import.meta.env.VITE_API + "/getLists.php?" + listURL).then((res: AxiosResponse) => res.data)
    
  try {
    if (res == 2) {
      nonexistentList.value = true
      return
    }

    LIST_DATA.value = res[0];
    LIST_CREATOR.value = LIST_DATA.value?.creator! || res[1].username;
    LIST_CREATORDATA.value = res[1]
    LIST_RATING.value = res[3]

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
        recentlyViewed.filter((list: ListPreview) => list.id == (!NONPRIVATE_LIST.value ? LIST_DATA.value?.hidden! : LIST_DATA.value?.id!))
          .length == 0; // Has not been viewed yet
    }

    if (addIntoRecentlyViewed) {
      recentlyViewed.push({
        creator: LIST_CREATOR.value,
        id: (!NONPRIVATE_LIST.value ? LIST_DATA.value?.hidden! : LIST_DATA.value?.id!).toString(),
        name: LIST_DATA.value?.name!,
        uploadDate: Date.now(),
        hidden: "0",
      });
      if (recentlyViewed.length == 10) recentlyViewed.splice(0, 1); // Gets sliced to 3 on homepage
      localStorage.setItem("recentlyViewed", JSON.stringify(recentlyViewed));
    }

    document.title = `${LIST_DATA.value?.name} | ${gdlists}`;

    // Set list colors
    LIST_COL.value = LIST_DATA.value?.data?.pageBGcolor
    
    // Saturation 0
    if (LIST_COL.value && LIST_COL?.value?.[0] == null) LIST_COL.value[0] = 0
    
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
}

const REVIEW_CONTENTS = ref<[number, string][]>([])
const embedsContent = ref<[ListFetchResponse, ListFetchResponse, ListFetchResponse]>([])
provide("batchEmbeds", embedsContent)
async function loadReview(loadedData: ReviewList | null) {
  nonexistentList.value = false

  let res: ReviewList | number;
  if (loadedData) res = loadedData
  else {
    let params = {review: props.listID?.includes("-") ? props.listID.match(/-(\d+)/)[1] : props.listID, hidden: !NONPRIVATE_LIST.value | 0}
    res = await axios.get(import.meta.env.VITE_API + "/getLists.php", {params: params}).then((res: AxiosResponse) => res.data)
  }
    
  try {
    if (res == 2) {
      nonexistentList.value = true
      return
    }

    let indicies = [0,0,0,0,0,0]
    LIST_DATA.value = res[0];
    LIST_DATA.value.name = decodeURIComponent(LIST_DATA.value.name).replaceAll("+", " ")
    REVIEW_CONTENTS.value = parseReviewContainers(LIST_DATA.value.data.containers, indicies)

    LIST_RATING.value = res[3]

    LIST_CREATOR.value = LIST_DATA.value?.creator! || res[1].username;
    LIST_CREATORDATA.value = res[1]

    // Fetch embeds
    embedsContent.value = await getEmbeds(LIST_DATA.value.data)

    if (hasLocalStorage()) {
      favoritedIDs.value = JSON.parse(localStorage.getItem("favoriteIDs")!);
      recentlyViewed = JSON.parse(localStorage.getItem("recentlyViewed")!) ?? [];

      addIntoRecentlyViewed =
        recentlyViewed.filter((list: ListPreview) => list.url == props.listID)
          .length == 0; // Has not been viewed yet
    }
    if (addIntoRecentlyViewed) {
      recentlyViewed.push({
        creator: LIST_CREATOR.value,
        url: props.listID,
        name: LIST_DATA.value?.name!,
        uploadDate: Date.now(),
        hidden: "0",
      });
      if (recentlyViewed.length == 10) recentlyViewed.splice(0, 1); // Gets sliced to 3 on homepage
      localStorage.setItem("recentlyViewed", JSON.stringify(recentlyViewed));
    }

    document.title = `${LIST_DATA.value?.name} | ${gdlists}`;

    // Set review colors
    LIST_COL.value = LIST_DATA.value?.data.pageBGcolor!;
    
    // Saturation 0
    if (LIST_COL?.value?.[0] == null) LIST_COL.value[0] = 0
    
    if (LIST_COL.value != undefined && !isNaN(LIST_COL.value[0]))
      modifyListBG(LIST_COL.value);

    // Check pinned status
    if (hasLocalStorage()) {
      JSON.parse(localStorage.getItem("pinnedLists")!).forEach((pin: ListPreview) => {
        if (props.listID == pin.url) listPinned.value = true
      });
    }

    LEVEL_COUNT.value = LIST_DATA.value.data.levels.length
  } catch (e) {
    console.log(e)
    listErrorLoading.value = true
  }
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

  commentsShowing.value = false
  scrolledToEnd.value = false
  
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
        if (pin.id == LIST_DATA.value.id || pin.url == props.listID) pinned.splice(i, 1)
        i++
      })
    }
    else {
      let pinData = {
        name: LIST_DATA.value.name,
        creator: LIST_CREATOR.value,
        uploadDate: Date.now(),
        hidden: LIST_DATA.value.hidden,
        isPinned: true
      }
      if (props.isReview) pinData.url = props.listID
      else pinData.id = LIST_DATA.value.id
      pinned.push(pinData)
    }
    if (pinned.length > 5) { // Remove last pinned level
      pinned.splice(0, 1)
    }

    listPinned.value = !listPinned.value
    localStorage.setItem("pinnedLists", JSON.stringify(pinned))
  }
}

const getURL = () => {
  let base = `${window.location.protocol}//${window.location.host}/gdlists/`
  if (props.isReview) return base + 'review/' + window.location.pathname.split("/").toReversed()[0]
  else return base + (!NONPRIVATE_LIST.value ? LIST_DATA.value?.hidden! : LIST_DATA.value?.id!)
}
const sharePopupOpen = ref(false);
const jumpToPopupOpen = ref(false);
const scrolledToEnd = ref(false)
const commentsShowing = ref(false)
const mobileExtrasOpen = ref(false)
const guessHelpOpened = ref(false)
const tagViewerOpened = ref(-1)
const uploadedDialogShown = ref(0)
const reviewLevelsOpen = ref(false)
if (hasLocalStorage()) {
  let uploadKey = sessionStorage.getItem("uploadFinished")
  if (uploadKey != null) {
    uploadedDialogShown.value = parseInt(uploadKey) // 1 - upload, 2 - update
    sessionStorage.removeItem("uploadFinished")
  }
}

const ViewModePicker = defineAsyncComponent({loader: () => import("./global/ViewModePicker.vue")})

watch(router.currentRoute, () => {
    // load viewed review
    if (!hasLocalStorage()) return

    let viewedReview = localStorage.getItem("reviewScroll")
    if (viewedReview) {
      backToReview.value = viewedReview
      localStorage.removeItem("reviewScroll")
    } else backToReview.value = false
})

const listActions = (action: string) => {
  switch (action) {
    case "comments":
      reviewLevelsOpen.value = false
      commentsShowing.value = !commentsShowing.value;
      break;
    case "sharePopup":
      sharePopupOpen.value = true;
      break;
    case "jumpPopup":
      resetIndentation()
      jumpToPopupOpen.value = true;
      break;
    case "pinList":
      toggleListPin()
      break;
    case "editList":
      if (props.isReview)
        router.push(`/edit/review/${LIST_DATA.value?.id!}`)
      else
        router.push(`/edit/list/${LIST_DATA.value?.id!}`)
      break;
    case "mobileExtras":
      mobileExtrasOpen.value = true
      break;
    case "rateNotLoggedIn":
      likeNotLoggedInOpen.value = true
      break;
    case "reviewLevels":
      commentsShowing.value = false
      reviewLevelsOpen.value = !reviewLevelsOpen.value
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
      listID: [NONPRIVATE_LIST.value ? LIST_DATA.value.id : LIST_DATA.value.hidden, ind]
    }
    currSaved.push(collab)
    currSavedIDs.push(collab.levelID as string)
  }

  localStorage.setItem("savedCollabs", JSON.stringify(currSaved))
  localStorage.setItem("savedCollabIDs", JSON.stringify(currSavedIDs))
}

const jumpToContent = (type: string, index: number) => {
  // let get = document.querySelector(`p[data-type=${type}]:nth-of-type(${index+1})`)
  commentsShowing.value = false
  scrolledToEnd.value = false
  let get = document.querySelectorAll(`div[data-type=${type}]`).item(index-1)
  get?.scrollIntoView({'behavior': "smooth"})
  jumpToPopupOpen.value = false
}

const getLevelsRatings = () => {
  return [LIST_DATA.value?.data.levels, LIST_DATA.value?.data.ratings ?? []]
}

provide("settingsTitles", CONTAINERS)
provide("saveCollab", saveCollab)
provide("levelsRatingsData", getLevelsRatings)

const collabViewerColor = ref("")

const copyID = (id: string) => {
  navigator.clipboard.writeText(id!);
  summonNotification(i18n.global.t("level.idCopied"), "", 'check')
};
provide("idCopyTimestamp", copyID)

const jumpSearch = ref("")

const modPreview = (clickedImageID: number) => {
  console.log(imagesArray.value, clickedImageID)
  imageIndex.value = imagesArray.value.findIndex(c => c.id == clickedImageID)
}

provide("imagePreviewFullscreen", modPreview)
const imagesArray = computed(() => {
  let allImages: ReviewContainer[] = []
  let data = (LIST_DATA.value.data as ReviewList).containers
  if (viewingLevelScreenshot.value) {
    LIST_DATA.value.data.levels.forEach(x => {
      if (x.screenshots) {
        x.screenshots.forEach(y => allImages.push(y[1]))
      }
    })
  }

  if (!data) return allImages
  
  if (!viewingLevelScreenshot.value) {
    data.forEach(con => {
      if (con.type == "showImage") allImages.push(con)
      if (con.type == "twoColumns") {
        con.settings.components.forEach(sub => {
          sub.forEach(subc => {if (subc?.type == "showImage") allImages.push(subc)})
        })
      }
      if (con.type == "addCarousel") {
        con.settings.components.forEach(car => {
          if (car?.type == "showImage") allImages.push(car)
        })
      }
      // todo: ReviewLevel
    })
  }

  return allImages
})
const imageIndex = ref(-1)

const viewingLevelScreenshot = ref(false)
const levelImageFullscreen = (imgIndex: number, levelIndex: number) => {
  let offset = 0
  for (let i = 0; i < levelIndex; i++) {
    let screenshots = LIST_DATA.value.data.levels[i].screenshots
    if (screenshots)
      offset += screenshots.length
  }

  imageIndex.value = offset+imgIndex
  viewingLevelScreenshot.value = true
}
provide("fullscreenLevel", levelImageFullscreen)

</script>

<template>
  <DialogVue :open="sharePopupOpen" @close-popup="sharePopupOpen = false" :title="$t('other.share')" :width="dialog.medium">
    <SharePopup :share-text="getURL()" :review="isReview" />
  </DialogVue>
  
  <DialogVue :open="jumpToPopupOpen" @close-popup="jumpToPopupOpen = false" :title="$t('listViewer.contents')">
    <PickerPopup v-model="jumpSearch">
      <template v-if="cardGuessing > -1 && cardGuessing < LEVEL_COUNT" #error>
        <span>{{ $t('listViewer.noGuessJumping') }}</span>
      </template>
      <template v-if="isReview && !REVIEW_CONTENTS.length && !jumpSearch.length" #error>
        <span>{{ $t('listViewer.noContents') }}</span>
      </template>
      <FormattingBubble @click="jumpToContent(link[0], link[1])" v-show="isReview && !reviewLevelsOpen" v-for="link in REVIEW_CONTENTS.filter(x => x[3].toLowerCase().includes(jumpSearch.toLowerCase()))" :text="link[3]" :icon-index="link[0]" :heading-level="link[2]-1" />
      <LevelBubble @pick="tryJumping(LIST_DATA?.data.levels.indexOf($event)!, true)" v-show="(!isReview || reviewLevelsOpen) && cardGuessing == -1" v-for="level in LIST_DATA.data.levels.filter(x => x.levelName.toLowerCase().includes(jumpSearch.toLowerCase()))" :data="level" />
  </PickerPopup>
  </DialogVue>

  <Transition name="fade">
    <ImageViewer
      v-if="imageIndex !== -1"
      @close-popup="imageIndex = -1; viewingLevelScreenshot = false"
      :images-array="viewingLevelScreenshot ? undefined : imagesArray"
      :hash-array="imagesArray"
      :uid="LIST_CREATORDATA?.discord_id"
      not-editable
      v-model="imageIndex"
    />
  </Transition>

  <!-- Mobile options popup -->
  <DialogVue :open="mobileExtrasOpen" @close-popup="mobileExtrasOpen = false" :title="$t('other.options')">
    <MobileExtras @do-list-action="listActions" @close-popup="mobileExtrasOpen = false" :list-pinned="listPinned"/>
  </DialogVue>

  <DialogVue :open="guessHelpOpened" @close-popup="guessHelpOpened = false" :header-disabled="true">
    <DiffGuesserHelpDialog @close-popup="guessHelpOpened = false"/>
  </DialogVue>

  <DialogVue :open="tagViewerOpened > -1" @close-popup="tagViewerOpened = -1" :title="$t('other.information')">
    <TagViewerPopup v-if="tagViewerOpened > -1" @close-popup="tagViewerOpened = -1" :level-i-d="LIST_DATA.data.levels[tagViewerOpened].levelID" :video="LIST_DATA.data.levels[tagViewerOpened].video" :tags="LIST_DATA.data.levels[tagViewerOpened].tags"/>
  </DialogVue>

  <Teleport to="body">
    <Transition name="fadeSlide">
      <TemporaryList v-if="selectedLevels.length" />
    </Transition>
  </Teleport>
  
  <DialogVue :open="LIST_DATA.name != undefined && uploadedDialogShown" header-disabled>
    <ListUploadedDialog
      :link="getURL()"
      :is-updating="uploadedDialogShown == 2"
      :is-review="isReview"
      @do-edit="listActions('editList')"
      @close-popup="uploadedDialogShown = 0"
    />
  </DialogVue>

  <section class="mt-12 text-white">
    <header>
      <ListDescription
        v-if="LIST_DATA.name != undefined && !nonexistentList"
        class="mb-8"
        v-bind="LIST_DATA"
        @do-list-action="listActions"
        @update-ratings="LIST_RATING = $event"
        :creator="LIST_CREATOR"
        :creator-data="LIST_CREATORDATA!"
        :id="LIST_DATA?.id"
        :list-pinned="listPinned"
        :review="isReview"
        :open-dialogs="[commentsShowing, reviewLevelsOpen]"
        :ratings="LIST_RATING"
        :hidden="LIST_DATA.hidden"
        :color="LIST_COL"
      />
    </header>

    <!-- Nonexistent list -->
    <section v-if="nonexistentList" class="flex flex-col items-center my-20 text-white">
      <img src="@/images/listError.svg" class="w-56 opacity-60" alt="">
      <h2 v-if="isReview" class="mt-2 text-2xl font-bold opacity-60">{{ $t('listViewer.nonexistentReview') }}</h2>
      <h2 v-else class="mt-2 text-2xl font-bold opacity-60">{{ $t('listViewer.nonexistentList') }}</h2>
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

    <main v-if="!nonexistentList && !listErrorLoading" class="flex flex-col gap-4">
      <!-- Back to review from link -->
      <RouterLink v-if="backToReview" @click="$router.go(-1)" to="" class="flex gap-2 p-2 mx-auto w-max rounded-md bg-greenGradient">
        <img src="@/images/showCommsL.svg" class="w-3" alt="">
        <span>{{ $t('other.backTO') }} <b>{{ backToReview }}</b></span>
      </RouterLink>

      <Teleport to="#app">
        <ListBackground :image-data="LIST_DATA.data.titleImg ?? []" :list-color="LIST_COL" />
      </Teleport>

      <DialogVue :custom-color="collabViewerColor" :width="dialog.xl" :title="collabData.levelName" :open="collabData.collabData != null" @close-popup="collabData.collabData = null">
        <CollabViewer @custom-color="collabViewerColor = $event" v-bind="collabData" :translucent="LIST_DATA?.data.translucent!"/>
      </DialogVue>

      <!-- List view picker -->
      <div v-if="!viewedPopups.pickedStyling && !isReview">
        <ViewModePicker />
      </div>

      <!-- List -->
      <div ref="postContent" v-if="!isReview || reviewLevelsOpen" class="flex flex-col gap-4 items-center" v-show="!commentsShowing">
        <LevelCardTableTable :active="SETTINGS.levelViewMode == 2">
          <component
            v-for="(level, index) in LIST_DATA?.data.levels.slice(0, cardGuessing == -1 ? LEVEL_COUNT : cardGuessing+1)"
            :is="[LevelCard, LevelCardCompact, LevelCardTable][cardGuessing == -1 ? SETTINGS.levelViewMode : 0]"
            class="levelCard"
            :style="{animationDelay: `${LIST_DATA?.diffGuesser ? 0 : index/25}s`}"
            v-bind="level"
            :favorited="favoritedIDs?.includes(level.levelID!)"
            :level-index="index"
            :list-i-d="PRIVATE_LIST ? LIST_DATA?.hidden : LIST_DATA?.id.toString()"
            :list-name="LIST_DATA?.name!"
            :translucent-card="LIST_DATA?.data.translucent! && !SETTINGS.disableTL" 
            :disable-stars="cardGuessing == index"
            :guessing-now="cardGuessing == index"
            :diff-guess-array="LIST_DATA.data.diffGuesser ?? [false, false, false]"
            :uploader-uid="LIST_CREATORDATA?.discord_id"
            @vue:mounted="tryJumping(index)"
            @next-guess="doNextGuess($event)"
            @open-tags="tagViewerOpened = $event"
            @open-collab="openCollabTools"
            @error="listErrorLoading = true"
            @fullscreen-image="levelImageFullscreen($event, index)"
          />      
        </LevelCardTableTable>
      </div>
      
      <div ref="postContent" v-else v-show="!commentsShowing && !reviewLevelsOpen">
        <WriterViewer :writer-data="LIST_DATA.data" :editable="false" :zen-mode="false" />
      </div>

      <!-- Guessing bottom padding -->
      <div :style="{height: `${windowHeight}px`}" class="w-4" v-if="LIST_DATA.diffGuesser && cardGuessing != -1 && cardGuessing != LEVEL_COUNT && !commentsShowing"></div>

      <GuessingFinished
        v-if="LIST_DATA?.id != undefined && cardGuessing == LEVEL_COUNT && !commentsShowing"
        :guesses="guesses"
        :list-creator="LIST_CREATOR"
        :list-name="LIST_DATA.name"
        :list-i-d="!NONPRIVATE_LIST ? LIST_DATA?.hidden: LIST_DATA?.id.toString()"
        :both-modes-enabled="LIST_DATA.data.diffGuesser[1] && LIST_DATA.data.diffGuesser[2]"
        @replay-list="guesses = []; cardGuessing = 0"
      />

      <CommentSection
        v-if="LIST_DATA?.id != undefined"
        v-show="commentsShowing || scrolledToEnd"
        @update-comment-amount="LIST_DATA.commAmount = $event"
        :comm-amount="LIST_DATA.commAmount"
        :list-i-d="LIST_DATA?.id"
        :hidden-i-d="LIST_DATA.hidden"
        :showing="commentsShowing || scrolledToEnd"
        :comments-disabled="LIST_DATA.data.disComments"
        :is-review="isReview"
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
  .levelCard:nth-child(-n + 5) {
    animation: slideIn 0.4s ease forwards;
    opacity: 0;
  }
}
</style>