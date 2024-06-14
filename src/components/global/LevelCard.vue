<script setup lang="ts">
import type { CollabData, FavoritedLevel, Level, LevelTag } from "@/interfaces";
import chroma, { type Color } from "chroma-js";
import { onErrorCaptured, ref } from "vue";
import CollabPreview from "../levelViewer/CollabPreview.vue";
import Tag from "../levelViewer/Tag.vue";
import { fixHEX, diffScaleOffsets, diffTranslateOffsets } from "@/Editor";
import DifficultyGuesserContainer from "../levelViewer/DifficultyGuesserContainer.vue";
import RatingContainer from './RatingContainer.vue'

interface Extras {
  favorited: boolean | undefined;
  levelIndex: number;
  listID: string;
  listName: string;
  disableStars: boolean;
  translucentCard: boolean;
  guessingNow: boolean;
  diffGuessArray: [boolean, boolean, boolean];
}

const props = defineProps<Level & Extras>();

const emit = defineEmits<{
  (e: "error"): void;
  (e: "nextGuess", res: number): void;
  (e: "openCollab", index: number, col: [number, number, number]): void;
}>();

const isFavorited = ref<boolean>(props.favorited);
const copyingID = ref<boolean>(false)
const copyID = () => {
  copyingID.value = true
  setTimeout(() => copyingID.value = false, 2500);
  
  navigator.clipboard.writeText(props.levelID!);
};
const doFavoriteLevel = () => {
  let faves: FavoritedLevel[] = JSON.parse(localStorage.getItem("favorites")!);
  let favesIDs: string[] = JSON.parse(localStorage.getItem("favoriteIDs")!);

  if (isFavorited.value) {
    let levelIndex = favesIDs.indexOf(props.levelID!);
    favesIDs.splice(levelIndex, 1);
    faves.splice(levelIndex, 1);
  } else {
    favesIDs.push(props.levelID!);

    
    let isCollab = typeof props.creator == "object";
    let levelCreator
    if (isCollab) levelCreator = props.creator?.[3] ? props.creator[0][0].name : props.creator[0][0]
    else levelCreator = props.creator

    // TODO: add proper list name (list name may not always be sex)
    faves.push({
      levelName: props.levelName,
      creator: levelCreator,
      levelColor: CARD_COL.value?.hex(),
      levelID: props.levelID!,
      levelDiff: props.difficulty,
      listID: props.listID,
      listName: props.listName,
      listPosition: props.levelIndex,
      timeAdded: Date.now(),
    });
  }

  localStorage.setItem("favorites", JSON.stringify(faves));
  localStorage.setItem("favoriteIDs", JSON.stringify(favesIDs));
  isFavorited.value = !isFavorited.value;
};

const CARD_COL = ref<Color>();

// Old lists may have broken colors!! (damn you, old Gamingas :D)
try {
  CARD_COL.value = typeof props.color == 'string' ? chroma(fixHEX(props.color)) : chroma.hsl(...props.color);
} catch (e) {
  CARD_COL.value = chroma.random();
}

const difficultyFace = ref("")
const difficultyGlow = ref("")

async function getDifficulty() {
  if (props.difficulty) {
    difficultyFace.value = await import(`../../images/faces/${props.difficulty[0]}.webp`).then(res => res.default)
    if (props.difficulty[1]) { // Must be rated
      difficultyGlow.value = await import(`../../images/faces/${["","star","featured","epic","legendary","mythic"][props.difficulty[1]]}.webp`).then(res => res.default)
    }
  }
}
getDifficulty()

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

onErrorCaptured(() => {
  emit("error")
})

</script>

