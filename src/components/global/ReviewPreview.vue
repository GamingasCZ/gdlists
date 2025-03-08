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
import { SETTINGS } from "@/siteSettings";
import ProfilePicture from "./ProfilePicture.vue";

const props = defineProps<{
  rate_ratio: string;
  views: string;
  timestamp: string;
  name: string;
  tagline: string;
  id: string;
  post?: string;
  index: number;
  uid: string;
  hidden: string;
  url: string;
  thumbnail: string;
  thumbnailLink?: string;
  thumbProps: [number, number, number, boolean];
  reviewDetails: ReviewDetailsResponse[]
  creator: string

  userArray: ListCreatorInfo[];
  disableLink?: boolean | 2
  unrolledOptions: boolean

  isList: boolean
  diffGuesser?: boolean
}>();

let thumb = ref()


const modListCol = () => {
  if (!props.thumbnail || SETTINGS.value.disableColors) return

  let dom = getDominantColor(thumb.value).hsv()
  listColor.value = chroma.hsv(dom[0], dom[1], Math.min(dom[2], 0.5))
}

const listColor = ref<Color>(makeColorFromString(props.name));

const emit = defineEmits<{
  (e: 'unpinList', index: number): void
  (e: 'selectedLink', creator: string): void
  (e: 'clickedOption', data: selectedList): void
  (e: 'selected'): void
}>()

function getUser() {
  if (!props.userArray) return ""
  
  let listCreator: ListCreatorInfo = [];
  props.userArray.forEach((user) => {
    if (props.uid == user.discord_id) listCreator = user;
  });
  return listCreator;
}

