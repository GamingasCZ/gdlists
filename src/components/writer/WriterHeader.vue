<script setup lang="ts">
import { reviewData } from '@/Reviews';

defineProps<{
    editing: boolean
    uploading: boolean
}>()

const emit = defineEmits<{
    (e: "openDialog", key: string): void
    (e: "upload"): void
    (e: "remove"): void
    (e: "update"): void
}>()

</script>

<template>
    <section class="flex justify-between items-center p-1 mb-2 h-10 text-white rounded-md bg-greenGradient">
        <div class="flex gap-1">
            <button class="flex relative gap-2 px-2 py-1 bg-black bg-opacity-40 rounded-md button hover:bg-opacity-60" @click="emit('openDialog', 'levels')">
                <img src="@/images/browseMobHeader.svg" alt="" class="w-6">
                <img src="@/images/warn.svg" v-show="!reviewData.levels.length && !reviewData.disabledRatings" alt="" class="absolute bottom-1 left-5 w-3">
                <span class="max-sm:hidden">{{ $t('editor.levels') }}</span>
            </button>
            <button :disabled="reviewData.disabledRatings" class="flex relative gap-2 px-2 py-1 bg-black bg-opacity-40 rounded-md button hover:bg-opacity-60 disabled:opacity-20" @click="emit('openDialog', 'ratings')">
                <img src="@/images/rating.svg" alt="" class="w-6">
                <img src="@/images/warn.svg" v-show="!reviewData.disabledRatings" alt="" class="absolute bottom-1 left-5 w-3">
                <span class="max-sm:hidden">{{ $t('reviews.rating') }}</span>
            </button>
            <button class="flex relative gap-2 px-2 py-1 bg-black bg-opacity-40 rounded-md button hover:bg-opacity-60" @click="emit('openDialog', 'settings')">
                <img src="@/images/gear.svg" alt="" class="w-6">
                <span class="max-sm:hidden">{{ $t('other.settings') }}</span>
            </button>
        </div>
        <div>
            <button :disabled="uploading" v-if="!editing" @click="emit('upload')" class="flex gap-2 px-2 py-1 font-bold text-black rounded-md button bg-lof-400">
                <img v-if="uploading" src="@/images/loading.webp" class="my-auto w-4 h-4 animate-spin" alt="">
                <img v-else src="@/images/upload.svg" alt="" class="w-6">
                <span class="max-sm:hidden">{{ $t('editor.upload') }}</span>
            </button>
            <div class="flex gap-1" v-else>
                <button :disabled="uploading" @click="emit('update')" class="flex gap-2 px-2 py-1 font-bold text-black rounded-md button bg-lof-400">
                    <img v-if="uploading" src="@/images/loading.webp" class="my-auto w-4 h-4 animate-spin" alt="">
                    <img v-else src="@/images/upload.svg" alt="" class="w-6">
                    <span class="max-sm:hidden">{{ $t('editor.update') }}</span>
                </button>
                <button :disabled="uploading" @click="emit('remove')" class="flex gap-2 px-2 py-1 font-bold text-black bg-red-400 rounded-md button">
                    <img src="@/images/del.svg" alt="" class="w-6">
                </button>
            </div>
        </div>
    </section>
</template>