<script setup lang="ts">
import { levelList, moveLevel, deleteLevel } from '@/Editor'
import axios, { type AxiosResponse } from 'axios';
import chroma, { type Color } from 'chroma-js'
import { ref, onUnmounted } from 'vue';
import type { Level, LevelSearchResponse } from '../../interfaces'
import ColorPicker from "../global/ColorPicker.vue";
import DifficultyPicker from "./DifficultyPicker.vue";
import LevelTags from "./LevelTags.vue";

const props = defineProps<{
  index?: number
  opened?: boolean
  data?: Level
}>()

const emit = defineEmits<{
  (e: "updateOpenedCard", newPos: number): void
  (e: "openTagPopup"): void
}>()

// Colors
const darkCol = () => chroma.hsl(...props.data?.color!).darken().css()
const changeCardColors = (newColors: [number, number]) => levelList.value.levels[props.index!].color = [newColors[0], 0.5, newColors[1] / 64]

// Difficulty Picker
const changeRate = (newRating: number) => levelList.value.levels[props.index!].difficulty[1] = newRating
const changeFace = (newFace: number) => levelList.value.levels[props.index!].difficulty[0] = newFace
const getRateImage = () => {
  let rate = levelList.value.levels[props.index!].difficulty[1]
  if (rate == 0) return // Unrated level
  else {
    return `/src/images/${['star', 'faces/featured', 'faces/epic'][rate-1]}.webp`
  }
}

const changeProp = (e: Event) => {
  let target: HTMLInputElement = e.currentTarget as HTMLInputElement
  levelList.value.levels[props.index as number][target.name] = target.value
}

const openedPanel = ref<number>(0)
const startMove = (toPosition: number) => {
  emit('updateOpenedCard', moveLevel(props.index!, toPosition))
  openedPanel.value = 0
}

function searchLevel() {
  let levelID = levelList.value.levels[props.index!].levelID
  let levelName = levelList.value.levels[props.index!].levelName
  let levelCreator = levelList.value.levels[props.index!].creator
  axios.get("http://localhost:8000/php/rubLevelData.php?id="+levelID).then((response: AxiosResponse) => {
    let level: LevelSearchResponse = response.data
    levelList.value.levels[props.index!].levelID = level.id
    levelList.value.levels[props.index!].levelName = level.name
    levelList.value.levels[props.index!].creator = level.author
    levelList.value.levels[props.index!].difficulty = [level.difficulty, level.cp]
  }
  )
}

</script>

