<script setup lang="ts">
import type { LevelTag } from "@/interfaces";
const props = defineProps<{
  tag: LevelTag;
}>();
</script>

<template>
  <div class="rounded-full bg-black bg-opacity-40 p-1.5 text-xs sm:text-sm">
    <img
      :src="`/src/images/badges/${tag[0]}.svg`"
      class="mr-2 inline w-3 align-middle sm:w-6"
      alt=""
    />
    <a
      target="_blank"
      class="text-blue-300 underline"
      :href="tag[2]"
      v-if="tag[2]"
      >{{ tag[1] == -1 ? $t(`editor.tags[${tag[0]}]`) : tag[1] }}</a
    >
    <span v-else>{{
      tag[1] == -1 ? $t(`editor.tags[${tag[0]}]`) : tag[1]
    }}</span>
  </div>
</template>
