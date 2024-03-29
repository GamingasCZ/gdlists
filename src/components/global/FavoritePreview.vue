<script setup lang="ts">
import { number } from "@intlify/core-base";
import chroma, { type Color } from "chroma-js";
import { reactive, ref, watch } from "vue";
import { RouterLink } from "vue-router";

const emit = defineEmits(["removeLevel"]);
const props = defineProps({
  levelName: String,
  creator: String,
  levelColor: String,
  levelID: String,
  listID: String,
  listName: String,
  listPosition: Number,
  timeAdded: Number,
  hideRemove: { type: Boolean, default: false },

  userArray: String,
});

const listColor = ref<Color>(chroma(props.levelColor!));

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
</script>

<template>
  <RouterLink
    :to="`${listID!}?goto=${listPosition}`"
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
