<script setup lang="ts">
import type { ListBackground } from '@/interfaces';
import chroma from 'chroma-js';
import { ref, watch } from 'vue';


const props = defineProps<{
    imageData: ListBackground;
    listColor: [number, number, number];
}>()

const positionListBackground = () => ["left", "center", "right"][props.imageData?.[3]];

let lightness
if (props.listColor[2] > 1) lightness = props.listColor[2] / 64
else lightness = props.listColor[2]
let colorData = [props.listColor[0], props.listColor[1], lightness]

const listCol = ref(chroma.hsl(...colorData).hex())
watch(props, () => listCol.value = chroma.hsl(...colorData).hex())


</script>

<template>
    <section v-if="imageData[0]" class="fixed left-0 top-10 w-screen h-screen bg-cover -z-50" :style="{backgroundPositionY: `${imageData[1]}%`, backgroundPositionX: positionListBackground(), height: `${imageData[2]}%`, backgroundImage: `url(${imageData[0]})`}">
        <div v-if="imageData[4]" class="w-full h-full" :style="{backgroundImage: `linear-gradient(transparent, ${listCol})`}"></div>

    </section>
</template>