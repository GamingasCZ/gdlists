<script setup lang="ts">
import { makeColorFromString, prettyDate } from "@/Editor";
import type { ListCreatorInfo, ListPreview, ReviewDetailsResponse } from "@/interfaces";
import chroma, { type Color } from "chroma-js";
import { computed, reactive, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import ReviewRatingBar from './ReviewRatingBar.vue'
import { getDominantColor } from "@/Reviews";
import ListBackground from "./ListBackground.vue";
import RatingContainer from "./RatingContainer.vue";

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
  thumbProps: [number, number, number, boolean];
  reviewDetails: ReviewDetailsResponse[]

  userArray: ListCreatorInfo[];
  disableLink?: boolean
}>();

let thumb = ref()


const modListCol = () => {
  if (!props.thumbnail) return

  let dom = getDominantColor(thumb.value).hsv()
  listColor.value = chroma.hsv(dom[0], dom[1], Math.min(dom[2], 0.5))
}

const listColor = ref<Color>(makeColorFromString(props.name));

const emit = defineEmits(['unpinList', 'selectedLink'])

function getUser() {
  let listCreator: ListCreatorInfo = [];
  props.userArray.forEach((user) => {
    if (props.uid == user.discord_id) listCreator = user;
  });
  return listCreator;
}

var levelCount: number
var levelRatings: number[] = []
function getRating() {
  let details = props.reviewDetails.find(x => x.reviewID == props.id.toString())
  if (!details) return

  Object.keys(details).forEach(key => {
    if (key != "level_count")
      details[key] = parseFloat(details[key]).toFixed(details[key] % 1 == 0 ? 0 : 1)
  });
  levelCount = parseInt(details.level_count)
  levelRatings = Object.values(details).slice(2)
}
getRating()

const getGradient = (col) =>
  `linear-gradient(90deg, ${col.darken(
    2
  )}, ${col.darken()}, ${col.brighten()})`;

const uploadDate = new Date(props.timestamp);

const creator = getUser()

const pre = import.meta.env.VITE_USERCONTENT
const base = import.meta.env.BASE_URL

const getDefaultThumb = () => {
  return props.name.split("").map(x => x.charCodeAt(0)).reduce((x,y) => x+y) % 3
}

let thumbLink
if (props.thumbnail) {
  thumbLink = `${pre}/userContent/${props.uid}/${props.thumbnail}.webp`
}
else
  thumbLink = `${base}/defaultThumbnails/${getDefaultThumb()}.png`

let background = (JSON.parse(props.thumbProps) || [])
background.splice(0,0,thumbLink)
let xPos = ["left", "center", "right"][background[3]]

</script>

<template>
  <component :is="disableLink ? 'button' : 'RouterLink'"
    :to="`/review/${url.toString()}`"
    class="flex flex-col w-5/6 max-w-6xl cursor-pointer relative rounded-md border-[0.2rem] border-solid bg-[length:150vw] bg-center text-white group transition-[background-position] duration-200 hover:bg-left"
    :style="{
      backgroundImage: getGradient(listColor),
      borderColor: listColor.darken(2).hex(),
    }" :class="{ '!border-dotted !border-white !border-opacity-40': hidden != '0' }"
    @click="emit('selectedLink', creator.username)"
  >
    
    <div class="relative w-full h-36 bg-cover">
      <img ref="thumb" @load="modListCol" :src="thumbLink" alt="" :style="{objectPosition: `${xPos} ${background[1]}%`}" class="object-cover w-full h-36" :class="{'mix-blend-luminosity': !thumbnail}">
      <div :style="{background: `linear-gradient(0deg, ${listColor.darken().hex()}, transparent)`}" class="absolute bottom-0 w-full h-8 transition-colors duration-200 group-hover:brightness-50"></div>
      <div class="flex absolute top-2 right-2 left-2 gap-2 justify-between opacity-0 transition-opacity duration-75 group-hover:opacity-100">
        <div class="px-2 py-1 w-max bg-black bg-opacity-80 rounded-md backdrop-blur-sm h-max">
            <img src="../../images/view.svg" alt="" class="inline mr-2 w-4" />
            <span>{{ views }}</span>
        </div>
        <div v-if="tagline && rate_ratio != -1" class="flex items-center px-2 py-1 bg-black bg-opacity-80 rounded-md backdrop-blur-sm grow">
            <ReviewRatingBar :rate="rate_ratio" />
        </div>
        <div v-if="levelCount" class="px-2 py-1 w-max bg-black bg-opacity-80 rounded-md backdrop-blur-sm h-max">
            <span>{{ levelCount }} {{ $t('other.levels', [levelCount]) }}</span>
        </div>
        <div v-if="levelCount" class="absolute -bottom-24 left-1/2 w-72 -translate-x-1/2">
          <RatingContainer class="mr-3" :ratings="levelRatings" compact />
        </div>
      </div>
    </div>

    <section class="flex flex-col items-start m-1">
      <h2 class="text-xl font-bold leading-tight">{{ name }}</h2>
      <div class="w-full">
        <q v-if="tagline" class="text-sm leading-none opacity-80 min-h-4" :class="{'after:hidden before:hidden': !(tagline ?? '').length}">{{ tagline }}</q>
        <ReviewRatingBar :class="{'bg-black bg-opacity-40 rounded-md': rate_ratio != -1}" v-else :rate="rate_ratio" />
      </div>
      <p class="flex gap-3 items-center mt-2">
        <img class="w-10 rounded-full" :src="`https://cdn.discordapp.com/avatars/${creator.discord_id}/${creator.avatar_hash}.png`" alt="">
        <div>
          <h3 class="text-lg font-bold leading-none">{{ creator.username }}</h3>
          <h4 class="text-xs opacity-70 cursor-help" :title="`${uploadDate.toLocaleDateString()} ${uploadDate.toLocaleTimeString()}`">{{ prettyDate(((new Date()).getTime() - uploadDate.getTime())/1000) }}</h4>
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
