<script setup lang="ts">
import NotLoggedIn from "./global/NotLoggedInDialog.vue";
import ListSettings from "./editor/ListSettings.vue";
import EditorCard from "./editor/EditorCard.vue";
import ColorPicker from "./global/ColorPicker.vue";
import TagPickerPopup from "./editor/TagPickerPopup.vue";
import BGImagePicker from "./global/BackgroundImagePicker.vue";
import DescriptionEditor from "./global/TextEditor.vue";
import PickerPopup from "./global/PickerPopup.vue";
import RemoveListPopup from "./editor/RemoveListPopup.vue"
import { levelList, addLevel, modifyListBG, DEFAULT_LEVELLIST, makeColor } from "../Editor";
import { ref, onMounted, nextTick } from "vue";
import type { FavoritedLevel, Level, ListUpdateFetch, LevelList } from "@/interfaces";
import chroma from "chroma-js";
import LevelCard from "./global/LevelCard.vue";
import axios, { type AxiosResponse } from "axios";
import cookier from "cookier"
import router from "@/router";

document.title = "Editor | GD Seznamy";

const props = defineProps<{
  isLoggedIn: boolean;
  editing: boolean
  listID: string | number
}>();

onMounted(() => {
  levelList.value = JSON.parse(JSON.stringify(DEFAULT_LEVELLIST))
})

var isNowHidden: Boolean
if (props.editing) {
  axios.post(import.meta.env.VITE_API+"/pwdCheckAction.php", {id: props.listID}, {headers: {Authorization: cookier('access_token').get()}}).then((res: AxiosResponse) => {
    let listData: ListUpdateFetch = res.data;
    let list: LevelList = listData.data;
    (document.getElementById("levelName") as HTMLInputElement).value = listData.name;
    (document.getElementById("levelName") as HTMLInputElement).disabled = true;
    levelList.value.description = list.description;

    isNowHidden = listData.hidden != '0';
    (document.querySelector("input[name='private']") as HTMLInputElement).checked = isNowHidden

    // Old list have levels scattered in levelList
    if (list.levels == undefined) {
      list.levels = []
      Object.keys(list).filter(x => x.match(/^\d+$/)).forEach(level => list.levels.push(list[parseInt(level)]));
    }

    list.levels.forEach(level => addLevel(level))

    levelList.value.pageBGcolor = makeColor(list.pageBGcolor)
    
    // Color is most likely #020202, the default color
    if (!isNaN(levelList.value.pageBGcolor[0])) modifyListBG(levelList.value.pageBGcolor)
  })
}

const nice = () => {
  console.log(levelList.value);
};
const currentlyOpenedCard = ref<number>(0);
const tagPopupOpen = ref<boolean>(false);
const BGpickerPopupOpen = ref<boolean>(false);
const bgColorPickerOpen = ref<boolean>(false);
const descriptionEditorOpen = ref<boolean>(false);
const favoriteLevelPickerOpen = ref<boolean>(false);
const removeListPopupOpen = ref<boolean>(false);
const previewingList = ref<boolean>(false);

const startAddLevel = () => {
  addLevel(null);
  currentlyOpenedCard.value = levelList.value.levels.length - 1;
};

const updatingPositions = ref<number>(-1);
const updateOpenedCard = (newPos: number) => {
  currentlyOpenedCard.value = newPos;
  if (newPos == -1) updatingPositions.value = currentlyOpenedCard.value;
};

let oldOpenedPos = 0;
const enableMoveControls = (pos: number, nowOpenedIndex: number) => {
  if (pos == -1) {
    // Reset
    updatingPositions.value = -1;
    currentlyOpenedCard.value = nowOpenedIndex;
    return;
  }
  updatingPositions.value = currentlyOpenedCard.value;
  oldOpenedPos = currentlyOpenedCard.value;
  currentlyOpenedCard.value = -1;
};

const addFromFavorites = (level: FavoritedLevel) => {
  let addedLevel: Level = {
    levelName: level.levelName,
    creator: level.creator,
    color: chroma(level.levelColor).hsv(),
    levelID: level.levelID,
    video: null,
    difficulty: [0, 0],
    tags: [],
  };
  addLevel(addedLevel);
};

