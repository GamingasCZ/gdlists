<script setup lang="ts">
import type { TitleData } from '@/interfaces';
import { pickFont } from '@/Reviews';
import chroma from 'chroma-js';
import { computed } from 'vue';


const props = defineProps<{
    titleData?: TitleData
    text: string
    tagline: string
    font: number
}>()

const aligns = ['left', 'center', 'right']
const fSizes = [4, 6, 7]

const getColors = computed(() => {
    if (!props?.titleData) return 'white'
    console.log(props.titleData)

    if (props.titleData?.theme == 0) {
        if (props.titleData.colors[0])
            return `linear-gradient(30deg, var(--brightGreen), white 40%)`
        else {
            console.log(props.titleData.colors[1])
            let col1 = chroma.hsl(props.titleData.colors[1].theme[0][0], props.titleData.colors[1].theme[0][1]/32, props.titleData.colors[1].theme[0][2]/32).css()
            let col2 = chroma.hsl(props.titleData.colors[1].theme[1][0], props.titleData.colors[1].theme[1][1]/32, props.titleData.colors[1].theme[1][2]/32).css()

            return `linear-gradient(30deg, ${col1}, ${col2} 40%)`
        }
    }
    return `linear-gradient(30deg, var(--brightGreen), white 40%)`
})

</script>

<template>
    <h1 v-if="!titleData" id="objectName" class="pl-2 text-8xl font-black">{{ text }}</h1>
    <section v-else class="pl-2 w-full" :style="{fontSize: `${fSizes[titleData.size]}rem`, textAlign: aligns[titleData.align], fontFamily: titleData.followFont ? pickFont(font) : 'Poppins'}">
        <div v-if="titleData.theme == 0" :style="{backgroundImage: getColors}" class="font-black text-transparent bg-clip-text">
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