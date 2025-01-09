<script setup lang="ts">
import { i18n } from '@/locales';
import parseText from './parseEditorFormatting';

defineProps<{
  iconIndex: number
  headingLevel: number
  text: string
}>();

const help = [
  i18n.global.t('other.picture'),
  i18n.global.t('reviews.heading'),
  i18n.global.t('reviews.heading'),
  i18n.global.t('reviews.heading'),
  i18n.global.t('level.video'),
  i18n.global.t('reviews.carousel')
]

const icons = [
  "showImage",
  "heading1",
  "heading2",
  "heading3",
  "addVideo",
  "addCarousel",
]

const BASE_URL = import.meta.env.BASE_URL

</script>
<template>
  <button
    class="hover:translate-x-1 w-full gap-2 flex items-center transition-transform duration-75 text-left focus-visible:!outline"
  >
    <hr v-show="headingLevel != 0" :style="{width: `${headingLevel}rem`}" class="h-0.5 bg-white rounded-md border-none opacity-10">
    <div class="grid rounded-md grid-cols-[max-content,1fr] grow items-center gap-2 bg-black bg-opacity-40 px-2 py-2 leading-4">
      <img
      :src="`${BASE_URL}/formatting/${iconIndex}.svg`"
        class="inline mr-1 w-5"
        alt=""
      />
      <div>
        <h4 class="text-sm opacity-40">{{ help[icons.indexOf(iconIndex)] }}</h4>
        <h2 class="font-bold" v-html="parseText(text, true)"></h2>
      </div>
    </div>
  </button>
</template>
