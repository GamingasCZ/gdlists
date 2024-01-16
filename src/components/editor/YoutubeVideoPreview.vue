<script setup lang="ts">
import { prettyDate } from '@/Editor';
import type { ytSearchDetails } from '@/interfaces';
import { ref } from 'vue';


const props = defineProps<{
    videoData: ytSearchDetails;
    index: number;
}>()

const emit = defineEmits<{
    (e: "pickVideo", link: string): void
}>()

const hovering = ref(false)

</script>

<template>
    <article class="inline overflow-clip rounded-md max-sm:flex bg-greenGradient max-sm:active:scale-110" @touchstart="emit('pickVideo', videoData.links[index-1])">
        <header @mouseover="hovering = true" @mouseleave="hovering = false" @touchstart="hovering = true" class="relative">
            <div class="w-52 max-sm:w-24 bg-center h-full bg-cover transition-[filter_0.2s_ease] aspect-video" :style="{backgroundImage: `url(${videoData.thumbnails[index-1]})`}" :class="{'sm:brightness-50': hovering}"></div>
            <Transition name="fade">
                <div v-show="hovering" class="flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-sm:hidden">
                    <a :title="$t('editor.openVideoTitle')" :href="`https://youtu.be/${videoData.links[index-1]}`" class="mr-2 button" target="_blank">
                        <img src="@/images/modYT.svg" class="w-10" alt="">
                    </a>
                    <button :title="$t('editor.pickVideoTitle')" @click="emit('pickVideo', videoData.links[index-1])" class="button"><img src="@/images/modPick.svg" class="w-10" alt=""></button>
                </div>            
            </Transition>
            <div class="absolute bottom-0 pr-2 w-full h-5 text-sm text-right text-white text-opacity-40 backdrop-blur-lg backdrop-brightness-50 max-sm:hidden">{{ prettyDate((Date.now() - new Date(videoData.publishTime[index-1])) / 1000) }}</div>
        </header>
        <footer>
            <h3 class="px-2 mt-1 h-16 text-sm leading-tight" v-html="videoData.titles[index-1]"></h3>
            <h2 class="px-2 mt-2 text-sm leading-tight opacity-50">{{ videoData.creators[index-1] }}</h2>
        </footer>
    </article>
</template>