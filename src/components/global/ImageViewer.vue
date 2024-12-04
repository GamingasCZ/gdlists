<script setup lang="ts">
import type { ReviewContainer } from '@/interfaces';
import { SETTINGS } from '@/siteSettings';
import { onMounted, onUnmounted, ref } from 'vue';


const props = defineProps<{
    imagesArray?: ReviewContainer[]
    hashArray?: string[]
    urlArray?: string[]
    uid?: string
}>()

const emit = defineEmits<{
    (e: "closePopup"): void
    (e: "remove"): void
    (e: "download"): void
}>()

const clickClose = () => {
    if (SETTINGS.value.dialogClickClose)
        emit('closePopup')
}
const keypress = (e: KeyboardEvent) => {
    if (e.key == "Escape")
        emit('closePopup')
    if (e.key == "ArrowLeft")
        prevImage()
    if (e.key == "ArrowRight")
        nextImage()
}

let uiCooldown = -1
let hoveringOverUI = false
const startCooldown = () => {
    if (uiCooldown != -1) clearTimeout(uiCooldown)
    hoveringOverUI = false
    uiCooldown = setTimeout(() => {
        uiShown.value = false
        uiCooldown = -1    
    }, 1500);
}
const stopCooldown = () => {
    clearTimeout(uiCooldown)
    hoveringOverUI = true
    uiCooldown = -1
    uiShown.value = true
}


const uiShown = ref(false)
const showUI = () => {
    uiShown.value = true
    if (hoveringOverUI) return

    startCooldown()
}


document.body.addEventListener("keyup", keypress)

onMounted(() => {
    document.body.style.overflow = "clip"
})
onUnmounted(() => {
    document.body.removeEventListener("keyup", keypress)
    document.body.style.overflow = "auto"
})
const imageIndex = defineModel()

const prevImage = () => imageIndex.value = Math.max(0, imageIndex.value - 1)
const nextImage = () => imageIndex.value = Math.min(imageIndex.value + 1, (props.imagesArray ?? props.hashArray ?? props.urlArray ?? []).length - 1)

const imgOffset = ref(0)
let lastDragX = -1
let dragDisabled = false
const swipe = (e: TouchEvent) => {
    if (dragDisabled) return
    if (lastDragX == -1) {
        lastDragX = e.touches?.item(0)?.screenX
        return
    }
    imgOffset.value = Math.min(Math.max(-100, imgOffset.value + (e.touches?.item(0)?.screenX - lastDragX)), 100)
    if (imgOffset.value == -100) {
        nextImage()
        stopDrag()
    }
    if (imgOffset.value == 100) {
        prevImage()
        stopDrag()
    }
    lastDragX = e.touches?.item(0)?.screenX
}

const stopDrag = () => {
    dragDisabled = true
    imgOffset.value = 0
    lastDragX = -1
}

const base = import.meta.env.VITE_USERCONTENT

</script>

<template>
<Teleport to="body">
    <section @keyup.esc="emit('closePopup')" @click="clickClose" @mousemove="showUI" class="flex fixed inset-0 z-30 justify-center items-center p-2 text-white bg-black bg-opacity-80 backdrop-grayscale">
        <Transition name="fade">
            <div v-show="uiShown">
                <div class="flex absolute top-0 right-0 left-0 z-10 justify-between items-center p-2 px-3 bg-black bg-opacity-80 backdrop-blur-sm">
                    <h2 class="text-xl">{{ imageIndex+1 }}/{{ (imagesArray ?? hashArray ?? urlArray ?? []).length }}</h2>
                    <div class="flex gap-2">
                        <button v-if="uid && urlArray" @click="emit('download')" class="button"><img src="@/images/link.svg" class="inline mr-1 w-6" alt="">{{ $t('other.link') }}</button>
                        <button v-else-if="uid" @click="emit('download')" class="button"><img src="@/images/copy.svg" class="inline mr-1 w-6" alt="">{{ $t('other.download') }}</button>
                        <button v-if="uid" @click="emit('remove')" class="button"><img src="@/images/trash.svg" class="inline mr-1 w-6" alt="">{{ $t('editor.remove') }}</button>
                        <button v-if="uid" @click="emit('move')" class="mr-3 button"><img src="@/images/move.svg" class="inline mr-1 w-6" alt="">{{ $t('other.move') }}</button>
                        <button @click="emit('closePopup')" class="button"><img src="@/images/close.svg" class="w-8" alt=""></button>
                    </div>
                </div>
                <div class="flex absolute top-0 right-0 left-0 justify-between items-start mx-4 max-sm:hidden">
                    <button @mouseenter="stopCooldown" @mouseleave="startCooldown" class="h-screen" @click.stop="prevImage()"><img src="@/images/showCommsL.svg" class="w-8 button" alt=""></button>
                    <button @mouseenter="stopCooldown" @mouseleave="startCooldown" class="h-screen" @click.stop="nextImage()"><img src="@/images/showComms.svg" class="w-8 button" alt=""></button>
                </div>
            </div>
        </Transition>

        <figure @touchmove="swipe" @touchend="stopDrag" @touchstart="dragDisabled = false">
            <img v-if="imagesArray" @click.stop="" :style="{transform: `translateX(${imgOffset}px)`}" class="max-h-[90vh] transition-transform h-max pointer-events-none rounded-md" :src="imagesArray[imageIndex].settings.url" :alt="imagesArray[imageIndex].settings.alt">
            <img v-else-if="hashArray" @click.stop="" :style="{transform: `translateX(${imgOffset}px)`}" class="max-h-[90vh] transition-transform h-max pointer-events-none rounded-md" :src="`${base}/userContent/${uid}/${hashArray[imageIndex]}.webp`" :alt="hashArray[imageIndex]">
            <img v-else-if="urlArray" @click.stop="" :style="{transform: `translateX(${imgOffset}px)`}" class="max-h-[90vh] transition-transform h-max pointer-events-none rounded-md" :src="urlArray[imageIndex]" :alt="urlArray[imageIndex]">

            <figcaption v-if="imagesArray" class="mt-4 text-lg text-center text-white">{{ imagesArray[imageIndex].settings.alt }}</figcaption>
        </figure>

    </section>
</Teleport>
</template>