<template>
  <section v-if="guessResult"
    class="relative font-[poppins] w-[min(100%,95vw)] max-w-[70rem] rounded-lg p-3 text-white text-left shadow-lg shadow-[color:#0000008F]"
    :style="{ backgroundImage: `linear-gradient(39deg, ${CARD_COL!.alpha(translucentCard ? 0.4 : 1).css()}, ${CARD_COL!.brighten(1).alpha(translucentCard ? 0.4 : 1).css()})` }"
    :class="{'backdrop-blur-md': translucentCard}"
    :id="guessResult[0] != -1 ? 'levelCard' : ''"
  >

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

    <!-- ID copy popup -->
    <Transition name="fade">
      <article v-if="copyingID" class="absolute top-1/2 left-1/2 z-10 px-4 py-2 w-max text-2xl text-center bg-black bg-opacity-80 rounded-lg -translate-x-1/2 -translate-y-1/2">
        <h2 class="font-black">{{ $t('level.idCopied') }}</h2>
        <hr class="rounded-full border-2 opacity-80">
        <h3>{{ levelID }}</h3>
      </article>
    </Transition>

    <main class="flex justify-between items-center max-sm:flex-col">
      <div>
        <header class="flex items-center">
          <!-- Level difficulty -->
          <div
            class="relative m-2 mr-1 ml-0"
            v-if="difficulty && !guessingNow"
            :class="{ '!mx-2': difficulty[1] > 0 }"
          >

            <!-- Difficulty face -->
            <img
              class="relative z-10 w-10"
              :src="difficultyFace"
              :class="{'translate-y-0.5': difficulty[1] >= 3}"
              :style="{scale: diffScaleOffsets[difficulty[0]-6], translate: diffTranslateOffsets[difficulty[0]-6]}"
              alt=""  
            />


            <!-- Mythic glow -->
            <img
              v-if="difficulty[1] == 5"
              class="absolute top-1/2 -translate-y-1/2 -translate-x-0.5 z-0 w-full scale-[1.8]"
              :class="{
              }"
              :src="difficultyGlow"
              alt=""
            />
            <!-- Legendary glow -->
            <img
              v-if="difficulty[1] == 4"
              class="absolute top-1/2 -translate-y-1/2  z-0 w-full scale-[1.6]"
              :class="{
              }"
              :src="difficultyGlow"
              alt=""
            />
            
            <!-- Featured glow -->
            <img
              v-if="difficulty[1] == 2"
              class="absolute top-1/2 -translate-y-1/2  z-0 w-full scale-[1.4]"
              :src="difficultyGlow"
              alt=""
            />

            <!-- Epic rate -->
            <img
              v-if="difficulty[1] == 3"
              class="absolute -top-1 z-0 w-full scale-[1.6]"
              :src="difficultyGlow"
              alt=""
            />

            <!-- Star rate -->
            <img
              v-if="difficulty[1] == 1"
              class="absolute -right-0 -bottom-0 z-20 w-4 scale-150"
              :src="difficultyGlow"
              alt=""
            />
          </div>

          <!-- Level name -->
          <h2 :class="{'ml-2': !guessingNow}" class="text-3xl relative font-black max-sm:max-w-[60vw] max-sm:text-center break-words">
            <h4 class="absolute -top-4 text-sm" v-if="platf">Platformer</h4>
            {{ levelName || $t('other.unnamesd') }}
          </h2>
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
        <button class="button" v-if="levelID?.match(/^\d+$/)" @click="copyID">
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
      class="absolute top-1 right-1 button"
      @click="doFavoriteLevel"
      :class="{ disabled: isFavorited }"
      v-if="favorited != undefined && levelID?.match(/^\d+$/) && !disableStars"
    >
      <img src="@/images/star.webp" class="w-8" alt="" />
    </button>

    <!-- Level creator -->
    <h3 v-if="typeof creator == 'string'">{{ creator || $t('other.unnamesd') }}</h3>
    <CollabPreview v-if="typeof creator == 'object'" :collab="creator" @open-collab="emit('openCollab', levelIndex, CARD_COL?.hsl()!)" />

    <!-- Level Tags -->
    <section class="flex flex-wrap gap-2 mt-2">
      <Tag v-for="tag in tags" :tag="tag" />
    </section>

    <DifficultyGuesserContainer :difficulty="difficulty" :diff-guess-array="diffGuessArray" v-if="guessingNow" @guessed="nextGuess" />
  
    <RatingContainer v-if="ratings" :ratings="ratings[0]" :user-ratings="ratings[1]" />
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
