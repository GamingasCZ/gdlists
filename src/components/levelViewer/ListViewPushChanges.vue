<script setup lang="ts">

defineProps<{
    ownsPost: boolean
    updating: boolean
}>()

const emit = defineEmits<{
    (e: "discard"): void
    (e: "confirm"): void
}>()

</script>

<template>
    <div class="flex fixed bottom-2 left-1/2 z-30 flex-col gap-3 items-center p-3 w-96 rounded-md -translate-x-1/2 max-sm:bottom-32 bg-greenGradient">
        <h3 class="text-xl">{{ $t('listViewer.changes') }}</h3>
        <div class="grid grid-cols-2 gap-4 w-full">
            <button @click="emit('discard')" :disabled="updating" class="flex gap-2 items-center px-2 rounded-md disabled:opacity-20 hover:bg-opacity-40 button hover:bg-black">
                <img src="@/images/close.svg" class="w-5" alt="">
                {{ $t('other.discard') }}
            </button>
            <button @click="emit('confirm')" :disabled="updating" class="flex gap-2 items-center p-2 font-bold text-black rounded-md disabled:opacity-20 button bg-lof-400">
                <img v-if="updating" src="@/images/loading.webp" class="w-5 animate-spin" alt="">
                <img v-else src="@/images/upload.svg" class="w-5" alt="">
                {{ $t('editor.update') }}
            </button>
        </div>
    </div>
</template>