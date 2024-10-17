<script setup lang="ts">
import NotLoggedIn from "./global/NotLoggedInDialog.vue";
import ListSettings from "./editor/ListSettings.vue";
import EditorCard from "./editor/EditorCard.vue";
import EditorCardHeader from "./editor/EditorCardHeader.vue";
import ColorPicker from "./global/ColorPicker.vue";
import TagPickerPopup from "./editor/TagPickerPopup.vue";
import BGImagePicker from "./global/BackgroundImagePicker.vue";
import DescriptionEditor from "./global/TextEditor.vue";
import PickerPopup from "./global/PickerPopup.vue";
import RemoveListPopup from "./editor/RemoveListPopup.vue"
import CollabEditor from "./editor/CollabEditor.vue"
import CollabViewer from "./editor/CollabViewer.vue"
import ErrorPopup from "./editor/errorPopup.vue";
import EditorBackup from "./editor/EditorBackup.vue";
import ListBackground from "./global/ListBackground.vue";
import LevelImportPopup from "./editor/LevelImportPopup.vue";
import { levelList, addLevel, modifyListBG, DEFAULT_LEVELLIST, removeBackup, checkList, isOnline, fixHEX, getBGcolor, newCardBG, predefinedLevelList } from "../Editor";
import { ref, onMounted, watch, provide, reactive } from "vue";
import type { FavoritedLevel, Level, ListUpdateFetch, LevelList, LevelBackup } from "@/interfaces";
import chroma from "chroma-js";
import LevelCard from "./global/LevelCard.vue";
import axios, { type AxiosResponse } from "axios";
import cookier from "cookier"
import router from "@/router";
import { saveBackup, moveLevel } from "../Editor";
import Notification from "./global/Notification.vue";
import { SETTINGS, hasLocalStorage } from "@/siteSettings";
import { onBeforeRouteLeave } from "vue-router";
import { useI18n } from "vue-i18n";
import DialogVue from "./global/Dialog.vue";
import parseText from "./global/parseEditorFormatting";
import { dialog } from "./ui/sizes";
import ImageBrowser from "./global/ImageBrowser.vue";
import { getDominantColor } from "@/Reviews";
import LevelBubble from "./global/LevelBubble.vue";
import { summonNotification } from "./imageUpload";
import { i18n } from "@/locales";


document.title = `Editor | ${ useI18n().t('other.websiteName') }`;
const props = defineProps<{
  isLoggedIn: boolean;
  editing: boolean
  listID: string | number
}>();

levelList.value = JSON.parse(JSON.stringify(DEFAULT_LEVELLIST))
  if (predefinedLevelList.value.length) {
    levelList.value.levels = predefinedLevelList.value
    predefinedLevelList.value = []
  }

const doBackup = () => {
  if (levelList.value.levels.length == 0) return // Do not save without any levels
  if (router.currentRoute.value.name != "editor") return // Only when leaving editor
  summonNotification("", i18n.global.t("editor.levelSaved"), 'check')
  notifStamp.value = saveBackup(listName.value, !!listHiddenSelected())
}

const favoriteLevels = ref<FavoritedLevel>()
const backupData = ref({backupName: "", backupDate: "0", backupData: "", choseHidden: "0"})
let autosaveInterval
onMounted(() => {
  if (localStorage) {
    let backup = localStorage.getItem("listBackup")
    if (backup) {
      let backupParsed: LevelBackup = JSON.parse(backup)
      backupData.value.backupName = backupParsed.listName
      backupData.value.backupDate = new Date(backupParsed.listDate).toLocaleDateString()
      backupData.value.backupData = <any>backupParsed.levelData
      backupData.value.choseHidden = backupParsed.listHidden
    }

    favoriteLevels.value = JSON.parse(localStorage.getItem("favorites")!) ?? []
  }

  if (SETTINGS.value.autosave) {
    // Save when leaving the site
    window.addEventListener("beforeunload", doBackup)
    onBeforeRouteLeave(doBackup)

    autosaveInterval = setInterval(() => {
      if (!SETTINGS.value.autosave) { // If setting changes, do not autosave
        clearInterval(autosaveInterval)
        return
      }
    }, AUTOSAVE_TIMEOUT)

    doBackup()
}
})

