<script setup lang="ts">
import { onMounted, ref } from 'vue';

const props = defineProps<{
    maxSize?: number
    minSize?: number
    gizmoPos: 'corner' | 'vertical'
    editable: boolean
    alwaysVisible: boolean
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
            imageScale.value = Math.min(Math.max(props.minSize ?? 96, Math.ceil(self.value?.clientHeight/10)*10 + drag), props.maxSize ?? 1024)
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

</script>

<template>
    <div ref="self" class="relative group" :class="{'p-1 border-2 border-transparent group-hover:!border-blue-400 h-full': editable, 'border-blue-400': alwaysVisible}">
        <slot :width="width" />
        
        <button v-if="editable" ref="gizmo" @mousedown="startScale" @touchstart="startScale" class="isolate absolute -bottom-1.5 w-4 h-4 bg-white rounded-full scale-0 group-hover:scale-100"
        :class="{'-right-1': gizmoPos == 'corner', 'left-1/2': gizmoPos == 'vertical'}"
        ></button>
    </div>
</template>