<script setup lang="ts">
import axios, { type AxiosResponse } from "axios";
import {
  type ListFetchResponse,
  type ListPreview,
  type SavedCollab,
type CollabData,
type LevelList,
type ReviewList,
type ReviewContainer,
type ViewedPinArray,
URIHideUIOptions,
type PostData,
} from "@/interfaces";
import CommentSection from "./levelViewer/CommentSection.vue";
import LevelCard from "./global/LevelCard.vue";
import ListDescription from "./levelViewer/ListDescription.vue";
import { ref, onMounted, watch, provide, computed, defineAsyncComponent, inject, type Ref, toRaw } from "vue";
import { currentUID, generateHash, modifyListBG, navHidden, selectedLevels } from "@/Editor";
import PickerPopup from "./global/PickerPopup.vue";
import router, { timeLastRouteChange } from "@/router";
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
import CONTAINERS, { type Container } from "./writer/containers";
import { dialog } from "./ui/sizes";
import { getEmbeds, parseReviewContainers, resetIndentation } from "@/Reviews";
import LevelBubble from "./global/LevelBubble.vue";
import FormattingBubble from "./global/FormattingBubble.vue";
import LevelCardTable from "./global/LevelCardTable.vue";
import LevelCardCompact from "./global/LevelCardCompact.vue";
import ImageViewer from "./global/ImageViewer.vue";
import LevelCardTableTable from "./global/LevelCardTableTable.vue";
import { summonNotification } from "./imageUpload";
import { i18n } from "@/locales";
import WriterViewer from "./writer/WriterViewer.vue";
import TemporaryList from "./global/TemporaryList.vue";
import ShareSection from "./levelViewer/ShareSection.vue";
import { nextTick } from "vue";

const props = defineProps<{
  listID?: string
  isReview: boolean
  randomList: boolean
}>()

let gdlists = useI18n().t('other.websiteName')

watch(timeLastRouteChange, () => {
  loadContent()
})

let lastScroll = 0
const postContent = ref<HTMLDivElement>()
const ShareUIHide = ref<URIHideUIOptions>(URIHideUIOptions.None)
const loadContent = async () => {
  let uri = new URL(window.location.href)
  if (uri.searchParams.has("ui")) {
    let opts = uri.searchParams.get("ui")!.split("").map(x => +x)
    if (!opts.includes(NaN) && opts.length == URIHideUIOptions.Length) {
      ShareUIHide.value = parseInt(uri.searchParams.get("ui")!, 2)
    }
  }

  let randomData = null
  let forceType: number | boolean = +props.isReview
  if (props.randomList) {
    randomData = (await axios.get(import.meta.env.VITE_API+"/getLists.php", {params: {random: props.isReview}})).data
  }
  props.isReview ? await loadReview(randomData) : await loadList(randomData)
  
  if (isJumpingFromFaves != null) {
    if (!isNaN(parseInt(isJumpingFromFaves))) {
      if (props.isReview)
        reviewLevelsOpen.value = true
      nextTick(() => tryJumping(+isJumpingFromFaves, true))
    }
  }

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

  if (uri.searchParams.has("comment"))
    commentsShowing.value = true
}

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
  cardGuessing.value = -1

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

    postExtrasApply()

    // Set difficulty guessing
    guessHelpOpened.value = hasLocalStorage() && !viewedPopups.diffGuesserHelp && LIST_DATA.value.diffGuesser
    if (LIST_DATA.value.data.diffGuesser?.[0] && !isJumpingFromFaves) cardGuessing.value = 0
  } catch (e) {
    listErrorLoading.value = true
  }
}

const createPostHashes = (post: any) => {
  let originalHashes = {}
  let cont = Array.from(post.data.containers)
  let hashes = cont.map(x => generateHash(JSON.stringify(x)))
  let ids = cont.map(x => x.id)
  for (let i = 0; i < hashes.length; i++)
    originalHashes[ids[i]] = hashes[i]

  return originalHashes
}

