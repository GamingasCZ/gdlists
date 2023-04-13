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
  commAmount: number
}>()

const emit = defineEmits<{
  (e: "doListAction", action: 'sharePopup'): void;
}>();

const rating = ref<[number, number, -2 | 0 | 1]>()
const rate = ref<number>()
onMounted(() => {
  axios.get(import.meta.env.VITE_API + `/php/rateAction.php/?id=${props.id}`).then((res: AxiosResponse) => {
    rating.value = res.data
    rate.value = res.data[0]-res.data[1]
  })

  let description = document.getElementById("listDescription")!
  tallDescription.value = description.scrollHeight > description.clientHeight
})

const getCol = () => document.documentElement.style.getPropertyValue("--primaryColor")

const toggleDescription = ref<boolean>(false)
const tallDescription = ref<boolean>(false)
watch(toggleDescription, () => {
  let description = document.getElementById("listDescription")!
  if (toggleDescription.value) description.style.height = 20+description.scrollHeight+'px'
  else description.style.height = ""
})

</script>

<template>
  <section class="flex flex-col w-[80rem] max-w-[95vw] mx-auto backdrop-blur-sm">
  
    <section class="flex gap-2">
      <!-- Likes and dislikes -->
      <div class="box-border flex flex-col items-center max-sm:hidden">
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
        <header class="relative bg-gray-900 bg-opacity-80 rounded-t-md">
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
        <pre id="listDescription" class="font-[poppins] leading-5 transition-[height] duration-75 ease-in-out overflow-y-hidden whitespace-pre-wrap px-2 h-24 text-white bg-gray-800 bg-opacity-80 rounded-b-md descriptionFade before:transition-opacity " :class="{'text-opacity-40': ['', undefined].includes(data?.description), 'before:opacity-0': !tallDescription || toggleDescription}" v-html="parseText(data?.description || 'Seznam nemá popisek.')"></pre>
        <button v-if="tallDescription" class="absolute bottom-0 left-1/2 w-10 rounded-t-lg" :style="{'backgroundColor': getCol()}" @click="toggleDescription = !toggleDescription"><img src="@/images/descMore.svg" :class="{'-scale-y-100': toggleDescription}" class="p-1 mx-auto w-6" alt=""></button>
      </main>
    </section>

    <section class="flex justify-between items-start mt-2">
      <div class="sm:ml-9">
        <button class="relative p-2 rounded-md button bg-greenGradient"><img src="@/images/comment.svg" class="inline w-6 sm:mr-2"><label class="max-sm:hidden">Komentáře</label>
          <label class="px-0.5 py-0.5 ml-1.5 text-xs leading-3 bg-red-500 rounded-sm max-sm:bottom-1 max-sm:right-1 max-sm:absolute">{{ commAmount }}</label>
        </button>
      </div>

      <div class="flex gap-2">
        <button @click="emit('doListAction', 'sharePopup')" class="button align-middle p-1 py-0.5 max-sm:!p-2 rounded-md bg-[linear-gradient(9deg,#141f20,#044a51)]" ><img class="inline w-4 max-sm:w-6 sm:mr-2" src="@/images/share.svg" alt=""><label class="max-sm:hidden">Sdílet</label></button>
        <button class="button align-middle p-1 py-0.5 max-sm:!p-2 rounded-md bg-[linear-gradient(9deg,#141f20,#044a51)]" ><img class="inline w-4 max-sm:w-6 sm:mr-2" src="@/images/jumpto.svg" alt=""><label class="max-sm:hidden">Skočit na</label></button>
        <button class="button align-middle p-1 py-0.5 max-sm:!p-2 rounded-md bg-[linear-gradient(9deg,#141f20,#044a51)]" ><img class="inline w-4 max-sm:w-6 sm:mr-2" src="@/images/pin.svg" alt=""><label class="max-sm:hidden">Připnout</label></button>
        <button class="button align-middle p-1 py-0.5 max-sm:!p-2 rounded-md bg-[linear-gradient(9deg,#141f20,#044a51)]" ><img class="inline w-4 max-sm:w-6 sm:mr-2" src="@/images/edit.svg" alt=""><label class="max-sm:hidden">Upravit</label></button>
      </div>

    </section>

  </section>
</template>
