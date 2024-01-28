<script setup lang="ts">
import axios, { type AxiosResponse } from 'axios';
import { ref } from 'vue';
import type { Level, LevelSearchResponse } from "@/interfaces";


const emit = defineEmits<{
  (e: "closePopup"): void
  (e: "addLevel", level: Level)
}>();
const page = ref(0) // 0 - main, 1 - loading, 2 - error, 3 - results
const LEVELS = ref<LevelSearchResponse[]>([])
const findByIDList = (ids: string) => {
  let idArray = ids.match(/\d+/g)
  page.value = 1
  axios
    .get(import.meta.env.VITE_API + "/rubLevelData.php?idList&list=" + idArray?.join(","))
    .then(async (response: AxiosResponse) => {
      LEVELS.value = response.data;
      page.value = 3
    }).catch();
}

const findIngame = (searchUser:boolean, listID: string) => {
  console.log(searchUser)
  page.value = 1
  let reqUrl: string
  if (!searchUser) reqUrl = `/rubLevelData.php?idList&id=` + listID
  else reqUrl = `/rubLevelData.php?userAll&username=` + listID

  axios
  .get(import.meta.env.VITE_API + reqUrl)
  .then(async (response: AxiosResponse) => {
    LEVELS.value = response.data;
    page.value = 3
  }).catch();
}

const goBack = () => {
  page.value = 0
  LEVELS.value = []
}

const addLevels = () => {
  LEVELS.value.forEach(level => {
    let formattedLevel: Level = {
      levelName: level.name,
      creator: level.author,
      difficulty: [level.difficulty, level.cp],
      levelID: level.id,
      platf: level.platf
    }
    emit('addLevel', formattedLevel)
  })
  emit('closePopup')
}

</script>

<template>
  <section @click.stop=""
    class="absolute top-1/2 left-1/2 flex h-[40rem] max-h-[95svh] w-[35rem] max-w-[95vw] -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg bg-greenGradient p-2 text-white shadow-lg shadow-black">
    <div class="relative">
      <h1 class="text-xl font-bold text-center">{{ $t('editor.importLevels') }}</h1>
      <img src="@/images/close.svg" alt="" class="absolute top-0 right-0 w-6 button" @click="emit('closePopup')" />
    </div>

    <!-- Main -->
    <main v-if="page == 0" class="grid grid-rows-[max-content_1fr_max-content_1fr_max-content] mt-3 w-full h-full">

      <!-- In-game lists -->
      <div class="">
        <h2 class="text-xl font-bold text-center">{{ $t('editor.iglists') }}</h2>
        <form class="grid grid-cols-2 justify-items-center items-center h-full text-center" @submit.prevent="findIngame($event.target[0].value == 'on', $event.target[2].value)">
          <fieldset class="flex flex-col gap-4 justify-center items-start">
            <div>
              <input type="radio" name="ingame" id="impList"><label for="impList">List</label>
            </div>
            <div>
              <input type="radio" name="ingame" id="impUser"><label for="impUser">Uživatel</label>
            </div>
          </fieldset>
          <div class="flex flex-col gap-2 items-center">
            <input class="py-1 pl-3 max-w-[40vw] bg-white bg-opacity-20 rounded-md" maxlength="20" role="spinbutton"
              :placeholder="'ID listu'" type="text">
            <button type="submit" class="px-3 py-1 font-black text-black rounded-md bg-lof-400 button">{{ $t('other.import') }}</button>
          </div>
        </form>
      </div>

      <hr class="self-center h-0.5 bg-white rounded-full border-none opacity-50">

      <!-- ID array -->
      <div class="">
        <h2 class="text-xl font-bold text-center">{{ $t('editor.idlist') }}</h2>
        <p class="text-center">{{ $t('editor.idlistHelp') }}</p>
        <form @submit.prevent="findByIDList($event.target[0].value)">
          <textarea class="p-1 w-full bg-white bg-opacity-20 rounded-md resize-none" @keyup.prevent.enter="findByIDList($event.target.value)"
            :placeholder="'Zadej oddělená ID levelů (např. 96000699, 29107242, 128)'"></textarea>
          <button type="submit" class="px-3 py-1 font-black text-black rounded-md bg-lof-400 button">{{ $t('other.import') }}</button>
        </form>
      </div>

      <hr class="self-center h-0.5 bg-white rounded-full border-none opacity-50">

      <!-- CSV import -->
      <div class="">
        <h2 class="text-xl font-bold text-center">{{ $t('editor.tables') }}</h2>
        <h3 class="text-xs text-center text-yellow-300">Výjde později</h3>
        <p class="text-center">{{ $t('editor.tablesHelp') }}</p>
        <button class="px-3 py-1 font-black text-black rounded-md opacity-40 grayscale bg-lof-400">{{ $t('editor.uploadFile') }}</button>
      </div>
    </main>

    <!-- Results Page -->
    <main v-else class="text-center grid grid-rows-[max-content_1fr_max-content] max-h-full gap-3">
      <div>
        <h2 class="text-2xl">Nalezeno {{ LEVELS.length }} levelů!</h2>
        <h3 class="text-sm">Kliknutím můžeš vynechat vybrané levely.</h3>
      </div>
      <div class="flex overflow-y-auto flex-col gap-1 p-1 w-full bg-black bg-opacity-40 rounded-md overflow-x-clip">
        <button v-for="level in LEVELS" class="text-left bg-white rounded-md odd:bg-opacity-20 even:bg-opacity-10 button"><input type="checkbox" :checked="true">{{ level.name }} - {{ level.author }}</button>
      </div>
      <div class="flex justify-between w-full">
        <button class="p-1 px-2 text-xl font-bold rounded-md border-4 border-white border-opacity-20" @click="goBack">{{ $t('other.back') }}</button>
        <button class="p-1 px-2 text-xl font-bold text-black rounded-md bg-lof-400" @click="addLevels">{{ $t('other.add') }}</button>
      </div>
    </main>
  </section>
</template>
