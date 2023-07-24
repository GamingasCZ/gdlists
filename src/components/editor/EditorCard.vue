<script setup lang="ts">
import { levelList, moveLevel, deleteLevel } from "@/Editor";
import axios, { type AxiosResponse } from "axios";
import chroma, { type Color } from "chroma-js";
import { ref, onUnmounted } from "vue";
import type { Level, LevelSearchResponse } from "../../interfaces";
import ColorPicker from "../global/ColorPicker.vue";
import DifficultyPicker from "./DifficultyPicker.vue";
import LevelTags from "./LevelTags.vue";

const props = defineProps<{
  index?: number;
  opened?: boolean;
  data?: Level;
  updatingPositions: number;
}>();

const emit = defineEmits<{
  (e: "updateOpenedCard", newPos: number): void;
  (e: "startMove", pos: number, newInd: number): void;
  (e: "openTagPopup"): void;
  (e: "openCollabTools", levelIndex: number): void;
  (e: "doMove", levelIndex: number, toIndex: number): void;
}>();

// Colors
const darkCol = () => 
  chroma
    .hsl(...levelList.value.levels[props.index!].color!)
    .darken()
    .css();
const changeCardColors = (newColors: [number, number]) =>
  (levelList.value.levels[props.index!].color = [
    newColors[0],
    0.5,
    newColors[1] / 64,
  ]);

// Difficulty Picker
const changeRate = (newRating: number) =>
  (levelList.value.levels[props.index!].difficulty[1] = newRating);
const changeFace = (newFace: number) =>
  (levelList.value.levels[props.index!].difficulty[0] = newFace);
const getRateImage = () => {
  let rate = levelList.value.levels[props.index!].difficulty[1];
  if (rate == 0) return; // Unrated level
  else {
    return `/public/faces/${["star", "featured", "epic"][rate - 1]}.webp`;
  }
};

const diffFacePath = ref(new URL(`/public/faces/${levelList.value.levels[props.index!].difficulty[0]}.webp`, import.meta.url).href)
const levelCreator = ref(typeof levelList.value.levels[props.index!].creator == 'object' ? levelList.value.levels[props.index!].creator[0][0] : levelList.value.levels[props.index!].creator)
const modifyCreator = (e: Event) => {
  let newCreator = (e.target as HTMLInputElement).value
  if (typeof levelList.value.levels[props.index!].creator == 'string')
    levelList.value.levels[props.index!].creator = newCreator
  else
    levelList.value.levels[props.index!].creator[0][0] = newCreator
}

const openedPanel = ref<number>(0);

const mobileMoveLevel = () => {
  emit("startMove", props.index!, 0);
};

function searchLevel(searchingByID: boolean, userSearchPage: number = 0) {
  let levelID = levelList.value.levels[props.index!].levelID;
  let levelName = levelList.value.levels[props.index!].levelName;
  let levelCreator: string;
  if (typeof levelList.value.levels[props.index!].creator == 'string')
    levelCreator = levelList.value.levels[props.index!].creator
  else
    levelCreator = levelList.value.levels[props.index!].creator[0][0]

  let request: string = "";
  if (searchingByID) request = `id=${levelID}`; // Searching by ID
  else {
    if (levelName && levelCreator) {
      // Find level by specific creator
      for (let i = 0; i < 5; i++) {
        request = `userSearch=${levelCreator}&name=${levelName}&page=${userSearchPage}`;
      }
    } else request = `levelName=${levelName}`; // Find level
  }

  axios
    .get(import.meta.env.VITE_API + "/rubLevelData.php?" + request)
    .then((response: AxiosResponse) => {
      let level: LevelSearchResponse = response.data;
      levelList.value.levels[props.index!].levelID = level.id;
      levelList.value.levels[props.index!].levelName = level.name;
      
      if (typeof levelList.value.levels[props.index!].creator == 'string')
        levelList.value.levels[props.index!].creator = level.author
      else
        levelList.value.levels[props.index!].creator[0][0] = level.author

      levelList.value.levels[props.index!].difficulty = [
        level.difficulty,
        level.cp,
      ];
    });
}
</script>

