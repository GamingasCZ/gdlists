<script setup lang="ts">
import axios, { type AxiosResponse } from 'axios';
import { ref } from 'vue';
import type { Level, LevelSearchResponse } from "@/interfaces";
import TabBar from '../ui/TabBar.vue';


const emit = defineEmits<{
  (e: "closePopup"): void
  (e: "addLevel", level: Level): void
}>();

const page = ref(0) // 0 - main, 1 - loading, 2 - error, 3 - results
const tab = ref(0) // 0 - main, 1 - loading, 2 - error, 3 - results


const LEVELS = ref<LevelSearchResponse[]>([])
const findByIDList = (ids: string) => {
  importError.value = 3
  let idArray = (ids.match(/\d+/g) ?? []).slice(0, 50)
  if (idArray?.length < 2) {
    idListError.value = true
    setTimeout(() => idListError.value = false, 500);
    return
  }

  page.value = 1
  axios
    .get(import.meta.env.VITE_API + "/rubLevelData.php?idList&list=" + (idArray?.join(",")) + ',')
    .then(async (response: AxiosResponse) => {
      LEVELS.value = response.data;
      for (let i = 0; i < LEVELS.value.length; i++) {
        LEVELS.value[i].selected = true
      }

      if (LEVELS.value.length == 0) importError.value = 1
      else importError.value = 0

      page.value = 3
    }).catch(() => importError.value = 2);
}

const findIngame = (searchUser:boolean, listID: string) => {
  importError.value = 3
  page.value = 1
  let reqUrl: string
  if (!searchUser) reqUrl = `/rubLevelData.php?list&id=` + listID
  else reqUrl = `/rubLevelData.php?userAll&username=` + listID

  axios
  .get(import.meta.env.VITE_API + reqUrl)
  .then(async (response: AxiosResponse) => {
    LEVELS.value = response.data;
    for (let i = 0; i < LEVELS.value.length; i++) {
      LEVELS.value[i].selected = true
    }
    if (LEVELS.value.length == 0) importError.value = 1
    else importError.value = 0
    
    page.value = 3
  }).catch(() => importError.value = 2);
}

const submitForm = () => {
  (document.querySelector("#importForm form") as HTMLFormElement).requestSubmit()
}

const goBack = () => {
  page.value = 0
  tab.value = 0
  LEVELS.value = []
}

