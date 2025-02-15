<script setup lang="ts">
import { makeColorFromString, newCardBG } from "@/Editor";
import type { selectedList } from "@/interfaces";
import { SETTINGS } from "@/siteSettings";
import { number } from "@intlify/core-base";
import chroma, { type Color } from "chroma-js";
import { reactive, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import DifficultyIcon from "./DifficultyIcon.vue";
import RatingContainer from "./RatingContainer.vue";

const emit = defineEmits<{
  (e: 'removeLevel', index: number): void
  (e: 'clickedOption', data: selectedList): void
}>()
const props = defineProps<{
  levelName: string
  creator: string
  levelColor?: string
  color?: string
  levelID: string
  listID: string
  listName: string
  listPosition?: number
  timeAdded: number
  hideRemove: boolean
  inReviews: number
  inLists: number
  difficulty?: number
  rating?: number

  A_gameplay?: string | null
  A_decoration?: string | null
  A_difficulty?: string | null
  A_overall?: string | null

  userArray: string
  disableLink?: boolean | 2
}>()

const listColor = ref<Color>(chroma(props.color ?? props.levelColor! ?? makeColorFromString(props.levelName)));
if (SETTINGS.value.disableColors) {
  listColor.value = chroma(getComputedStyle(document.documentElement).getPropertyValue("--primaryColor"))
}

function parseElapsed(secs: number) {
  if (secs < 60) return Math.round(secs) + "s"; //s - seconds
  else if (secs < 3600) return Math.round(secs / 60) + "m"; //m - minutes
  else if (secs < 86400) return Math.round(secs / 3600) + "h"; //h - hours
  else if (secs < 604800) return Math.round(secs / 86400) + "d"; //d - days
  else if (secs < 1892160000)
    return Math.round(secs / 604800) + "w"; //w - weeks
  else return Math.round(secs / 1892160000) + "y"; //y - years
}

const getGradient = () => {
  if (SETTINGS.value.disableColors) {
    return getComputedStyle(document.documentElement).getPropertyValue("--secondaryColor")
  }

  return `linear-gradient(90deg, ${listColor.value.darken(
    2
  )}, ${listColor.value.darken()}, ${listColor.value.brighten()})`;
}

const uploadDate = reactive(new Date(props.timeAdded!));
const goto = props.listPosition ? `?goto=${props.listPosition}`: ''
const round = (x) => parseFloat(parseFloat(x).toFixed(1))

const clickLevel = () => {
  let bg = newCardBG()
  bg.image[0] = props?.background
  emit('clickedOption', {levelName: props.levelName, creator: props.creator, levelID: props.levelID, difficulty: props.difficulty, rating: props.rating, color: props?.color, background: bg})
}
</script>

<template>
  <component
    :is="disableLink ? 'button' : 'RouterLink'"
    :to="`/${listID!}${goto}`"
    class="flex text-left max-w-6xl w-full cursor-pointer items-center flex-wrap gap-3 rounded-md border-2 border-solid bg-[length:150vw] bg-center px-2 py-0.5 text-white transition-[background-position] duration-200 hover:bg-left"
    :style="{
      background: getGradient(),
      borderColor: listColor.darken(2).hex(),
    }"
    @click="clickLevel"
  >
    <section class="flex flex-col gap-1 items-center">
      <div
        v-if="timeAdded"
        class="flex gap-1 text-xs hover:cursor-help"
        :title="`${uploadDate.toLocaleDateString()} ${uploadDate.toLocaleTimeString()}`"
      >
        <img src="../../images/time.svg" alt="" class="w-4" />{{
          parseElapsed(Date.now() / 1000 - timeAdded / 1000)
        }}
      </div>
      <DifficultyIcon v-if="difficulty !== undefined && rating !== undefined" class="w-10":difficulty="difficulty" :rating="rating" />
    </section>


    <section class="flex flex-col justify-center">
      <h1 class="text-lg font-bold">{{ levelName }}</h1>
      <p class="text-xs">{{ creator }}</p>
    </section>

    <section v-if="inLists || inReviews" class="grid grid-cols-[1fr_0.5fr] gap-2 ml-auto">
      <RatingContainer v-if="inReviews" class="min-w-60 max-sm:mb-2" :ratings="[round(A_gameplay), round(A_decoration), round(A_difficulty), round(A_overall)]" compact />
      <div v-else></div>
        
      <div class="flex gap-3 items-center place-self-end px-2 py-0.5 mb-auto w-max bg-black bg-opacity-60 rounded-md">
        <div v-if="inLists > 0">
          <img src="@/images/browseMobHeader.svg" class="inline mr-2 w-3" alt="">{{ inLists }}
        </div>
        <hr v-if="inLists > 0 && inReviews > 0" class="w-0.5 h-4 bg-white border-none opacity-40">
        <div v-if="inReviews > 0">
          <img src="@/images/reviews.svg" class="inline mr-2 w-3" alt="">{{ inReviews }}
        </div>
      </div>
    </section>

    <button
      v-if="!hideRemove"
      class="box-border p-2 ml-auto w-10 bg-black bg-opacity-40 rounded-md button"
      @click.stop.prevent="emit('removeLevel', levelID)"
    >
      <img src="@/images/trash.svg" class="w-7" alt="" />
    </button>
  </component>
</template>
