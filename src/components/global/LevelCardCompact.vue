<script setup lang="ts">
import type { Level } from "@/interfaces";
import type { Color } from "chroma-js";
import { computed, inject, onErrorCaptured, ref } from "vue";
import { doFavoriteLevel, fixBrokenColors } from "./levelCard";
import DifficultyIcon from "./DifficultyIcon.vue";
import { DEFAULT_RATINGS } from "@/Reviews";
import chroma from "chroma-js";
import Dropdown from "../ui/Dropdown.vue";
import CardTheme from "../levelViewer/CardTheme.vue";

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

const isFavorited = ref<boolean>(props.favorited);
const CARD_COL = ref<Color>(fixBrokenColors(props.color));
const copyID = inject("idCopyTimestamp")

const openOverview = () => {
  if (document.body.clientWidth > 640) return
  if (!hasInfo) return
  emit('openTags', props.levelIndex)
}

const openCollab = () => {
  if (!isCollab) return
  emit("openCollab", props.levelIndex, props.color)
}

const isCollab = typeof props.creator != 'string'
const hasInfo = props.levelID || props.video || (props.tags && props.tags.length)

onErrorCaptured(() => {
  emit("error")
})

const listData = inject("listData")

const rateDropdownButton = ref<HTMLImageElement>()
const ratingsShowing = ref(false)
const textCol = computed(() => {
  return CARD_COL.value.luminance() > 0.5 ? 'black' : 'white'
})

</script>

<template>
  <section class="relative max-sm:button mx-auto w-[58rem] max-w-[95vw] rounded-lg p-2 shadow-lg shadow-[color:#0000008F]"
    :style="{
      backgroundImage: `linear-gradient(39deg, ${CARD_COL!.alpha(translucentCard ? 0.4 : 1).css()}, ${CARD_COL!.brighten(1).alpha(translucentCard ? 0.4 : 1).css()})`,
      color: textCol
    }"
    :class="{ 'backdrop-blur-md': translucentCard }" @click="openOverview">
    
    <CardTheme v-if="BGimage" v-bind="BGimage" />

    <main class="flex justify-between items-center">
      <div>
        <header class="flex items-center">
          <!-- Level difficulty -->
          <div class="relative mr-1" v-if="difficulty">
            <DifficultyIcon class="w-12" :difficulty="difficulty[0]" :rating="difficulty[1]" />
          </div>

          <!-- Level name -->
          <h2 class="text-xl relative max-sm:max-w-[60vw] break-words">
            <div class="flex flex-col leading-snug">
              <div class="flex gap-2">
                <span class="font-black">{{ levelName || $t('other.unnamesd') }}</span>
                <img class="w-6" v-if="platf" title="Platformer" src="@/images/platformer.svg" alt="">
                <img @click="ratingsShowing = true" class="w-6 button" ref="rateDropdownButton" v-if="ratings && !hideRatings" :title="$t('reviews.rating')" src="@/images/rating.svg" alt="">
                <button class="w-6 button focus-within:outline-current max-sm:hidden" v-if="tags && tags.length > 0" @click="emit('openTags', levelIndex)"><img src="@/images/levelID.svg" alt=""></button>
              </div>
              <div>
              <span class="text-base font-normal" v-if="!isCollab">{{ creator || $t('other.unnamesd')}}</span>
              <div v-else class="flex gap-1" :class="{'hover:underline cursor-pointer': isCollab}">
                <img src="@/images/collab.svg" v-if="isCollab" alt="">
                <span @click="openCollab" class="text-base font-normal">{{ creator[0][0].name || $t('other.unnamesd')}}</span>
              </div>
              </div>
            </div>
          </h2>
        </header>
      </div>

      <!-- Card links -->
      <div class="flex gap-1.5 max-sm:hidden max-sm:my-2 sm:mr-6">
        <a class="button" v-if="video" :href="`https://youtu.be/${video}`"><img class="w-12 max-sm:w-10"
            src="@/images/modYT.svg" alt="" /></a>
        <a class="button" v-if="levelID" :href="`https://gdbrowser.com/${levelID}`" target="_blank"><img
            class="w-12 max-sm:w-10" src="@/images/modGDB.svg" alt="" /></a>
        <button class="button" v-if="levelID?.match(/^\d+$/)" @click="copyID(levelID)">
          <img class="w-12 max-sm:w-10" src="@/images/modID.svg" alt="" />
        </button>
      </div>
    </main>

    <!-- Mobile more -->
    <button class="absolute right-3 top-1/2 h-full opacity-40 -translate-y-1/2 button sm:hidden" v-if="hasInfo">
      <img src="@/images/arrow.svg" class="w-4" alt="" />
    </button>

    <!-- Favorite star -->
    <button class="absolute top-1 right-1 drop-shadow-md button max-sm:hidden" @click="isFavorited = doFavoriteLevel(props, isFavorited, CARD_COL)"
      :class="{ disabled: isFavorited }" v-if="favorited != undefined && levelID?.match(/^\d+$/) && !disableStars">
      <img src="@/images/star.svg" class="w-6" alt="" />
    </button>

    <!-- Level review ratings -->
    <Dropdown v-if="ratingsShowing" @close="ratingsShowing = false" :title="$t('reviews.rating')" :options="[]" :button="rateDropdownButton">
      <template #header>
        <div v-for="(rating, index) in DEFAULT_RATINGS.concat(listData.data.ratings)" class="flex flex-col gap-1 p-1">
          <div class="flex justify-between text-white">
            <h3 class="overflow-hidden max-w-full text-sm text-ellipsis">{{ rating.name }}</h3>
            <span class="text-sm font-bold">{{ listData.data.levels[levelIndex].ratings[Math.floor(index / 4)][index % 4] }}/10</span>
          </div>
          <div class="relative w-full h-1 bg-black bg-opacity-40">
            <div :style="{background: chroma.hsl(...rating.color).hex(), width: `${10*listData.data.levels[levelIndex].ratings[Math.floor(index / 4)][index % 4]}%`}" class="absolute h-full"></div>
          </div>
        </div>
      </template>
    </Dropdown>

  </section>
</template>
