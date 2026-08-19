<script setup lang="ts">
import type { Stop } from '@/interfaces';
import chroma from 'chroma-js';
import { computed, ref } from 'vue';


const props = defineProps<{
    gradient: Stop[]
}>()

const emit = defineEmits<{
    (e: "addedStop", pos: number): void
    (e: "movedStop", stop: {ind: number, newPos: number})
}>()

const gradientCSS = computed(() => {
    return `linear-gradient(180deg, ${props.gradient.map(x => chroma.hsl(...x.color).hex()+` ${x.position*100}%`).join(",")})`
})

const gradElement = ref<HTMLDivElement>()
const dragging = ref(-1)
const startDragging = (ind: number) => {
    dragging.value = ind
    document.body.addEventListener("mouseup", stopDrag, {once: true})
    document.body.addEventListener("mousemove", moveDragger)
    // document.body.addEventListener("mouseleave", stopDrag, {once: true})
}

const moveDragger = (e: MouseEvent) => {
    if (!gradElement.value) return
    let rect = gradElement.value.getBoundingClientRect()
    let gradTop = rect.top
    let draggerTop = Math.max(0, Math.min(1, (e.pageY-gradTop)/rect.height))
    emit('movedStop', {ind: dragging.value, newPos: draggerTop})
}

const stopDrag = () => {
    dragging.value = -1
    document.body.removeEventListener("mousemove", moveDragger)
}

</script>

<template>
<div ref="gradElement" class="relative my-4 w-20 rounded-md border-2 border-black ring-2 ring-white" :style="{background: gradientCSS}">
    <button
        v-for="(stop, ind) in gradient"
        @mousedown="startDragging(ind)"
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