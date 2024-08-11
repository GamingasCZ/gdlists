<script setup lang="ts">
import { fixHEX } from "@/Editor";
import type { FavoritedLevel, Level } from "@/interfaces";
import { SETTINGS } from "@/siteSettings";
import chroma from "chroma-js";

const props = defineProps<{
  data: FavoritedLevel | Level;
}>();

const emit = defineEmits<{
  (e: "pick", level: FavoritedLevel | Level): void
}>();

let col = props.data.levelColor ?? props.data.color

var color = typeof col == 'string' ? fixHEX(col) : chroma.hsl(...col).hex()
if (SETTINGS.value.disableColors)
  color = getComputedStyle(document.documentElement).getPropertyValue("--siteBackground")

const isCollab = typeof props.data.creator != "string"
</script>
<template>
  <button
    :style="{ backgroundColor: color }"
    class="hover:translate-x-1 transition-transform duration-75 rounded-md px-2 py-1 text-left leading-4 focus-visible:!outline"
    @click="emit('pick', data)"
  >
    <h3 class="font-bold">
      <img
        v-if="isCollab"
        src="@/images/collab.svg"
        class="inline mr-1 w-4"
        alt=""
      />
      {{ data.levelName }}</h3>
    <h5 class="text-xs font-normal opacity-70">{{ !isCollab ? data.creator : (data.creator[0][0]?.name ?? data.creator[0][0]) }}</h5>
  </button>
</template>
