<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue';


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
const scaling = ref(false)

const mousePos = ref([0, 0])
const trackPos = (e: MouseEvent) => mousePos.value = [e.clientX, e.clientY]
var scaleID
const startScale = () => {
    document.body.addEventListener("mouseup", endScale, {once: true})
    document.body.addEventListener("mousemove", trackPos)
    
    nextTick(() => {
        scaleID = setInterval(() => {
            let rect = gizmo.value?.getBoundingClientRect()
            let mVec = [rect.x + 8, rect.y + 8]
            imageScale.value = Math.min(Math.max(96, imageScale.value + mousePos.value[0] - mVec[0]), document.body.clientWidth * 0.85)
        }, 20)
    })
}

const endScale = () => {
    document.body.removeEventListener("mousemove", trackPos)
    clearInterval(scaleID)
}

</script>

<template>
    <div class="mx-auto my-2 w-max max-w-full overflow-clip min-h-20">
        <button v-show="imageLoading != 0" @click="emit('openSettings')" class="flex w-[30rem] m-2 flex-col items-center p-2 text-xl text-center rounded-md bg-lof-300">
            <div v-if="imageLoading == -2">
                <img :src="`${BASE_URL}/formatting/showImage.svg`" class="p-2 mx-auto w-24 opacity-10" alt="">
                <h2>{{ $t('reviews.clickImgSet') }}</h2>
            </div>
            <div v-if="imageLoading == 1">
                <img src="@/images/loading.webp" class="p-2 mx-auto w-24 opacity-10 animate-spin" alt="">
                <h2>{{ $t('other.loading') }}...</h2>
            </div>
            <div v-if="imageLoading == -1">
                <img src="@/images/close.svg" class="p-2 mx-auto w-24 opacity-10" alt="">
                <h2>{{ $t('reviews.imgError') }}</h2>
            </div>
        </button>
        <figure v-show="imageLoading == 0">
            <div class="flex relative group max-w-[85vw]" :style="{width: `${imageScale}px`}">
                <img
                    ref="image"
                    class="w-full rounded-md border-2 border-transparent pointer-events-none min-w-24 group-hover:border-blue-400"
                    :src="settings.url"
                    :alt="settings.alt"
                    :title="settings.alt"
                >
                <button ref="gizmo" @mousedown="startScale" class="absolute -right-1 -bottom-1 w-4 h-4 bg-white rounded-full scale-0 group-hover:scale-100"></button>
            </div>
            <figcaption>{{ settings.description }}</figcaption>
        </figure>
    </div>
</template>