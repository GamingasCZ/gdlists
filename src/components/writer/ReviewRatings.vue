<script setup lang="ts">
import { watch } from 'vue';
import ContainerHelp from './ContainerHelp.vue';
import { computed } from 'vue';
import { DEFAULT_RATINGS, reviewData } from '@/Reviews';
import chroma from 'chroma-js';
import { ref } from 'vue';
import { i18n } from '@/locales';

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

    selectedLevel.value = props.settings.level == -1 ? 0 : props.settings.level
})

const available = computed(() => reviewData.value.levels.length && !reviewData.value.disabledRatings)
const getCol = (col: number[]) => {
    return chroma.hsl(...col).css()
}


const allRatings = computed(() => DEFAULT_RATINGS.concat(reviewData.value.ratings))
const levelRatings = computed(() => {
    if (available.value) return reviewData.value.levels?.[selectedLevel.value!]?.ratings
})
const errMessage = computed(() => {
    if (reviewData.value.disabledRatings) return i18n.global.t('reviews.rateoff')
    if (!reviewData.value.levels.length) return i18n.global.t('reviews.noLevelsYet')
})
const selectedLevel = ref(props.settings.level == -1 ? 0 : props.settings.level)
</script>

<template>
    <ContainerHelp v-if="!available"
        icon="showRating"
        :help-content="errMessage">
    </ContainerHelp>
    
    <section :class="{'pt-10': settings.level == -1, '!max-w-[40rem]': settings.show != -1}" class="relative px-3 py-1 font-[poppins] bg-black m-2 bg-opacity-40 rounded-md overflow-x-hidden" v-else>
        
        <!-- Tabbar -->
        <div v-if="settings.level == -1" class="flex absolute top-1 left-1/2 gap-4 justify-between w-max text-xl text-center border-b-2 -translate-x-1/2 bg-lof-200 border-lof-400">
            <button :class="{'to-15%': settings.show == -1, '!opacity-0': selectedLevel == 0}" class="text-right text-transparent whitespace-nowrap bg-clip-text bg-gradient-to-l from-white to-transparent opacity-60 min-w-64" @click="selectedLevel = Math.max(0, selectedLevel - 1)">{{ reviewData.levels?.[selectedLevel - 1]?.levelName || $t('other.unnamesd') }}</button>
            <button class="my-1 whitespace-nowrap rounded-md bg-lof-300 min-w-36">{{ reviewData.levels[selectedLevel].levelName || $t('other.unnamesd') }}</button>
            <button :class="{'to-15%': settings.show == -1, '!opacity-0': selectedLevel == reviewData.levels.length - 1}" class="text-left text-transparent whitespace-nowrap bg-clip-text bg-gradient-to-r from-white to-transparent opacity-60 min-w-64" @click="selectedLevel = Math.min(selectedLevel + 1, reviewData.levels.length - 1)">{{ reviewData.levels?.[selectedLevel + 1]?.levelName || $t('other.unnamesd')}}</button>
        </div>

        <!-- Single rating -->
        <div v-if="settings.show != -1" class="w-[40rem] max-w-full">
            <div class="grid grid-cols-2 grid-rows-2 w-full text-left">
                <span class="text-2xl">{{ allRatings[settings.show].name || $t('other.unnamesd') }}</span>
                <span v-if="levelRatings[Math.floor(settings.show / 4)][settings.show % 4] > -1" class="w-full text-4xl font-bold text-right">{{ levelRatings[Math.floor(settings.show / 4)][settings.show % 4] }}/10</span>
                <span v-else class="w-full text-4xl font-bold text-right text-red-600">!</span>
                <div class="relative col-span-2 h-6 overflow-clip bg-black bg-opacity-40 rounded-md">
                    <div :style="{width: `${levelRatings[Math.floor(settings.show / 4)][settings.show % 4]*10}%`, backgroundColor: getCol(allRatings[settings.show].color)}" class="absolute inset-0 h-full transition-[width_0.3s]"></div>
                </div>
            </div>
        </div>

        <div v-else>
            <!-- All ratings -->
            <div v-if="!reviewData.disabledRatings" class="grid grid-rows-4 grid-flow-col gap-x-4">
                <div v-for="(rating, index) in levelRatings[0].concat(levelRatings[1])" class="min-w-[min(30vw,_10rem)] grid grid-cols-2 grid-rows-2 text-left">
                    <span>{{ allRatings[index].name || $t('other.unnamesd') }}</span>
                    <span v-if="rating > -1" class="text-xl font-bold text-right">{{ rating }}/10</span>
                    <span v-else class="w-full text-2xl font-bold text-right text-red-600">!</span>
                    <div class="relative col-span-2 h-2 overflow-clip bg-black bg-opacity-40 rounded-md">
                        <div :style="{width: `${rating*10}%`, backgroundColor: getCol(allRatings[index].color)}" class="absolute inset-0 h-full transition-[width_0.3s]"></div>
                    </div>
                </div>
            </div>
            
            <div v-else>
                <div v-for="(rating, index) in levelRatings[0].concat(levelRatings[1])" class="flex justify-between my-2 text-left">
                    <span>{{ allRatings[index].name || $t('other.unnamesd') }}</span>
                    <div class="flex gap-1">
                        <img class="w-4" src="@/images/reviews/star1.svg" v-for="filled in Math.floor(rating/2)" alt="">
                        <img class="w-4" src="@/images/reviews/star12.svg" v-if="rating/2 % 1 > 0" alt="">
                        <img class="w-4" src="@/images/reviews/star0.svg" v-for="filled in Math.max(0, 5 - Math.round(rating/2 % 1) - Math.floor(rating.rating/2))" alt="">
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>