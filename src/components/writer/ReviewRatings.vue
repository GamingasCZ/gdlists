<script setup lang="ts">
import { inject, type Ref, watch } from 'vue';
import ContainerHelp from './ContainerHelp.vue';
import { computed } from 'vue';
import { DEFAULT_RATINGS } from '@/Reviews';
import chroma from 'chroma-js';
import { ref } from 'vue';
import { i18n } from '@/locales';
import type { Level, PostData, ReviewRating } from '@/interfaces';
import { type cShowRating } from './containers';

const emit = defineEmits<{
    (e: 'openSettings'): void
    (e: 'clearButton'): void
}>()

const props = defineProps<{
    settings: cShowRating
    index: number
    buttonState: string
}>()

const postData = inject<() => [Level[], ReviewRating[]]>("levelsRatingsData")!()

watch(props, () => {
    switch (props.buttonState) {
        case "pick": props.settings.level = false; break;
    }
    emit("clearButton")

    selectedLevel.value = props.settings.level == -1 ? 0 : props.settings.level
})

const available = computed(() => postData?.[0].length)
const getCol = (col: number[], darken = 0) => {
    return chroma.hsl(...col).darken(darken).css()
}

const allRatings = computed(() => DEFAULT_RATINGS.concat(postData[1]))
const levelRatings = computed(() => {
    if (available.value) return postData[0]?.[selectedLevel.value!]?.ratings
})
const errMessage = computed(() => {
    if (!postData?.[0].length) return i18n.global.t('reviews.noLevelsYet')
})
const selectedLevel = ref(props.settings.level == -1 ? 0 : props.settings.level)

const base = import.meta.env.BASE_URL
const toShow = computed(() => levelRatings.value[Math.floor(props.settings.show / 4)][props.settings.show % 4])
const rateBG = computed(() => {
    if (toShow.value == -1) return "noRating"
    else if (toShow.value < 4) return "sad"
    else if (toShow.value > 7) return "nice"
    else return "mid"
})
</script>

<template>
    <ContainerHelp v-if="!available"
        unclickable
        icon="showRating"
        :help-content="errMessage">
    </ContainerHelp>
    
    <section :class="{'pt-10': settings.level == -1, '!max-w-[40rem]': settings.show != -1}" class="relative px-3 py-1 font-[poppins] bg-black m-2 bg-opacity-40 rounded-md overflow-x-hidden" v-else>
        <!-- Tabbar -->
        <div v-if="settings.level == -1" class="flex absolute top-1 left-1/2 gap-4 justify-between w-max text-xl text-center border-b-2 -translate-x-1/2 bg-lof-200 border-lof-400">
            <button :class="{'to-15%': settings.show == -1, '!opacity-0': selectedLevel == 0}" class="text-right text-transparent whitespace-nowrap bg-clip-text bg-gradient-to-l from-white to-transparent opacity-60 min-w-64" @click="selectedLevel = Math.max(0, selectedLevel - 1)">{{ postData.levels?.[selectedLevel - 1]?.levelName || $t('other.unnamesd') }}</button>
            <button class="my-1 whitespace-nowrap rounded-md bg-lof-300 min-w-36">{{ postData[0][selectedLevel].levelName || $t('other.unnamesd') }}</button>
            <button :class="{'to-15%': settings.show == -1, '!opacity-0': selectedLevel == postData[0].length - 1}" class="text-left text-transparent whitespace-nowrap bg-clip-text bg-gradient-to-r from-white to-transparent opacity-60 min-w-64" @click="selectedLevel = Math.min(selectedLevel + 1, postData.levels.length - 1)">{{ postData.levels?.[selectedLevel + 1]?.levelName || $t('other.unnamesd')}}</button>
        </div>

        <!-- Single rating -->
        <div v-if="settings.show != -1" class="w-[40rem] max-w-full">
            <div class="grid grid-cols-2 grid-rows-2 w-full text-left">
                <span class="text-2xl">{{ allRatings[settings.show].name || $t('other.unnamesd') }}</span>
                <span v-if="toShow > -1" class="w-full text-4xl font-bold text-right">{{ toShow }}/10</span>
                <span v-else class="w-full text-4xl font-bold text-right text-red-600">!</span>
                <div class="relative col-span-2 h-6 overflow-clip bg-black bg-opacity-40 rounded-md">
                    <div :style="{width: `${toShow*10}%`, background: `linear-gradient(180deg, ${getCol(allRatings[settings.show].color)}, ${getCol(allRatings[settings.show].color, 1)})`}" class="absolute inset-0 h-full"></div>
                    <div :style="{width: `${toShow*10}%`, background: `url(${base}/rateBGs/${rateBG}.webp)`, backgroundSize: '6rem', animation: 'scroll 10s infinite linear'}" class="absolute inset-0 z-10 h-full mix-blend-soft-light"></div>
                </div>
            </div>
        </div>

        <div v-else>
            <!-- All ratings -->
            <div class="grid grid-rows-4 grid-flow-col gap-x-4">
                <div v-for="(rating, index) in levelRatings[0].concat(levelRatings[1])" class="min-w-[min(30vw,_10rem)] grid grid-cols-2 grid-rows-2 text-left">
                    <span>{{ allRatings[index].name || $t('other.unnamesd') }}</span>
                    <span v-if="rating > -1" class="text-xl font-bold text-right">{{ rating }}/10</span>
                    <span v-else class="w-full text-2xl font-bold text-right text-red-600">!</span>
                    <div class="relative col-span-2 h-2 overflow-clip bg-black bg-opacity-40 rounded-md">
                        <div :style="{width: `${rating*10}%`, backgroundColor: getCol(allRatings[index].color)}" class="absolute inset-0 h-full"></div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
