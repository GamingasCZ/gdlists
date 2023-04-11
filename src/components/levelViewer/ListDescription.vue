<script setup lang="ts">
import type { LevelList } from '@/interfaces';
import axios, { type AxiosResponse } from 'axios';
import { onMounted, ref, watch } from 'vue';
import parseText from '../global/parseEditorFormatting';
import chroma from 'chroma-js';


const props = defineProps<{
  name: string,
  creator: string,
  uid: string,
  timestamp: string,
  views: number,
  data: LevelList,
  id: string,
}>()

const rating = ref<[number, number, -2 | 0 | 1]>()
const rate = ref<number>()
onMounted(() => {
  axios.get(import.meta.env.VITE_API + `/php/rateAction.php/?id=${props.id}`).then((res: AxiosResponse) => {
    rating.value = res.data
    rate.value = res.data[0]-res.data[1]
  })
})

const getCol = () => document.documentElement.style.getPropertyValue("--primaryColor")

const heightCheck = () => {
  let description = document.getElementById("listDescription")!
  console.log(description.scrollHeight);
  console.log(description.clientHeight);
  
  return description.scrollHeight == description.clientHeight
}

const toggleDescription = ref<boolean>(false)
watch(toggleDescription, () => {
  let description = document.getElementById("listDescription")!
  if (toggleDescription.value) description.style.height = 20+description.scrollHeight+'px'
  else description.style.height = ""
})

</script>

<template>
  <section class="flex w-[80rem] max-w-[95vw] mx-auto gap-2">
  
    <!-- Likes and dislikes -->
    <div class="box-border flex flex-col items-center">
      <button class="button rounded-lg bg-[#21cc5b] p-1">
        <img class="w-5" src="@/images/like.svg" alt="" />
      </button>
      <span class="text-sm">{{ rate }}<hr v-if="rate == undefined" class="w-4 h-1 bg-white bg-opacity-50 rounded-full border-none"></span>
      <button class="button rounded-lg bg-[#cc2121] p-1">
        <img class="w-5" src="@/images/dislike.svg" alt="" />
      </button>
    </div>

    <!-- Description -->
    <main class="relative grow">
      <header class="relative bg-gray-900 bg-opacity-50 rounded-t-md">
        <img src="@/images/defaultPFP.webp" class="absolute bottom-1 mx-2 w-12 rounded-full border-2 border-white border-solid" alt="">
        <h1 class="absolute bottom-6 ml-16 text-xl">{{ name }}</h1>
        <div class="flex gap-2 items-center py-0.5 ml-16 text-base">
          <span class="font-bold">{{ creator }}</span>
          <hr class="w-1 h-4 bg-white bg-opacity-60 rounded-full border-none">
          <span>{{ views }} zhl.</span>
          <hr class="w-1 h-4 bg-white bg-opacity-60 rounded-full border-none">
          <span>{{ new Date(parseInt(timestamp!)*1000).toLocaleDateString() }}</span>
        </div>
      </header>
      <pre id="listDescription" class="font-[poppins] leading-5 transition-[height] duration-75 ease-in-out overflow-y-hidden whitespace-pre-wrap px-2 h-24 text-white bg-gray-900 bg-opacity-40 rounded-b-md" :class="{'text-opacity-40': ['', undefined].includes(data.description), 'descriptionFade': heightCheck() || !toggleDescription}" v-html="parseText(data.description ?? 'Seznam nemá popisek.')"></pre>
      <button class="absolute bottom-0 left-1/2 w-10 rounded-t-lg" :style="{'backgroundColor': getCol()}" @click="toggleDescription = !toggleDescription"><img src="@/images/descMore.svg" :class="{'-scale-y-100': toggleDescription}" class="p-1 mx-auto w-6" alt=""></button>
    </main>
  </section>
</template>
