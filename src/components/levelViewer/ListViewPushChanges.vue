<script setup lang="ts">
import { hasLocalStorage } from '@/siteSettings';


defineProps<{
    ownsPost: boolean
    updating: boolean
}>()

const emit = defineEmits<{
    (e: "discard"): void
    (e: "confirm"): void
}>()

const hasLS = hasLocalStorage()

</script>

<template>
    <div class="flex fixed bottom-2 left-1/2 z-30 flex-col gap-3 items-center p-3 w-96 rounded-md -translate-x-1/2 max-sm:bottom-32 bg-greenGradient">
        <span class="text-xl leading-none">{{ $t('listViewer.changes') }}</span>
        <span v-if="!ownsPost && hasLS" class="mb-3 text-sm opacity-30">{{ $t('listViewer.changes2') }}</span>
        <span v-else-if="!hasLS" class="mb-3 text-sm opacity-30">{{ $t('listViewer.changes3') }}</span>
        <div v-if="hasLS" class="grid grid-cols-2 gap-4 w-full">
            <button @click="emit('discard')" :disabled="updating" class="flex gap-2 items-center px-2 py-1 rounded-md disabled:opacity-20 hover:bg-opacity-40 button hover:bg-black">
                <img src="@/images/close.svg" class="w-5" alt="">
                {{ $t('other.discard') }}
            </button>
            <button @click="emit('confirm')" v-if="ownsPost" :disabled="updating" class="flex gap-2 items-center p-2 font-bold text-black rounded-md disabled:opacity-20 button bg-lof-400">
                <img v-if="updating" src="@/images/loading.webp" class="w-5 animate-spin" alt="">
                <img v-else src="@/images/upload.svg" class="w-5" alt="">
                {{ $t('editor.update') }}
            </button>
            <button @click="emit('confirm')" v-else :disabled="updating" class="flex gap-2 items-center px-2 py-1 rounded-md disabled:opacity-20 hover:bg-opacity-40 button hover:bg-black">
                <img src="@/images/symbolicSave.svg" class="w-5" alt="">
                {{ $t('other.save') }}
            </button>
        </div>
    </div>
</template>