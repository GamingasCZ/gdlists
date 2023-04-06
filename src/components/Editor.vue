<script setup lang="ts">
import NotLoggedIn from "./global/NotLoggedInDialog.vue";
import ListSettings from "./editor/ListSettings.vue";
import EditorCard from "./editor/EditorCard.vue";
import ColorPicker from "./global/ColorPicker.vue";
import TagPickerPopup from "./editor/TagPickerPopup.vue";
import BGImagePicker from "./global/BackgroundImagePicker.vue";
import DescriptionEditor from "./global/TextEditor.vue";
import { levelList, addLevel, modifyListBG } from "../Editor";
import { ref } from "vue";

const nice = () => {
  console.log(levelList.value);
};
const currentlyOpenedCard = ref<number>(0);
const tagPopupOpen = ref<boolean>(false);
const BGpickerPopupOpen = ref<boolean>(false);
const bgColorPickerOpen = ref<boolean>(false);
const descriptionEditorOpen = ref<boolean>(false);
</script>

<template>
  <NotLoggedIn class="hidden" mess="Pro vytvoření seznamu se prosím přihlaš!" />
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

  <form
    action="/editor"
    @submit.prevent
    class="mx-auto flex w-[70rem] max-w-[95vw] translate-y-20 flex-col items-center rounded-md bg-greenGradient pb-3 text-white shadow-lg shadow-black"
  >
    <div
      class="my-2 grid w-full grid-cols-[max-content_max-content] items-center justify-center gap-y-2 gap-x-3"
    >
      <input
        autocomplete="off"
        type="text"
        class="h-8 max-w-[77vw] rounded-md bg-white bg-opacity-5 px-2 placeholder:text-lg"
        placeholder="Jméno seznamu"
      />
      <div></div>
      <textarea
        autocomplete="off"
        type="text"
        class="h-16 max-w-[77vw] resize-none rounded-md bg-white bg-opacity-5 px-2 placeholder:text-lg"
        placeholder="Popis seznamu"
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
        class="h-8 max-w-[77vw] rounded-md bg-white bg-opacity-5 px-2 placeholder:text-lg"
        placeholder="Obrázek seznamu"
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
      class="flex w-full flex-row items-center justify-between bg-[url(../images/headerBG.webp)] px-2 py-2"
    >
      <span class="text-2xl font-black">Levely</span>
      <div class="mt-2 box-border flex gap-3">
        <button type="button">
          <img
            class="button w-10 rounded-full bg-black bg-opacity-50 p-1.5"
            src="../images/preview.svg"
            alt=""
          />
        </button>
        <button type="button">
          <img
            class="button w-10 rounded-full bg-black bg-opacity-50 p-1.5"
            src="../images/addfromFaves.svg"
            alt=""
          />
        </button>
        <button type="button" @click="addLevel">
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
        @update-opened-card="currentlyOpenedCard = $event"
        @open-tag-popup="tagPopupOpen = true"
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