const addLevels = () => {
  LEVELS.value.filter(l => l.selected).forEach(level => {
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

const inGameType = ref(0)
const idListError = ref(false)
const importFilter = ref("")
const importError = ref(3)
const gdInput = ref<HTMLInputElement>()

</script>

<template>
    <!-- Main -->
    <TabBar @switched-tab="tab = $event" :tab-names="[$t('editor.iglists'), $t('editor.idlist')]" />
    <main v-if="page == 0" id="importForm" class="relative w-full h-80">
      <!-- In-game lists -->
      <div v-if="tab == 0">
        <h2 class="mt-2 text-xl font-bold text-center">{{ $t('editor.ingame') }}</h2>
        <h3 class="mb-2 text-sm text-center">{{ $t('editor.impFrom') }}</h3>
        <form class="flex flex-col gap-3 items-center h-full text-center" @submit.prevent="findIngame(inGameType, $event.target[3].value)">
          <fieldset class="flex gap-4 justify-start items-start text-xl">
            <div class="flex flex-col items-center p-2 w-24 text-center bg-black bg-opacity-20 rounded-md">
              <label for="impList"><img src="@/images/list.svg" class="w-12 opacity-40" alt="">List</label>
              <input @change="gdInput?.focus()" class="!m-0" type="radio" v-model="inGameType" :value="0" name="ingame" id="impList">
            </div>
            <div class="flex flex-col items-center p-2 w-24 text-center bg-black bg-opacity-20 rounded-md">
              <label for="impUser"><img src="@/images/collab.svg" class="mx-auto w-12 opacity-40" alt="">{{ $t('level.creator') }}</label>
              <input @change="gdInput?.focus()" class="!m-0" type="radio" v-model="inGameType" :value="1" name="ingame" id="impUser">
            </div>
          </fieldset>
          <div class="flex gap-2 items-start">
            <input ref="gdInput" class="py-1 pl-3 text-xl text-center bg-black bg-opacity-40 rounded-md max-w-64" maxlength="20" role="spinbutton"
              :placeholder="$t('editor.enterThe') + [$t('editor.listID'), $t('editor.playername')][inGameType] + '...'" type="text">
          </div>
        </form>
      </div>

      <!-- ID array -->
      <div v-else>
        <h2 class="mt-2 text-xl font-bold text-center">{{ $t('editor.idlist') }}</h2>
        
        <p class="text-sm text-center">{{ $t('editor.idlistHelp') }}</p>
        
        <form class="px-2" @submit.prevent="findByIDList($event.target[0].value)">
          <textarea class="p-1 mt-4 w-full h-28 bg-black bg-opacity-40 rounded-md resize-none" @keyup.prevent.enter="findByIDList($event.target.value)"
            :placeholder="$t('editor.sepList')"></textarea>
        </form>
        <Transition name="fade">
          <p v-if="idListError" class="text-sm text-center text-red-300">{{ $t('editor.idlistError1') }}</p>
        </Transition>
      </div>

      <button @click="submitForm" class="absolute right-0 bottom-0 px-3 py-1 m-2 font-black text-black rounded-md bg-lof-400 button">{{ $t('other.import') }}</button>
        
      <!-- CSV import -->
      <!-- <div class="">
        <h2 class="text-xl font-bold text-center">{{ $t('editor.tables') }}</h2>
        <h3 class="text-xs text-center text-yellow-300">Výjde později</h3>
        <p class="text-center">{{ $t('editor.tablesHelp') }}</p>
        <button class="px-3 py-1 font-black text-black rounded-md opacity-40 grayscale bg-lof-400">{{ $t('editor.uploadFile') }}</button>
      </div> -->
    </main>

    <!-- Results Page -->
    <main v-else id="importResults" class="text-center h-[40rem] grid grid-rows-[max-content_1fr_max-content] max-h-full">
      <div class="pb-1">
        <h2 v-if="LEVELS.length > 0" class="text-2xl">{{ $t('editor.foundLevels', [LEVELS.length]) }}</h2>
        <h3 v-show="LEVELS.length > 0" class="text-sm">{{ $t('editor.clickLeave') }}</h3>
      </div>
      <div class="flex justify-start relative overflow-y-auto flex-col w-full bg-[url('@/images/fade.webp')] bg-repeat-x overflow-x-clip">
        <div v-if="importError == 3" class="flex flex-col items-center m-auto opacity-40">
          <img src="@/images/loading.webp" class="w-36 animate-spin" alt="">
          <h3 class="mt-4 text-2xl font-bold">{{ $t('other.loading') }}...</h3>
        </div>

        <div v-if="importError == 1" class="flex flex-col items-center m-auto opacity-40">
          <img src="@/images/searchOpaque.svg" class="w-36" alt="">
          <h3 class="mt-4 text-2xl font-bold">{{ $t('editor.nothingFound') }}</h3>
          <p>{{ $t('editor.modParams') }}</p>
        </div>

        <div v-if="importError == 2" class="flex flex-col items-center m-auto opacity-40">
          <img src="@/images/KABOOMshshsh.svg" class="w-48" alt="">
          <h3 class="mt-4 text-2xl font-bold">{{ $t('editor.importFail') }}</h3>
          <p>{{ $t('editor.serverBOOM') }}</p>
        </div>
        
        
        <div v-if="LEVELS.length > 0" class="p-2">
          <input type="text" v-model="importFilter" class="py-1 pl-8 bg-[url(@/images/searchOpaque.svg)] bg-[size:1rem] bg-[0.5rem] bg-no-repeat w-full bg-black bg-opacity-40 rounded-md" :placeholder="$t('other.search')+'...'">
        </div>
        
        <button v-for="level in LEVELS.filter(l => l.name.toLowerCase().includes(importFilter.toLowerCase()))" class="flex z-10 items-center text-left bg-black odd:bg-opacity-30 even:bg-opacity-10">
          <input class="ml-2 button" type="checkbox" :id="level.id" v-model="level.selected">
          <label :for="level.id" class="py-2 w-full h-full">
            <h4 class="text-xl font-bold leading-none">{{ level.name }}</h4>
            <p class="leading-none opacity-40">{{ level.author }}</p>
          </label>
        </button>
        <div class="sticky inset-full w-full h-12 bg-gradient-to-t from-black to-transparent opacity-20"></div>
      </div>
      <div class="flex justify-between px-2 pb-2 mt-2 w-full">
        <button class="px-3 text-xl rounded-md border-2 border-white border-opacity-20" @click="goBack">{{ $t('other.back') }}</button>
        <button :disabled="LEVELS.length == 0" class="flex gap-2 items-center px-3 text-xl font-bold text-black rounded-md disabled:grayscale disabled:opacity-40 bg-lof-400" @click="addLevels"><img src="@/images/check.svg" class="w-5 translate-y-0.5" alt=""> {{ $t('other.add') }}</button>
      </div>
    </main>
</template>

<style>

@keyframes scaleIn {
  from {transform: scaleY(0.7)}
  to {transform: scaleY(1)}
}

#importResults {
  animation: scaleIn 0.2s ease;
}

</style>