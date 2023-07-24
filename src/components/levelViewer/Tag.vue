<script setup lang="ts">
import type { LevelTag } from "@/interfaces";
defineProps<{
  tag: LevelTag;
}>();

</script>

<template>
  <div class="p-1.5 text-xs bg-black bg-opacity-40 rounded-full sm:text-sm">
    <img
      :src="'/badges/'+tag[0]+'.svg'"
      class="inline mr-2 w-3 align-middle sm:w-6"
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
