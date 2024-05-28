<script setup lang="ts">
import { onMounted, ref } from 'vue';

const props = defineProps<{
    maxSize?: number
    minSize?: number
    gizmoPos: 'corner' | 'vertical'
    editable: boolean
}>()

const emit = defineEmits<{
    (e: "resize", newSize: number): void
}>()

const width = ref(0)
const self = ref<HTMLDivElement>()

const imageScale = ref(0)

const gizmo = ref<HTMLButtonElement>()

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
        let drag
        if (props.gizmoPos == 'corner')
            drag = Math.sqrt(Math.pow(mousePos.value[0], 2) + Math.pow(mousePos.value[1], 2)) - Math.sqrt(Math.pow(mVec[0], 2) + Math.pow(mVec[1], 2))
        else
            drag = mousePos.value[1] + mVec.value[1]

        imageScale.value = Math.min(Math.max(props.minSize ?? 96, self.value?.clientHeight + drag), props.maxSize ?? document.body.clientWidth * 0.85)
        emit("resize", imageScale.value)
    }, 20)
}

const endScale = () => {
    document.body.removeEventListener("mousemove", trackPos)
    clearInterval(scaleID)
}

</script>

<template>
    <div ref="self" class="relative group">
        <div :class="{'p-1 border-2 border-transparent group-hover:border-blue-400': editable}">
            <slot :width="width" />
        </div>
        <button v-if="editable" ref="gizmo" @mousedown="startScale" class="isolate absolute -bottom-1.5 w-4 h-4 bg-white rounded-full scale-0 group-hover:scale-100"
        :class="{'-right-1': gizmoPos == 'corner', 'left-1/2': gizmoPos == 'vertical'}"
        ></button>
    </div>
</template>