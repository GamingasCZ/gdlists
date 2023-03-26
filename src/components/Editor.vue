<script setup lang="ts">
import NotLoggedIn from './global/NotLoggedInDialog.vue'
import ListSettings from './editor/ListSettings.vue'
import EditorCard from './editor/EditorCard.vue'
import ColorPicker from './global/ColorPicker.vue'
import TagPickerPopup from "./editor/TagPickerPopup.vue";
import { levelList, addLevel } from '../Editor'
import { ref } from 'vue';
import chroma from 'chroma-js';

const nice = () => {
  console.log(levelList.value)
}
const currentlyOpenedCard = ref<number>(0)
const tagPopupOpen = ref<boolean>(false)
const bgColorPickerOpen = ref<boolean>(false)

const modifyListBG = (newColors: number) => {
  document.documentElement.style.setProperty('--siteBackground', chroma(chroma.hsl(newColors[0], 0.36, newColors[1]*0.015625)).hex())
  document.documentElement.style.setProperty('--primaryColor', chroma(chroma.hsl(newColors[0], 0.36, 0.167)).hex())
  document.documentElement.style.setProperty('--secondaryColor', chroma(chroma.hsl(newColors[0], 0.906, 0.049)).hex())
}

</script>

<template>
  <NotLoggedIn class="hidden" mess="Pro vytvoření seznamu se prosím přihlaš!" />
  <TagPickerPopup v-show="tagPopupOpen" @close-popup="tagPopupOpen = false" @add-tag="levelList.levels[currentlyOpenedCard].tags.push($event)"></TagPickerPopup>

  <form
    action="/editor"
    class="shadow-lg shadow-black mx-auto flex w-[70rem] max-w-[95vw] translate-y-20 flex-col items-center rounded-md bg-greenGradient pb-3 text-white"
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
      ></textarea>
      <img
        class="p-1.5 w-8 bg-black bg-opacity-50 rounded-full button"
        src="../images/fullscreen.svg"
        alt=""
      />
      <input
        autocomplete="off"
        type="text"
        class="h-8 max-w-[77vw] rounded-md bg-white bg-opacity-5 px-2 placeholder:text-lg"
        placeholder="Obrázek seznamu"
      />
      <img
        class="p-1.5 w-8 bg-black bg-opacity-50 rounded-full button"
        src="../images/gear.svg"
        alt=""
      />
    </div>

    <div class="flex gap-2 items-center my-1">
      <span>Barva pozadí:</span>
      <button
        type="button"
        class="box-border flex justify-center items-center w-8 h-8 rounded-md border-2 border-white button"
        @click="bgColorPickerOpen = !bgColorPickerOpen"
      >
        <img src="../images/color.svg" alt="" class="w-5" />
      </button>
    </div>

    <div v-show="bgColorPickerOpen" class="px-3 py-2 my-2 w-9/12 bg-black bg-opacity-40 rounded-md">
      <ColorPicker @colors-modified="modifyListBG" />
    </div>

    <header
      class="flex w-full flex-row items-center justify-between bg-[url(../images/headerBG.webp)] px-2 py-2"
    >
      <span class="text-2xl font-black">Levely</span>
      <div class="box-border flex gap-3 mt-2">
        <img
          class="p-1.5 w-10 bg-black bg-opacity-50 rounded-full button"
          src="../images/preview.svg"
          alt=""
        />
        <img
          class="p-1.5 w-10 bg-black bg-opacity-50 rounded-full button"
          src="../images/addfromFaves.svg"
          alt=""
        />
        <img
          class="p-1.5 w-10 bg-black bg-opacity-50 rounded-full button"
          src="../images/addLevel.svg"
          alt=""
          @click="addLevel"
        />
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
        @update-opened-card="currentlyOpenedCard = $event"
        @open-tag-popup="tagPopupOpen = true"
      />
    </main>
    <ListSettings />
    <button
      type="submit"
      class="flex gap-2 items-center px-3 py-2 mt-3 font-black text-black rounded-md button bg-lof-400"
    >
      <img src="../images/upload.svg" class="w-6" alt="" />Nahrát
    </button>
  </form>
  <button @click="nice" class="translate-y-20">dwdsasad</button>
</template>
