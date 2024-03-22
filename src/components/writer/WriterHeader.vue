<script setup lang="ts">
import { reviewData } from '@/Reviews';


const emit = defineEmits<{
    (e: "openDialog", key: string): void
}>()

</script>

<template>
    <section class="flex justify-between items-center p-1 mb-2 h-10 text-white rounded-md bg-greenGradient">
        <div class="flex gap-1">
            <button class="flex relative gap-2 px-2 py-1 bg-black bg-opacity-40 rounded-md button hover:bg-opacity-60" @click="emit('openDialog', 'levels')">
                <img src="@/images/browseMobHeader.svg" alt="" class="w-6">
                <img src="@/images/warn.svg" v-show="!reviewData.levels.length || reviewData.rateTheme == 2" alt="" class="absolute bottom-1 left-5 w-3">
                <span class="max-sm:hidden">{{ $t('editor.levels') }}</span>
            </button>
            <button :disabled="reviewData.rateTheme == 2" class="flex relative gap-2 px-2 py-1 bg-black bg-opacity-40 rounded-md button hover:bg-opacity-60 disabled:opacity-20">
                <img src="@/images/rating.svg" alt="" class="w-6">
                <img src="@/images/warn.svg" v-show="reviewData.rateTheme != 2" alt="" class="absolute bottom-1 left-5 w-3">
                <span class="max-sm:hidden">{{ $t('reviews.rating') }}</span>
            </button>
            <button class="flex relative gap-2 px-2 py-1 bg-black bg-opacity-40 rounded-md button hover:bg-opacity-60" @click="emit('openDialog', 'settings')">
                <img src="@/images/gear.svg" alt="" class="w-6">
                <span class="max-sm:hidden">{{ $t('other.settings') }}</span>
            </button>
        </div>
        <div>
            <button v-if="true" class="flex gap-2 px-2 py-1 font-bold text-black rounded-md button bg-lof-400">
                <img src="@/images/upload.svg" alt="" class="w-6">
                <span class="max-sm:hidden">{{ $t('editor.upload') }}</span>
            </button>
            <div class="flex gap-1" v-else>
                <button class="flex gap-2 px-2 py-1 font-bold text-black rounded-md button bg-lof-400">
                    <img src="@/images/upload.svg" alt="" class="w-6">
                    <span class="max-sm:hidden">{{ $t('editor.update') }}</span>
                </button>
                <button class="flex gap-2 px-2 py-1 font-bold text-black bg-red-400 rounded-md button">
                    <img src="@/images/del.svg" alt="" class="w-6">
                </button>
            </div>
        </div>
    </section>
</template>