<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
    min: number
    max: number
    step: number
}>()

const width = 2

const value = defineModel("value", {default: 5})
const scrolling = ref(false)

const scrollerPerc = ref(value.value)
const main = ref<HTMLDivElement>()
const setValue = (e: MouseEvent) => {
    if (!scrolling.value) return
    
    let pos = main.value?.getBoundingClientRect()
    let val = (e.x - pos.x) / main.value?.clientWidth
    let vx100 = val*100
    let step = vx100 % props.step
    scrollerPerc.value = Math.max(0, Math.min(vx100 - step, 100))
    value.value = Math.max(props.min, Math.min(Math.trunc((val * props.max - step)*10)/10, props.max))
}

const endScroll = () => {
    scrolling.value = false
    document.removeEventListener("mousemove", setValue)
}
const startScroll = () => {
    scrolling.value = true
    document.addEventListener("mousemove", setValue)
    document.addEventListener("mouseup", endScroll, {once: true})
}

</script>

<template>
    <div ref="main" role="slider" :aria-valuenow="value" :aria-valuemin="min" :aria-valuemax="max" class="flex relative w-full rounded-full border-2 border-white">
        <div class="absolute top-0 bottom-0 left-0 bg-black rounded-l-full" :style="{width: `calc(${scrollerPerc}% - ${width/2}rem)`}"></div>
        <button
            :style="{width: `${width}rem`, height: `${width}rem`, marginLeft: `calc(${scrollerPerc}% - ${width}rem)`}"
            @mousedown="startScroll"
            @touchstart="scrolling = true"
            @touchend="scrolling = false"
            @keydown.left="value -= step"
            @keydown.right="value += step"
            class="bg-white rounded-full button"
        ></button>
    </div>
</template>