<template>
  <section>
    <!-- Card content -->
    <main
    :style="{ backgroundImage: `linear-gradient(30deg, ${chroma.hsl(...levelList.levels[index!].color!).hex()}, ${darkCol()})` }"
    class="flex flex-col gap-1.5 p-2 rounded-md"
    >
      <div class="flex justify-between">
        <div class="box-border inline-flex gap-2">
          <!-- Level ID input -->
          <img class="w-10 aspect-square" src="../../images/star.webp" alt="" />
          <input
            autocomplete="off"
            class="max-w-[20vw] rounded-md bg-black bg-opacity-30 px-2 placeholder:text-white placeholder:text-opacity-80 max-sm:max-w-[30vw]"
            type="text"
            name="levelID"
            v-model="levelList.levels[index!].levelID"
            :placeholder="$t('level.levelID')"
          />
          <img
            class="p-1 w-10 bg-black bg-opacity-30 rounded-md transition-opacity duration-100 button aspect-square"
            src="../../images/searchOpaque.svg"
            alt=""
            :style="{ opacity: levelList.levels[index!].levelID ? 1 : 0.5 }"
            @click="searchLevel(true)"
          />
        </div>

        <div class="flex max-sm:hidden">
          <!-- Level position -->
          <img
            class="w-10 button aspect-square"
            src="../../images/showCommsU.svg"
            alt=""
            @click="emit('doMove', props.index!, props.index! - 1); openedPanel = 0;"
          />
          <input
            autocomplete="off"
            style="appearance: textfield"
            class="w-12 max-w-[20vw] font-black text-2xl rounded-md bg-black bg-opacity-30 px-2 text-center placeholder:text-white placeholder:text-opacity-80"
            type="number"
            :value="index! + 1"
            @click="mobileMoveLevel()"
            @change="
              emit('doMove', props.index!, parseInt(($event.target as HTMLInputElement).value) - 1); openedPanel = 0;
            "
          />
          <img
            class="w-10 button aspect-square"
            src="../../images/showCommsD.svg"
            alt=""
            @click="emit('doMove', props.index!, props.index! + 1); openedPanel = 0;"
          />
        </div>

        <!-- Mobile move button -->
        <button type="button" @click="mobileMoveLevel()" class="sm:hidden" v-if="levelList.levels.length > 1">
          <img
            class="p-1 w-10 bg-black bg-opacity-30 rounded-md transition-opacity duration-100 button"
            src="../../images/move.svg"
            alt=""
          />
        </button>
      </div>
      <hr class="h-1 border-none" :style="{ backgroundColor: darkCol() }" />
      <div class="flex gap-2 items-center max-sm:flex-col">
        <!-- Level name input -->
        <div class="flex gap-2">
          <img
            class="w-10 aspect-square max-sm:hidden"
            src="../../images/island.webp"
            alt=""
          />
          <button
            :disabled="!(levelList.levels[index!].levelName != '' || levelList.levels[index!].creator != '')"
            type="button"
            @click="searchLevel(false)"
            class="sm:hidden"
          >
            <img
              class="p-1 w-10 bg-black bg-opacity-30 rounded-md transition-opacity duration-100 button aspect-square"
              src="../../images/searchOpaque.svg"
              alt=""
              :style="{ opacity: (levelList.levels[index!].levelName || levelList.levels[index!].creator) ? 1 : 0.5 }"
            />
          </button>
          <input
            autocomplete="off"
            class="h-10 max-w-[20vw] rounded-md bg-black bg-opacity-30 px-2 placeholder:text-white placeholder:text-opacity-80 max-sm:max-w-full"
            type="text"
            name="levelName"
            maxlength="20"
            v-model="levelList.levels[index!].levelName"
            :placeholder="$t('level.levelName')"
          />
        </div>

        <!-- Level search -->
        <div class="flex gap-2 items-center max-sm:hidden">
          <hr
            class="w-8 h-1 bg-white transition-opacity duration-100"
            :style="{ opacity: levelList.levels[index!].levelName ? 1 : 0.5 }"
          />
          <button
            :disabled="!(levelList.levels[index!].levelName != '' || levelList.levels[index!].creator != '')"
            type="button"
            @click="searchLevel(false)"
          >
            <img
              class="p-1 w-10 bg-black bg-opacity-30 rounded-md transition-opacity duration-100 button aspect-square"
              src="../../images/searchOpaque.svg"
              alt=""
              :style="{ opacity: (levelList.levels[index!].levelName || levelList.levels[index!].creator) ? 1 : 0.5 }"
            />
          </button>
          <hr
            class="w-8 h-1 bg-white transition-opacity duration-100"
            :style="{ opacity: levelList.levels[index!].creator ? 1 : 0.5 }"
          />
        </div>

        <!-- Creator input -->
        <div class="flex gap-2 max-sm:flex-row-reverse">
          <input
            autocomplete="off"
            class="h-10 max-w-[20vw] rounded-md bg-black bg-opacity-30 px-2 placeholder:text-white placeholder:text-opacity-80 max-sm:max-w-full"
            type="text"
            name="creator"
            :value="levelCreator"
            @change="modifyCreator"
            :placeholder="$t('level.creator')"
          />
          <img
            class="p-1 w-10 bg-black bg-opacity-30 rounded-md button aspect-square"
            src="../../images/bytost.webp"
            alt=""
            :class="{'hue-rotate-180': typeof levelList.levels[index!].creator == 'object'}"
            @click="emit('openCollabTools', index!)"
          />
        </div>
      </div>
      <div class="flex justify-between items-center max-sm:flex-col">
        <!-- Video input -->
        <div class="flex gap-2">
          <img
            class="w-10 aspect-square"
            src="../../images/youtube.webp"
            alt=""
          />
          <input
            autocomplete="off"
            class="max-w-[20vw] rounded-md bg-black bg-opacity-30 px-2 placeholder:text-white placeholder:text-opacity-80 max-sm:max-w-full"
            type="text"
            name="video"
            v-model="levelList.levels[index!].video"
            :placeholder="$t('level.video')"
          />
        </div>

        <!-- Extras buttons -->
        <div class="flex gap-2 items-start max-sm:mt-3">
          <img
            class="w-10 button"
            @click="openedPanel = openedPanel != 1 ? 1 : 0"
            src="../../images/colorPicker.svg"
            alt=""
          />
          <div class="flex relative justify-center items-center button">
            <img
              class="w-10"
              @click="openedPanel = openedPanel != 2 ? 2 : 0"
              alt=""
              src="../../images/difficultyBG.svg"
            />
            <img
              :src="diffFacePath"
              alt=""
              class="absolute z-20 w-7 pointer-events-none"
            />
            <img
              :src="getRateImage()"
              alt=""
              class="absolute z-10 w-10 pointer-events-none"
              :style="{zIndex: levelList.levels[index!].difficulty[1]-1 ? 10 : 30 }"
            />
          </div>
          <img
            class="w-10 button"
            @click="openedPanel = openedPanel != 3 ? 3 : 0"
            src="../../images/tagPicker.svg"
            alt=""
          />
          <img
            class="ml-4 w-10 button"
            @click="deleteLevel(props.index!)"
            src="../../images/deleteLevel.svg"
            alt=""
          />
        </div>
      </div>

      <!-- Extras panel -->
      <div class="p-2 bg-black bg-opacity-30 rounded-md" v-show="openedPanel">
        <ColorPicker
          v-if="openedPanel == 1"
          @colors-modified="changeCardColors"
        />
        <DifficultyPicker
          v-if="openedPanel == 2"
          :selected-rate="levelList.levels[props.index!].difficulty[1]"
          :selected-face="levelList.levels[props.index!].difficulty[0]"
          @change-face="changeFace"
          @change-rate="changeRate"
        />
        <LevelTags
          :card-index="index"
          v-if="openedPanel == 3"
          @open-popup="emit('openTagPopup')"
        />
      </div>
    </main>
  </section>
</template>
