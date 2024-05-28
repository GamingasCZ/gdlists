<script setup lang="ts">
import { makeColorFromString, parseElapsed, prettyDate } from "@/Editor";
import type { ListCreatorInfo, ListPreview } from "@/interfaces";
import chroma, { type Color } from "chroma-js";
import { computed, reactive, ref, watch } from "vue";
import { RouterLink } from "vue-router";

const props = defineProps<{
  rate_ratio: string;
  views: string;
  timestamp: string;
  name: string;
  tagline: string;
  id: string;
  index: number;
  uid: string;
  hidden: string;
  url: string;
  thumbnail: string;

  userArray: ListCreatorInfo[];
  disableLink?: boolean
}>();


const listColor = ref<Color>(makeColorFromString(props.name));

const emit = defineEmits(['unpinList', 'selectedLink'])

function getUser() {
  let listCreator: ListCreatorInfo = [];
  props.userArray.forEach((user) => {
    if (props.uid == user.discord_id) listCreator = user;
  });
  return listCreator;
}

const getGradient = () =>
  `linear-gradient(90deg, ${listColor.value.darken(
    2
  )}, ${listColor.value.darken()}, ${listColor.value.brighten()})`;

const uploadDate = new Date(props.timestamp);

const unpinList = () => {
  let pinned: ListPreview[] = JSON.parse(localStorage.getItem('pinnedLists')!)
  let i = 0
  let removedIndex = -1
  pinned.forEach((pin: ListPreview) => {
    if (pin.id == props.id) {
      pinned.splice(i, 1)
      removedIndex = i
    }
    i++
  })
  localStorage.setItem("pinnedLists", JSON.stringify(pinned))
  emit('unpinList', removedIndex)
}

const creator = getUser()

const pre = import.meta.env.VITE_USERCONTENT
const base = import.meta.env.BASE_URL

let thumbLink
if (props.thumbnail)
  thumbLink = `${pre}/userContent/${props.uid}/${props.thumbnail}.webp`
else
  thumbLink = `${base}/defaultThumbnails/0.png`

</script>

<template>
  <component :is="disableLink ? 'button' : 'RouterLink'"
    :to="`/review/${url.toString()}`"
    class="flex flex-col w-5/6 max-w-6xl cursor-pointer relative rounded-md border-[0.2rem] border-solid bg-[length:150vw] bg-center text-white transition-[background-position] duration-200 hover:bg-left"
    :style="{
      backgroundImage: getGradient(),
      borderColor: listColor.darken(2).hex(),
    }" :class="{ '!border-dotted !border-white !border-opacity-40': hidden != '0' }"
    @click="emit('selectedLink', creator.username)"
  >
    
    <div class="relative w-full h-36 bg-cover">
      <img :src="thumbLink" alt="" class="object-cover w-full h-36" :class="{'mix-blend-luminosity': !thumbnail}">
      <div class="absolute top-2 left-2 px-2 py-1 w-max bg-black bg-opacity-80 rounded-md">
          <img src="../../images/view.svg" alt="" class="inline mr-2 w-4" />
          <span>{{ views }}</span>
      </div>
      <div class="absolute top-2 right-2 px-2 py-1 w-max bg-black bg-opacity-80 rounded-md">
          <span>{{ views }} levelů</span>
      </div>
    </div>

    <section class="flex flex-col items-start m-1">
      <h2 class="text-xl font-bold leading-tight">{{ name }}</h2>
      <div class="w-full">
        <q v-if="tagline" class="text-sm leading-none opacity-80 min-h-4" :class="{'after:hidden before:hidden': !(tagline ?? '').length}">{{ tagline }}</q>
        <div v-else class="flex gap-2 items-center mx-4 h-4 text-sm">
          <div class="w-full h-1.5 bg-black bg-opacity-40 rounded-full grow"></div>
          <span v-show="parseInt(rate_ratio) != -1">{{ parseInt(rate_ratio*100) }}%</span>
        </div>
      </div>
      <p class="flex gap-3 items-center mt-2">
        <img class="w-10 rounded-full" :src="`https://cdn.discordapp.com/avatars/${creator.discord_id}/${creator.avatar_hash}.png`" alt="">
        <div>
          <h3 class="text-lg font-bold leading-none">{{ creator.username }}</h3>
          <h4 class="text-xs opacity-70 cursor-help" :title="`${uploadDate.toLocaleDateString()} ${uploadDate.toLocaleTimeString()}`">{{ prettyDate((new Date()).getTime() - uploadDate.getTime()) }}</h4>
        </div>
      </p>
    </section>
  </component>
</template>

<style>
q {
  quotes: "„" "“";
  font-style: italic;
}
</style>
