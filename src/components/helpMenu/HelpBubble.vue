<script setup lang="ts">
import { ref } from "vue";
import parseText from "../global/parseEditorFormatting";

defineProps({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  filterShow: { type: Boolean, required: true },
  startSection: { type: String, required: false },
});

const answerOpen = ref<boolean>(false);
</script>

<template>
  <div v-if="startSection" class="flex items-center gap-2 opacity-90">
    <hr class="h-0.5 w-6 rounded-full border-none bg-white" />
    <h2 class="text-xl">{{ startSection }}</h2>
    <hr class="h-0.5 w-full rounded-full border-none bg-white" />
  </div>
  <section
    v-show="filterShow"
    class="rounded-sm bg-white bg-opacity-10 px-2 py-3 text-white"
    @click="answerOpen = !answerOpen"
  >
    <div class="relative font-bold">
      <header>{{ question }}</header>
      <button
        class="absolute top-0 right-0 transition-[scale] duration-75"
        :style="{ scale: answerOpen ? '1 -1' : '1 1' }"
      >
        V
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
