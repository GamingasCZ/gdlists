<script setup lang="ts">
import type { Stop } from '@/interfaces';
import chroma, { type Color } from 'chroma-js';
import { computed, ref } from 'vue';


const props = defineProps<{
    gradient: Stop[]
}>()

const emit = defineEmits<{
    (e: "openColor", ind: number): void
    (e: "madeChanges"): void
}>()

const gradientCSS = computed(() => {
    return `linear-gradient(180deg, ${props.gradient.map(x => chroma.hsv(...x.color).hex()+` ${x.position*100}%`).join(",")})`
})

const gradElementInner = ref<HTMLDivElement>()
const dragging = ref<Stop | null>(null)
const startDragging = (ind: Stop) => {
    dragging.value = ind
    document.body.addEventListener("mouseup", stopDrag, {once: true})
    document.body.addEventListener("mousemove", moveDragger)
    emit('openColor', props.gradient.indexOf(ind))
    // document.body.addEventListener("mouseleave", stopDrag, {once: true})
}

const getDistFromTop = (y: number) => {
    if (!gradElementInner.value) return 0
    let rect = gradElementInner.value.getBoundingClientRect()
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
    emit('madeChanges')
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

    props.gradient.push({position: stopTop, color: null})
    props.gradient.sort((a,b) => a.position - b.position)
    let newInd = props.gradient.findIndex(x => x.color == null)
    let lower = Math.max(0, newInd-1)
    if (newInd == lower) lower++
    let higher = Math.min(props.gradient.length-1, newInd+1)
    if (newInd == higher) higher--

    let newCol: [number, number, number]
    if (lower == higher) // happens when creating stop before first, or after last
        newCol = JSON.parse(JSON.stringify(props.gradient[lower].color))
    else
        newCol = chroma.mix(chroma.hsv(...props.gradient[lower].color), chroma.hsv(...props.gradient[higher].color), stopTop, 'rgb').hsv()
    props.gradient[newInd].color = newCol

    emit('madeChanges')
    emit('openColor', newInd)
}

const reverseGradient = () => {
    let colors = props.gradient.map(x => x.color).reverse()
    let i = 0
    for (const el of props.gradient) {
        el.color = colors[i]
        i++
    }
    emit('madeChanges')

}

const stopPreviewerY = ref("0%")
const moveStopPreview = (e: MouseEvent) => {
    stopPreviewerY.value = `${getDistFromTop(e.pageY)*100}%`
}

const randomize = () => {
    props.gradient.forEach(x => x.color = chroma.random().hsv())
    emit('madeChanges')
}

defineExpose({
    addStop,
    reverseGradient,
    randomize
})

</script>

<template>
<div ref="gradElement" class="relative my-4 ml-8 w-32">
    <div @click="addStop" ref="gradElementInner" @mousemove="moveStopPreview" class="h-full rounded-md border-2 border-black ring-2 ring-white group" :style="{background: gradientCSS}">
        <!-- Previewer -->
        <div v-if="gradient.length < 10" class="absolute -left-0.5 w-full h-2 bg-transparent border-2 border-black ring-4 ring-white opacity-0 transition-opacity duration-75 translate-x-0.5 -translate-y-1 group-hover:opacity-100" :style="{top: stopPreviewerY}">
        </div>
    </div>

    <button
        v-for="(stop, ind) in gradient"
        @mousedown="startDragging(stop)"
        @click="emit('openColor', ind)"
        :style="{top: `${stop.position*100}%`}"
        class="absolute -right-10 p-1 pl-6 bg-white rounded-md -translate-y-3.5 cursor-move stopCutout"
    >
        <div :key="stop.position" class="w-5 rounded-full aspect-square button" :style="{background: chroma.hsv(...stop.color).hex()}"></div>
    </button>
</div>


</template>

<style>

.stopCutout {
    clip-path: polygon(33.33% 100%, 100% 100%, 100% 0%, 33.33% 0%, 0% 50%);
}

</style>