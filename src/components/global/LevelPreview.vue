<script setup lang="ts">
import { makeColorFromString, newCardBG, selectedLevels } from "@/Editor";
import type { selectedList } from "@/interfaces";
import { SETTINGS } from "@/siteSettings";
import { number } from "@intlify/core-base";
import chroma, { type Color } from "chroma-js";
import { reactive, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import DifficultyIcon from "./DifficultyIcon.vue";
import RatingContainer from "./RatingContainer.vue";
import axios from "axios";
import ProfilePicture from "./ProfilePicture.vue";

const emit = defineEmits<{
  (e: 'removeLevel', index: number): void
  (e: 'clickedOption', data: selectedList): void
}>()
const props = defineProps<{
  levelName: string
  creator: string
  background?: string
  uploaderID: string
  levelColor?: string
  color?: string
  levelID: string
  listID: string
  listName: string
  listPosition?: number
  timeAdded: number
  inReviews: number
  inLists: number
  difficulty?: number
  rating?: number
  platformer?: 0 | 1

  A_gameplay?: string | null
  A_decoration?: string | null
  A_difficulty?: string | null
  A_overall?: string | null

  userArray: string
  disableLink?: boolean | 2
}>()

const listColor = ref<Color>(chroma(props.color ?? props.levelColor! ?? makeColorFromString(props.levelName)));
if (SETTINGS.value.disableColors) {
  listColor.value = chroma(getComputedStyle(document.documentElement).getPropertyValue("--primaryColor"))
}

const getGradient = () => {
  if (SETTINGS.value.disableColors) {
    return getComputedStyle(document.documentElement).getPropertyValue("--secondaryColor")
  }

  return `linear-gradient(90deg, ${listColor.value.darken(
    2
  )}, ${listColor.value.darken(0.5)})`;
}

const goto = props.listPosition ? `?goto=${props.listPosition}`: ''
const round = (x) => parseFloat(parseFloat(x).toFixed(1))

const clickLevel = () => {
  let bg = newCardBG()
  bg.image[0] = props?.background
  emit('clickedOption', {levelName: props.levelName, creator: props.creator, levelID: props.levelID, difficulty: props.difficulty, rating: props.rating, color: props?.color, background: bg})
}

const addToTemporaryList = () => {
  selectedLevels.value.push({
    levelName: props.levelName, 
    creator: props.creator,
    levelID: props.levelID,
    difficulty: [props.difficulty, props.rating],
    color: listColor.value,
    platf: props.platformer
  })
}

const uc = import.meta.env.VITE_USERCONTENT

const insidePosts = ref([])
const getContainingPosts = async() => {
  insidePosts.value = await axios.get(import.meta.env.VITE_API + "/getLists.php", {params: {postsInLevel: 1, levelID: props.levelID}}).then(res => res.data)
}
</script>

<template>
  <component
    :is="disableLink ? 'button' : 'button'"
    :to="`/${listID!}${goto}`"
    class="flex relative flex-col items-center px-2 w-full max-w-4xl text-center text-white overflow-clip rounded-md cursor-pointer"
    :style="{
      background: getGradient(),
    }"
    @click="getContainingPosts"
  >
    <img :style="{mask: 'linear-gradient(90deg,transparent,black)'}" class="isolate absolute inset-0 opacity-40 mix-blend-luminosity" :src="`${uc}/userContent/${uploaderID}/${background}.webp`" alt="">
    
    <div class="flex flex-col justify-center items-center">
      <DifficultyIcon v-if="difficulty !== undefined && rating !== undefined" class="z-10 mt-4 w-18":difficulty="difficulty" :rating="rating" />
  
      <section class="flex z-10 flex-col justify-center">
        <h1 class="text-3xl font-extrabold">{{ levelName }}</h1>
        <p class="">{{ creator }}</p>
      </section>
  
      <section v-if="inLists || inReviews" class="relative z-10 h-14">
        <RatingContainer v-if="inReviews" class="absolute bottom-2 left-1/2 w-64 -translate-x-1/2" :ratings="[round(A_gameplay), round(A_decoration), round(A_difficulty), round(A_overall)]" compact />
        <div v-else></div>
      </section>
    </div>

    <button @mousedown.prevent="" class="absolute top-1 left-1 z-10 button">
      <img src="@/images/star.svg" class="w-7" alt="">
    </button>
    <button @mousedown.prevent="addToTemporaryList" class="absolute left-2 top-10 z-20 button">
      <img src="@/images/addLevel.svg" class="w-5" alt="">
    </button>

    <section v-if="insidePosts.length" class="flex overflow-y-auto absolute inset-2 z-20 flex-col gap-2 p-1 text-left rounded-md backdrop-blur-sm shadow-drop"
    :style="{background: listColor.darken(4).alpha(0.95).css(), border: `${listColor.hex()} 3px solid`}">
      <RouterLink :to="post.type ? `/review/${post.id}` : `/${post.id}`" v-for="post in insidePosts" class="flex gap-2 p-1 rounded-md hover:bg-white hover:bg-opacity-10">
        <ProfilePicture :uid="post.uid" :cutout="0" class="w-8 aspect-square" /> <!-- todo: maybe fetch proper cutout -->
        <div class="flex flex-col">
          <span class="text-xs opacity-40">{{ [$t('other.list'), $t('reviews.review')][post.type] }}</span>
          <span class="leading-[0.5] mb-1">{{ post.name }}</span>
        </div>
        <img src="@/images/arrow.svg" class="ml-auto w-2 aspect-square" alt="">
      </RouterLink>
    </section>

  </component>
</template>
