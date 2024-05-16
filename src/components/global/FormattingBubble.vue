<script setup lang="ts">

const props = defineProps<{
  type: number
  text: string
}>();

const help = [
  "Obrázek",
  "Nadpis",
  "Nadpis",
  "Nadpis",
  "Video"
]

const icons = [
  "showImage",
  "heading",
  "heading",
  "heading",
  "addVideo"
]

const headingLevel = [1,2,3].includes(props.type) ? props.type - 1 : 0
const BASE_URL = import.meta.env.BASE_URL

</script>
<template>
  <button
    class="hover:translate-x-1 gap-2 flex items-center transition-transform duration-75 text-left focus-visible:!outline"
  >
    <hr v-show="headingLevel != 0" :style="{width: `${headingLevel}rem`}" class="h-1 bg-white rounded-md border-none opacity-40">
    <div class="grid rounded-md grid-cols-[max-content,1fr] grow items-center gap-2 bg-black bg-opacity-40 px-2 py-2 leading-4">
      <img
      :src="`${BASE_URL}/formatting/${icons[type]}.svg`"
        class="inline mr-1 w-5"
        alt=""
      />
      <div>
        <h4 class="text-sm opacity-40">{{ help[type] }}</h4>
        <h2 class="font-bold">{{ text }}</h2>
      </div>
    </div>
  </button>
</template>
