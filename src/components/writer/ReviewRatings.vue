<script setup lang="ts">
import { watch } from 'vue';
import ContainerHelp from './ContainerHelp.vue';
import { computed } from 'vue';
import { reviewData } from '@/Reviews';
import chroma from 'chroma-js';
import { ref } from 'vue';


const emit = defineEmits<{
    (e: 'openSettings'): void
    (e: 'clearButton'): void
}>()

const props = defineProps<{
    settings: object
    index: number
    buttonState: string
}>()

watch(props, () => {
    switch (props.buttonState) {
        case "pick": props.settings.level = false; break;
    }
    emit("clearButton")
})

const available = computed(() => !reviewData.value.levels.length || reviewData.value.rateTheme == 2)
const getCol = (col: number[]) => {
    return chroma.hsl(...col).css()
}

const selectedLevel = ref(0)
</script>

<template>
    <div class="">
        <ContainerHelp v-if="available"
            icon="showRating"
            :help-content="reviewData.levels.length ? $t('reviews.rateoff') : $t('reviews.noLevelsYet')">
        </ContainerHelp>
        
        <section class="px-3 py-1 w-64 max-w-full bg-black bg-opacity-40 rounded-md" v-else>
            <div class="flex gap-4 justify-between">
                <button class="text-xl" @click="selectedLevel = Math.max(0, selectedLevel - 1)">{{ reviewData.levels?.[selectedLevel - 1]?.levelName }}</button>
                <button class="text-xl">{{ reviewData.levels[selectedLevel].levelName }}</button>
                <button class="text-xl" @click="selectedLevel = Math.min(selectedLevel + 1, reviewData.levels.length)">{{ reviewData.levels?.[selectedLevel + 1]?.levelName }}</button>
            </div>
            <div v-if="reviewData.rateTheme == 0">
                <div v-for="rating in reviewData.defaultRatings.concat(reviewData.ratings)" class="grid grid-cols-2 grid-rows-2 text-left">
                    <span>{{ rating.name }}</span>
                    <span class="w-full text-xl font-bold text-right">{{rating.rating }}/10</span>
                    <div class="relative col-span-2 h-2 overflow-clip bg-black bg-opacity-40 rounded-md">
                        <div :style="{width: `${rating.rating*10}%`, backgroundColor: getCol(rating.color)}" class="absolute inset-0 h-full"></div>
                    </div>
                </div>
            </div>
            
            <div v-else>
                <div v-for="rating in reviewData.defaultRatings.concat(reviewData.ratings)" class="flex justify-between my-2 text-left">
                    <span>{{ rating.name }}</span>
                    <div class="flex gap-1">
                        <img class="w-4" src="@/images/reviews/star1.svg" v-for="filled in Math.floor(rating.rating/2)" alt="">
                        <img class="w-4" src="@/images/reviews/star12.svg" v-if="rating.rating/2 % 1 > 0" alt="">
                        <img class="w-4" src="@/images/reviews/star0.svg" v-for="filled in Math.max(0, 5 - Math.round(rating.rating/2 % 1) - Math.floor(rating.rating/2))" alt="">
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>