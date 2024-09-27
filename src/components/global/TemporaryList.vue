<script setup lang="ts">
import { selectedLevels } from '@/Editor';
import DifficultyIcon from './DifficultyIcon.vue';
</script>

<template>
    <section class="relative bottom-2 left-2 justify-center w-max max-w-full text-center text-white overflow-clip rounded-md shadow-drop">
        <div class="p-2 rounded-t-md bg-lof-300">
            <button class="absolute top-3 right-3"><img src="@/images/close.svg" class="w-4" alt=""></button>
            <span class="text-xl font-bold">Vybráno {{ selectedLevels.length }} levelů</span>
            <div class="flex gap-3 items-center mt-2">
                <button class="p-2 text-sm rounded-md hover:bg-black hover:bg-opacity-40"><img class="inline mr-2 w-5" src="@/images/browseMobHeader.svg" alt="">{{ $t('homepage.createList') }}</button>
                <hr class="w-0.5 h-3 bg-white border-none opacity-40">
                <button class="p-2 text-sm rounded-md hover:bg-black hover:bg-opacity-40"><img class="inline mr-2 w-5" src="@/images/reviews.svg" alt="">{{ $t('homepage.writeReview') }}</button>
            </div>
        </div>
        <div class="flex flex-col bg-lof-200">
            <div v-for="level in selectedLevels">
                <DifficultyIcon :difficulty="level.difficulty[0]" :rating="level.difficulty[1]" />
            </div>
        </div>
    </section>
</template>