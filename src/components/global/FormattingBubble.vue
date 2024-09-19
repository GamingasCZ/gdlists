<script setup lang="ts">
import { i18n } from '@/locales';
import parseText from './parseEditorFormatting';


const props = defineProps<{
  iconIndex: number
  text: string
}>();

const help = [
  i18n.global.t('other.picture'),
  i18n.global.t('reviews.heading'),
  i18n.global.t('reviews.heading'),
  i18n.global.t('reviews.heading'),
  i18n.global.t('level.video')
]

const icons = [
  "showImage",
  "heading",
  "heading",
  "heading",
  "addVideo"
]

const headingLevel = ["1","2","3"].includes(props.iconIndex) ? props.iconIndex - 1 : 0
const BASE_URL = import.meta.env.BASE_URL

</script>
<template>
  <button
    class="hover:translate-x-1 w-full gap-2 flex items-center transition-transform duration-75 text-left focus-visible:!outline"
  >
    <hr v-show="headingLevel != 0" :style="{width: `${headingLevel}rem`}" class="h-0.5 bg-white rounded-md border-none opacity-10">
    <div class="grid rounded-md grid-cols-[max-content,1fr] grow items-center gap-2 bg-black bg-opacity-40 px-2 py-2 leading-4">
      <img
      :src="`${BASE_URL}/formatting/${icons[iconIndex]}.svg`"
        class="inline mr-1 w-5"
        alt=""
      />
      <div>
        <h4 class="text-sm opacity-40">{{ help[iconIndex] }}</h4>
        <h2 class="font-bold" v-html="parseText(text, true)"></h2>
      </div>
    </div>
  </button>
</template>
