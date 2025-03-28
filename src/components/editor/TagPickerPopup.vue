<script setup lang="ts">
import { ref } from "vue";
import { TAG_COUNT } from "../../Editor";
import type { LevelTag } from "../../interfaces";

const emit = defineEmits<{
  (e: "closePopup"): void;
  (e: "addTag", tag: LevelTag): void;
}>();

const Tags = ref<string[]>([])
function loadTags() {
  for (let i = 0; i < TAG_COUNT; i++) {
    Tags.value.push(`${import.meta.env.BASE_URL}/tags/${i}.svg`)
  }
}
loadTags()

</script>


<template>
  <div
    class="grid max-h-[85vh] grid-cols-2 gap-1 overflow-y-auto p-2 overflow-x-hidden bg-black bg-opacity-20 bg-[url(@/images/fade.svg)] bg-repeat-x sm:grid-cols-3">
    <button @click="emit('addTag', [tag - 1, '', ''])" v-for="(tag, index) in TAG_COUNT" type="button"
      class="flex gap-2 items-center p-1.5 text-sm bg-black bg-opacity-20 rounded-full button">
      <img :src="Tags[index]" alt="" />{{
      $t(`editor.tags[${tag - 1}]`)
    }}
    </button>
  </div>
</template>
