<script setup lang="ts">
import { predefinedLevelList, selectedLevels } from '@/Editor';
import DifficultyIcon from './DifficultyIcon.vue';
import router from '@/router';
import { ref } from 'vue';

const makeList = () => {
    predefinedLevelList.value = selectedLevels.value.slice(0)
    selectedLevels.value = []
    router.push("/make/list")
}

const writeReview = () => {
    predefinedLevelList.value = selectedLevels.value.slice(0)
    selectedLevels.value = []
    router.push("/make/review")
}

const unrolled = ref(true)
const rollLevels = () => {
    unrolled.value = !unrolled.value
}

</script>

<template>
    <section class="fixed bottom-2 left-2 z-10 justify-center w-max max-w-full text-center text-white overflow-clip rounded-md shadow-drop">
        <div class="p-2 rounded-t-md bg-lof-300">
            <button @click="selectedLevels = []" class="absolute top-3 left-3 button"><img src="@/images/trash.svg" class="w-4" alt=""></button>
            <button @click="rollLevels" class="absolute top-3 right-3 button"><img src="@/images/arrow.svg" :class="{'-scale-x-100': !unrolled}" class="w-3 rotate-90" alt=""></button>
            <span class="text-xl font-bold">{{ $t('listViewer.pickedLevels', selectedLevels.length) }}</span>
            <div class="flex gap-3 items-center mt-2">
                <button @click="makeList" class="p-2 text-sm rounded-md hover:bg-black hover:bg-opacity-40"><img class="inline mr-2 w-5" src="@/images/browseMobHeader.svg" alt="">{{ $t('homepage.createList') }}</button>
                <hr class="w-0.5 h-3 bg-white border-none opacity-40">
                <button @click="writeReview" class="p-2 text-sm rounded-md hover:bg-black hover:bg-opacity-40"><img class="inline mr-2 w-5" src="@/images/reviews.svg" alt="">{{ $t('homepage.writeReview') }}</button>
            </div>
        </div>
        <div v-show="unrolled" class="flex bg-[url(@/images/fade.svg)] bg-repeat-x flex-col max-h-44 overflow-y-auto gap-2 bg-lof-200">
            <div v-for="(level, index) in selectedLevels" class="flex items-center text-left">
                <DifficultyIcon class="w-12" :difficulty="level.difficulty[0]" :rating="level.difficulty[1]" />
                <div class="flex flex-col">
                    <span>{{ decodeURIComponent(level.levelName) }}</span>
                    <span class="text-xs text-white text-opacity-60">{{ level.creator }}</span>
                </div>
                <button @click="selectedLevels.splice(index, 1)" class="mr-2 ml-auto button"><img src="@/images/trash.svg" class="w-5" alt=""></button>
            </div>
        </div>
    </section>
</template>