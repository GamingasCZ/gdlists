<script setup lang="ts">
import { ref } from "vue";
import { TAG_COUNT } from "../../Editor";
import type { LevelTag } from "../../interfaces";

const emit = defineEmits<{
  (e: "closePopup"): void;
  (e: "addTag", tag: LevelTag): void;
}>();

const Tags = ref<string[]>([])
async function loadTags() {
    for (let i = 0; i < TAG_COUNT; i++) {
        Tags.value.push(await import(`../../images/badges/${i}.svg`).then(res => res.default))
    }
}
loadTags()

</script>


<template>
  <section
    @click.stop=""
    class="absolute top-1/2 left-1/2 w-max max-w-[95vw] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-greenGradient text-white shadow-lg shadow-black"
  >
    <div class="relative m-2">
      <h1 class="text-xl font-bold text-center">{{ $t('editor.tagTitle') }}</h1>
      <img
        src="@/images/close.svg"
        alt=""
        class="absolute top-0 right-0 w-6 button"
        @click="emit('closePopup')"
      />
    </div>
    <div
      class="grid max-h-[85vh] grid-cols-2 gap-1 overflow-y-auto p-2 overflow-x-hidden bg-black bg-opacity-20 bg-[url(@/images/fade.webp)] bg-repeat-x sm:grid-cols-3"
    >
      <button
        @click="emit('addTag', [tag - 1, '', ''])"
        v-for="(tag, index) in TAG_COUNT"
        type="button"
        class="flex gap-2 items-center p-1.5 text-sm bg-black bg-opacity-20 rounded-full button"
      >
        <img :src="Tags[index]" alt="" />{{
          $t(`editor.tags[${tag - 1}]`)
        }}
      </button>
    </div>
  </section>
</template>
