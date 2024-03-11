<script setup lang="ts">

const emit = defineEmits<{
    (e: 'openSettings'): void
}>()

const BASE_URL = import.meta.env.BASE_URL
</script>

<template>
    <button @click="emit('openSettings')" class="mx-auto w-[30rem] text-center flex flex-col items-center text-xl p-2 rounded-md bg-lof-300 min-h-20">
        <img :src="`${BASE_URL}/formatting/showImage.svg`" class="w-28 opacity-10" alt="">
        <h2>Kliknutím nastav obrázek</h2>
    </button>
    <img >
</template>