var isNowHidden: boolean
const AUTOSAVE_TIMEOUT = SETTINGS.value.autosave*1000

const listExists = ref<boolean>(true)
const listBelongsToYou = ref<boolean>(true)
if (props.editing) {
  axios.post(import.meta.env.VITE_API+"/pwdCheckAction.php", {id: props.listID, type: 'list'}, {headers: {Authorization: cookier('access_token').get()}}).then((res: AxiosResponse) => {
    let listData: ListUpdateFetch | number = res.data;
    if (typeof listData == 'number') {
      switch (listData) {
        case 2: listBelongsToYou.value = false; break;
        case 3: listExists.value = false; break;
      }
      return
    }
    loadList(listData.data, listData.name, listData.hidden)
  }).catch(() => listExists.value = false)
}

function loadList(listData: LevelList, lName: string, hidden: '0'|'1') {
    let list: LevelList = listData;
    levelList.value.levels = []
    listName.value = lName;

    // Old list have levels scattered in levelList
    if (list.levels == undefined) {
      list.levels = []
      Object.keys(list).filter(x => x.match(/^\d+$/)).forEach(level => list.levels.push(list[parseInt(level)]));
    }

    // Check fucked up hex values
    list.levels = list.levels.map(level => {
      if (typeof level.color == "string") {
        let newCols = chroma(fixHEX(level.color)).hsl()
        level.color = newCols
        return level
      } else return level
    })

    levelList.value = list

    // Add missing values
    Object.keys(DEFAULT_LEVELLIST).forEach(key => {
      if (levelList.value[key] == undefined) levelList.value[key] = DEFAULT_LEVELLIST[key]
    })


    isNowHidden = hidden != '0';
    (document.querySelector("input[name='private']") as HTMLInputElement).checked = isNowHidden

    levelList.value.pageBGcolor = modifyListBG(list.pageBGcolor)
}

const openDialogs = reactive({
  tagPopup: false,
  BGpicker: [false, 0, 0],
  BGcolorPicker: false,
  descriptionEditor: false,
  favoriteLevelPicker: false,
  removeListPopup: false,
  importDialog: false,
  imagePicker: [false, 0, 0],
  collabEditor: false
})

const modifyImage = (imgUrl: string) => {
  if (openDialogs.imagePicker[1] == 0) {
    levelList.value.titleImg[0] = imgUrl
    useAccentColor()
  }
  if (openDialogs.imagePicker[1] == -5) {
    let level = levelList.value.levels[openDialogs.imagePicker[2] as number]
    if (!level.BGimage)
      level.BGimage = newCardBG()

    level.BGimage.image[0] = imgUrl
  }
}

provide("openedDialogs", openDialogs)

const previewBackground = ref(false);
const collabEditorOpen = ref(false);
const descriptionFocused = ref(false);

const currentlyOpenedCard = ref(0);
const previewingList = ref(false);

const listName = ref('')
const errorMessage = ref('')
const errorStamp = ref(-1)
const errorDblclickHelp = ref(false)
const formShaking = ref(false)
const collabClipboard = ref()
const collabBackground = ref<HTMLDivElement>()

const loadBackup = () => {
  loadList(JSON.parse(<any>backupData.value.backupData), backupData.value.backupName, <any>backupData.value.choseHidden)
  removeBackup()
  saveBackup(listName.value, !!listHiddenSelected())
}

const startAddLevel = () => {
  addLevel(null);
  currentlyOpenedCard.value = levelList.value.levels.length - 1;
};

