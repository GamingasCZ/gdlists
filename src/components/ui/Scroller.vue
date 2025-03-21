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
const scrolling = ref(false)

const scrollerPerc = ref(value.value == -1 ? 50 :parseInt(value.value/props.max*100))
const main = ref<HTMLDivElement>()
const setValue = (e: MouseEvent | TouchEvent) => {
    // if (!scrolling.value) return
    
    let val: number
    let pos = main.value?.getBoundingClientRect()
    if (e.type == "touchmove")
        val = (e.touches?.[0].screenX - pos.x + width*2) / (main.value?.clientWidth - width)
    else
       val = (e.x - pos.x + width*2) / (main.value?.clientWidth - width)

    let vx100 = val*100
    let step = vx100 % props.step
    scrollerPerc.value = Math.max(width*2, Math.min(vx100 - step, 100))
    value.value = Math.round(Math.max(props.min, Math.min(val * props.max - step, props.max))*10)/10
}

const endScroll = () => {
    scrolling.value = false
    document.removeEventListener("mousemove", setValue)
}
const startScroll = () => {
    scrolling.value = true
    document.addEventListener("mousemove", setValue)
    document.addEventListener("touchmove", setValue)
    document.addEventListener("mouseup", endScroll, {once: true})
}

const addStep = () => value.value = (value.value*10 + props.step*10)/10
const subStep = () => value.value = (value.value*10 - props.step*10)/10

const base = import.meta.env.BASE_URL

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
            @keydown.left="subStep"
            @keydown.right="addStep"
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