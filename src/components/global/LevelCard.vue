<script setup lang="ts">
import type { Level } from "@/interfaces";
import chroma, { type Color } from "chroma-js";
import { inject, onErrorCaptured, ref } from "vue";
import CollabPreview from "../levelViewer/CollabPreview.vue";
import Tag from "../levelViewer/Tag.vue";
import DifficultyGuesserContainer from "../levelViewer/DifficultyGuesserContainer.vue";
import { DEFAULT_RATINGS, DEFAULT_REVIEWDATA } from "@/Reviews";
import { doFavoriteLevel, fixBrokenColors } from "./levelCard";
import DifficultyIcon from "./DifficultyIcon.vue";
import CardTheme from "../levelViewer/CardTheme.vue";
import { computed } from "vue";

interface Extras {
  favorited: boolean | undefined;
  levelIndex: number;
  listID: string;
  listName: string;
  disableStars: boolean;
  translucentCard: boolean;
  guessingNow: boolean;
  diffGuessArray: [boolean, boolean, boolean];
  hideRatings?: boolean
  rating?: number
  isEmbed?: boolean
  uploaderUid?: boolean
}

const props = defineProps<Level & Extras>();

const emit = defineEmits<{
  (e: "error"): void;
  (e: "nextGuess", res: number): void;
  (e: "openCollab", index: number, col: [number, number, number]): void;
  (e: "fullscreenImage", index: number): void;
}>();

const isFavorited = ref<boolean>(props?.favorited);
const CARD_COL = computed<Color>(() => fixBrokenColors(props.color));

const guessResult = ref([-1,-1])
const guessGradient = ref("")
const guessOpacity = ref(0.5)
function nextGuess(results: number) {
  switch (results) {
    case 0: guessResult.value = [0,0]; break;
    case 1: guessResult.value = [1,1]; break;
    case 2: guessResult.value = [1,0]; break;
    case 3: guessResult.value = [0,1]; break;
  }
  let colDiff = guessResult.value[0] ? "#78d51c" : "#b92020"
  let colRate = guessResult.value[1] ? "#78d51c" : "#b92020"
  guessGradient.value = `linear-gradient(10deg, ${colDiff}, ${colRate})`
  let repeats = 5
  let flash = setInterval(() => {
    guessOpacity.value = guessOpacity.value == 0.5 ? 0.8 : 0.5
    if (repeats == 0) {
      clearInterval(flash)
      guessOpacity.value = 0
      setTimeout(() => {
        guessResult.value = [-1,-1]
      }, 100);
    }
    repeats -= 1
  }, 150)
  emit('nextGuess', results)
}

const copyID = inject("idCopyTimestamp")

onErrorCaptured(() => {
  emit("error")
})

const listData = inject("levelsRatingsData")()
const userContent = import.meta.env.VITE_USERCONTENT
const textCol = computed(() => {
  return CARD_COL.value.luminance() > 0.5 ? 'black' : 'white'
})

</script>

