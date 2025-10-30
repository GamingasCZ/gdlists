<script setup lang="ts">
import type { TitleData } from '@/interfaces';
import { pickFont } from '@/Reviews';


defineProps<{
    titleData?: TitleData
    text: string
    tagline: string
    font: number
}>()

const aligns = ['left', 'center', 'right']
const fSizes = [4, 6, 7]

</script>

<template>
    <h1 v-if="!titleData" id="objectName" class="pl-2 text-8xl font-black">{{ text }}</h1>
    <section v-else class="pl-2 w-full" :style="{fontSize: `${fSizes[titleData.size]}rem`, textAlign: aligns[titleData.align], fontFamily: titleData.followFont ? pickFont(font) : 'Poppins'}">
        <div v-if="titleData.theme == 0" :style="{backgroundImage: `linear-gradient(30deg, var(--brightGreen), white 40%)`}" class="font-black text-transparent bg-clip-text">
            <h1 id="objectName">{{ text }}</h1>
        </div>
        <div v-else-if="titleData.theme == 1" class="font-black text-lof-400">
            <h1 id="objectName">{{ text }}</h1>
        </div>
        <div v-else-if="titleData.theme == 2" :style="{'-webkit-text-stroke': `var(--brightGreen) 3px`}" class="font-black text-transparent">
            <h1 id="objectName">{{ text }}</h1>
        </div>
    </section>
</template>