const previewList = (bypassCheck: boolean) => {
  let check = checkList(listName.value)
  errorDblclickHelp.value = true
  errorMessage.value = ""
  if (!check.valid && !bypassCheck) {
    errorMessage.value = check.error!
    errorStamp.value = check.stamp!
    formShaking.value = true
    setTimeout(() => formShaking.value = false, 333);
  }
  else
    previewingList.value = true
}

const startMove = (currIndex: number, toPosition: number) => {
  if (updatingPositions.value != -1)
    updateOpenedCard(moveLevel(updatingPositions.value, toPosition));
  else updateOpenedCard(moveLevel(currIndex, toPosition));
  enableMoveControls(-1, toPosition);

  let offset = currIndex > toPosition ? -100 : -200
  window.scrollTo(0, (document.querySelectorAll(".levelCard")[toPosition] as HTMLDivElement).offsetTop+offset)
};

const updatingPositions = ref(-1);
const updateOpenedCard = (newPos: number) => {
  currentlyOpenedCard.value = newPos;
  if (newPos == -1) updatingPositions.value = currentlyOpenedCard.value;
};

const enableMoveControls = (pos: number, nowOpenedIndex: number) => {
  if (pos == -1) {
    // Reset
    updatingPositions.value = -1;
    currentlyOpenedCard.value = nowOpenedIndex;
    return;
  }
  updatingPositions.value = currentlyOpenedCard.value;
  currentlyOpenedCard.value = -1;
};

const favoritesSearch = ref("")
const addFromFavorites = (level: FavoritedLevel) => {
  let addedLevel: Level = {
    levelName: level.levelName,
    creator: level.creator,
    color: chroma(level.levelColor).hsv(),
    levelID: level.levelID,
    video: null,
    difficulty: level.levelDiff,
    tags: [],
  };
  addLevel(addedLevel);
};

const listHiddenSelected = () => (document.querySelector("input[name='private']") as HTMLInputElement).checked ? 1 : 0

const errors = [
  useI18n().t('other.uploadFail'),
  useI18n().t('other.updateFail'),
  useI18n().t('other.removeFail')
]

function uploadList() {
  errorDblclickHelp.value = false
  let check = checkList(listName.value)
  if (!check.valid) {
    errorMessage.value = check.error!
    errorStamp.value = check.stamp!
    formShaking.value = true
    setTimeout(() => formShaking.value = false, 333);
    return
  }

  axios.post(import.meta.env.VITE_API+"/uploadPost.php", {
    postData: levelList.value,
    postName: listName.value,
    hidden: listHiddenSelected(),
    postType: 'list'
  }, {headers: {Authorization: cookier('access_token').get()}}).then((res: AxiosResponse) => {
    if (res.data[0] != -1) {
      removeBackup()
      sessionStorage.setItem("uploadFinished", "1")
      router.replace(`/${res.data[0]}`)
    }
    else {
      errorDblclickHelp.value = false
      errorMessage.value = errors[0]+res.data[1]
      errorStamp.value = Math.random()
    }
  }).catch(res => {
      errorDblclickHelp.value = false
      errorMessage.value = errors[0]+"-1"
      errorStamp.value = Math.random()
  })
}

function updateList() {
  errorDblclickHelp.value = false
  let check = checkList(listName.value)
  if (!check.valid) {
    errorMessage.value = check.error!
    errorStamp.value = check.stamp!
    formShaking.value = true
    setTimeout(() => formShaking.value = false, 333);
    return
  }

  axios.post(import.meta.env.VITE_API+"/updateList.php", {
    listData: JSON.stringify(levelList.value),
    id: props.listID,
    isNowHidden: isNowHidden ? "true" : "false",
    diffGuesser: (levelList.value.diffGuesser[0] as any) | 0,
    hidden: listHiddenSelected(),
    type: 'list',
    disComments: (levelList.value.disComments as any) | 0
  }, {headers: {Authorization: cookier('access_token').get()}}).then((res: AxiosResponse) => {
    if (res.data[0] != -1) {
      removeBackup()
      sessionStorage.setItem("uploadFinished", "2")
      router.replace(`/${res.data[0]}`)
    }
    else {
      errorDblclickHelp.value = false
      errorMessage.value = errors[1]+res.data[1]
      errorStamp.value = Math.random()
    }
  }).catch(res => {
      errorDblclickHelp.value = false
      errorMessage.value = errors[1]+"-1"
      errorStamp.value = Math.random()
  })
}