<template>
  <section v-if="guessResult"
    class="relative font-[poppins] overflow-clip w-[min(100%,95vw)] max-w-[58rem] rounded-lg p-3 text-left shadow-lg shadow-[color:#0000008F]"
    :style="{
      backgroundImage: `linear-gradient(39deg, ${CARD_COL!.alpha(translucentCard ? 0.4 : 1).css()}, ${CARD_COL!.brighten(1).alpha(translucentCard ? 0.4 : 1).css()})`,
      color: textCol
    }"
    :class="{'backdrop-blur-md': translucentCard}"
    :id="guessResult[0] != -1 ? 'levelCard' : ''"
  >
    <CardTheme v-if="BGimage" v-bind="BGimage" />

    <Transition name="fade">
      <div v-if="guessResult[0] > -1" class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-[min(30vw,60rem)] justify-center items-center -z-10 opacity-40 mix-blend-luminosity">
        <div v-show="diffGuessArray[1]" class="w-28">
          <img v-if="guessResult[0] == 0" src="@/images/error.webp" class="w-28" alt="">
          <img v-else src="@/images/check.webp" class="w-28" alt="">
        </div>
        <div v-show="diffGuessArray[2]" class="w-28">
          <img v-if="guessResult[1] == 0" src="@/images/error.webp" class="w-28" alt="">
          <img v-else src="@/images/check.webp" class="w-28" alt="">
        </div>
      </div>
    </Transition>

    <main class="flex justify-between items-center max-sm:flex-col">
      <div>
        <header class="flex items-center">
          <!-- Level difficulty -->
          <div class="relative m-2 mr-1 ml-0" v-if="difficulty && !guessingNow">
            <DifficultyIcon class="w-14" :difficulty="difficulty?.[0] ?? difficulty" :rating="difficulty?.[1] ?? rating" />
          </div>

          <div :class="{'ml-2': !guessingNow}">
            <!-- Level name -->
            <h2 class="text-3xl relative font-black max-sm:max-w-[60vw] max-sm:text-center break-words">
              <h4 class="absolute -top-4 text-sm" v-if="platf">Platformer</h4>
              <component :is="isEmbed ? 'RouterLink' : 'span'" :to="'/'+listID" :class="{'underline cursor-pointer': isEmbed}">{{ levelName || $t('other.unnamesd') }}</component>
            </h2>
  
            <!-- Level creator -->
            <h3 v-if="typeof creator == 'string'">{{ creator || $t('other.unnamesd') }}</h3>
          </div>
        </header>
      </div>

      <!-- Card links -->
      <div class="flex gap-1.5 max-sm:my-2 sm:mr-10" v-if="!guessingNow">
        <a class="button" v-if="video" :href="`https://youtu.be/${video}`"
          ><img class="w-14 max-sm:w-10" src="@/images/modYT.svg" alt=""
        /></a>
        <a class="button" v-if="levelID" :href="`https://gdbrowser.com/${levelID}`" target="_blank"
          ><img class="w-14 max-sm:w-10" src="@/images/modGDB.svg" alt=""
        /></a>
        <button class="button" v-if="levelID?.toString()?.match(/^\d+$/)" @click="copyID(levelID)">
          <img class="w-14 max-sm:w-10" src="@/images/modID.svg" alt="" />
        </button>
      </div>

      <!-- Skip difficulty guess -->
      <button v-else class="mr-10 max-sm:mr-0 button" @click="emit('nextGuess', 0)">
          <img class="w-14 max-sm:w-10" src="@/images/skip.svg" alt="" />
      </button>

    </main>

    <!-- Favorite star -->
    <button
      class="absolute top-1 right-1 drop-shadow-md button"
      @click="isFavorited = doFavoriteLevel(props, isFavorited, CARD_COL)"
      :class="{ disabled: isFavorited }"
      v-if="favorited != undefined && levelID?.toString()?.match(/^\d+$/) && !disableStars"
    >
      <img src="@/images/star.svg" class="w-8" alt="" />
    </button>

    <div class="flex flex-col gap-3 mt-2">
      <CollabPreview v-if="typeof creator == 'object'" :collab="creator" @open-collab="emit('openCollab', levelIndex, CARD_COL?.hsl()!)" />
  
      <section v-if="screenshots" class="flex overflow-auto z-10 gap-4 w-full">
        <img v-for="(img, ind) in screenshots" @click="emit('fullscreenImage', ind)" :src="`${userContent}/userContent/${uploaderUid}/${img[1]}-thumb.webp`" class="max-h-36 rounded-md inter shadow-drop" alt="">
      </section>

      <!-- Level Tags -->
      <section class="flex z-10 flex-wrap gap-2">
        <Tag v-for="tag in tags" :tag="tag" />
      </section>
  
      <DifficultyGuesserContainer :difficulty="difficulty" :diff-guess-array="diffGuessArray" v-if="guessingNow" @guessed="nextGuess" />
      
      <!-- Level review ratings -->
      <div v-if="ratings && !hideRatings" class="flex z-10 flex-wrap gap-x-10 gap-y-10 justify-center p-4 bg-black bg-opacity-40 rounded-md">
        <div v-for="(rating, index) in DEFAULT_RATINGS.concat(listData[1])" :style="{'--bg': chroma.hsl(...rating.color).hex(), '--fill': `${listData[0][levelIndex].ratings[Math.floor(index / 4)][index % 4]*10}%`}" class="flex relative flex-col justify-center items-center p-1 w-24 group aspect-square ratingCircle">
          <h3 class="overflow-hidden max-w-full text-sm text-ellipsis">{{ rating.name }}</h3>
          <span v-if="rating.name.length > 12" class="absolute z-10 p-1 text-xl opacity-0 transition-opacity group-hover:opacity-100 bg-lof-300 shadow-drop">{{ rating.name }}</span>
          
          <span v-if="listData[0][levelIndex]?.ratings?.[Math.floor(index / 4)]?.[index % 4] > -1" class="text-2xl font-bold">{{ listData[0][levelIndex].ratings[Math.floor(index / 4)][index % 4] }}/10</span>
          <span v-else class="text-3xl font-black text-red-600">!</span>
        </div>
      </div>
    </div>

  </section>
</template>

<style scoped>

#levelCard::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 20;
  overflow: hidden;
  mix-blend-mode: plus-lighter;
  background: v-bind(guessGradient);
  transition: opacity 150ms ease;
  opacity: v-bind(guessOpacity);
}

</style>
