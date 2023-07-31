<script setup lang="ts">
import type { CollabData, FavoritedLevel, LevelTag } from "@/interfaces";
import chroma, { type Color } from "chroma-js";
import { onMounted, ref } from "vue";
import CollabPreview from "../levelViewer/CollabPreview.vue";
import Tag from "../levelViewer/Tag.vue";
import { fixHEX } from "@/Editor";
import DifficultyGuesserContainer from "../levelViewer/DifficultyGuesserContainer.vue";

const props = defineProps<{
  levelName: string;
  creator: string | CollabData;
  levelID: string | null;
  video: string | null;
  difficulty: [number, number];
  color: [number, number, number] | string;
  tags: LevelTag[];
  favorited: boolean | undefined;
  levelIndex: number;
  listID: string;
  listName: string;
  disableStars: boolean;
  translucentCard: boolean;
  guessingNow: boolean;
  diffGuessArray: [boolean, boolean, boolean];
}>();

const emit = defineEmits<{
  (e: "nextGuess", res: number): void;
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

    // TODO: add proper list name (list name may not always be sex)
    faves.push({
      levelName: props.levelName,
      creator: isCollab ? props.creator[0][0] : (props.creator as string),
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
      difficultyGlow.value = await import(`../../images/faces/${["","star","featured","epic"][props.difficulty[1]]}.webp`).then(res => res.default)
    }
  }
}
getDifficulty()

</script>

<template>
  <section
    class="relative flex mx-auto w-[70rem] max-w-[95vw] rounded-sm p-3 text-white shadow-lg shadow-[color:#0000008F]"
    :style="{ backgroundImage: `linear-gradient(39deg, ${CARD_COL!.alpha(translucentCard ? 0.4 : 1).css()}, ${CARD_COL!.brighten(1).alpha(translucentCard ? 0.4 : 1).css()})` }"
    :class="{'backdrop-blur-md': translucentCard}"
  >
    <!-- ID copy popup -->
    <Transition name="fade">
      <article v-if="copyingID" class="absolute top-1/2 left-1/2 z-10 px-4 py-2 w-max text-2xl text-center bg-black bg-opacity-80 rounded-lg -translate-x-1/2 -translate-y-1/2">
        <h2 class="font-black">{{ $t('level.idCopied') }}</h2>
        <hr class="rounded-full border-2 opacity-80">
        <h3>{{ levelID }}</h3>
      </article>
    </Transition>

    <main class="flex justify-between items-center max-sm:flex-col">
      <div class="flex gap-4 items-center">
        <div class="relative w-40 bg-black max-w-[30vw] rounded-md aspect-video bg-cover bg-center" :style="{backgroundImage: `url(https://img.youtube.com/vi/${video}/0.jpg)`}">
          <button class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 button"><img src="@/images/modYT.svg" class="w-10" alt=""></button>
        </div>
        <header class="flex flex-col items-left">
          <!-- Level name -->
          <h2 class="text-3xl font-black max-sm:max-w-[60vw] max-sm:text-center break-words">
            <h3 class="inline mr-3 italic align-middle opacity-40">#{{ levelIndex+1 }}</h3>
            {{ levelName || $t('other.unnamesd') }}
          </h2>
          <!-- Level creator -->
          <h3 v-if="typeof creator == 'string'">{{ creator || $t('other.unnamesd') }}</h3>
        </header>
      </div>
      
      <!-- Skip difficulty guess -->
      <button v-if="guessingNow" class="mr-10 max-sm:mr-0 button" @click="emit('nextGuess', 0)">
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

    <CollabPreview v-if="typeof creator == 'object'" :collab="creator" />

    <!-- Level Tags -->
    <section class="flex flex-wrap gap-2 mt-2">
      <Tag v-for="tag in tags" :tag="tag" />
    </section>

    <DifficultyGuesserContainer :difficulty="difficulty" :diff-guess-array="diffGuessArray" v-if="guessingNow" @guessed="emit('nextGuess', $event)" />
  </section>
</template>
