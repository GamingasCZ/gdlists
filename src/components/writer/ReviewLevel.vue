<script setup lang="ts">
import { inject, ref, watch } from 'vue';
import LevelCard from '../global/LevelCard.vue';
import ContainerHelp from "./ContainerHelp.vue";
import { reviewData } from '@/Reviews';

const emit = defineEmits<{
    (e: 'openSettings'): void
    (e: 'clearButton'): void
}>()

const props = defineProps<{
    settings: object
    buttonState: string
}>()

watch(props, () => {
    switch (props.buttonState) {
        case "pickLevel": props.settings.pickedIndex = -1; break;
    }
    emit("clearButton")
})

const levelHashes = inject("levelHashes", 0)!
let indPicked = ref(0)

</script>

<template>
    <ContainerHelp v-if="settings.pickedIndex == -1" icon="showLevel" :help-content="reviewData.levels.length > 0 ? $t('reviews.pickShowcase') : $t('reviews.noLevelsAddedYet')">
        <form v-show="reviewData.levels.length > 0" target="." class="flex gap-1 justify-center w-full" @submit.prevent="settings.pickedIndex = indPicked">
            <select v-model.lazy="indPicked" class="p-2 bg-white bg-opacity-10 rounded-md">
                <option :value="index" v-for="(level, index) in reviewData.levels">{{ level.levelName || $t('other.unnamesd') }}</option>
            </select>
            <button type="submit" class="p-1 w-10 rounded-md bg-lof-400">
                    <img class="mx-auto mt-1 w-6" src="@/images/check.svg" alt="">
            </button>
        </form>
    </ContainerHelp>
    
    <figure class="flex p-2 w-full" style="justify-content: inherit" v-else>
        <LevelCard :key="levelHashes?.[settings.pickedIndex] ?? 0" hide-ratings v-bind="reviewData.levels[settings.pickedIndex]" :disable-stars="true"/>
        <figcaption class="mt-2">{{ settings.description }}</figcaption>
    </figure>
</template>