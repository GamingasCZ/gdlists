<script setup lang="ts">
import { makeColorFromString } from "@/Editor";
import { number } from "@intlify/core-base";
import chroma, { type Color } from "chroma-js";
import { reactive, ref, watch } from "vue";
import { RouterLink } from "vue-router";

const emit = defineEmits(["removeLevel"]);
const props = defineProps<{
  levelName: string
  creator: string
  levelColor?: string
  levelID: string
  listID: string
  listName: string
  listPosition?: number
  timeAdded: number
  hideRemove: boolean
  inReviews: number
  inLists: number

  userArray: string
}>()

const listColor = ref<Color>(chroma(props.levelColor! ?? makeColorFromString(props.levelName)));

function parseElapsed(secs: number) {
  if (secs < 60) return Math.round(secs) + "s"; //s - seconds
  else if (secs < 3600) return Math.round(secs / 60) + "m"; //m - minutes
  else if (secs < 86400) return Math.round(secs / 3600) + "h"; //h - hours
  else if (secs < 604800) return Math.round(secs / 86400) + "d"; //d - days
  else if (secs < 1892160000)
    return Math.round(secs / 604800) + "w"; //w - weeks
  else return Math.round(secs / 1892160000) + "y"; //y - years
}

const getGradient = () =>
  `linear-gradient(90deg, ${listColor.value.darken(
    2
  )}, ${listColor.value.darken()}, ${listColor.value.brighten()})`;

const uploadDate = reactive(new Date(props.timeAdded!));
const goto = props.listPosition ? `?goto=${props.listPosition}`: ''
</script>1

<template>
  <RouterLink
    :to="`/${listID!}${goto}`"
    class="flex w-5/6 max-w-6xl cursor-pointer items-center gap-3 rounded-md border-2 border-solid bg-[length:150vw] bg-center px-2 py-0.5 text-white transition-[background-position] duration-200 hover:bg-left"
    :style="{
      backgroundImage: getGradient(),
      borderColor: listColor.darken(2).hex(),
    }"
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
    </section>

    <section class="flex flex-col justify-center">
      <h1 class="text-lg font-bold">{{ levelName }}</h1>
      <p class="text-xs">- {{ creator }} -</p>
    </section>

    <div v-if="inLists" class="flex gap-3 items-center p-1 ml-auto bg-black bg-opacity-40 rounded-md">
      <div v-if="inLists > 0">
        <img src="@/images/browseMobHeader.svg" class="inline mr-2 w-3" alt="">{{ inLists }}
      </div>
      <hr v-if="inLists > 0 && inReviews > 0" class="w-0.5 h-4 bg-white border-none opacity-40">
      <div v-if="inReviews > 0">
        <img src="@/images/reviews.svg" class="inline mr-2 w-3" alt="">{{ inReviews }}
      </div>
    </div>

    <button
      v-if="!hideRemove"
      class="box-border p-2 ml-auto w-10 bg-black bg-opacity-40 rounded-md button"
      @click.stop.prevent="emit('removeLevel', levelID)"
    >
      <img src="@/images/trash.svg" class="w-7" alt="" />
    </button>
  </RouterLink>
</template>
3
