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
  (e: "moveControls", pos: number, newInd: number): void;
  (e: "openTagPopup"): void;
  (e: "openCollabTools", levelIndex: number): void;
  (e: "doMove", levelIndex: number, toIndex: number): void;
}>();

// Colors
const lightCol = () => 
  chroma
    .hsl(...levelList.value.levels[props.index!].color!)
    .brighten(0.5)
    .css();
const changeCardColors = (newColors: [number, number, number]) =>
  (levelList.value.levels[props.index!].color = [
    newColors[0],
    0.5,
    newColors[2] / 64,
  ]);

// Difficulty Picker
const changeRate = (newRating: number) =>
  (levelList.value.levels[props.index!].difficulty[1] = newRating);
const changeFace = async (newFace: number) => {
  levelList.value.levels[props.index!].difficulty[0] = newFace;
  diffFacePath.value = await getDiffFace()
}
const getRateImage = () => {
  let rate = levelList.value.levels[props.index!].difficulty?.[1] ?? 0;
  if (rate == 0) return; // Unrated level
  else {
    return new URL(`/public/faces/${["star", "featured", "epic"][rate - 1]}.webp`, import.meta.url).href;
  }
};

const collabShaking = ref(false)
const shakeCollab = () => {
  collabShaking.value = true
  setTimeout(() => {
    collabShaking.value = false
  }, 200);
}

const diffFacePath = ref("")
const getDiffFace = async () => await import(`../../images/faces/${levelList.value.levels[props.index!].difficulty?.[0] ?? 0}.webp`).then(res => diffFacePath.value = res.default)
getDiffFace()


const levelCreator = ref(typeof levelList.value.levels[props.index!].creator == 'object' ? levelList.value.levels[props.index!].creator[0][0] : levelList.value.levels[props.index!].creator)
const modifyCreator = (e: Event) => {
  let newCreator = (e.currentTarget as HTMLInputElement).value
  if (typeof levelList.value.levels[props.index!].creator == 'string')
    levelList.value.levels[props.index!].creator = newCreator
  else
    levelList.value.levels[props.index!].creator[0][0] = newCreator
  levelCreator.value = newCreator
}

const openedPanel = ref<number>(0);

const mobileMoveLevel = () => {
  emit("moveControls", props.index!, props.index!);
};

function searchLevel(searchingByID: boolean, userSearchPage: number = 0) {
  let levelID = levelList.value.levels[props.index!].levelID;
  let levelName = levelList.value.levels[props.index!].levelName;

  let request: string = "";
  if (searchingByID) request = `id=${levelID}`; // Searching by ID
  else {
    if (levelName && levelCreator.value) {
      // Find level by specific creator
      for (let i = 0; i < 5; i++) {
        request = `userSearch=${levelCreator.value}&name=${levelName}&page=${userSearchPage}`;
      }
    } else request = `levelName=${levelName}`; // Find level
  }

  axios
    .get(import.meta.env.VITE_API + "/rubLevelData.php?" + request)
    .then(async (response: AxiosResponse) => {
      let level: LevelSearchResponse = response.data;
      levelList.value.levels[props.index!].levelID = level.id;
      levelList.value.levels[props.index!].levelName = level.name;
      
      if (typeof levelList.value.levels[props.index!].creator == 'string')
        levelList.value.levels[props.index!].creator = level.author
      else
        levelList.value.levels[props.index!].creator[0][0] = level.author
      levelCreator.value = level.author

      if (level.difficulty == -1) level.difficulty = 11 // Auto levels
      levelList.value.levels[props.index!].difficulty = [
        level.difficulty,
        level.cp,
      ];
      diffFacePath.value = await getDiffFace()
    });
}
</script>

<template>
  <!-- Card content -->
  <section
  :style="{ backgroundImage: `linear-gradient(-90deg, ${lightCol()}, ${chroma.hsl(...levelList.levels[index!].color!).hex()})` }"
  class="flex flex-col gap-1.5 overflow-clip rounded-md"
  >
    <div class="flex justify-between p-2 pr-1 bg-black bg-opacity-20">
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
          class="box-border p-1.5 w-10 button aspect-square"
          src="../../images/moveUp.svg"
          alt=""
          @click="emit('doMove', index!, index! - 1); openedPanel = 0;"
        />
        <input
          autocomplete="off" readonly
          class="w-12 mx-1 max-w-[20vw cursor-move outline-none font-black text-2xl rounded-md bg-black bg-opacity-30 px-2 text-center placeholder:text-white placeholder:text-opacity-80"
          :value="index! + 1"
          @mousedown="mobileMoveLevel()"
        />
        <img
          class="box-border p-1.5 w-10 button aspect-square"
          src="../../images/moveDown.svg"
          alt=""
          @click="emit('doMove', index!, index! + 1); openedPanel = 0;"
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
    <div class="flex gap-2 items-center px-2 max-sm:flex-col">
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
          maxlength="15"
          :value="levelCreator"
          @change="modifyCreator"
          :placeholder="$t('level.creator')"
        />
        <img
          class="p-1 w-10 bg-black bg-opacity-30 rounded-md button aspect-square"
          src="../../images/collabMen.svg"
          alt=""
          :class="{'animate-[shake_0.2s_infinite]': collabShaking, 'hue-rotate-180': typeof levelList.levels[index!].creator == 'object'}"
          @click="shakeCollab()"
        />
      </div>
    </div>
    <div class="flex justify-between items-center px-2 pb-2 max-sm:flex-col">
      <!-- Video input -->
      <div class="flex gap-2">
        <img
          class="w-10 aspect-square"
          src="../../images/modYT.svg"
          alt=""
        />
        <input
          autocomplete="off"
          class="max-w-[20vw] rounded-md bg-black bg-opacity-30 px-2 placeholder:text-white placeholder:text-opacity-80 max-sm:max-w-full"
          type="text"
          name="video"
          maxlength="50"
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
            :class="{'w-5 left-2/4 top-2/4': levelList.levels[index!].difficulty?.[1] == 1}"
            :style="{zIndex: (levelList.levels[index!].difficulty?.[1] ?? 0) -1 ? 10 : 30 }"
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
    <div class="p-2 bg-black bg-opacity-20" v-show="openedPanel">
      <ColorPicker
        v-if="openedPanel == 1"
        @colors-modified="changeCardColors"
        :hue="levelList.levels[index!].color[0]"
        :saturation="levelList.levels[index!].color[1]"
        :lightness="levelList.levels[index!].color[2] * 64"
      />
      <DifficultyPicker
        v-if="openedPanel == 2"
        :selected-rate="levelList.levels[index!].difficulty[1]"
        :selected-face="levelList.levels[index!].difficulty[0]"
        @change-face="changeFace"
        @change-rate="changeRate"
      />
      <LevelTags
        :card-index="index"
        v-if="openedPanel == 3"
        @open-popup="emit('openTagPopup')"
      />
    </div>
  </section>
</template>

<style scoped>

@keyframes appear {
  0% {
    transform: translate(0.5rem) scaleY(0.95);
  }
  100% {
    transform: translate(0) scaleY(1);
  }
}

section {
  animation: appear 0.1s cubic-bezier(0.215, 0.610, 0.355, 1);
  transform-origin: top;
}

</style>