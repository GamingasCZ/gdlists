<script setup lang="ts">
import type { LevelTag } from "@/interfaces";
import { ref } from "vue";
const props = defineProps<{
  tag: LevelTag;
}>();

const tagPath = ref("")
function getTag() {
  tagPath.value =`${import.meta.env.BASE_URL}/tags/${props.tag[0]}.svg`
}
getTag()

</script>

<template>
  <div class="pr-3 text-xs bg-black bg-opacity-40 rounded-full sm:text-sm">
    <img
      :src="tagPath"
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
