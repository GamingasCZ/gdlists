<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

const props = defineProps<{
    maxSize?: number
    minSize?: number
    gizmoPos: 'corner' | 'vertical' | 'slider'
    editable: boolean
    alwaysVisible: boolean
    currHeight?: number
}>()

const emit = defineEmits<{
    (e: "resize", newSize: number): void
}>()

const width = ref(0)
const self = ref<HTMLDivElement>()

const imageScale = ref(0)

const gizmo = ref<HTMLButtonElement>()

const mousePos = ref([0, 0])
const trackPos = (e: MouseEvent | TouchEvent) => {
    if (e?.buttons == 0) return endScale()
    
    if (e?.clientX) mousePos.value = [e.clientX, e.clientY]
    else mousePos.value = [e.touches.item(0).screenX, e.touches.item(0).screenY]
}
var scaleID
var prevSize = -1
const startScale = () => {
    document.body.addEventListener("mouseup", endScale, {once: true})
    document.body.addEventListener("mousedown", trackPos)
    document.body.addEventListener("mousemove", trackPos)

    document.body.addEventListener("touchmove", trackPos)
    document.body.addEventListener("touchend", endScale, {once: true})
    document.body.style.overflow = "clip"
    
    scaleID = setInterval(() => {
        if (!mousePos.value[0] || !mousePos.value[1]) return
        if (mousePos.value[0] + mousePos.value[1] == prevSize) return

        let rect = gizmo.value?.getBoundingClientRect()
        let mVec = [rect.x + 8, rect.y + 8]
        let drag
        if (props.gizmoPos == 'corner') {
            drag = Math.sqrt(Math.pow(mousePos.value[0], 2) + Math.pow(mousePos.value[1], 2)) - Math.sqrt(Math.pow(mVec[0], 2) + Math.pow(mVec[1], 2))
            imageScale.value = Math.min(Math.max(props.minSize ?? 96, self.value?.clientWidth + drag), props.maxSize ?? document.body.clientWidth * 0.85)
        }
        else {
            drag = mousePos.value[1] - mVec[1]
            imageScale.value = Math.min(Math.max(props.minSize ?? 96, self.value?.clientHeight + drag), props.maxSize ?? 1024)
        }

        imageScale.value = Math.ceil(imageScale.value/4)*4
        prevSize = mousePos.value[0] + mousePos.value[1]

        emit("resize", imageScale.value)
    }, 5)
}

const endScale = () => {
    document.body.style.overflow = "auto"

    document.body.removeEventListener("mousemove", trackPos)
    document.body.removeEventListener("mousedown", trackPos)
    document.body.removeEventListener("mouseup", endScale, {once: true})
    clearInterval(scaleID)
}

const autoResize = () => {
    let newSize = imageScale.value == props.maxSize ? props.minSize : props.maxSize
    imageScale.value = newSize
    emit('resize', imageScale.value)
}

const perc = computed(() => {
    let curr = props.currHeight ?? 1
    let min = props.minSize ?? 1
    let max = props.maxSize ?? 1
    let ratio = (curr - min) / (max - min)
    return `${Math.floor(ratio*100)}%`
})

</script>

<template>
    <div ref="self" class="relative rounded-lg group" :class="{'border-2 border-transparent group-hover:!border-blue-400 h-full': editable, 'border-blue-400': alwaysVisible}">
        <slot :width="width" />
        
        <button v-if="editable && gizmoPos != 'slider'" tabindex="-1" ref="gizmo" @mousedown.left="startScale" @auxclick="autoResize" @touchstart="startScale" class="isolate absolute -right-3 -bottom-3 z-20 w-6 h-6 bg-white rounded-full scale-0 group-hover:scale-100"
        :class="{'-right-1': gizmoPos == 'corner', 'left-1/2': gizmoPos == 'vertical'}"
        ></button>
        <input v-else-if="editable" @input="emit('resize', $event.target.value)" tabindex="-1" :value="currHeight" type="range" :min="minSize ?? 96" :max="maxSize ?? 1024" id="resizerSlider" class="absolute -top-3 w-full bg-transparent appearance-none group-hover:visible">
    </div>
</template>

<style>
#resizerSlider::-webkit-slider-thumb {
  @apply border-black bg-blue-100 p-2 w-7 h-7 -translate-y-2.5 border-2 border-solid appearance-none rounded-full
}
#resizerSlider::-moz-range-thumb {
  @apply border-black scale-125 bg-blue-100 rounded-full
}

#resizerSlider::-webkit-slider-runnable-track {
  @apply border-2 border-blue-400 border-solid h-3 translate-y-2 rounded-full;
  --range: v-bind(perc);
  background: linear-gradient(90deg, #61A3F6 var(--range),black var(--range))
}
#resizerSlider::-moz-range-track {
  @apply bg-black border-2 border-blue-400 border-solid h-2 rounded-full
}
#resizerSlider::-moz-range-progress {
  @apply bg-blue-400 h-2 rounded-full
}
</style>