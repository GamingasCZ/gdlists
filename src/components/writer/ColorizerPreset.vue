<script setup lang="ts">
import type { Stop } from '@/interfaces';
import chroma from 'chroma-js';


const props = defineProps<{
    gradient: Stop[]
    name: string
    selected: boolean
}>()

const gradientCSS = `linear-gradient(180deg, ${props.gradient.map(x => chroma.hsl(...x.color).hex()+` ${x.position*100}%`).join(",")})`

</script>

<template>
<button class="flex flex-col gap-2">
    <div class="w-28 h-full max-h-36 rounded-md border-2 border-black ring-4" :class="{'ring-lof-300': !selected, 'ring-lof-400': selected}" :style="{background: gradientCSS}"></div>
    <span class="">{{ name }}</span>
</button>
</template>