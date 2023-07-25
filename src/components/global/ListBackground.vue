<script setup lang="ts">
import type { ListBackground } from '@/interfaces';
import chroma from 'chroma-js';
import { ref, watch } from 'vue';


const props = defineProps<{
    imageData: ListBackground;
    listColor: [number, number, number];
}>()

const positionListBackground = () => ["left", "center", "right"][props.imageData?.[3]];


const listCol = ref(chroma.hsl(...props.listColor).hex())
watch(props, () => listCol.value = chroma.hsl(...props.listColor).hex())


</script>

<template>
    <section class="fixed left-0 top-10 w-screen h-screen bg-cover -z-50" :style="{backgroundPositionY: `${imageData[1]}%`, backgroundPositionX: positionListBackground(), height: `${imageData[2]}%`, backgroundImage: `url(${imageData[0]})`}">
        <div class="w-full h-full" :style="{backgroundImage: `linear-gradient(transparent, ${listCol})`}"></div>

    </section>
</template>