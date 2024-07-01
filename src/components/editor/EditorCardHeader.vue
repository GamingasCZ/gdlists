<script setup lang="ts">

import type { Level } from '@/interfaces';
import chroma from 'chroma-js';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
    data: Level
    updatingPositions: number
    index: number
}>()

const emit = defineEmits(['updateOpenedCard', 'doMove'])

function getCreator() {
    if (typeof props.data.creator == "object") // Collab
        return useI18n().t('editor.collabText', [props.data.creator[0][0].name, props.data.creator[2].length])
    else
        return props.data.creator
}

const tags = ref(props.data.tags.slice(0,5).map(x =>`${import.meta.env.BASE_URL}/tags/${x[0]}.svg`))

</script>

<template>
    <!-- Closed card content -->
    <header
    :style="{ backgroundImage: `linear-gradient(30deg, ${chroma.hsl(...data?.color!).darken(2).hex()}, ${chroma.hsl(...data?.color!).hex()})` }"
    :data-moving="updatingPositions != -1 ? 1 : 0"
    class="flex relative gap-2 items-center overflow-clip bg-right bg-no-repeat rounded-md bg-blend-saturation cursor-pointer overflow-y-clip h-max shadow-drop cardHeader"
    @click="updatingPositions != -1 ? 0 : emit('updateOpenedCard', index!)">

        <!-- Position -->
        <i class="py-2 w-14 text-2xl font-black tracking-widest text-center bg-black bg-opacity-80" >
            <b class="text-lg text-white text-opacity-30">#</b>{{ index! + 1 }}
        </i>

        <!-- Level Details -->
        <section class="flex justify-between items-end w-full">
            <div class="flex flex-col">
                <h1 class="text-lg font-bold leading-[1]">{{ data?.levelName || $t('other.unnamesd') }}</h1>
                <h3 class="leading-none text-white text-opacity-50">{{ getCreator() || $t('other.unnamesd') }}</h3>
            </div>

            <ul class="flex gap-1.5 mr-1.5">
                <img :src="tags[index]" :title="tag[2].toString()" alt="" class="w-6" v-for="(tag, index) in (data?.tags ?? []).slice(0, 5)">
            </ul>
        </section>
        
        <!-- Move arrows -->
        <div v-show="updatingPositions != -1" class="absolute right-0 top-2">
            <!-- Move Up -->
            <button v-show="index! < updatingPositions" class="w-12 button" @click="emit('doMove', updatingPositions, index)">
                <img src="@/images/moveUp.svg" />
            </button>

            <!-- Move down -->
            <button v-show="index! > updatingPositions" class="w-12 button" @click="emit('doMove', updatingPositions, index)">
                <img src="@/images/moveDown.svg" />
            </button>

            <!-- Cancel Move -->
            <button v-show="index! == updatingPositions" class="w-12 button" @click="emit('doMove', updatingPositions, index)">
                <img src="@/images/keepPosition.svg" />
            </button>
        </div>
    </header>
</template>

<style>
@media (prefers-reduced-motion: no-preference) {
    .cardHeader { transition: transform 0.1s cubic-bezier(0.19, 1, 0.22, 1); transform: translateX(0); }
    .cardHeader[data-moving="0"]:hover { transform: translateX(0.5rem); }
}

</style>
