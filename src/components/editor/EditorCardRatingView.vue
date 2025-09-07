<script setup lang="ts">
import type { PostData } from '@/interfaces';
import { DEFAULT_RATINGS } from '@/Reviews';
import RatingPicker from '../writer/RatingPicker.vue';
import DifficultyIcon from '../global/DifficultyIcon.vue';
import { computed, ref } from 'vue';
import chroma from 'chroma-js';
import Dropdown from '../ui/Dropdown.vue';
import { i18n } from '@/locales';
import EditorCardCommentary from './EditorCardCommentary.vue';

const props = defineProps<{
    postData: PostData
    levelIndex: number
    levelCreator: string
    isList: boolean
    brightBg: boolean
}>()

const emit = defineEmits<{
    (e: "close"): void
}>()

const SUGGESTIONS = computed(() => {
  let suggs = [
    i18n.global.t('reviews.theming'),
    i18n.global.t('reviews.sync'),
    i18n.global.t('reviews.music'),
    i18n.global.t('reviews.consistency'),
    i18n.global.t('reviews.sightreadability'),
    i18n.global.t('reviews.originality')
  ]

  props.postData.ratings.forEach(x => {
    let used = suggs.indexOf(x.name)
    if (used != -1) suggs.splice(used, 1)
  })

  return suggs
})

const selectedDefRate = ref(3)

const ratings = props.postData.levels[props.levelIndex].ratings
const customSuggOpen = ref(false)
const suggButton = ref<HTMLButtonElement>()

const addRatingsToLevels = () => {
  if (!props.postData.ratings) return
  if (!props.postData.levels?.[props.levelIndex]?.ratings) return

  for (let i = 0; i < props.postData.levels.length; i++) {
      let unadded = Array(Math.max(0, props.postData.ratings.length - props.postData.levels[i].ratings[1].length)).fill(-1)
      props.postData.levels[i].ratings[1] = props.postData.levels[i].ratings[1].concat(unadded)
  }
}

addRatingsToLevels() // Adds ratings to any newly added levels

const addRating = (name = "") => {
  if (props.postData.ratings.length > 3) return

  let col = [20*Math.ceil(Math.random()*18), 0.75, 0.72]

  props.postData.ratings.push({
    name: name,
    color: col,
    rating: -1
  })
  
  addRatingsToLevels()
  customSuggOpen.value = false
}

const removeRating = (ind: number) => {
    props.postData.ratings.splice(ind, 1)
    for (let i = 0; i < props.postData.levels.length; i++) {
        props.postData.levels[i].ratings[1].splice(ind, 1)
    }
}

const moveRating = (ind: number, to: number) => {
    let data = props.postData.ratings[ind]
    props.postData.ratings.splice(ind, 1)
    props.postData.ratings.splice(ind+to, 0, data)
    for (let i = 0; i < props.postData.levels.length; i++) {
        let data = props.postData.levels[i].ratings[1][ind]
        props.postData.levels[i].ratings[1].splice(ind, 1)
        props.postData.levels[i].ratings[1].splice(ind+to, 0, data)
    }
}

const changeSetting = (option: number, ratingIndex: number) => {
    switch (option) {
        case 0: removeRating(ratingIndex); break;
        case 1: moveRating(ratingIndex, -1); break;
        case 2: moveRating(ratingIndex, 1); break;
    }
}

const rateCol = computed(() => chroma.hsl(...DEFAULT_RATINGS[selectedDefRate.value].color))

</script>

