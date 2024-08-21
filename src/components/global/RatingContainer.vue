<script setup lang="ts">
import { DEFAULT_RATINGS } from '@/Reviews';
import chroma from 'chroma-js';
import { ref } from 'vue';

defineProps<{
    ratings: number[]
    userRatings: [string, number][]
    compact?: boolean
    noHelp?: boolean
}>()

const hoveredRatingName = ref("")

</script>

<template>
	<section class="flex flex-col gap-2">
	    <div :class="{'ratingDetails': compact && !noHelp, 'p-1 w-max': !compact}" class="grid bg-black bg-opacity-80 rounded-md backdrop-blur-sm">
            <span v-show="compact" v-if="!noHelp" class="text-xs text-center opacity-0 transition-opacity duration-200">{{ hoveredRatingName }}</span>
            <div class="flex">
                <div v-for="(defRating, index) in DEFAULT_RATINGS" @mouseover="hoveredRatingName = defRating.name" :style="{borderColor: chroma.hsl(defRating.color).css(), background: `linear-gradient(0deg, ${chroma.hsl(defRating.color).alpha(0.3).css()}, transparent)`}" class="px-2 w-full text-center border-b-4 max-w-24">
                    <h3 v-if="!compact">{{ defRating.name }}</h3>
                    <span class="font-bold" :class="{'text-2xl': !compact}">{{ ratings[index] }}</span><span :class="{'text-xs opacity-40': compact}">/10</span>
                </div>
            </div>
        </div>
    </section>
</template>

<style>

.ratingDetails {
    grid-template-rows: 0px 1fr;
    transition: grid-template-rows 0.2s ease;
}
.ratingDetails:hover {
    grid-template-rows: 12px 1fr;
}
.ratingDetails:hover > span {
    opacity: 1;
}

</style>