var levelCount: number
var levelRatings: number[] = []
function getRating() {
  let details = (props?.reviewDetails ?? []).find(x => x.reviewID == props.id.toString())
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

const uploadDate = new Date(isNaN(+props.timestamp) ? props.timestamp : props.timestamp*1000);

const creatorData = getUser()

const pre = import.meta.env.VITE_USERCONTENT
const base = import.meta.env.BASE_URL

const getDefaultThumb = () => {
  let t = props.name.split("").map(x => x.charCodeAt(0)).reduce((x,y) => x+y) % 3
  if (props.isList) t += 10
  return t
}

let thumbLink
if (props.thumbnail) {
  thumbLink = `${pre}/userContent/${props.uid}/${props.thumbnail}.webp`
}
else if (props.thumbnailLink) {
  thumbLink = props.thumbnailLink
}
else
  thumbLink = `${base}/defaultThumbnails/${getDefaultThumb()}.webp`

let background = JSON.parse(props.thumbProps || '[]')
background.splice(0,0,thumbLink)
let xPos = ["left", "center", "right"][background[3]]
const clickReview = (opt: number) => {
  if (props.disableLink == 2 || typeof opt == 'number') emit('clickedOption', {option: opt, postID: props.hidden != '0' ? props.hidden : props.id, postType: +(!props.isList)})
  else if (props.disableLink == 1) emit('selected')
  else emit('selectedLink', creatorData.value)
}

const link = () => {
  let pre = props.isList ? "/" : "/review/"
  let id = props.hidden != '0' ? props.hidden : (props.post ?? props.id)
  return pre + id
}

</script>

<template>
  <component :is="disableLink ? 'button' : 'RouterLink'"
    :to="link()"
    class="flex flex-col focus-within:outline outline-4 outline-lof-400 min-w-64 w-full text-left max-w-96 cursor-pointer relative rounded-lg overflow-clip border-solid bg-[length:150vw] bg-center text-white group transition-[background-position] duration-200 hover:bg-left"
    :style="{
      backgroundImage: getGradient(listColor),
      borderColor: listColor.darken(2).hex(),
    }" :class="{ '!border-dotted !border-white !border-opacity-40': hidden != '0' }"
    @click="clickReview"
  >
    
    <div class="relative w-full h-36 bg-cover">
      <img ref="thumb" @load="modListCol" :src="thumbLink" loading="lazy" alt="" :style="{objectPosition: `${xPos} ${background[1]}%`}" class="object-cover w-full h-36" :class="{'mix-blend-luminosity': (!thumbnail && !thumbnailLink) || SETTINGS.disableColors}">
      <div :style="{background: `linear-gradient(0deg, ${listColor.darken().hex()}, transparent)`}" class="absolute bottom-0 w-full h-8 transition-colors duration-200 group-hover:brightness-50"></div>
      <div v-if="!unrolledOptions" class="flex absolute top-2 right-2 left-2 gap-2 justify-between text-base opacity-0 transition-opacity duration-75 group-hover:opacity-100">
        <div v-if="views" class="px-2 py-1 w-max bg-black bg-opacity-80 rounded-md backdrop-blur-sm h-max">
            <img src="../../images/view.svg" alt="" class="inline mr-2 w-4" />
            <span>{{ views }}</span>
        </div>
        <div v-if="rate_ratio && rate_ratio != -1" class="flex items-center px-2 py-1 bg-black bg-opacity-80 rounded-md backdrop-blur-sm grow">
            <ReviewRatingBar :rate="rate_ratio" />
        </div>
        <div v-if="levelCount" class="px-2 py-1 w-max bg-black bg-opacity-80 rounded-md backdrop-blur-sm h-max">
            <span>{{ levelCount }} {{ $t('other.levels', [levelCount]) }}</span>
        </div>
        <div v-if="levelCount" class="absolute -bottom-24 left-1/2 w-72 -translate-x-1/2">
          <RatingContainer class="mr-3" :ratings="levelRatings" compact />
        </div>
      </div>
      
      <div v-else class="grid absolute inset-2 grid-rows-2 gap-2 text-xl">
        <button v-if="isList" @click.stop="clickReview(0)" class="bg-black bg-opacity-90 rounded-md outline-white outline-2 focus-within:outline button"><img src="@/images/browseMobHeader.svg" class="inline mr-2 w-5" alt="">{{ $t('other.pickList') }}</button>
        <button v-else @click.stop="clickReview(0)" class="bg-black bg-opacity-90 rounded-md outline-white outline-2 focus-within:outline button"><img src="@/images/reviews.svg" class="inline mr-2 w-5" alt="">{{ $t('other.pickReview') }}</button>
        <button @click.stop="clickReview(1)" class="bg-black bg-opacity-90 rounded-md outline-white outline-2 focus-within:outline button"><img src="@/images/searchOpaque.svg" class="inline mr-2 w-5" alt="">{{ $t('other.pickLevels') }}</button>
      </div>
    </div>

    <section class="flex overflow-hidden flex-col justify-between items-start m-1 h-full">
      <div class="flex items-center">
        <h2 class="inline text-xl font-bold leading-tight">{{ decodeURIComponent(name.replaceAll("+", " ")) }}</h2>
        <img v-if="diffGuesser" class="inline ml-2 w-6" src="@/images/diffGuessSign.svg" alt="" />
      </div>
      <div class="overflow-hidden w-full text-ellipsis min-h-5">
        <q class="text-sm leading-none opacity-80" :class="{'after:hidden before:hidden': !(tagline ?? '').length}">{{ tagline }}</q>
      </div>
      <div class="flex gap-2 items-center mt-2">
        <ProfilePicture class="w-11" :uid="creatorData?.discord_id ?? -2" :cutout="creatorData.pfp_cutout" />
        <div>
          <h3 class="text-lg font-bold leading-tight">{{ creatorData?.username ?? creator }}</h3>
          <h4 class="text-xs opacity-70 cursor-help" :title="`${uploadDate.toLocaleDateString()} ${uploadDate.toLocaleTimeString()}`">{{ prettyDate(((new Date()).getTime() - uploadDate.getTime())/1000) }}</h4>
        </div>
      </div>
    </section>

    <div class="absolute previewTypeIcon right-1 bottom-1 invert-[0.7] mix-blend-color-dodge">
      <img v-if="isList" src="@/images/browseMobHeader.svg" class="w-12" alt="">
      <img v-else src="@/images/reviews.svg" class="w-12" alt="">
    </div>
  </component>
</template>

<style>
q {
  quotes: "„" "“";
  font-style: italic;
}

.previewTypeIcon {
  mask: linear-gradient(125deg, transparent 21%, black);
}

</style>
