<script setup lang="ts">

import type { Level } from '@/interfaces';
import chroma from 'chroma-js';
import { ref } from 'vue';

const props = defineProps<{
    data: Level
    updatingPositions: number
    index: number
}>()

const emit = defineEmits(['updateOpenedCard', 'doMove'])

function getCreator() {
    if (typeof props.data.creator == "object") // Collab
        return `${props.data.creator[0][0]} + ${props.data.creator[1].length} dalších`
    else
        return props.data.creator
}

const getTag = (ind: number) => new URL(`/public/badges/${ind}.svg`, import.meta.url).href

const facePath = ref(`url(/faces/${props.data.difficulty[0]}.webp)`)

</script>

<template>
    <!-- Closed card content -->
    <header :style="{ backgroundImage: `linear-gradient(30deg, ${chroma.hsl(...data?.color!).darken(2).hex()}, ${chroma.hsl(...data?.color!).hex()})` }" class="flex relative gap-2 items-center overflow-clip bg-right bg-no-repeat rounded-md bg-blend-saturation cursor-pointer overflow-y-clip h-max shadow-drop cardHeader"
        @click="updatingPositions != -1 ? 0 : emit('updateOpenedCard', index!)">
        <i class="py-2 w-14 text-2xl font-black tracking-widest text-center bg-black bg-opacity-80" >
            <b class="text-lg text-white text-opacity-30">#</b>{{ index! + 1 }}
        </i>
        <section class="flex justify-between items-end w-full">
            <div class="flex flex-col">
                <h1 class="text-lg font-bold leading-[1]">{{ data?.levelName || $t('other.unnamesd') }}</h1>
                <h3 class="leading-none text-white text-opacity-50">{{ getCreator() || $t('other.unnamesd') }}</h3>
            </div>

            <ul class="flex gap-1.5 mr-1.5">
                <img :src="getTag(tag[0])" :title="tag[2].toString()" alt="" class="w-6" v-for="tag in data.tags.slice(0, 5)">
            </ul>
        </section>
        

        <div v-show="updatingPositions != -1" class="absolute right-0 top-2">
            <!-- Move Up -->
            <button v-show="index! < updatingPositions" class="w-12 button" @click="emit('doMove')">
                <img src="@/images/showCommsU.svg" />
            </button>

            <!-- Move down -->
            <button v-show="index! > updatingPositions" class="w-12 button" @click="emit('doMove')">
                <img src="@/images/showCommsD.svg" />
            </button>

            <!-- Cancel Move -->
            <button v-show="index! == updatingPositions" class="mr-2.5 w-6 button" @click="emit('doMove')">
                <img src="@/images/close.svg" />
            </button>
        </div>
    </header>
</template>

<style>
/*
.cardHeader::after {
    content: "";
    position: absolute;
    background-image: v-bind(facePath);
    width: 25rem;
    height: 25rem;
    top: var(--ypos);
    left: -2vw;
    background-size: contain;
    opacity: 0.1;
    filter: blur(2px);
    transition: top 0.1s ease-in-out;
}

.cardHeader { --ypos: -10rem; transition: transform 0.1s cubic-bezier(0.19, 1, 0.22, 1); transform: translateX(0); }
.cardHeader:hover { --ypos: -12rem; transform: translateX(0.5rem); }
*/
</style>
