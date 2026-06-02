<script setup lang="ts">
import { DEFAULT_RATINGS } from '@/Reviews';
import Dropdown from '../ui/Dropdown.vue';
import { inject, ref } from 'vue';
import chroma from 'chroma-js';

const props = defineProps<{
    levelIndex: number
}>()

const listData = inject("levelsRatingsData")()

const hasRatings = ref((() => {
  let r = false
  if (listData[0][props.levelIndex]?.ratings) {
    listData[0][props.levelIndex].ratings.forEach(type => {
      if (!r && type.filter(x => x > -1).length > 0)
        r = true
    });
  }
  return r
})())

const ratingsShowing = ref(false)
const rateDropdownButton = ref<HTMLButtonElement>()

</script>

<template>
    <button v-if="hasRatings" @click.stop="ratingsShowing = true" class="button" ref="rateDropdownButton">
        <img class="w-5" :title="$t('reviews.rating')" src="@/images/rating.svg" alt="">
    </button>
    <!-- Level review ratings -->
    <Dropdown v-if="ratingsShowing" @close="ratingsShowing = false" :title="$t('reviews.rating')" :options="[]"
        :button="rateDropdownButton">
        <template #header>
            <template v-for="(rating, index) in DEFAULT_RATINGS.concat(listData[1])">
                <div v-if="listData[0][levelIndex].ratings[Math.floor(index / 4)][index % 4] > -1"
                    class="flex flex-col gap-1 p-1">
                    <div class="flex justify-between text-white">
                        <h3 class="overflow-hidden max-w-full text-sm text-ellipsis">{{ rating.name }}</h3>
                        <span class="text-sm font-bold">{{ listData[0][levelIndex].ratings[Math.floor(index / 4)][index
                            % 4] }}/10</span>
                    </div>
                    <div class="relative w-full h-1 bg-black bg-opacity-40">
                        <div :style="{ background: chroma.hsl(...rating.color).hex(), width: `${10 * listData[0][levelIndex].ratings[Math.floor(index / 4)][index % 4]}%` }"
                            class="absolute h-full"></div>
                    </div>
                </div>
            </template>
        </template>
    </Dropdown>

</template>