<template>
  <section>

    <!-- Closed card content -->
    <header :style="{ backgroundColor: chroma.hsl(...data?.color!).hex()}" class="px-2 py-1 text-lg rounded-md" v-show="!opened"
      @click="emit('updateOpenedCard', index!)">
      #{{ index! + 1 }} - {{ data?.levelName || 'Bezejmenný' }}
    </header>

    <!-- Card content -->
    <main v-show="opened" :style="{ backgroundColor: chroma.hsl(...data?.color!).hex(), borderColor: darkCol() }"
      class="flex flex-col gap-1.5 rounded-md border-[0.35rem] border-solid p-2">
      <div class="flex justify-between">
        <div class="box-border flex gap-2">

          <!-- Level ID input -->
          <img class="w-10 aspect-square" src="../../images/star.webp" alt="" />
          <input
            class="max-w-[20vw] rounded-full bg-black bg-opacity-30 px-2 placeholder:text-white placeholder:text-opacity-80"
            type="text" name="levelID" @input="changeProp" :value="data?.levelID" placeholder="ID levelu" />
          <img class="p-1 w-10 bg-black bg-opacity-30 rounded-full transition-opacity duration-100 button aspect-square"
            src="../../images/searchOpaque.svg" alt="" :style="{ opacity: levelList.levels[index!].levelID ? 1 : 0.5 }" @click="searchLevel"/>
        </div>

        <div class="flex">
          
          <!-- Level position -->
          <img class="w-10 button aspect-square" src="../../images/showCommsU.svg" alt=""
            @click="startMove(props.index! - 1)"/>
          <input
            style="appearance: textfield;"
            class="w-12 max-w-[20vw] rounded-full bg-black bg-opacity-30 px-2 text-center placeholder:text-white placeholder:text-opacity-80"
            type="number" :value="index! + 1" @change="startMove(parseInt(($event.target as HTMLInputElement).value)-1)"/>
            <img class="w-10 button aspect-square" src="../../images/showCommsD.svg" alt=""
            @click="startMove(props.index! + 1)"/>
        </div>
      </div>
      <hr class="h-1 border-none" :style="{ backgroundColor: darkCol() }" />
      <div class="flex gap-2 items-center">

        <!-- Level name input -->
        <img class="w-10 aspect-square" src="../../images/island.webp" alt="" />
        <input
          class="max-w-[20vw] h-10 rounded-full bg-black bg-opacity-30 px-2 placeholder:text-white placeholder:text-opacity-80"
          type="text" name="levelName" :value="data?.levelName" @input="changeProp" placeholder="Jméno levelu" />

        <!-- Level search -->
        <hr class="w-8 h-1 bg-white transition-opacity duration-100"
          :style="{ opacity: levelList.levels[index!].levelName ? 1 : 0.5 }" />
        <button :disabled="!(levelList.levels[index!].levelName != '' || levelList.levels[index!].creator != '')" type="button">
          <img class="p-1 w-10 bg-black bg-opacity-30 rounded-full transition-opacity duration-100 button aspect-square"
            src="../../images/searchOpaque.svg" alt=""
            :style="{ opacity: (levelList.levels[index!].levelName || levelList.levels[index!].creator) ? 1 : 0.5 }" />
        </button>
        <hr class="w-8 h-1 bg-white transition-opacity duration-100"
          :style="{ opacity: levelList.levels[index!].creator ? 1 : 0.5 }" />

        <!-- Creator input -->
        <input
          class="max-w-[20vw] h-10 rounded-full bg-black bg-opacity-30 px-2 placeholder:text-white placeholder:text-opacity-80"
          type="text" name="creator" :value="data?.creator" @input="changeProp" placeholder="Tvůrce" />
        <img class="p-1 w-10 bg-black bg-opacity-30 rounded-full button aspect-square" src="../../images/bytost.webp"
          alt="" />
      </div>
      <div class="flex justify-between items-center">

        <!-- Video input -->
        <div class="flex gap-2">
          <img class="w-10 aspect-square" src="../../images/youtube.webp" alt="" />
          <input
            class="max-w-[20vw] rounded-full bg-black bg-opacity-30 px-2 placeholder:text-white placeholder:text-opacity-80"
            type="text" name="video" @input="changeProp" :value="data?.video" placeholder="Video" />
        </div>

        <!-- Extras buttons -->
        <div class="flex gap-2 items-start">
          <img class="w-10 button" @click="deleteLevel(props.index!)" src="../../images/delete.webp" alt="" />
          <img class="w-10 button" @click="openedPanel = openedPanel != 1 ? 1 : 0" src="../../images/colorSelect.webp"
            alt="" />
          <div class="flex relative justify-center items-center button">
            <img class="w-10" @click="openedPanel = openedPanel != 2 ? 2 : 0"
              src="../../images/faces/diffContainer.webp" alt="" />
            <img :src="`/src/images/faces/${levelList.levels[index!].difficulty[0]}.webp`" alt="" class="absolute z-20 w-6 pointer-events-none">
            <img :src="getRateImage()" alt="" class="absolute z-10 w-8 pointer-events-none" :style="{zIndex: levelList.levels[index!].difficulty[1]-1 ? 10 : 30 }">
          </div>
          <img class="w-10 button" @click="openedPanel = openedPanel != 3 ? 3 : 0" src="../../images/tags.webp" alt=""/>
        </div>
      </div>

      <!-- Extras panel -->
      <div class="p-2 bg-black bg-opacity-30 rounded-md" v-show="openedPanel">
        <ColorPicker v-if="openedPanel == 1" @colors-modified="changeCardColors" />
        <DifficultyPicker v-if="openedPanel == 2" :selected-rate="levelList.levels[props.index!].difficulty[1]"
        :selected-face="levelList.levels[props.index!].difficulty[0]" @change-face="changeFace"
        @change-rate="changeRate" />
        <LevelTags :card-index="index" v-if="openedPanel == 3" @open-popup="emit('openTagPopup')"/>
      </div>
    </main>
  </section>
</template>
