<script setup lang="ts">
import type { LevelBackground } from '@/interfaces';


const props = defineProps<LevelBackground>()

const styles = [
    {mask: `linear-gradient(90deg, transparent, black)`, opacity: props.opacity},
    {mask: `linear-gradient(120deg, transparent 55%, black 55%)`, opacity: props.opacity},
    {mixBlendMode: "luminosity", opacity: props.opacity},
    {filter: "blur(12px)", mixBlendMode: "color-dodge", opacity: props.opacity}
]

</script>

<template>
    <div class="absolute inset-0 pointer-events-none">
        <img :style="styles[theme]" class="absolute inset-0 -top-64 w-full overflow-clip" :src="image[0]" alt="">
        <div v-if="theme == 1" class="absolute w-5 h-full bg-white right-[32%] -skew-x-[30deg]"></div>
    </div>
</template>