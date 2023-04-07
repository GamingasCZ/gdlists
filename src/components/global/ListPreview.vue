<script setup lang="ts">
import chroma, { type Color } from "chroma-js";
import { reactive, ref } from "vue";
import { RouterLink } from "vue-router";
const props = defineProps({
  rate_ratio: String,
  views: Number,
  timestamp: Number,
  name: String,
  creator: String,
  id: String,
  index: Number
});

const makeColor = () =>
  chroma(
    Math.floor(
      16777215 *
        Math.sin(
          props.name
            ?.split("")
            .map((p: string) => p.charCodeAt(0))
            .reduce((x, y) => x + y)! % Math.PI
        )
    )
  );

const listColor = ref<Color>(makeColor());

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

const uploadDate = reactive(new Date(props.timestamp!));
</script>

<template>
  <RouterLink
    :to="id!"
    class="flex w-5/6 max-w-6xl cursor-pointer items-center gap-3 rounded-md border-[0.2rem] border-solid bg-[length:150vw] bg-center px-2 py-0.5 text-white transition-[background_position_y] duration-200 hover:bg-left"
    :style="{
      background: getGradient(),
      borderColor: listColor.darken(2).hex(),
    }"
  >
    <section v-if="rate_ratio" class="flex flex-col items-center text-xs">
      <img src="../../images/genericRate.svg" alt="" class="w-3.5" />{{
        rate_ratio
      }}
    </section>

    <section class="flex flex-col gap-1 items-center">
      <div v-if="views" class="flex gap-1 text-xs">
        <img src="../../images/view.svg" alt="" class="w-4" />{{ views }}
      </div>
      <div
        v-if="timestamp"
        class="flex gap-1 text-xs hover:cursor-help"
        :title="`${uploadDate.toLocaleDateString()} ${uploadDate.toLocaleTimeString()}`"
      >
        <img src="../../images/time.svg" alt="" class="w-4" />{{
          parseElapsed(Date.now() / 1000 - timestamp)
        }}
      </div>
    </section>

    <section class="flex flex-col justify-center">
      <h1 class="text-lg font-bold">{{ name }}</h1>
      <p class="text-xs">- {{}} -</p>
    </section>
  </RouterLink>
</template>
3
