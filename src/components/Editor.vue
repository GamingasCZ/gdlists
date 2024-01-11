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
import { levelList, addLevel, modifyListBG, DEFAULT_LEVELLIST, removeBackup, checkList, isOnline, fixHEX } from "../Editor";
import { ref, onMounted, watch } from "vue";
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

document.title = `Editor | ${ useI18n().t('other.websiteName') }`;
const props = defineProps<{
  isLoggedIn: boolean;
  editing: boolean
  listID: string | number
}>();


const doBackup = () => {
  if (levelList.value.levels.length == 0) return // Do not save without any levels
  if (router.currentRoute.value.name != "editor") return // Only when leaving editor
  notifStamp.value = saveBackup(listName.value, !!listHiddenSelected())
}

const backupData = ref({backupName: "", backupDate: "0", backupData: "", choseHidden: "0"})
let autosaveInterval
onMounted(() => {
  levelList.value = JSON.parse(JSON.stringify(DEFAULT_LEVELLIST))

  if (localStorage) {
    let backup = localStorage.getItem("listBackup")
    if (backup) {
      let backupParsed: LevelBackup = JSON.parse(backup)
      backupData.value.backupName = backupParsed.listName
      backupData.value.backupDate = new Date(backupParsed.listDate).toLocaleDateString()
      backupData.value.backupData = <any>backupParsed.levelData
      backupData.value.choseHidden = backupParsed.listHidden
    }
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
  axios.post(import.meta.env.VITE_API+"/pwdCheckAction.php", {id: props.listID}, {headers: {Authorization: cookier('access_token').get()}}).then((res: AxiosResponse) => {
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

    modifyListBG(list.pageBGcolor)
}

const tagPopupOpen = ref(false);
const BGpickerPopupOpen = ref(false);
const bgColorPickerOpen = ref(false);
const descriptionEditorOpen = ref(false);
const favoriteLevelPickerOpen = ref(false);
const removeListPopupOpen = ref(false);
const collabEditorOpen = ref(false);

const currentlyOpenedCard = ref(0);
const previewingList = ref(false);

const listName = ref('')
const errorMessage = ref('')
const errorStamp = ref(-1)
const errorDblclickHelp = ref(false)
const formShaking = ref(false)
const notifStamp = ref(Math.random())
const collabClipboard = ref()

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
const getBGcolor = () => document.documentElement.style.getPropertyValue('--siteBackground')

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

  axios.post(import.meta.env.VITE_API+"/sendList.php", {
    listData: JSON.stringify(levelList.value),
    lName: (document.getElementById("levelName") as HTMLInputElement).value,
    diffGuesser: (levelList.value.diffGuesser[0] as any) | 0,
    hidden: listHiddenSelected(),
    disComments: (levelList.value.disComments as any) | 0
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
    hidden: listHiddenSelected()
  }, {headers: {Authorization: cookier('access_token').get()}}).then((res: AxiosResponse) => {
    if (res.data == 3) {
      removeBackup()
      router.replace('/browse')
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
const collabDetails = ref([])

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

</script>

<template>
  <Transition name="fade">
    <TagPickerPopup
      v-if="tagPopupOpen"
      @close-popup="tagPopupOpen = false"
      @add-tag="levelList.levels[currentlyOpenedCard].tags.push($event)"
    ></TagPickerPopup>
  </Transition>
  
  <Transition name="fade">
    <BGImagePicker
    v-if="BGpickerPopupOpen"
    @close-popup="BGpickerPopupOpen = false"
    />
  </Transition>

  <Transition name="fade">
    <DescriptionEditor
      v-if="descriptionEditorOpen"
      :editor-title="$t('editor.descriptionEditor')"
      @close-popup="descriptionEditorOpen = false"
    />
  </Transition>

  <Transition name="fade">
    <CollabEditor
      v-if="collabEditorOpen && levelList.levels.length > 0"
      :index="currentlyOpenedCard"
      :clipboard="collabClipboard"
      @send-clipboard="collabClipboard = $event"
      @close-popup="closeCollabTools()"
    />
  </Transition>

  <PickerPopup
    v-if="favoriteLevelPickerOpen"
    :browser-name="$t('other.savedLevels')"
    :outer-error-text="$t('editor.maxLevels')"
    :outer-error="levelList.levels.length >= 50"
    @close-popup="favoriteLevelPickerOpen = false"
    @select-option="addFromFavorites($event)"
    picker-data="@favorites"
    picker-data-type="favoriteLevel"
  />

  <RemoveListPopup @close-popup="removeListPopupOpen = false" @delete-list="removeList" v-if="removeListPopupOpen"/>

  <h2 class="my-4 text-3xl text-center text-white" v-show="!previewingList">
    {{ editing ? $t('editor.editing') : $t('editor.editor') }}
  </h2>
  <NotLoggedIn
    v-if="!isLoggedIn && hasLocalStorage()"
    :mess="$t('editor.loginToCreate')"
  />
  <div v-else-if="!hasLocalStorage()" class="flex flex-col gap-4 justify-center items-center mx-auto mt-5">
    <img src="../images/disCookies.svg" class="w-48 opacity-20" alt="">
    <h1 class="max-w-sm text-2xl text-center text-white opacity-20">Nemáš povolené cookies, můžeš jen procházet seznamy!</h1>
  </div>

  <ErrorPopup :error-text="errorMessage" :stamp="errorStamp" :show-dblclick-info="errorDblclickHelp" :previewing="previewingList"/>

  <!-- List Preview -->
  <section v-if="previewingList" class="mt-4">
    <ListBackground :image-data="levelList.titleImg" :list-color="<any>levelList.pageBGcolor" />
    <div :class="{'!mt-16': !isOnline}" class="flex fixed top-16 sm:top-12 left-1/2 z-10 justify-center items-center px-3 py-2 w-96 max-w-[95vw] text-white bg-black bg-opacity-80 rounded-lg -translate-x-1/2">
      <h1 class="text-3xl text-center text-white">{{ $t('editor.preview') }}</h1>
      <button @click="previewingList = false" class="box-border absolute left-1 top-1/2 p-1 w-10 -translate-y-1/2 button">
        <img src="@/images/close.svg" class="w-full" alt="" />
      </button>
    </div>
    <div class="flex flex-col gap-3 mt-20" v-show="previewingList">
      <LevelCard
        v-for="(level, ind) in levelList.levels"
        v-bind="level"
        :disable-stars="true"
        :translucent-card="levelList.translucent"
        @open-collab="openCollabTools(ind, level.color)"
      />
    </div>
    {{ collabDetails }}
    <CollabViewer :editor="true" v-if="collabData.collabData != null" v-bind="collabData" :translucent="levelList?.translucent!" @close-popup="collabData.collabData = null" />
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
    class="mx-auto flex w-[70rem] max-w-[95vw] flex-col items-center rounded-md bg-greenGradient pb-3 text-white shadow-drop"
    :class="{'motion-reduce:animate-none animate-[shake_0.2s_infinite]': formShaking}"
    v-show="!previewingList"
    v-if="isLoggedIn && listExists && listBelongsToYou"
  >
    <div
      class="my-2 grid w-full grid-cols-[max-content_max-content] items-center justify-center gap-y-2 gap-x-3 sm:-mr-10"
    >
    
      <!-- List name -->
      <input
        autocomplete="off"
        type="text"
        id="levelName"
        maxlength="40"
        :disabled="editing"
        v-model="listName"
        :placeholder="$t('editor.levelName')"
        class="h-8 w-[77vw] max-w-[20em] rounded-md bg-white bg-opacity-5 px-2 placeholder:text-lg disabled:bg-opacity-0 disabled:cursor-not-allowed"
      />
      <div></div>

      <!-- List description -->
      <textarea
        autocomplete="off"
        type="text"
        id="description"
        maxlength="3000"
        :placeholder="$t('editor.listDescription')"
        class="h-8 w-[77vw] max-w-[20em] resize-none rounded-md bg-white bg-opacity-5 px-2 placeholder:text-lg focus:h-16"
        v-model="levelList.description"
      ></textarea>
      <button type="button">
        <img
          class="p-1.5 w-8 bg-black bg-opacity-50 rounded-md button"
          src="../images/fullscreen.svg"
          alt=""
          @click="descriptionEditorOpen = true"
        />
      </button>

      <!-- List Background -->
      <input
        autocomplete="off"
        type="text"
        maxlength="150"
        :placeholder="$t('editor.titleImage')"
        class="h-8 w-[77vw] max-w-[20em] rounded-md bg-white bg-opacity-5 px-2 placeholder:text-lg"
        v-model="levelList.titleImg[0]"
      />
      <button type="button">
        <img
          class="p-1.5 w-8 bg-black bg-opacity-50 rounded-md button"
          src="../images/gear.svg"
          alt=""
          @click="BGpickerPopupOpen = true"
        />
      </button>

    </div>

    <div class="flex gap-2 items-center my-1">
      <span>{{$t('editor.bgColor')}}</span>
      <button
        type="button"
        class="box-border flex justify-center items-center w-8 h-8 rounded-md border-2 border-white focus:outline focus:outline-current button"
        @click="bgColorPickerOpen = !bgColorPickerOpen"
        :style="{background: getBGcolor()}"
      >
        <img src="../images/color.svg" alt="" class="w-5" />
      </button>
      <button v-if="JSON.stringify(levelList.pageBGcolor) != JSON.stringify(DEFAULT_LEVELLIST.pageBGcolor)" class="ml-1 button" @click="modifyListBG([0,0,0], true)">
        <img src="@/images/close.svg" class="w-4" alt="">
      </button>
    </div>

    <div
      v-show="bgColorPickerOpen"
      class="px-3 py-2 my-2 w-9/12 bg-black bg-opacity-40 rounded-md"
    >
      <ColorPicker @colors-modified="modifyListBG" :hue="levelList.pageBGcolor[0]" :saturation="0.36" :lightness="levelList.pageBGcolor[2]"/>
    </div>

    <header
      class="sticky -top-8 z-10 flex w-full flex-row items-center justify-between bg-[url(../images/headerBG.webp)] px-2 py-2"
      id="editorHeader"
    >
      <span class="text-2xl font-black">{{ $t('editor.levels') }}</span>
      <div class="box-border flex gap-3 mt-2" v-if="updatingPositions == -1">
        <button type="button" @click="previewList(false)" @dblclick="previewList(true)">
          <img
            class="p-1.5 w-10 bg-black bg-opacity-50 rounded-md button"
            src="../images/preview.svg"
            alt=""
          />
        </button>
        <button :disabled="levelList.levels.length >= 50" type="button" class="disabled:grayscale transition-[filter_0.2s]" @click="favoriteLevelPickerOpen = true">
          <img
            class="p-1.5 w-10 bg-black bg-opacity-50 rounded-md button"
            src="../images/addfromFaves.svg"
            alt=""
          />
        </button>
        <button :disabled="levelList.levels.length >= 50" type="button" class="disabled:grayscale transition-[filter_0.2s]" @click="startAddLevel()">
          <img
            class="p-1.5 w-10 bg-black bg-opacity-50 rounded-md button"
            src="../images/addLevel.svg"
            alt=""
            id="addLevelButton"
          />
        </button>
      </div>
    </header>

    <Notification :title="$t('editor.levelSaved')" icon="save" :stamp="notifStamp"/>

    <main
      class="flex min-h-[6rem] w-full flex-col gap-1.5 bg-[url(../images/fade.webp)] bg-repeat-x px-2 py-2"
    >
      <EditorBackup v-if="levelList.levels.length == 0" :backup-data="backupData" @load-backup="loadBackup(); backupData.backupDate = '0'" @remove-backup="removeBackup(); backupData.backupDate = '0'"/>

      <h2 v-if="!levelList.levels.length" class="mt-4">
        {{ $t('editor.clickAdd1') }}
        <img
          class="inline p-1 mx-2 w-10 bg-black bg-opacity-50 rounded-md"
          src="../images/addLevel.svg"
        />
        {{ $t('editor.clickAdd2') }}
      </h2>

      <!-- Levels -->
      <component
        v-for="(level, index) in levelList.levels"
        :data="level"
        :index="index"
        :updating-positions="updatingPositions"
        @do-move="startMove"
        @update-opened-card="updateOpenedCard"
        @move-controls="enableMoveControls"
        @open-tag-popup="tagPopupOpen = true"
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
        @click="removeListPopupOpen = true"
        v-if="editing"
        :disabled="!isOnline"
      >
        <img src="../images/del.svg" class="w-6" alt="" />{{ $t('editor.remove') }}
      </button>
    </section>
  </main>
</template>