const REVIEW_CONTENTS = ref<[number, string][]>([])
const embedsContent = ref<[ListFetchResponse, ListFetchResponse, ListFetchResponse]>([])
const showChecklistsUsed = ref(false)
var originalListData: PostData
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
    originalListData = structuredClone(res[0].data)
    showChecklistsUsed.value = loadLocalChecklists(LIST_DATA.value.data)

    originalHashes = createPostHashes(res[0])
    let cont = Array.from(res[0].data.containers)
    let hashes = cont.map(x => generateHash(JSON.stringify(x)))
    let ids = cont.map(x => x.id)
    for (let i = 0; i < hashes.length; i++)
      originalHashes[ids[i]] = hashes[i]

    LIST_DATA.value.name = decodeURIComponent(LIST_DATA.value.name).replaceAll("+", " ")
    REVIEW_CONTENTS.value = parseReviewContainers(LIST_DATA.value.data.containers, indicies)

    LIST_RATING.value = res[3]

    LIST_CREATOR.value = LIST_DATA.value?.creator! || res[1].username;
    LIST_CREATORDATA.value = res[1]

    // Fetch embeds
    embedsContent.value = await getEmbeds(LIST_DATA.value.data)

    postExtrasApply()
  } catch (e) {
    listErrorLoading.value = true
  }
}