function removeList() {
  axios.post(import.meta.env.VITE_API+"/removeList.php", {
    id: props.listID,
    hidden: listHiddenSelected(),
    type: 'list'
  }, {headers: {Authorization: cookier('access_token').get()}}).then((res: AxiosResponse) => {
    if (res.data == 3) {
      removeBackup()
      router.replace('/browse/lists')
    }
    else {
      errorDblclickHelp.value = false
      errorMessage.value = errors[2]+res.data
      errorStamp.value = Math.random()
    }
  }).catch(res => {
      errorDblclickHelp.value = false
      errorMessage.value = errors[2]+"-1"
      errorStamp.value = Math.random()
  })

  let timeoutLength = Math.trunc(1/levelList.value.levels.length*1000)
  let levelCards = document.querySelectorAll(".levelCard")

  let i = 0
  let hide = setInterval(() => {
    (levelCards[i] as HTMLDivElement).style.display = "none"
    i++
    if (i == levelCards.length) clearInterval(hide)
  }, timeoutLength)

}

function throwError(messsage: string, dblClickHelp: boolean) {
  errorDblclickHelp.value = dblClickHelp
  errorMessage.value = messsage
  errorStamp.value = Math.random()
  formShaking.value = true
  setTimeout(() => formShaking.value = false, 333);
}

const closeCollabTools = () => {
  collabEditorOpen.value = false
  if (typeof levelList.value.levels[currentlyOpenedCard.value].creator == "string") return
  (document.querySelector("input[name=creator]") as HTMLInputElement).value = levelList.value.levels[currentlyOpenedCard.value].creator[0][0].name
}

const collabData = ref({
  levelName: "",
  levelColor: [0,0,0],
  collabData: null,
  index: 0,
  levelID: 0
})
const openCollabTools = (ind: number, col: [number, number, number]) => {
  if (typeof levelList.value?.levels?.[ind]?.creator == "string") return

  collabData.value.levelName = levelList.value?.levels?.[ind].levelName
  collabData.value.levelColor = col
  collabData.value.index = ind
  collabData.value.levelID = levelList.value?.levels?.[ind].levelID
  collabData.value.collabData = levelList.value?.levels?.[ind].creator

}

const useAccentColor = (url: string) => {
  let img = document.createElement("img")
  let col = null
  img.src = url
  img.onload = () => {
    col = getDominantColor(img).hex()
    img.remove()
  }
  return col
}

</script>

