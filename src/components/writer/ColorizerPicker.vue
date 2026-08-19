<script setup lang="ts">
import type { Stop } from '@/interfaces';
import chroma from 'chroma-js';
import { computed, ref } from 'vue';


const props = defineProps<{
    gradient: Stop[]
}>()

const emit = defineEmits<{
    (e: "addedStop", pos: number): void
}>()

const gradientCSS = computed(() => {
    return `linear-gradient(180deg, ${props.gradient.map(x => chroma.hsl(...x.color).hex()+` ${x.position*100}%`).join(",")})`
})

const gradElement = ref<HTMLDivElement>()
const dragging = ref<Stop | null>(null)
const startDragging = (ind: Stop) => {
    dragging.value = ind
    document.body.addEventListener("mouseup", stopDrag, {once: true})
    document.body.addEventListener("mousemove", moveDragger)
    // document.body.addEventListener("mouseleave", stopDrag, {once: true})
}

const getDistFromTop = (y: number) => {
    if (!gradElement.value) return 0
    let rect = gradElement.value.getBoundingClientRect()
    return Math.max(0, Math.min(1, (y-rect.top)/rect.height))
}

const moveDragger = (e: MouseEvent) => {
    if (!dragging.value) return
    let draggerTop = getDistFromTop(e.pageY)
    dragging.value.position = draggerTop;
    props.gradient.sort((a,b) => a.position - b.position)
}

const stopDrag = () => {
    dragging.value = null
    document.body.removeEventListener("mousemove", moveDragger)
}

const addStop = (e?: MouseEvent) => {
    if (props.gradient.length >= 10) return
    let stopTop: number;
    if (e)
        stopTop = getDistFromTop(e.pageY)
    else {
        let sLen = props.gradient.length
        if (sLen >= 2)
            stopTop = (props.gradient[sLen-2].position+props.gradient[sLen-1].position)/2
        else
            stopTop = 1-Math.round(sLen)
    }

    props.gradient.push({position: stopTop, color: chroma.random().hsl()})
    props.gradient.sort((a,b) => a.position - b.position)
}

const reverseGradient = () => {
    let colors = props.gradient.map(x => x.color).reverse()
    let i = 0
    for (const el of props.gradient) {
        el.color = colors[i]
        i++
    }

}

const stopPreviewerY = ref("0%")
const moveStopPreview = (e: MouseEvent) => {
    stopPreviewerY.value = `${getDistFromTop(e.pageY)*100}%`
}

defineExpose({
    addStop,
    reverseGradient
})

</script>

<template>
<div class="relative my-4 ml-8 w-32">
    <div ref="gradElement" @click="addStop" @mousemove="moveStopPreview" class="h-full rounded-md border-2 border-black ring-2 ring-white group" :style="{background: gradientCSS}">
        <!-- Previewer -->
        <div v-if="gradient.length < 10" class="absolute -left-0.5 w-full h-2 bg-transparent border-2 border-black ring-4 ring-white opacity-0 transition-opacity duration-75 -translate-y-1 group-hover:opacity-100" :style="{top: stopPreviewerY}">
        </div>
    </div>

    <button
        v-for="(stop, ind) in gradient"
        @mousedown="startDragging(stop)"
        :style="{top: `${stop.position*100}%`}"
        class="absolute -right-10 p-1 pl-6 bg-white rounded-md -translate-y-3.5 cursor-move stopCutout"
    >
        <div :key="stop.position" class="w-5 rounded-full aspect-square button" :style="{background: chroma.hsl(...stop.color).hex()}"></div>
    </button>
</div>


</template>

<style>

.stopCutout {
    clip-path: polygon(33.33% 100%, 100% 100%, 100% 0%, 33.33% 0%, 0% 50%);
}

</style>