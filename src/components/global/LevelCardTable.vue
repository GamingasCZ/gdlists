<script setup lang="ts">
import { type Level } from "@/interfaces";
import chroma, { type Color } from "chroma-js";
import { inject, onErrorCaptured, ref } from "vue";
import { doFavoriteLevel, fixBrokenColors } from "./levelCard";
import DifficultyIcon from "./DifficultyIcon.vue";
import Dropdown from "../ui/Dropdown.vue";
import { DEFAULT_RATINGS } from "@/Reviews";
import LevelRatingDropdown from "./LevelRatingDropdown.vue";
import { computed } from "vue";
import CircularRating from "../ui/CircularRating.vue";

interface Extras {
  favorited: boolean | undefined;
  levelIndex: number;
  listID: string;
  listName: string;
  disableStars: boolean;
  translucentCard: boolean;
  hideRatings?: boolean
  rating?: number
  isEmbed?: boolean
}

const props = defineProps<Level & Extras>();

const emit = defineEmits<{
  (e: "error"): void;
  (e: "nextGuess", res: number): void;
  (e: "openCollab", index: number, col: [number, number, number]): void;
  (e: "openTags", index: number): void;
}>();

const isFavorited = ref<boolean>(props.favorited ?? false);
const CARD_COL = ref<Color>(fixBrokenColors(props.color));
const copyID = inject("idCopyTimestamp")

const openCollab = () => {
  if (!isCollab.value) return
  emit("openCollab", props.levelIndex, props.color)
}

onErrorCaptured(() => {
  emit("error")
})

const isCollab = computed(() => typeof props.creator != 'string')

</script>

<template>
  <tr class="text-white"
    :style="{ backgroundColor: CARD_COL!.alpha(translucentCard ? 0.4 : 1).css() }">

    <td class="text-center">
      <span>{{ levelIndex + 1 }}</span>
    </td>

    <td>
      <!-- Level name -->
      <h2 class="font-bold max-sm:max-w-[60vw] max-sm:text-center break-words">
        <div class="flex gap-1 items-center">
          <DifficultyIcon v-if="difficulty?.[0]" class="w-6" :difficulty="difficulty[0]" :rating="difficulty[1]" />
          <span>{{ levelName || $t('other.unnamesd') }}</span>
          <img src="@/images/platformer.svg" title="Platformer" v-if="platf" class="w-5" alt="">
          <LevelRatingDropdown v-if="ratings && !hideRatings" :level-index="levelIndex" />
          <button class="w-6 button focus-within:outline-current" v-if="tags && tags.length > 0" @click="emit('openTags', levelIndex)"><img src="@/images/levelID.svg"></button>
        </div>
      </h2>
    </td>

    <td>
      <!-- Level creator -->
      <div class="flex gap-1">
        <img v-if="isCollab" src="@/images/collab.svg">
        <h3 v-if="!isCollab">{{ creator || $t('other.unnamesd') }}</h3>
        <h3 @click="openCollab" :class="{'hover:underline cursor-pointer': typeof creator != 'string'}" v-else :title="creator[1][creator[0][0].role]">{{ creator[0][0].name || creator[0][0] }}</h3>
      </div>
    </td>

    <td class="text-center">
      <span class="cursor-pointer hover:underline" @click="copyID(props.levelID)">{{ levelID }}</span>
    </td>

    <td class="text-center">
      <div class="flex gap-3 justify-center">
        <template v-if="ratings?.[0]">
          <CircularRating v-for="(rate, ind) in ratings[0]" v-show="rate > -1" class="!w-5 text-sm" :name="DEFAULT_RATINGS[ind].name" :min="0" :max="10" :value="rate" :color="chroma.hsl(...DEFAULT_RATINGS[ind].color).hex()" mini name="" />
        </template>
        <button v-if="commentary" @click="emit('openTags', levelIndex)" class="button">
          <img src="@/images/comment.svg" class="w-5" alt="">
        </button>
      </div>
    </td>
    
    <!-- Favorite star -->
    <td class="pr-1 w-5">
      <div class="flex gap-1 justify-center">
        <a v-if="levelID" :title="$t('listViewer.dispOnGDB')" :href="`https://gdbrowser.com/${levelID}`" target="_blank">
          <img src="@/images/modGDB.svg" class="w-5 min-w-5" alt="">
        </a>
        <a v-if="video" :title="$t('level.video')" :href="`https://youtu.be/${video}`">
          <img src="@/images/modYT.svg" class="w-5 min-w-5" alt="">
        </a>
        <button @click="isFavorited = doFavoriteLevel(props, isFavorited, CARD_COL)" :class="{ disabled: isFavorited }" class="flex justify-center items-center w-max"
          v-if="isFavorited != undefined && levelID?.toString()?.match(/^\d+$/) && !disableStars">
          <img class="w-5 min-w-5" src="../../images/star.svg">
        </button>
      </div>
    </td>
  </tr>
</template>

<style>
td:nth-child(even) { @apply bg-black bg-opacity-20 }
td { @apply px-1 }

</style>
