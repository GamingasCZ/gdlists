<script setup lang="ts">
import type { Color } from 'chroma-js';
import { computed, ref } from 'vue';

const props = defineProps<{
    min: number
    max: number
    step: number
    trackCol?: Color
}>()

const width = 2

const value = defineModel("value", {default: 5})

const scrollerPerc = ref(value.value == -1 ? 50 : Math.max(width*2, parseInt(value.value/props.max*100)))
const updateScrollPerc = (val: number) => Math.max(width*2, Math.min(val*100, 100))

const main = ref<HTMLDivElement>()
const setValue = (e: MouseEvent | TouchEvent) => {
    let val: number
    let pos = main.value?.getBoundingClientRect()
    if (e.type == "touchmove")
       val = (e.touches?.[0].screenX - pos.x + width*2) / (main.value?.clientWidth - width)
    else
       val = (e.x - pos.x + width*2) / (main.value?.clientWidth - width)

    scrollerPerc.value = updateScrollPerc(val)
    value.value = Math.ceil(Math.max(props.min, Math.min(val * props.max, props.max))*10)/10
}

const endScroll = () => {
    document.removeEventListener("mousemove", setValue)
}
const startScroll = () => {
    document.addEventListener("mousemove", setValue)
    document.addEventListener("touchmove", setValue)
    document.addEventListener("mouseup", endScroll, {once: true})
}

const addStep = (by: number) => {
    value.value = Math.max(props.min, Math.min((value.value*10 + by*props.step*10)/10, props.max))
    scrollerPerc.value = updateScrollPerc(value.value/10)
}

</script>

<template>  
    <div ref="main" @mousedown="startScroll" @mouseup="endScroll" @click="setValue" role="slider" :aria-valuenow="value" :aria-valuemin="min" :aria-valuemax="max"
        class="flex relative w-full rounded-full border-2 transition-transform scale-y-90 group active:scale-100">
        <div
            class="absolute top-0 bottom-0 left-0 rounded-l-full bg-blend-soft-light scro"
            :style="{width: `calc(${scrollerPerc}% - ${width/2}rem)`, backgroundColor: trackCol?.css() ?? '#000', backgroundImage: 'linear-gradient(black, transparent)'}"
        ></div>
        <button
            :style="{width: `${width}rem`, height: `${width}rem`, marginLeft: `calc(${scrollerPerc}% - ${width}rem)`}"
            @mousedown="startScroll"
            @touchstart="startScroll"
            @touchend="endScroll"
            @keydown.left="addStep(-1)"
            @keydown.right="addStep(1)"
            class="bg-white rounded-full scale-y-110 group-active:scale-100 touch-pan-x"
        ></button>
    </div>
</template>

<style>
@keyframes scroll {
    from {
        background-position: 0 0;
    }
    to {
        background-position: 64px -64px;
    }
}

@media (prefers-reduced-motion) {
    .scro { animation: none; }
}

/* .scro::after {
    @apply content-[''] rounded-full absolute inset-0;
    background: v-bind(faceBG);
    background-size: 2rem;
    animation: scroll 5s infinite linear;
} */
</style>