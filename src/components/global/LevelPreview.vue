<script setup lang="ts">
import { makeColor, makeColorFromString, newCardBG, selectedLevels } from "@/Editor";
import type { FavoritedLevel, selectedList } from "@/interfaces";
import { loggedIn, SETTINGS } from "@/siteSettings";
import { number } from "@intlify/core-base";
import chroma, { type Color } from "chroma-js";
import { reactive, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import DifficultyIcon from "./DifficultyIcon.vue";
import RatingContainer from "./RatingContainer.vue";
import axios from "axios";
import ProfilePicture from "./ProfilePicture.vue";
import { summonNotification } from "../imageUpload";
import { i18n } from "@/locales";

const emit = defineEmits<{
  (e: 'favorite', data: FavoritedLevel): void
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
  inReviews: number
  inLists: number
  difficulty?: number
  rating?: number
  platformer?: 0 | 1
  favorited?: boolean
  collabMemberCount: number

  A_gameplay?: string | null
  A_decoration?: string | null
  A_difficulty?: string | null
  A_overall?: string | null
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
  if (insidePosts.value.length) return
  insidePosts.value = await axios.get(import.meta.env.VITE_API + "/getLists.php", {params: {postsInLevel: 1, levelID: props.levelID}}).then(res => res.data)
}

const copyID = () => {
  summonNotification(i18n.global.t('level.idCopied'), "", "check")
  navigator.clipboard.writeText(props.levelID)
}

const favoriteLevel = () => {
  let level = {
    levelName: props.levelName,
    creator: props.creator,
    levelDiff: [props.difficulty, props.rating],
    levelColor: props.color || makeColor(),
    levelID: props.levelID,
    listID: props.listID,
    timeAdded: Date.now()
  }
  emit('favorite', level)
}

</script>

<template>
  <component
    :is="disableLink ? 'button' : 'button'"
    :to="`/${listID!}${goto}`"
    class="flex relative flex-col items-center px-2 w-full max-w-4xl text-center text-white overflow-clip rounded-md cursor-pointer group"
    :style="{
      background: getGradient(),
    }"
  >
    <img v-if="background" :style="{mask: 'linear-gradient(90deg,transparent,black)'}" class="isolate absolute inset-0 opacity-40 mix-blend-luminosity" :src="`${uc}/userContent/${uploaderID}/${background}.webp`" alt="">
    
    <div class="flex flex-col justify-center items-center opacity-100 transition-opacity duration-75 ease-out group-hover:opacity-0">
      <DifficultyIcon v-once v-if="difficulty !== undefined && rating !== undefined" class="z-10 mt-4 w-18":difficulty="difficulty" :rating="rating" />
  
      <section class="flex z-10 flex-col justify-center">
        <h1 class="text-3xl font-extrabold"><img src="@/images/collab.svg" v-if="collabMemberCount > 0" class="inline mr-2 w-4 -translate-y-1">{{ levelName }}</h1>
        <p class="">{{ creator }}</p>
      </section>
  
      <section v-if="inLists || inReviews" class="relative z-10 h-14">
        <RatingContainer v-if="inReviews" class="absolute bottom-2 left-1/2 w-64 -translate-x-1/2" :ratings="[round(A_gameplay), round(A_decoration), round(A_difficulty), round(A_overall)]" compact />
        <div v-else></div>
      </section>
    </div>

    <div class="flex absolute inset-0 flex-col items-center py-2 opacity-0 transition-opacity duration-75 ease-out group-hover:opacity-100">
      <span @click.stop="copyID" class="text-2xl font-bold hover:underline">ID: {{ levelID }}</span>
      <div @click="getContainingPosts" class="flex gap-2 items-center text-center hover:underline">
        <span v-if="inLists">{{ $t('listViewer.inLists', inLists) }}</span>
        <hr v-if="inLists && inReviews" class="w-1 h-1 bg-white rounded-full border-none opacity-40">
        <span v-if="inReviews">{{ $t('listViewer.inReviews', inReviews) }}</span>
      </div>

      <hr class="px-2 my-2 w-72 h-0.5 bg-white border-none opacity-40">

      <button v-if="loggedIn" @click.stop="addToTemporaryList" :disabled="selectedLevels.length >= 50" class="z-20 p-2 bg-black bg-opacity-40 rounded-md disabled:opacity-20 hover:bg-opacity-60 button">
        <img src="@/images/addLevel.svg" class="inline mr-2 w-5" alt="">{{ $t('listViewer.addToList') }}
      </button>
      <a @click.stop="" :href="`https://gdbrowser.com/${levelID}`" target="_blank" class="p-2 py-1 m-2 text-left bg-black bg-opacity-40 rounded-md transition-colors hover:bg-opacity-60"><img src="@/images/modGDB.svg" class="inline mr-2 w-8">{{ $t('listViewer.dispOnGDB') }}</a>
    </div>

    <button @click.stop="favoriteLevel" :class="{'disabled': favorited}" class="absolute top-1 right-1 z-10 button">
      <img src="@/images/star.svg" class="w-7" alt="">
    </button>

    <Transition name="fade">
      <section v-if="insidePosts.length" class="absolute inset-2 z-20">
        <button @click.stop="insidePosts = []" :style="{border: `${listColor.css()} 2px solid`, background: listColor.darken(3).css()}" class="absolute -top-2 -right-2 z-10 p-1 rounded-full border-2 button border-lof-400"><img src="@/images/close.svg" class="w-4" alt=""></button>
        <div class="flex overflow-y-auto flex-col gap-2 p-1 h-full text-left rounded-md backdrop-blur-sm shadow-drop"
        :style="{background: listColor.darken(4).alpha(0.95).css(), border: `${listColor.hex()} 3px solid`}">
          <RouterLink :to="post.type ? `/review/${post.id}` : `/${post.id}`" v-for="post in insidePosts" class="flex gap-2 p-1 rounded-md hover:bg-white hover:bg-opacity-10">
            <ProfilePicture :uid="post.uid" :cutout="0" class="w-8 aspect-square" /> <!-- todo: maybe fetch proper cutout -->
            <div class="flex flex-col">
              <span class="text-xs opacity-40">{{ [$t('other.list'), $t('other.review')][post.type] }}</span>
              <span class="leading-[0.5] mb-1">{{ decodeURIComponent(post.name) }}</span>
            </div>
            <img src="@/images/arrow.svg" class="ml-auto w-2 aspect-square" alt="">
          </RouterLink>
        </div>
      </section>
    </Transition>

  </component>
</template>
