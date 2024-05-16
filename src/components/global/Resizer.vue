<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
    defaultSize: number
    maxSize: number
    gizmoPos: 'corner' | 'vertical'
    editable: boolean
}>()

const emit = defineEmits<{
    (e: "resize", newSize: number): void
}>()

const width = ref(0)

const image = ref<HTMLImageElement>()
const imageScale = ref(0)
const gizmo = ref<HTMLButtonElement>()
const imageLoading = ref(-2)

const mousePos = ref([0, 0])
const trackPos = (e: MouseEvent) => mousePos.value = [e.clientX, e.clientY]
var scaleID
const startScale = () => {
    document.body.addEventListener("mouseup", endScale, {once: true})
    document.body.addEventListener("mousedown", trackPos)
    document.body.addEventListener("mousemove", trackPos)
    
    scaleID = setInterval(() => {
        if (!mousePos.value[0] || !mousePos.value[1]) return
        let rect = gizmo.value?.getBoundingClientRect()
        let mVec = [rect.x + 8, rect.y + 8]
        let drag = Math.sqrt(Math.pow(mousePos.value[0], 2) + Math.pow(mousePos.value[1], 2)) - Math.sqrt(Math.pow(mVec[0], 2) + Math.pow(mVec[1], 2))
        imageScale.value = Math.min(Math.max(96, imageScale.value + drag), document.body.clientWidth * 0.85)
        emit("resize", imageScale.value)
    }, 20)
}

const endScale = () => {
    document.body.removeEventListener("mousemove", trackPos)
    clearInterval(scaleID)
}

</script>

<template>
    <div class="relative group">
        <div class="p-1 border-2 border-transparent group-hover:border-blue-400">
            <slot :width="width" />
        </div>
        <button ref="gizmo" @mousedown="startScale" class="isolate absolute -right-1 -bottom-1 w-4 h-4 bg-white rounded-full scale-0 group-hover:scale-100"></button>
    </div>
</template>