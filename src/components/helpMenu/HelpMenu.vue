<script setup lang="ts">
import { useI18n } from "vue-i18n";
import HelpBubble from "./HelpBubble.vue";
import { ref } from "vue";

interface question {
  question: string;
  answer: string;
  startSection?: string;
}

const qa: question[] = [
  {
    startSection: useI18n().t('help.Lists'),
    question: useI18n().t('help.listPinning'),
    answer:
      useI18n().t('help.listPinHelp'),
  },
  {
    question: useI18n().t('help.listEdits'),
    answer:
      useI18n().t('help.listEditsHelp'),
  },
  {
    startSection: useI18n().t('editor.editor'),
    question: useI18n().t('editor.titleImage'),
    answer: useI18n().t('editor.listBGhelp')
  },
  {
    question: useI18n().t('help.usingTheEditor'),
    answer: useI18n().t('editor.levelSearchHelp'),
  },
  {
    question: useI18n().t('editor.collabTools'),
    answer: useI18n().t('editor.collabToolsSoon')
  },
  {
    question: useI18n().t('help.privLists'),
    answer:
      useI18n().t('help.privListsHelp'),
  },
  {
    question: useI18n().t('help.listGuessing'),
    answer:
      useI18n().t('editor.diffGuessHelp'),
  },
  {
    question: useI18n().t('editor.translucentCards'),
    answer:
      useI18n().t('help.translucentHelp'),
  },
  {
    question: useI18n().t('help.license'),
    answer: "https://github.com/GamingasCZ/gdlists/blob/master/LICENSE",
  },
  {
    question: useI18n().t('help.usedPackages'),
    answer: `
  vue, \n
  vue i18n, \n
  tailwind, \n
  axios, \n
  typescript, \n
  chroma-js, \n
  cookier, \n
  pure-editor \n
      `,
  },
];

const filteredQuestions = ref<number[]>([-1,]);

const emit = defineEmits(["closePopup"]);

const search = (e: Event) => {
  filteredQuestions.value = qa
    .filter((x) =>
      x.question
        .toLowerCase()
        .includes((e.target as HTMLInputElement).value.toLowerCase())
    )
    .map((x) => qa.indexOf(x));
};
</script>

<template>
  <dialog open @click="emit('closePopup')" tabindex="0" @keyup.esc="emit('closePopup')">
    <section @click.stop=""
      class="absolute top-1/2 left-1/2 h-[40rem] max-h-[95svh] w-[40rem] max-w-[95vw] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-greenGradient p-2 text-white shadow-lg shadow-black">
      <div class="relative">
        <h1 class="text-xl font-bold text-center">{{ $t('other.help') }}</h1>
        <img src="@/images/close.svg" alt="" class="absolute top-0 right-0 w-6 button" @click="emit('closePopup')" />
      </div>
      <div class="flex flex-col mt-2 h-[36.5rem]">
        <input type="text" :placeholder="$t('other.searchInHelp')"
          class="p-1 px-2 w-full bg-white bg-opacity-10 rounded-full" @input="search" />
        <div class="flex overflow-y-auto flex-col gap-2 p-2 mt-2 bg-white bg-opacity-10 rounded-md grow">
          <HelpBubble v-for="(question, index) in qa" v-bind="question" :filter-show="filteredQuestions[0] == -1 || filteredQuestions.includes(index)
            " />
        </div>
      </div>
    </section>
  </dialog>
</template>
