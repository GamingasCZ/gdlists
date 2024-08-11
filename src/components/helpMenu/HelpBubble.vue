<script setup lang="ts">
import { ref } from "vue";
import parseText from "../global/parseEditorFormatting";
import SectionDivider from '../ui/SectionDivider.vue'

defineProps({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  filterShow: { type: Boolean, required: true },
  startSection: { type: String, required: false },
});

const answerOpen = ref<boolean>(false);
</script>

<template>
  <SectionDivider v-if="startSection" :text="startSection" />
  <section
    v-show="filterShow"
    class="px-2 py-3 text-white bg-black bg-opacity-40 rounded-md"
    @click="answerOpen = !answerOpen"
  >
    <div class="relative font-bold">
      <header>{{ question }}</header>
      <button
        class="absolute top-1 right-1 transition-[scale] duration-75"
        :style="{ scale: answerOpen ? '1 -1' : '1 1' }"
      >
        <img src="@/images/moveDown.svg" class="w-4" alt="">
      </button>
    </div>
    <Transition name="fade">
      <article v-show="answerOpen" class="leading-4">
        <hr class="my-2 opacity-40" />
        <p v-html="parseText(answer!)"></p>
      </article>
    </Transition>
  </section>
</template>
