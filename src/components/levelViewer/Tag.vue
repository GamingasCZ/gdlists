<script setup lang="ts">
import type { LevelTag } from "@/interfaces";
defineProps<{
  tag: LevelTag;
}>();

const base = import.meta.env.BASE_URL

</script>

<template>
  <div class="pr-2 text-xs bg-black bg-opacity-40 rounded-full border-2 border-black border-opacity-50 sm:text-sm">
    <img
      :src="`${base}/tags/${tag[0]}.svg`"
      class="inline mr-2 w-3 align-middle sm:w-6"
      alt=""
    />
    <a
      target="_blank"
      class="text-blue-300 underline"
      :href="tag[2]"
      v-if="tag[2]"
      >{{ [-1, ''].includes(tag[1]) ? $t(`editor.tags[${tag[0]}]`) : tag[1] }}</a
    >
    <span v-else>{{
      [-1, ''].includes(tag[1]) ? $t(`editor.tags[${tag[0]}]`) : tag[1]
    }}</span>
  </div>
</template>
