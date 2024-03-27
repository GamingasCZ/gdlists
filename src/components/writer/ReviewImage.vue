<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue';
import ContainerHelp from './ContainerHelp.vue';
import { computed } from 'vue';


const emit = defineEmits<{
    (e: 'openSettings'): void
}>()

defineProps<{
    settings: object
}>()

const image = ref<HTMLImageElement>()
const imageScale = ref(0)
const gizmo = ref<HTMLButtonElement>()
const imageLoading = ref(-2)

onMounted(() => {
    image.value?.addEventListener("loadstart", () => imageLoading.value = 1)
    image.value?.addEventListener("load", () => {
        imageLoading.value = 0;
        imageScale.value = Math.min(image.value?.width, document.body.clientWidth * 0.4)
    })
    image.value?.addEventListener("error", () => {
        if (imageLoading.value != -2) imageLoading.value = -1
    })
})

const BASE_URL = import.meta.env.BASE_URL

const mousePos = ref([0, 0])
const trackPos = (e: MouseEvent) => mousePos.value = [e.clientX, e.clientY]
var scaleID
const startScale = () => {
    document.body.addEventListener("mouseup", endScale, {once: true})
    document.body.addEventListener("mousemove", trackPos)
    
    if (!mousePos.value) return
    scaleID = setInterval(() => {
        let rect = gizmo.value?.getBoundingClientRect()
        let mVec = [rect.x + 8, rect.y + 8]
        imageScale.value = Math.min(Math.max(96, imageScale.value + mousePos.value[0] - mVec[0]), document.body.clientWidth * 0.85)
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

</script>

<template>
    <div class="mx-auto my-2 w-max max-w-full overflow-clip min-h-20">
        <ContainerHelp v-show="imageLoading != 0" icon="showImage" :help-content="[$t('reviews.clickImgSet'), $t('other.loading'), $t('reviews.imgError')][text]" />

        <figure v-show="imageLoading == 0">
            <div class="flex relative group max-w-[85vw]" :style="{width: `${imageScale}px`}">
                <img
                    ref="image"
                    class="w-full rounded-md border-2 border-transparent pointer-events-none min-w-24 group-hover:border-blue-400"
                    :src="settings.url"
                    :alt="settings.alt"
                    :title="settings.alt"
                >
                <button ref="gizmo" @mousedown="startScale" class="isolate absolute -right-1 -bottom-1 w-4 h-4 bg-white rounded-full scale-0 group-hover:scale-100"></button>
            </div>
            <figcaption>{{ settings.description }}</figcaption>
        </figure>
    </div>
</template>