<template>
  <DialogVue :open="openDialogs.tagPopup" @close-popup="openDialogs.tagPopup = false" :title="$t('editor.tagTitle')">
    <TagPickerPopup
      @add-tag="levelList.levels[currentlyOpenedCard].tags.push($event)"
    ></TagPickerPopup>
  </DialogVue>

  <DialogVue :open="openDialogs.BGpicker[0]" @close-popup="openDialogs.BGpicker[0] = false" disable-tap-close :title="$t('other.imageSettings')" :width="dialog.xl">
    <BGImagePicker
      :source="[
        levelList.titleImg,
        levelList?.levels?.[openDialogs.BGpicker[2]]?.BGimage?.image]
        [openDialogs.BGpicker[1]]"
      :force-aspect-height="openDialogs.BGpicker[1] ? 20 : false"
      :disable-controls="openDialogs.BGpicker[1]"
    />
  </DialogVue>

  <DialogVue :open="openDialogs.descriptionEditor" @close-popup="openDialogs.descriptionEditor = false" :title="$t('editor.descriptionEditor')" :width="dialog.xl">
    <DescriptionEditor
      :edit-value="levelList"
    />
  </DialogVue>


  <CollabEditor
    v-if="collabEditorOpen"
    :index="currentlyOpenedCard"
    :level-array="levelList.levels"
    :clipboard="collabClipboard"
    @send-clipboard="collabClipboard = $event"
    @close-popup="closeCollabTools()"
  />

  <DialogVue :open="openDialogs.favoriteLevelPicker" @close-popup="openDialogs.favoriteLevelPicker = false" :title="$t('other.savedLevels')">
    <PickerPopup
      v-if="openDialogs.favoriteLevelPicker"
      v-model="favoritesSearch"
    >
      <template #error v-if="levelList.levels.length >= 50">
        <span>{{ $t('editor.maxLevels') }}</span>
      </template>
      <template #default v-else="favoriteLevels">
        <LevelBubble @pick="addFromFavorites($event)" v-for="level in favoriteLevels.filter(x => x.levelName.toLowerCase().includes(favoritesSearch))" :data="level" />
      </template>
    </PickerPopup>
  </DialogVue>

  <DialogVue :open="openDialogs.importDialog" @close-popup="openDialogs.importDialog = false" :title="$t('editor.importLevels')">
    <LevelImportPopup @close-popup="openDialogs.importDialog = false" @add-level="addLevel($event)" />
  </DialogVue>

  <DialogVue :open="openDialogs.imagePicker[0]" @close-popup="openDialogs.imagePicker[0] = false" :title="$t('editor.titleImage')" :width="dialog.large">
    <ImageBrowser :unselectable="false" :disable-external="openDialogs.imagePicker[1] == -5 " @pick-image="modifyImage" @close-popup="openDialogs.imagePicker[0] = false" />
  </DialogVue>

  <!-- Background preview -->
  <Transition name="fade">
    <ListBackground v-if="previewBackground || previewingList" :image-data="levelList.titleImg" :list-color="levelList.pageBGcolor" />
  </Transition>

  <RemoveListPopup @close-popup="openDialogs.removeListPopup = false" @delete-list="removeList" v-if="openDialogs.removeListPopup"/>

  <NotLoggedIn
    v-if="!isLoggedIn && hasLocalStorage()"
    :mess="$t('editor.loginToCreate')"
  />
  <div v-else-if="!hasLocalStorage()" class="flex flex-col gap-4 justify-center items-center mx-auto mt-5">
    <img src="../images/disCookies.svg" class="w-48 opacity-20" alt="">
    <h1 class="max-w-sm text-2xl text-center text-white opacity-20">{{ $t('editor.cookDisabled') }}</h1>
  </div>

  <ErrorPopup :error-text="errorMessage" :stamp="errorStamp" :show-dblclick-info="errorDblclickHelp" :previewing="previewingList"/>

  <!-- List Preview -->
  <section v-if="previewingList" class="mt-4">
    <div :class="{'!mt-16': !isOnline}" class="flex fixed top-16 sm:top-12 left-1/2 z-10 justify-center items-center px-3 py-2 w-96 max-w-[95vw] text-white bg-black bg-opacity-80 rounded-lg -translate-x-1/2">
      <h1 class="text-3xl text-center text-white">{{ $t('editor.preview') }}</h1>
      <button @click="previewingList = false" class="box-border absolute left-1 top-1/2 p-1 w-10 -translate-y-1/2 button">
        <img src="@/images/close.svg" class="w-full" alt="" />
      </button>
    </div>
    <div class="flex flex-col gap-3 items-center mt-20" v-show="previewingList">
      <LevelCard
        v-for="(level, ind) in levelList.levels"
        v-bind="level"
        :disable-stars="true"
        :translucent-card="levelList.translucent"
        @open-collab="openCollabTools(ind, level.color)"
      />
    </div>
    <DialogVue :open="collabData.collabData != null" @close-popup="collabData.collabData = null">
      <CollabViewer :editor="true" v-if="collabData.collabData != null" v-bind="collabData" :translucent="levelList?.translucent!" @close-popup="collabData.collabData = null" />
    </DialogVue>
  </section>

  <!-- Edit error - List doesn't exist -->
  <section
    class="flex flex-col items-center mx-auto my-11 w-max text-2xl font-bold text-center text-white opacity-40"
    v-if="!listExists"
  >
    <img src="@/images/listError.svg" class="mb-4 w-48" alt="">
    <p>{{ $t('editor.nonexistentList') }}</p>
  </section>


  <!-- Edit error - List doesn't belong to you -->
  <section
    class="flex flex-col items-center mx-auto my-11 w-max text-2xl font-bold text-center text-white opacity-40"
    v-if="!listBelongsToYou"
  >
    <div class="relative mb-4">
      <img src="@/images/edit.svg" class="w-48" alt="">
      <img src="@/images/close.svg" class="absolute right-0 bottom-5 w-12" alt="">
    </div>
    <p>{{ $t('editor.notBelongToYou') }}!</p>
  </section>

  <!-- Editor -->
  <main
    class="mx-auto flex w-[70rem] max-w-[95vw] mt-6 flex-col items-center rounded-md bg-greenGradient pb-3 text-white shadow-drop"
    :class="{'motion-reduce:animate-none animate-[shake_0.2s_infinite]': formShaking}"
    v-show="!previewingList"
    v-if="isLoggedIn && listExists && listBelongsToYou"
  >
    <div
      class="flex gap-2 justify-around p-2 w-full max-w-[55rem] max-sm:flex-col"
    >
    <div class="flex flex-col gap-2 grow">
      <!-- List name -->
        <input
          autocomplete="off"
          type="text"
          id="levelName"
          maxlength="40"
          :disabled="editing"
          v-model="listName"
          :placeholder="$t('editor.levelName')"
          class="px-2 py-1 w-full text-2xl bg-black bg-opacity-40 rounded-md disabled:bg-opacity-0 disabled:cursor-not-allowed disabled:border-white disabled:border-2 disabled:border-opacity-10"
          />

        <!-- List description -->
      <div class="flex relative row-span-3 gap-2 items-start w-full h-full min-h-10 group" @click="descriptionFocused = true">
        <textarea
          autocomplete="off"
          type="text"
          id="description"
          maxlength="3000"
          vue:updated="$el.focus()"
          :placeholder="$t('editor.listDescription')"
          class="px-2 w-full h-full bg-black bg-opacity-20 rounded-md resize-none placeholder:text-lg"
          v-model="levelList.description"
          @blur="descriptionFocused = false"
          v-if="descriptionFocused || !levelList.description"
        ></textarea>
        <div v-else
        class="overflow-auto overflow-y-auto px-2 h-full max-h-20 bg-black bg-opacity-20 rounded-md min-h-[72px] regularParsing grow"
        v-html="parseText(levelList.description)"
        ></div>
        <button type="button" @click="openDialogs.descriptionEditor = true" class="absolute right-2 bottom-2 p-1.5 w-8 bg-white bg-opacity-10 rounded-md opacity-0 transition-opacity group-hover:opacity-100 button">
          <img
            class="w-8"
            src="../images/fullscreen.svg"
            alt=""
          />
        </button>
      </div>
    </div>
      <div class="flex gap-2 justify-around">
          <div class="flex flex-col items-center p-1 px-2 w-full bg-black bg-opacity-20 rounded-md sm:w-32">
            <img src="@/images/color.svg" class="p-1 w-12 opacity-40" alt="">
            <span class="mb-2 text-xl">{{ $t('editor.bgColor') }}</span>
            <div class="flex gap-1">
              <button @click="openDialogs.BGcolorPicker = !openDialogs.BGcolorPicker" :style="{backgroundColor: getBGcolor()}" class="flex gap-1 items-center p-1 bg-black bg-opacity-40 rounded-md button">
                <img src="@/images/pippete.svg" class="box-content p-0.5 px-2 w-4 rounded-md border-2 border-white" alt="">
              </button>
              <button
                @click="levelList.pageBGcolor = modifyListBG([0,0,0], true); openDialogs.BGcolorPicker = false"
                v-show="JSON.stringify(levelList.pageBGcolor) != JSON.stringify(DEFAULT_LEVELLIST.pageBGcolor)"
                class="flex gap-1 items-center p-1 bg-black bg-opacity-40 rounded-md button"
              >
                <img src="@/images/trash.svg" class="w-6" alt="">
              </button>
            </div>
          </div>
          <div :style="{backgroundImage: `url(${levelList.titleImg[0]})`}" :class="{'!bg-opacity-60': levelList.titleImg[0]}" class="flex flex-col items-center p-1 w-full bg-black bg-opacity-20 bg-center bg-cover rounded-md bg-blend-overlay sm:w-48">
            <img src="@/images/image.svg" class="p-1 w-12 opacity-40" alt="">
            <span class="mb-2 text-xl">{{ $t('other.bg') }}</span>
            <div class="flex gap-1">
              <button @click="openDialogs.BGpicker[0] = true; openDialogs.BGpicker[1] = 0" v-show="levelList.titleImg[0]" class="flex gap-1 items-center p-1 bg-black bg-opacity-40 rounded-md button">
              <img src="@/images/gear.svg" class="w-6" alt="">
              </button>
              <button @click="openDialogs.imagePicker[0] = true; openDialogs.imagePicker[1] = 0" class="flex gap-1 items-center p-1 bg-black bg-opacity-40 rounded-md button">
                <img src="@/images/copy.svg" class="w-6" alt="">
                <span>{{ levelList.titleImg[0] ? $t('other.modify') : $t('other.pick') }}</span>
              </button>
              <button @click="previewBackground = !previewBackground" v-show="levelList.titleImg[0]" class="flex gap-1 items-center p-1 bg-black bg-opacity-40 rounded-md button">
                <img src="@/images/view.svg" class="w-6 opacity-100 transition-opacity duration-75" :class="{'opacity-20': !previewBackground}" alt="">
              </button>
            </div>
          </div>
        </div>
    </div>


    <div
      v-show="openDialogs.BGcolorPicker"
      class="px-3 py-2 my-2 w-full max-w-[54rem] bg-white bg-opacity-10 rounded-md"
    >
      <ColorPicker @colors-modified="levelList.pageBGcolor = modifyListBG($event, false, false)" :hue="levelList.pageBGcolor[0]" :saturation="0.36" :lightness="levelList.pageBGcolor[2]"/>
    </div>

    <header
      class="sticky -top-8 z-10 flex w-full flex-row items-center justify-between bg-[url(../images/headerBG.webp)] px-2 py-2"
      id="editorHeader"
    >
      <span class="text-2xl font-black">{{ $t('editor.levels') }}</span>
      <div class="box-border flex mt-2" v-if="updatingPositions == -1">
        <button type="button" @click="previewList(false)" @dblclick="previewList(true)">
          <img
            class="p-2 w-10 bg-black bg-opacity-40 rounded-md hover:bg-black hover:bg-opacity-60"
            src="../images/preview.svg"
            alt=""
          />
        </button>
        <button :disabled="levelList.levels.length >= 50" type="button" class="disabled:grayscale transition-[filter_0.2s] ml-3" @click="openDialogs.importDialog = true">
          <img
            class="p-2 w-10 bg-black bg-opacity-40 rounded-l-md hover:bg-black hover:bg-opacity-60"
            src="../images/importLevels.svg"
            alt=""
          />
        </button>
        <button :disabled="levelList.levels.length >= 50" type="button" class="disabled:grayscale transition-[filter_0.2s]" @click="openDialogs.favoriteLevelPicker = true">
          <img
            class="p-2 w-10 bg-black bg-opacity-40 hover:bg-black hover:bg-opacity-60"
            src="../images/addfromFaves.svg"
            alt=""
          />
        </button>
        <button :disabled="levelList.levels.length >= 50" type="button" class="disabled:grayscale transition-[filter_0.2s]" @click="startAddLevel()">
          <img
            class="p-2 w-10 bg-black bg-opacity-40 rounded-r-md hover:bg-black hover:bg-opacity-60"
            src="../images/addLevel.svg"
            alt=""
            id="addLevelButton"
          />
        </button>
      </div>
    </header>

    <main
      class="flex min-h-[6rem] w-full flex-col gap-1.5 bg-[url(../images/fade.webp)] bg-repeat-x px-2 py-2"
    >
      <EditorBackup v-if="levelList.levels.length == 0" :backup-data="backupData" @load-backup="loadBackup(); backupData.backupDate = '0'" @remove-backup="removeBackup(); backupData.backupDate = '0'"/>

      <div v-if="!levelList.levels.length" class="mt-2 mb-8 w-full mx-auto max-w-[50rem]">
        <h2 class="mb-3 text-xl text-center">{{ $t('editor.startHelp') }}</h2>
        <div class="flex gap-2 items-center max-sm:flex-col">
          <button @click="addLevel()" class="flex gap-2 items-center p-1 w-9/12 bg-black bg-opacity-20 rounded-md hover:bg-opacity-40"><img src="../images/addLevel.svg" class="w-8" alt="">{{ $t('reviews.addLevel') }}</button>
          <button @click="openDialogs.favoriteLevelPicker = true" class="flex gap-2 items-center p-1 w-9/12 bg-black bg-opacity-20 rounded-md hover:bg-opacity-40"><img src="../images/addfromFaves.svg" class="w-8" alt="">{{ $t('editor.addFromSaves') }}</button>
          <button @click="openDialogs.importDialog = true" class="flex gap-2 items-center p-1 w-9/12 bg-black bg-opacity-20 rounded-md hover:bg-opacity-40"><img src="../images/importLevels.svg" class="w-8" alt="">{{ $t('editor.importFromGD') }}</button>
        </div>
      </div>

      <!-- Levels -->
      <component
        v-for="(level, index) in levelList.levels"
        :data="level"
        :index="index"
        :level-array="levelList"
        :updating-positions="updatingPositions"
        @do-move="startMove"
        @update-opened-card="updateOpenedCard"
        @move-controls="enableMoveControls"
        @open-tag-popup="openDialogs.tagPopup = true"
        @open-collab-tools="collabEditorOpen = true"
        @throw-error="throwError($event, false)"
        class="levelCard"
        :is="currentlyOpenedCard == index ? EditorCard : EditorCardHeader"
      />
    </main>
    <ListSettings />

    <section class="flex gap-3" :class="{'disabled': !isOnline}">
      <button
        class="flex gap-2 items-center px-3 py-2 mt-3 font-black text-black rounded-md button bg-lof-400 focus-within:outline-white"
        @click="uploadList"
        v-if="!editing"
        :disabled="!isOnline"
      >
        <img src="../images/upload.svg" class="w-6" alt="" />{{ $t('editor.upload') }}
      </button>
      <button
        class="flex gap-2 items-center px-3 py-2 mt-3 font-black text-black rounded-md button bg-lof-400 focus-within:outline-white"
        @click="updateList"
        v-if="editing"
        :disabled="!isOnline"
      >
        <img src="../images/upload.svg" class="w-6" alt="" />{{ $t('editor.update') }}
      </button>
      <button
        class="flex gap-2 items-center px-3 py-2 mt-3 font-black text-black bg-red-400 rounded-md button focus-within:outline-white"
        @click="openDialogs.removeListPopup = true"
        v-if="editing"
        :disabled="!isOnline"
      >
        <img src="../images/del.svg" class="w-6" alt="" />{{ $t('editor.remove') }}
      </button>
    </section>
  </main>
</template>
