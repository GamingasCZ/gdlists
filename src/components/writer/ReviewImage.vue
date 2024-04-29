<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue';
import ContainerHelp from './ContainerHelp.vue';
import { computed } from 'vue';
import { inject } from 'vue';
import { watch } from 'vue';


const emit = defineEmits<{
    (e: 'openSettings'): void
    (e: 'clearButton'): void
}>()

const props = defineProps<{
    settings: object
    index: number
    buttonState: string
    editable: boolean
}>()

const image = ref<HTMLImageElement>()
const imageScale = ref(0)
const gizmo = ref<HTMLButtonElement>()
const imageLoading = ref(-2)

onMounted(() => {
    image.value?.addEventListener("loadstart", () => imageLoading.value = 1)
    image.value?.addEventListener("load", () => {
        imageLoading.value = 0;

        // Default - image width, overriden by epic dasher set width :)
        imageScale.value = props.settings.width || Math.min(image.value?.width, document.body.clientWidth * 0.4)

    })
    image.value?.addEventListener("error", () => {
        if (imageLoading.value != -2) imageLoading.value = -1
    })
})

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
        props.settings.width = imageScale.value
    }, 20)
}

const endScale = () => {
    document.body.removeEventListener("mousemove", trackPos)
    clearInterval(scaleID)
}

const text = computed(() => {
    switch (imageLoading.value) {
        case -2: return 0;
        case 1: return 1;
        case -1: return 2;
    }  
})

watch(props, () => {
    switch (props.buttonState) {
        case "pick":
            dialogs.imagePicker = [true, props.index]
            break;
    }
    emit("clearButton")
})

const dialogs = inject("openedDialogs")

</script>

<template>
    <ContainerHelp v-show="imageLoading != 0 && editable" icon="showImage" :help-content="['', $t('other.loading'), $t('reviews.imgError')][text]" >
        <button @click="dialogs.imagePicker = [true, index]" class="flex gap-2 items-center p-2 mx-auto bg-black bg-opacity-40 rounded-md button">
            <img src="@/images/browseMobHeader.svg" alt="" class="w-8">
            <span>{{ $t('reviews.pickImage') }}</span>
        </button>
    </ContainerHelp>

    <figure v-show="imageLoading == 0">
        <div class="flex relative group min-h-[64px] max-w-[85vw]" :style="{width: `${imageScale}px`}">
            <img
                ref="image"
                class="w-full rounded-md border-transparent pointer-events-none min-w-24"
                :class="{'group-hover:border-blue-400 border-2': editable}"
                :src="settings.url"
                :alt="settings.alt"
                :title="settings.alt"
            >
            <button ref="gizmo" @mousedown="startScale" v-if="editable" class="isolate absolute -right-1 -bottom-1 w-4 h-4 bg-white rounded-full scale-0 group-hover:scale-100"></button>
        </div>
        <figcaption>{{ settings.description }}</figcaption>
    </figure>
</template>