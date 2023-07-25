<script setup lang="ts">
import type { CollabData, FavoritedLevel, LevelTag } from "@/interfaces";
import chroma, { type Color } from "chroma-js";
import { onMounted, ref } from "vue";
import CollabPreview from "../levelViewer/CollabPreview.vue";
import Tag from "../levelViewer/Tag.vue";

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
      levelColor: chroma(props.color!).hex(),
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
  CARD_COL.value = typeof props.color == 'string' ? chroma(props.color) : chroma.hsl(...props.color);
} catch (e) {
  CARD_COL.value = chroma.random();
}

const difficultyFace = ref("")
const difficultyGlow = ref("")
if (props.difficulty) {
  difficultyFace.value = new URL(`/public/faces/${props.difficulty[0]}.webp`, import.meta.url).href
  if (props.difficulty[1]) { // Must be rated
    difficultyGlow.value = new URL(`/public/faces/${["","star","featured","epic"][props.difficulty[1]]}.webp`, import.meta.url).href
  }
}

</script>

<template>
  <section
    class="relative mx-auto w-[70rem] max-w-[95vw] rounded-lg p-3 text-white shadow-lg shadow-[color:#0000008F]"
    :style="{ backgroundImage: `linear-gradient(39deg, ${CARD_COL!.alpha(translucentCard ? 0.4 : 1).css()}, ${CARD_COL!.brighten(1).alpha(translucentCard ? 0.4 : 1).css()})` }"
    :class="{'backdrop-blur-md': translucentCard}"
  >
    <!-- ID copy popup -->
    <article v-if="copyingID" class="absolute top-1/2 left-1/2 z-10 px-4 py-2 w-max text-2xl text-center bg-black bg-opacity-80 rounded-lg -translate-x-1/2 -translate-y-1/2">
      <h2 class="font-black">{{ $t('level.idCopied') }}</h2>
      <hr class="rounded-full border-2 opacity-80">
      <h3>{{ levelID }}</h3>
    </article>

    <main class="flex justify-between items-center max-sm:flex-col">
      <div>
        <header class="flex items-center">
          <!-- Level difficulty -->
          <div
            class="relative m-2 mr-1 ml-0"
            v-if="difficulty"
            :class="{ '!mx-2': difficulty[1] > 0 }"
          >
            <img
              class="relative z-10 w-10"
              :src="difficultyFace"
              :class="{ 'scale-[1.3]': difficulty[0] > 5 }"
              alt=""
            />
            <img
              v-if="difficulty[1] == 2"
              class="absolute top-0 z-0 w-full scale-[1.4]"
              :class="{
                '!-top-0.5 !scale-[1.7]': difficulty[0] > 5,
                '!-top-0.5 !scale-[1.48]': difficulty[0] == 10,
              }"
              :src="difficultyGlow"
              alt=""
            />
            <img
              v-else-if="difficulty[1] == 3"
              class="absolute -top-1 -z-10 w-full scale-[1.6]"
              :src="difficultyGlow"
              alt=""
            />
            <img
              v-else-if="difficulty[1] == 1"
              class="absolute -right-0 -bottom-0 z-20 w-4 scale-150"
              :src="difficultyGlow"
              alt=""
            />
          </div>

          <!-- Level name -->
          <h2 class="ml-2 text-3xl font-black max-sm:max-w-[60vw] max-sm:text-center break-words">
            {{ levelName || $t('other.unnamesd') }}
          </h2>
        </header>
      </div>

      <!-- Card links -->
      <div class="flex gap-1.5 max-sm:my-2 sm:mr-10">
        <button class="button" v-if="video">
          <a :href="`https://youtu.be/${video}`"
            ><img class="w-14 max-sm:w-10" src="@/images/modYT.svg" alt=""
          /></a>
        </button>
        <button class="button" v-if="levelID?.match(/^\d+$/)">
          <a :href="`https://gdbrowser.com/${levelID}`"
            ><img class="w-14 max-sm:w-10" src="@/images/modGDB.svg" alt=""
          /></a>
        </button>
        <button class="button" v-if="levelID?.match(/^\d+$/)" @click="copyID">
          <img class="w-14 max-sm:w-10" src="@/images/modID.svg" alt="" />
        </button>
      </div>
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
    <CollabPreview v-if="typeof creator == 'object'" :collab="creator" />

    <!-- Level Tags -->
    <section class="flex flex-wrap gap-2 mt-2">
      <Tag v-for="tag in tags" :tag="tag" />
    </section>
  </section>
</template>
