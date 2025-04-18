<script setup lang="ts">
import { LevelImage, type Level } from "@/interfaces";
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
import { TagName } from "@/assets/tags";
import EditorCardCommentary from "../editor/EditorCardCommentary.vue";

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

const isBlackText = computed(() => CARD_COL.value.luminance() > 0.4)
const textCol = computed(() => {
  return isBlackText.value ? 'black' : 'white'
})

const hasPlatTag = (() => {
  if (props.tags)
    return props.tags.find(x => x[0] == TagName.PLATFORMER) !== undefined
  return false
})()

</script>

<template>
  <section v-if="guessResult"
    class="relative font-[poppins] overflow-clip w-[min(100%,95vw)] max-w-[58rem] rounded-lg p-3 py-5 text-left shadow-lg shadow-[color:#0000008F]"
    :style="{
      backgroundImage: `linear-gradient(39deg, ${CARD_COL!.alpha(translucentCard ? 0.4 : 1).css()}, ${CARD_COL!.brighten(1).alpha(translucentCard ? 0.4 : 1).css()})`,
      color: textCol
    }"
    :class="{'backdrop-blur-md': translucentCard}"
    :id="guessResult[0] != -1 ? 'levelCard' : ''"
  >
    <CardTheme v-if="BGimage" v-bind="BGimage" :uid="uploaderUid"/>

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
              <h4 class="absolute -top-4 text-sm" v-if="platf || hasPlatTag">Platformer</h4>
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

      <!-- Collab -->
      <CollabPreview v-if="typeof creator == 'object'" :collab="creator" :white="isBlackText" @open-collab="emit('openCollab', levelIndex, CARD_COL?.hsl()!)" />
  
      <!-- Level review ratings -->
      <div v-if="ratings && !hideRatings" class="flex z-10 flex-wrap gap-3 justify-start empty:hidden">
        <template v-for="(rating, index) in DEFAULT_RATINGS.concat(listData[1])">
          <div
            :class="{'bg-black': !isBlackText, 'bg-white': isBlackText}"
            class="flex relative justify-center items-center p-1 px-2 py-1 overflow-clip bg-opacity-70 rounded-md group"
            v-if="listData[0][levelIndex]?.ratings?.[Math.floor(index / 4)]?.[index % 4] > -1"
          >
            <h3 class="overflow-hidden mr-4 min-w-max text-ellipsis">{{ rating.name }}</h3>
            
            <span class="text-2xl font-black">{{ listData[0][levelIndex].ratings[Math.floor(index / 4)][index % 4] }}</span>
            <span class="ml-1 opacity-40 translate-y-1 text-inherit">/10</span>

            <div
            class="absolute bottom-0 left-0 w-full h-1 bg-white"
            :style="{background: chroma.hsl(...rating.color).css(), width: `${parseInt(listData[0][levelIndex].ratings[Math.floor(index / 4)][index % 4]/10*100)}%` }"></div>
          </div>
        </template>
      </div>
      <EditorCardCommentary v-if="commentary" :editable="false" :uid="uploaderUid" :dark="isBlackText" :text="commentary" />

      <!-- Screenshots -->
      <h2 v-if="scShotSecName && screenshots?.length" class="mt-3 text-2xl font-bold leading-none">{{ scShotSecName }}</h2>
      <section v-if="screenshots?.length" class="flex overflow-auto z-10 gap-2 w-full">
        <figure v-for="(img, ind) in screenshots" class="flex flex-col">
          <iframe
              v-if="img[0] == LevelImage.VIDEO"
              height="144" width="255"
              :src="`https://www.youtube-nocookie.com/embed/${img[1]}`"
              title="YouTube video player" frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
              class="rounded-md"
              >
          </iframe>
          <img v-else @click="emit('fullscreenImage', ind)" :src="`${userContent}/userContent/${uploaderUid}/${img[1]}-thumb.webp`" class="object-cover object-center max-h-36 rounded-md aspect-video inter shadow-drop" alt="">
          <figcaption class="text-center text-inherit">{{ img[2] }}</figcaption>
        </figure>
      </section>

      <!-- Level Tags -->
      <section class="flex z-10 flex-wrap gap-2">
        <Tag v-for="tag in tags" :tag="tag" :white="isBlackText" />
      </section>
  
      <DifficultyGuesserContainer :difficulty="difficulty" :diff-guess-array="diffGuessArray" v-if="guessingNow" @guessed="nextGuess" />
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