function uploadList() {
  axios.post(import.meta.env.VITE_API+"/sendList.php", {
    listData: JSON.stringify(levelList.value),
    lName: (document.getElementById("levelName") as HTMLInputElement).value,
    diffGuesser: (levelList.value.diffGuesser[0] as any) | 0,
    hidden: (document.querySelector("input[name='private']") as HTMLInputElement).checked | 0
  }, {headers: {Authorization: cookier('access_token').get()}}).then((res: AxiosResponse) => {

  })
}

function updateList() {
  axios.post(import.meta.env.VITE_API+"/updateList.php", {
    listData: JSON.stringify(levelList.value),
    id: props.listID,
    isNowHidden: isNowHidden ? "true" : "false",
    diffGuesser: (levelList.value.diffGuesser[0] as any) | 0,
    hidden: (document.querySelector("input[name='private']") as HTMLInputElement).checked | 0
  }, {headers: {Authorization: cookier('access_token').get()}}).then((res: AxiosResponse) => {
    router.push(`/${res.data[0]}`)
  })
}

function removeList() {
  axios.post(import.meta.env.VITE_API+"/removeList.php", {
    id: props.listID,
    hidden: (document.querySelector("input[name='private']") as HTMLInputElement).checked ? "1" : "0"
  }, {headers: {Authorization: cookier('access_token').get()}}).then((res: AxiosResponse) => {
    if (res.data == 3) {
      router.replace('/browse')
    }
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
</script>

<template>
  <TagPickerPopup
    v-show="tagPopupOpen"
    @close-popup="tagPopupOpen = false"
    @add-tag="levelList.levels[currentlyOpenedCard].tags.push($event)"
  ></TagPickerPopup>
  <BGImagePicker
    v-if="BGpickerPopupOpen"
    @close-popup="BGpickerPopupOpen = false"
  />
  <DescriptionEditor
    v-show="descriptionEditorOpen"
    editor-title="Editor popisku"
    @close-popup="descriptionEditorOpen = false"
  />
  <PickerPopup
    v-show="favoriteLevelPickerOpen"
    browser-name="Uložené levely"
    @close-popup="favoriteLevelPickerOpen = false"
    @select-option="addFromFavorites($event)"
    picker-data="@favorites"
    picker-data-type="favoriteLevel"
  />

  <RemoveListPopup @close-popup="removeListPopupOpen = false" @delete-list="removeList" v-if="removeListPopupOpen"/>

  <h2 class="my-4 text-3xl text-center text-white" v-show="!previewingList">
    {{ editing ? 'Upravování' : 'Editor' }}
  </h2>
  <NotLoggedIn
    v-if="!isLoggedIn"
    mess="Pro vytvoření seznamu se prosím přihlaš!"
  />
  <section v-show="previewingList" class="mt-4">
    <div class="flex fixed top-12 left-1/2 z-10 justify-center items-center px-3 py-2 w-9/12 text-white bg-black bg-opacity-80 rounded-lg -translate-x-1/2">
      <button @click="previewingList = false" class="absolute top-1 left-1 button">
        <img src="@/images/arrow-left.webp" class="w-10" alt="" />
      </button>
      <h1 class="text-3xl text-center text-white">Náhled seznamu</h1>
    </div>
    <div class="flex flex-col gap-3 mt-20">
      <LevelCard
        v-for="level in levelList.levels"
        v-bind="level"
        :disable-stars="true"
        :translucent-card="levelList.translucent"
      />
    </div>
  </section>
  <form
    action="/editor"
    @submit.prevent
    class="mx-auto flex w-[70rem] max-w-[95vw] flex-col items-center rounded-md bg-greenGradient pb-3 text-white shadow-lg shadow-black"
    v-show="!previewingList"
    v-if="isLoggedIn"
  >
    <div
      class="my-2 grid w-full grid-cols-[max-content_max-content] items-center justify-center gap-y-2 gap-x-3 sm:-mr-10"
    >
      <input
        autocomplete="off"
        type="text"
        id="levelName"
        placeholder="Jméno seznamu"
        class="h-8 w-[77vw] max-w-[20em] rounded-md bg-white bg-opacity-5 px-2 placeholder:text-lg"
      />
      <div></div>
      <textarea
        autocomplete="off"
        type="text"
        id="description"
        placeholder="Popis seznamu"
        class="h-16 w-[77vw] max-w-[20em] resize-none rounded-md bg-white bg-opacity-5 px-2 placeholder:text-lg"
        v-model="levelList.description"
      ></textarea>
      <button type="button">
        <img
          class="p-1.5 w-8 bg-black bg-opacity-50 rounded-full button"
          src="../images/fullscreen.svg"
          alt=""
          @click="descriptionEditorOpen = true"
        />
      </button>
      <input
        autocomplete="off"
        type="text"
        placeholder="Obrázek seznamu"
        class="h-8 w-[77vw] max-w-[20em] rounded-md bg-white bg-opacity-5 px-2 placeholder:text-lg"
        v-model="levelList.titleImg[0]"
      />
      <button type="button">
        <img
          class="p-1.5 w-8 bg-black bg-opacity-50 rounded-full button"
          src="../images/gear.svg"
          alt=""
          @click="BGpickerPopupOpen = true"
        />
      </button>
    </div>

    <div class="flex gap-2 items-center my-1">
      <span>Barva pozadí:</span>
      <button
        type="button"
        class="box-border flex justify-center items-center w-8 h-8 rounded-md border-2 border-white focus-visible:outline button"
        @click="bgColorPickerOpen = !bgColorPickerOpen"
      >
        <img src="../images/color.svg" alt="" class="w-5" />
      </button>
    </div>

    <div
      v-show="bgColorPickerOpen"
      class="px-3 py-2 my-2 w-9/12 bg-black bg-opacity-40 rounded-md"
    >
      <ColorPicker @colors-modified="modifyListBG" />
    </div>

    <header
      class="sticky -top-8 z-10 flex w-full flex-row items-center justify-between bg-[url(../images/headerBG.webp)] px-2 py-2"
      id="editorHeader"
    >
      <span class="text-2xl font-black">Levely</span>
      <div class="box-border flex gap-3 mt-2" v-if="updatingPositions == -1">
        <button type="button" @click="previewingList = true">
          <img
            class="p-1.5 w-10 bg-black bg-opacity-50 rounded-full button"
            src="../images/preview.svg"
            alt=""
          />
        </button>
        <button type="button" @click="favoriteLevelPickerOpen = true">
          <img
            class="p-1.5 w-10 bg-black bg-opacity-50 rounded-full button"
            src="../images/addfromFaves.svg"
            alt=""
          />
        </button>
        <button type="button" @click="startAddLevel()">
          <img
            class="p-1.5 w-10 bg-black bg-opacity-50 rounded-full button"
            src="../images/addLevel.svg"
            alt=""
          />
        </button>
      </div>
    </header>

    <main
      class="flex min-h-[6rem] w-full flex-col gap-1.5 bg-[url(../images/fade.webp)] bg-repeat-x px-2 py-2"
    >
      <h2 v-if="!levelList.levels.length" class="mt-4">
        Kliknutím na
        <img
          class="inline p-1 mx-2 w-10 bg-black bg-opacity-50 rounded-full"
          src="../images/addLevel.svg"
        />
        přidáš level!
      </h2>

      <!-- Levels -->
      <EditorCard
        v-for="(level, index) in levelList.levels"
        :data="level"
        :index="index"
        :opened="currentlyOpenedCard == index"
        :updating-positions="updatingPositions"
        @update-opened-card="updateOpenedCard"
        @start-move="enableMoveControls"
        @open-tag-popup="tagPopupOpen = true"
        class="levelCard"
      />
    </main>
    <ListSettings />

    <section class="flex gap-3">
      <button
        type="submit"
        class="flex gap-2 items-center px-3 py-2 mt-3 font-black text-black rounded-md button bg-lof-400"
        @click="uploadList"
        v-if="!editing"
      >
        <img src="../images/upload.svg" class="w-6" alt="" />Nahrát
      </button>
      <button
        type="submit"
        class="flex gap-2 items-center px-3 py-2 mt-3 font-black text-black rounded-md button bg-lof-400"
        @click="updateList"
        v-if="editing"
      >
        <img src="../images/upload.svg" class="w-6" alt="" />Aktualizovat
      </button>
      <button
        type="submit"
        class="flex gap-2 items-center px-3 py-2 mt-3 font-black text-black bg-red-400 rounded-md button"
        @click="removeListPopupOpen = true"
        v-if="editing"
      >
        <img src="../images/del.svg" class="w-6" alt="" />Smazat
      </button>
    </section>
  </form>
  <button @click="nice" class="translate-y-20">dwdsasad</button>
</template>
