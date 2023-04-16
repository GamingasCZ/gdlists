<script setup lang="ts">
import NotLoggedIn from "./global/NotLoggedInDialog.vue";
import ListSettings from "./editor/ListSettings.vue";
import EditorCard from "./editor/EditorCard.vue";
import ColorPicker from "./global/ColorPicker.vue";
import TagPickerPopup from "./editor/TagPickerPopup.vue";
import BGImagePicker from "./global/BackgroundImagePicker.vue";
import DescriptionEditor from "./global/TextEditor.vue";
import PickerPopup from "./global/PickerPopup.vue";
import { levelList, addLevel, modifyListBG } from "../Editor";
import { ref, onMounted } from "vue";
import type { FavoritedLevel, Level } from "@/interfaces";
import chroma from "chroma-js";
import LevelCard from "./global/LevelCard.vue";

document.title = "Editor | GD Seznamy";

defineProps<{
  isLoggedIn: boolean;
}>();

const nice = () => {
  console.log(levelList.value);
};
const currentlyOpenedCard = ref<number>(0);
const tagPopupOpen = ref<boolean>(false);
const BGpickerPopupOpen = ref<boolean>(false);
const bgColorPickerOpen = ref<boolean>(false);
const descriptionEditorOpen = ref<boolean>(false);
const favoriteLevelPickerOpen = ref<boolean>(false);
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

  <h2 class="my-4 text-center text-3xl text-white" v-show="!previewingList">
    Editor
  </h2>
  <NotLoggedIn
    v-if="!isLoggedIn"
    mess="Pro vytvoření seznamu se prosím přihlaš!"
  />
  <section v-show="previewingList">
    <div class="relative mx-5 flex items-center justify-center text-white">
      <button @click="previewingList = false" class="button absolute left-0">
        <img src="@/images/arrow-left.webp" class="w-12" alt="" />
      </button>
      <h1 class="text-center text-3xl text-white">Náhled seznamu</h1>
    </div>
    <div class="mt-12 flex flex-col gap-3">
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
        placeholder="Jméno seznamu"
        class="h-8 w-[77vw] max-w-[20em] rounded-md bg-white bg-opacity-5 px-2 placeholder:text-lg"
      />
      <div></div>
      <textarea
        autocomplete="off"
        type="text"
        placeholder="Popis seznamu"
        class="h-16 w-[77vw] max-w-[20em] resize-none rounded-md bg-white bg-opacity-5 px-2 placeholder:text-lg"
        v-model="levelList.description"
      ></textarea>
      <button type="button">
        <img
          class="button w-8 rounded-full bg-black bg-opacity-50 p-1.5"
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
          class="button w-8 rounded-full bg-black bg-opacity-50 p-1.5"
          src="../images/gear.svg"
          alt=""
          @click="BGpickerPopupOpen = true"
        />
      </button>
    </div>

    <div class="my-1 flex items-center gap-2">
      <span>Barva pozadí:</span>
      <button
        type="button"
        class="focusOutline button box-border flex h-8 w-8 items-center justify-center rounded-md border-2 border-white"
        @click="bgColorPickerOpen = !bgColorPickerOpen"
      >
        <img src="../images/color.svg" alt="" class="w-5" />
      </button>
    </div>

    <div
      v-show="bgColorPickerOpen"
      class="my-2 w-9/12 rounded-md bg-black bg-opacity-40 px-3 py-2"
    >
      <ColorPicker @colors-modified="modifyListBG" />
    </div>

    <header
      class="sticky -top-8 z-10 flex w-full flex-row items-center justify-between bg-[url(../images/headerBG.webp)] px-2 py-2"
      id="editorHeader"
    >
      <span class="text-2xl font-black">Levely</span>
      <div class="mt-2 box-border flex gap-3">
        <button type="button" @click="previewingList = true">
          <img
            class="button w-10 rounded-full bg-black bg-opacity-50 p-1.5"
            src="../images/preview.svg"
            alt=""
          />
        </button>
        <button type="button" @click="favoriteLevelPickerOpen = true">
          <img
            class="button w-10 rounded-full bg-black bg-opacity-50 p-1.5"
            src="../images/addfromFaves.svg"
            alt=""
          />
        </button>
        <button type="button" @click="startAddLevel()">
          <img
            class="button w-10 rounded-full bg-black bg-opacity-50 p-1.5"
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
          class="mx-2 inline w-10 rounded-full bg-black bg-opacity-50 p-1"
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
    <button
      type="submit"
      class="button mt-3 flex items-center gap-2 rounded-md bg-lof-400 px-3 py-2 font-black text-black"
    >
      <img src="../images/upload.svg" class="w-6" alt="" />Nahrát
    </button>
  </form>
  <button @click="nice" class="translate-y-20">dwdsasad</button>
</template>
