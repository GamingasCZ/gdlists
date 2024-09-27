<script setup lang="ts">
import { currentUID, manageParallax, parascroll } from '@/Editor';
import type { LevelBackground } from '@/interfaces';
import { SETTINGS } from '@/siteSettings';
import { computed } from 'vue';


const props = defineProps<LevelBackground>()

const base = import.meta.env.VITE_USERCONTENT
let imgurl = `url(${base}/userContent/${currentUID.value}/${props.image[0]}.webp)`
const styles = [
    {backgroundImage: imgurl, backgroundPositionY: `${props.image[1]}%`, backgroundRepeat: props.tile ? 'repeat' : 'no-repeat', backgroundSize: props.tile ? '' : 'cover', mask: `linear-gradient(90deg, transparent, black)`, opacity: props.opacity},
    {backgroundImage: imgurl, backgroundPositionY: `${props.image[1]}%`, backgroundRepeat: props.tile ? 'repeat' : 'no-repeat', backgroundSize: props.tile ? '' : 'cover', mask: `linear-gradient(120deg, transparent 55%, black 55%)`, opacity: props.opacity},
    {backgroundImage: imgurl, backgroundPositionY: `${props.image[1]}%`, backgroundRepeat: props.tile ? 'repeat' : 'no-repeat', backgroundSize: props.tile ? '' : 'cover', mask: `linear-gradient(90deg, transparent, #000B)`, mixBlendMode: "luminosity", opacity: props.opacity},
    {backgroundImage: imgurl, backgroundPositionY: `${props.image[1]}%`, backgroundRepeat: props.tile ? 'repeat' : 'no-repeat', backgroundSize: props.tile ? '' : 'cover', filter: "blur(12px) grayscale(1)", mixBlendMode: "overlay", opacity: props.opacity}
]

if (props.scrolling == 2) {
    window.addEventListener("scroll", manageParallax)
}

const bgScrollY = computed(() => `calc(${props.image[1]}% - ${parascroll.value}px)`)

</script>

<template>
    <div v-if="[0, 1].includes(SETTINGS.disableAllBGs)" class="absolute inset-0 pointer-events-none" :class="{'cardBackgroundScroll': scrolling == 1, 'cardBackgroundParallax': scrolling == 2}" :style="styles[theme]">
        <!-- <img :style="styles[theme]" class="absolute inset-0 -top-64 w-full overflow-clip" :src="" alt=""> -->
        <div v-if="theme == 1" class="absolute w-5 h-full bg-white right-[43%] -skew-x-[30deg]"></div>
    </div>
</template>

<style>

@keyframes bg-scroll {
    0% {background-position-y: 10%}
    5% {background-position-y: 13%;}
    50% {background-position-y: 100%}
    95% {background-position-y: 13%;}
    100% {background-position-y: 10%}

}

@media (prefers-reduced-motion: no-preference) {
    .cardBackgroundScroll {
        animation: bg-scroll 80s linear infinite;
    }
    .cardBackgroundParallax {
        @apply !bg-repeat-y;
        background-position-y: v-bind(bgScrollY) !important;
    }
}

</style>