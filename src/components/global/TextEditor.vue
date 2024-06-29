<script setup lang="ts">
import { ref } from "vue";
import parseText, { addFormatting, autoLink } from "./parseEditorFormatting";
import { i18n } from "@/locales";
import type { LevelList, ReviewList } from "@/interfaces";

const isPreviewing = ref<boolean>(false);
const props = defineProps<{
  editValue: LevelList | ReviewList
}>()

const doFormat = (type: number) => {
  if (isPreviewing.value) return;
  props.editValue.description = addFormatting(type, document.querySelector("#mainTextbox"))
}

const base = import.meta.env.BASE_URL
const formatting = [
  ["bold", i18n.global.t('reviews.bold')],
  ["cursive", i18n.global.t('reviews.italics')],
  ["strike", i18n.global.t('reviews.strike')],
  ["div"],
  ["list", i18n.global.t('editor.listItems')],
  ["quotes", i18n.global.t('editor.citations')],
  ["div"],
  ["heading1", i18n.global.t('reviews.title', [1])],
  ["heading2", i18n.global.t('reviews.title', [2])],
  ["heading3", i18n.global.t('reviews.title', [3])],
  ["div"],
  ["link", i18n.global.t('other.link')],
  ["showImage", i18n.global.t('other.picture')],
  ["div"],
]
</script>

<template>
    <main class="flex flex-grow-[1] flex-col gap-0 mt-0 h-[30rem]">
      <div class="box-border flex flex-wrap gap-1.5 items-center px-2">
        <div v-for="(format, index) in formatting">
          <button
            @click="doFormat(index)"
            :title="format[1]"
            class="p-1 px-2 bg-black bg-opacity-20 rounded-md hover:bg-opacity-40 button"
            :class="{ disabled: isPreviewing }"
            v-if="format[0] != 'div'"
          >
            <img class="w-5" :src="`${base}/formatting/${format[0]}.svg`" alt="aas" />
          </button>
          <del v-else class="my-auto w-1 h-full rounded-full border-2 border-black opacity-20"></del>
        </div>
        <button
          @click="isPreviewing = !isPreviewing"
          class="flex items-center p-1 px-2 bg-black bg-opacity-40 rounded-md button"
          :class="{ 'bg-opacity-[0.8]': isPreviewing }"
        >
          <img
            class="flex gap-1 w-5"
            src="@/images/view.svg"
            alt=""
          /><span class="pl-1 leading-none">{{ $t('other.preview') }}</span>
        </button>
      </div>
      <textarea
        @paste="addFormatting(autoLink($event), $event.target)"
        id="mainTextbox"
        v-show="!isPreviewing"
        v-model="editValue.description"
        class="h-max w-full grow resize-none bg-[url(@/images/fade.webp)] bg-repeat-x bg-black bg-opacity-20 focus-within:bg-opacity-40 focus-within:outline-none px-2 py-1"
        :placeholder="$t('editor.listDescription') + $t('editor.mdHelp')"
      ></textarea>
      <div
        class="h-max grow bg-[url(@/images/fade.webp)] bg-repeat-x bg-opacity-10 bg-black overflow-y-auto regularParsing px-1"
        v-show="isPreviewing"
        v-html="parseText(editValue.description)"
      ></div>
    </main>
</template>