function postExtrasApply() {
    let vpArray: ViewedPinArray;
    let postType = +props.isReview
    if (hasLocalStorage()) {
      favoritedIDs.value = JSON.parse(localStorage.getItem("favoriteIDs")!);
      vpArray = JSON.parse(localStorage.getItem("viewedPinArray")!) ?? createViewPinArray()

      addIntoRecentlyViewed =
        vpArray.viewed[postType].filter((list: number | string) => list == props.listID)
          .length == 0; // Has not been viewed yet

      if (addIntoRecentlyViewed) {
        let numtest = +(props.listID)
        vpArray.viewed[postType].push(isNaN(numtest) ? LIST_DATA.value.hidden : numtest)
        let viewLen = vpArray.viewed[0].length + vpArray.viewed[1].length
        let toDelete = +(vpArray.viewed[1].length > vpArray.viewed[0].length)

        if (viewLen == 5) vpArray.viewed[toDelete].splice(0, 1); // Gets sliced to 3 on homepage
        localStorage.setItem("viewedPinArray", JSON.stringify(vpArray));
      }

      // Check pinned status
      vpArray.pinned[postType].forEach((pin: any) => {
        if (props.listID == pin || LIST_DATA.value.hidden == pin) listPinned.value = true
      });
    }

    document.title = `${LIST_DATA.value?.name} | ${gdlists}`;

    // Set post colors
    LIST_COL.value = LIST_DATA.value?.data.pageBGcolor!;
    
    // Saturation 0
    if (LIST_COL.value && LIST_COL?.value?.[0] == null) LIST_COL.value[0] = 0
    
    if (LIST_COL.value != undefined && !isNaN(LIST_COL.value[0]))
      modifyListBG(LIST_COL.value);
    else
      modifyListBG([0,0,0], true)

    LEVEL_COUNT.value = LIST_DATA.value.data.levels.length
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

    let to: HTMLDivElement = jumpedToCard[
      Math.max(0, parseInt(isJumpingFromFaves) - 2)
    ];
    if (!isNaN(parseInt(isJumpingFromFaves))) {
      if (to) {
        to.scrollIntoView();
        (jumpedToCard[Math.max(0, parseInt(isJumpingFromFaves))] as HTMLDivElement
        ).style.animation = "flash 0.8s linear forwards";
      }
    }
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

function createViewPinArray() {return ({pinned: [[],[]], viewed: [[], []]})}
const listPinned = ref<boolean>(false)
const toggleListPin = () => {
  if (hasLocalStorage()) {
    let vpArr: ViewedPinArray = JSON.parse(localStorage.getItem('viewedPinArray')!) ?? createViewPinArray()
    let typeInd = +props.isReview
    if (listPinned.value) { // Remove from pinned
      let i = 0
      vpArr.pinned[typeInd].forEach((pin: any) => {
        if (pin == props.listID) vpArr.pinned[typeInd].splice(i, 1)
        i++
      })
    }
    else {
      let numtest = +(props.listID)
      vpArr.pinned[typeInd].push(isNaN(numtest) ? LIST_DATA.value.hidden : numtest)
    }

    let pinLen = vpArr.pinned[0].length + vpArr.pinned[1].length
    let toDelete = +(vpArr.pinned[1].length > vpArr.pinned[0].length)
    if (pinLen > 5) { // Remove last pinned level
      vpArr.pinned[toDelete].splice(0, 1)
    }

    listPinned.value = !listPinned.value
    localStorage.setItem("viewedPinArray", JSON.stringify(vpArr))
  }
}

const getURL = () => {
  let base = `${window.location.protocol}//${window.location.host}/gdlists/`
  if (props.isReview) return base + 'review/' + window.location.pathname.split("/").toReversed()[0]
  else return base + (!NONPRIVATE_LIST.value ? LIST_DATA.value?.hidden! : LIST_DATA.value?.id!)
}
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

    // change pin icon when clicking on embed
    let vpArr: ViewedPinArray = JSON.parse(localStorage.getItem('viewedPinArray')!)
    if (vpArr?.pinned)
      listPinned.value = vpArr.pinned[+props.isReview].includes(props.listID!)
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
      listID: [NONPRIVATE_LIST.value ? LIST_DATA.value.id : LIST_DATA.value.hidden, ind, props.isReview]
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

const postMadeChanges = ref(false)
var originalHashes: {[containerID: number]: number} = {}
type SavedChecklist = {[containerID: number]: ReviewContainer}
type AllSavedChecklists = {[postID: string]: SavedChecklist}
var postChanges: SavedChecklist = {}
const UpdateConfirmer = defineAsyncComponent(() =>
  import("./levelViewer/ListViewPushChanges.vue")
)

// brings up changed popup, if changed container has a different hash, that its original hash
const doModifyPost = (changedContainer: ReviewContainer) => {
  if (postChanges[changedContainer.id]) {
    let changedHash = generateHash(JSON.stringify(changedContainer))
    if (changedHash == originalHashes[changedContainer.id])
      delete postChanges[changedContainer.id]
    else
    postChanges[changedContainer.id] = changedContainer
  }
  else
    postChanges[changedContainer.id] = changedContainer
  
  postMadeChanges.value = Object.keys(postChanges).length > 0
  showChecklistsUsed.value = false
}

const loadLocalChecklists = (currentListData: PostData) => {
  if (!hasLocalStorage()) return false

  let savedChecklists: AllSavedChecklists | null = JSON.parse(localStorage.getItem("localChecklists")!)
  if (savedChecklists == null) return false

  let thisListChecklists = savedChecklists?.[LIST_DATA.value.id]
  if (!thisListChecklists) return false

  for (const key in thisListChecklists) {
    currentListData.containers.forEach(c => {
      if (c.id == key)
        c.data = thisListChecklists[key].data
    })
  }
  return true
}

const saveLocalChecklists = () => {
  if (!hasLocalStorage()) return

  let savedChecklists = JSON.parse(localStorage.getItem("localChecklists")!) ?? {}
  if (savedChecklists == null) return

  originalHashes = createPostHashes(LIST_DATA.value)
  savedChecklists[LIST_DATA.value.id] = postChanges
  localStorage.setItem("localChecklists", JSON.stringify(savedChecklists))
  postChanges = {}
  postMadeChanges.value = false
}

const revertPostEdits = () => {
  LIST_DATA.value.data.containers = []
  nextTick(() => {
    LIST_DATA.value.data.containers = structuredClone(originalListData.containers)
  })
  originalHashes = createPostHashes(LIST_DATA.value)
  postMadeChanges.value = false
  postChanges = {}
}

var tempListData: Container[]
const hideChecklistEditsViewing = ref(false)
const hideLocalChecklistEdits = () => {
  if (hideChecklistEditsViewing.value) {
    LIST_DATA.value.data.containers = []
    nextTick(() => {
      LIST_DATA.value.data.containers = JSON.parse(JSON.stringify(tempListData))
      tempListData = undefined
    }).then(() =>
        nextTick(() => document.querySelectorAll("#reviewText input[type='checkbox']").forEach(x => x.disabled = false))
    )
  }
  else {
    tempListData = JSON.parse(JSON.stringify(LIST_DATA.value.data.containers))
    LIST_DATA.value.data.containers = []
    nextTick(() =>
      LIST_DATA.value.data.containers = JSON.parse(JSON.stringify(originalListData.containers))
    ).then(() =>
        nextTick(() => document.querySelectorAll("#reviewText input[type='checkbox']").forEach(x => x.disabled = true))
    )
  }
  hideChecklistEditsViewing.value = !hideChecklistEditsViewing.value
}

const discardLocalChecklistEdits = () => {
  revertPostEdits()
  showChecklistsUsed.value = false
  let savedChecklists = JSON.parse(localStorage.getItem("localChecklists")!)
  delete savedChecklists[LIST_DATA.value.id]
  localStorage.setItem("localChecklists", JSON.stringify(savedChecklists))
}

// todo add discarding
const updatingPost = ref(false)
const sendChangedComponents = () => {
  // save locally on post you don't own
  if (LIST_DATA.value.uid != currentUID.value) return saveLocalChecklists()
  if (hideChecklistEditsViewing.value) return

  updatingPost.value = true
  axios.post(import.meta.env.VITE_API+"/updateList.php", {
    type: props.isReview ? 'review' : 'list',
    id: props.listID,
    isNowHidden: +!NONPRIVATE_LIST.value,
    hidden: +!NONPRIVATE_LIST.value,
    components: postChanges
  }).then(res => {
    postChanges = {}
    postMadeChanges.value = false
    originalHashes = createPostHashes(LIST_DATA.value)

    setTimeout(() => updatingPost.value = false, 250)
    if (res.data == "8")
      summonNotification(i18n.global.t('listViewer.postUpdated'), "", 'check')
    else
      summonNotification(i18n.global.t('other.error'), i18n.global.t('listViewer.failUpdate'), 'error')
  }).catch(() => {
    postMadeChanges.value = false
    setTimeout(() => updatingPost.value = false, 250)
    summonNotification(i18n.global.t('other.error'), i18n.global.t('listViewer.failUpdate'), 'error')
  })
}

const cancelHidingOptions = () => {
  ShareUIHide.value = URIHideUIOptions.None
  navHidden.value = false
}

</script>

<template> 
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

  <Teleport defer to="#backToGDLSection">
    <button v-if="ShareUIHide > 0" @click="cancelHidingOptions" id="contactButton" class="p-1 underline rounded-md opacity-80">
      {{ $t('other.backToGDL') }}
    </button>
  </Teleport>

  <section class="mt-12 text-white">
    <header>
      <ListDescription
        v-if="LIST_DATA.name != undefined && !nonexistentList"
        v-show="!(ShareUIHide & URIHideUIOptions.Description)"
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
        :comms-hidden="ShareUIHide & URIHideUIOptions.Comments"
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

    <Transition name="fade">
      <UpdateConfirmer v-if="postMadeChanges" @confirm="sendChangedComponents" @discard="revertPostEdits" :updating="updatingPost" :owns-post="LIST_DATA.uid == currentUID" />
    </Transition>

    <div v-if="showChecklistsUsed" class="bg-greenGradient gap-2 flex my-4 rounded-md p-2 max-sm:flex-col w-full max-w-[40rem] mx-auto">
      <span v-if="hideChecklistEditsViewing" @click="hideLocalChecklistEdits" class="grow">
        <img src="@/images/view.svg" class="inline mr-2 w-6" alt="">
        {{ $t('listViewer.viewingNew') }}
      </span>
      <span v-else class="grow">
        <img src="@/images/edit.svg" class="inline mr-2 w-6" alt="">
        {{ $t('listViewer.changes4') }}
      </span>
      <button v-if="hideChecklistEditsViewing" @click="hideLocalChecklistEdits" class="p-1 mx-1 bg-black bg-opacity-40 rounded-md button"><img src="@/images/back.svg" class="inline mr-2 w-5" alt="">{{ $t('other.back') }}</button>
      <div class="" v-else>
        <button @click="hideLocalChecklistEdits" class="p-1 mx-1 bg-black bg-opacity-40 rounded-md button"><img src="@/images/view.svg" class="inline mr-2 w-5" alt="">{{ $t('other.hide') }}</button>
        <button @click="discardLocalChecklistEdits" class="p-1 mx-1 bg-black bg-opacity-40 rounded-md button"><img src="@/images/trash.svg" class="inline mr-2 w-5" alt="">{{ $t('other.discard') }}</button>
      </div>
    </div>

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
      <div v-if="!viewedPopups?.pickedStyling && !isReview">
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
            @next-guess="doNextGuess($event)"
            @open-tags="tagViewerOpened = $event"
            @open-collab="openCollabTools"
            @error="listErrorLoading = true"
            @fullscreen-image="levelImageFullscreen($event, index)"
          />      
        </LevelCardTableTable>
      </div>
      
      <div ref="postContent" v-if="isReview" v-show="!commentsShowing && !reviewLevelsOpen">
        <WriterViewer @forced-update="doModifyPost" :writer-data="LIST_DATA.data" :editable="false" :zen-mode="false" />
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

      <ShareSection v-if="LIST_DATA.name != undefined && !(ShareUIHide & URIHideUIOptions.Sharing) && !nonexistentList && !commentsShowing" :share-text="getURL()" :review="isReview" />

      <CommentSection
        v-if="listID != undefined"
        v-show="!(ShareUIHide & URIHideUIOptions.Comments) && (commentsShowing || scrolledToEnd)"
        @update-comment-amount="LIST_DATA.commAmount = $event"
        :comm-amount="LIST_DATA.commAmount"
        :list-i-d="listID"
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