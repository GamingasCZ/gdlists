<script setup lang="ts">
import type { FavoritedLevel } from "@/interfaces";

defineProps<{
  data: FavoritedLevel;
}>();
</script>
<template>
  <button
    :style="{ backgroundColor: data.levelColor }"
    class="button rounded-md px-2 py-1 text-left leading-4"
  >
    <h3 class="font-bold">{{ data.levelName }}</h3>
    <h5 class="text-xs font-normal opacity-70">{{ data.creator }}</h5>
  </button>
</template>
