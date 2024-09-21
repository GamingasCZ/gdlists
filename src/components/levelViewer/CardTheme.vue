<script setup lang="ts">
import type { LevelBackground } from '@/interfaces';


const props = defineProps<LevelBackground>()

const styles = [
    {backgroundImage: `url(${props.image[0]})`, mask: `linear-gradient(90deg, transparent, black)`, opacity: props.opacity},
    {backgroundImage: `url(${props.image[0]})`, mask: `linear-gradient(120deg, transparent 55%, black 55%)`, opacity: props.opacity},
    {backgroundImage: `url(${props.image[0]})`, mixBlendMode: "luminosity", opacity: props.opacity},
    {backgroundImage: `url(${props.image[0]})`, filter: "blur(12px)", mixBlendMode: "color-dodge", opacity: props.opacity}
]

</script>

<template>
    <div class="absolute inset-0 bg-center pointer-events-none" :style="styles[theme]">
        <!-- <img :style="styles[theme]" class="absolute inset-0 -top-64 w-full overflow-clip" :src="" alt=""> -->
        <div v-if="theme == 1" class="absolute w-5 h-full bg-white right-[43%] -skew-x-[30deg]"></div>
    </div>
</template>