<template>
    <div>
      <header @click="emit('close')" class="flex gap-2 items-center p-1 pl-5 bg-black bg-opacity-40 transition-colors duration-75 cursor-pointer group hover:bg-opacity-60">
        <img src="@/images/back.svg" class="w-6 transition-transform duration-75 group-active:-translate-x-2" alt="">
        <DifficultyIcon class="ml-2 w-12" :difficulty="postData.levels[levelIndex].difficulty[0]" :rating="postData.levels[levelIndex].difficulty[1]" />
        <div>
          <p class="text-2xl font-bold leading-tight">{{ postData.levels[levelIndex].levelName || $t('other.unnamesd') }}</p>
          <p class="text-sm leading-none">{{ levelCreator || $t('other.unnamesd') }}</p>
        </div>
      </header>
      <section class="flex flex-col gap-2 p-2">

        <!-- Rating selector -->
        <div class="flex flex-wrap gap-2">
          <button
            v-for="(rating, i) in DEFAULT_RATINGS"
            @click="selectedDefRate = i"
            :style="{
              background: selectedDefRate == i ? rateCol.darken(2).css() : '#00000066',
              borderColor: selectedDefRate == i ? rateCol.css() : '#000',
              boxShadow: `0px 0px 16px ${selectedDefRate == i ? rateCol.css() : '#000'}`,
            }"
            class="relative p-2 overflow-clip rounded-md border-2 max-sm:grow button"
          >
            <span class="mr-2 text-xl font-bold">{{ rating.name }}</span>

            <span v-if="ratings?.[0]?.[i] != -1" class="inline-block min-w-6">{{ ratings?.[0]?.[i] }}</span>
            <span v-else class="inline-block font-black text-red-500 min-w-6">!</span>
            
            <div
                :style="{width: `${(ratings?.[0]?.[i] ?? 0)/10*100}%`, background: chroma.hsl(...rating.color).hex()}"
                :class="{'animatedNoRating': ratings?.[0]?.[i] == -1}"
                class="absolute bottom-0 left-0 w-full h-1"
            ></div>
          </button>
        </div>

        <RatingPicker
          :key="DEFAULT_RATINGS[selectedDefRate].name"
          :color="DEFAULT_RATINGS[selectedDefRate].color"
          @mod-rating="ratings[0][selectedDefRate] = $event"
          :value="postData.levels?.[levelIndex]?.ratings?.[0]?.[selectedDefRate]"
          :default-name="DEFAULT_RATINGS[selectedDefRate].name"
          :rating="DEFAULT_RATINGS[selectedDefRate]"
        />

        <template v-if="!isList">
          <div class="flex gap-2 px-2 items-center mix-blend-plus-lighter invert-[0.2] mt-6 opacity-50">
              <span class="text-xl">{{ $t('reviews.customRating') }}</span>
              <hr class="mx-2 rounded-sm border grow">
              <button :disabled="(postData.ratings ?? []).length >= 4" @click="addRating()" class="flex gap-2 items-center px-2 py-1 rounded-md transition-colors hover:bg-black button">
                  <img src="@/images/plus.svg" class="w-5" alt="">
                  {{ $t('other.add') }}
                </button>
                <hr class="w-0.5 h-5 bg-white rounded-md border-none">
                <button class="py-2 button" @click="customSuggOpen = true" ref="suggButton">
                  <img src="@/images/genericRate.svg" class="w-2 rotate-180" alt="">
                </button>
          </div>
  
          <p class="my-3 text-sm text-center opacity-20 mix-blend-plus-lighter" v-if="!(postData.ratings ?? []).length">{{ $t('reviews.cRatingHelp') }}</p>
  
          <RatingPicker
            v-for="(rating, i) in postData.ratings"
            :key="rating.color"
            @edit-action="changeSetting($event, i)"
            @mod-rating="ratings[1][i] = $event"
            :value="ratings[1][i]"
            v-model:name="rating.name"
            :color="rating.color"
            editable
          />
        </template>
        <EditorCardCommentary  class="mt-4 mb-0" v-else
          v-model="postData.levels[levelIndex].commentary"
          editable
          :class="{'text-black': brightBg}"
        />

        
      </section>

      <Dropdown v-if="customSuggOpen" @close="customSuggOpen = false" :button="suggButton!">
        <template #header>
            <section class="flex flex-col p-2 text-white">
                <span class="mb-2 text-xl font-bold text-center">{{ $t('collabTools.examples') }}</span>
                <button @click="addRating(sugg)" class="px-2 mb-1 bg-black bg-opacity-40 rounded-md button" v-for="sugg in SUGGESTIONS">{{ sugg }}</button>
            </section>
        </template>
      </Dropdown>
    </div>
</template>

<style>

@keyframes noRating {
    0% { @apply translate-x-0; }
    50% { @apply -translate-x-3/4; }
    100% { @apply translate-x-0; }
}

.animatedNoRating {
    animation: noRating 8s infinite ease;
    background: linear-gradient(90deg, rgb(148, 28, 157), transparent) !important;
}

</style>