<script setup lang="ts">
import { inject, onMounted, type Ref, ref, watch } from 'vue';
import LevelCard from '../global/LevelCard.vue';
import ContainerHelp from "./ContainerHelp.vue";
import type { Level, PostData, ReviewRating } from '@/interfaces';

const emit = defineEmits<{
    (e: 'openSettings'): void
    (e: 'clearButton'): void
}>()

const props = defineProps<{
    settings: object
    buttonState: [string, number]
    index: number
}>()

watch(props, () => {
    if (props.buttonState[1] != props.index) return

    switch (props.buttonState[0]) {
        case "pickLevel": props.settings.pickedIndex = -1; break;
    }
    emit("clearButton")
})

const postData = inject<() => [Level[], ReviewRating[]]>("levelsRatingsData")!()
const levelHashes = inject("levelHashes", 0)!
let indPicked = ref(0)

</script>

<template>
    <ContainerHelp unclickable v-if="settings.pickedIndex == -1 || !postData[0]?.[settings.pickedIndex]" icon="showLevel" :help-content="postData[0].length > 0 ? $t('reviews.pickShowcase') : $t('reviews.noLevelsAddedYet')">
        <form v-show="postData[0].length > 0" class="flex gap-1 justify-center w-full" @submit.prevent="settings.pickedIndex = indPicked">
            <select @keyup.enter="settings.pickedIndex = indPicked" v-model.lazy="indPicked" class="p-2 bg-white bg-opacity-10 rounded-md">
                <option :value="index" v-for="(level, index) in postData[0]">{{ level.levelName || $t('other.unnamesd') }}</option>
            </select>
            <button type="submit" class="p-1 w-10 rounded-md bg-lof-400">
                    <img class="mx-auto mt-1 w-6" src="@/images/check.svg" alt="">
            </button>
        </form>
    </ContainerHelp>
    
    <figure class="flex flex-col p-2 w-full" style="justify-content: inherit" v-else>
        <LevelCard :key="levelHashes?.[settings.pickedIndex] ?? 0" hide-ratings v-bind="postData[0][settings.pickedIndex]" :disable-stars="true"/>
        <figcaption class="text-[90%] text-inherit mt-1">{{ settings.description }}</figcaption>
    </figure>
</template>