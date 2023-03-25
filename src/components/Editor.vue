<script setup lang="ts">
import NotLoggedIn from './global/NotLoggedInDialog.vue'
import ListSettings from './editor/ListSettings.vue'
import EditorCard from './editor/EditorCard.vue'
import { levelList, addLevel } from '../Editor'
import { ref } from 'vue';

const nice = () => {
  console.log(levelList.value)
}
const currentlyOpenedCard = ref<number>(0)

</script>

<template>
  <NotLoggedIn class="hidden" mess="Pro vytvoření seznamu se prosím přihlaš!" />

  <form
    action="/editor"
    class="mx-auto flex w-[70rem] max-w-[95vw] translate-y-20 flex-col items-center rounded-md bg-greenGradient pb-3 text-white"
  >
    <div
      class="my-2 grid w-full grid-cols-[max-content_max-content] items-center justify-center gap-y-2 gap-x-3"
    >
      <input
        autocomplete="off"
        type="text"
        class="h-10 max-w-[77vw] rounded-md bg-white bg-opacity-5 px-2 placeholder:text-lg"
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
        class="button w-10 rounded-full bg-black bg-opacity-50 p-1.5"
        src="../images/fullscreen.svg"
        alt=""
      />
      <input
        autocomplete="off"
        type="text"
        class="h-10 max-w-[77vw] rounded-md bg-white bg-opacity-5 px-2 placeholder:text-lg"
        placeholder="Obrázek seznamu"
      />
      <img
        class="button w-10 rounded-full bg-black bg-opacity-50 p-1.5"
        src="../images/gear.svg"
        alt=""
      />
    </div>

    <div class="my-1 flex items-center gap-2">
      <span>Barva pozadí:</span>
      <button
        type="button"
        class="button box-border flex h-8 w-8 items-center justify-center rounded-md border-2 border-white"
      >
        <img src="../images/color.svg" alt="" class="w-5" />
      </button>
    </div>

    <header
      class="flex w-full flex-row items-center justify-between bg-[url(../images/headerBG.webp)] px-2 py-2"
    >
      <span class="text-2xl font-black">Levely</span>
      <div class="mt-2 box-border flex gap-3">
        <img
          class="button w-10 rounded-full bg-black bg-opacity-50 p-1.5"
          src="../images/preview.svg"
          alt=""
        />
        <img
          class="button w-10 rounded-full bg-black bg-opacity-50 p-1.5"
          src="../images/addfromFaves.svg"
          alt=""
        />
        <img
          class="button w-10 rounded-full bg-black bg-opacity-50 p-1.5"
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
