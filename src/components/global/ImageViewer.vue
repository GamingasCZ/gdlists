<script setup lang="ts">
import type { ReviewContainer } from '@/interfaces';
import { SETTINGS } from '@/siteSettings';
import { onUnmounted, ref } from 'vue';


const props = defineProps<{
    imagesArray: ReviewContainer[]
}>()

const emit = defineEmits<{
    (e: "closePopup"): void
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
const uiShown = ref(false)
const showUI = () => {
    uiShown.value = true

    if (uiCooldown != -1) clearTimeout(uiCooldown)
    uiCooldown = setTimeout(() => {
        uiShown.value = false
        uiCooldown = -1    
    }, 1500);
}

document.body.addEventListener("keyup", keypress)
onUnmounted(() => {
    document.body.removeEventListener("keyup", keypress)
})
const imageIndex = defineModel()

const prevImage = () => imageIndex.value = Math.max(0, imageIndex.value - 1)
const nextImage = () => imageIndex.value = Math.min(imageIndex.value + 1, props.imagesArray.length - 1)


</script>

<template>
<Teleport to="body">
    <section @keyup.esc="emit('closePopup')" @click="clickClose" @mousemove="showUI" class="flex fixed inset-0 z-30 justify-center items-center p-2 text-white bg-black bg-opacity-80 backdrop-grayscale">
        <Transition name="fade">
            <div v-show="uiShown">
                <div class="flex absolute top-0 right-0 left-0 justify-between items-center p-2 px-3 bg-black bg-opacity-80 backdrop-blur-sm">
                    <h2 class="text-xl">{{ imageIndex+1 }}/{{ imagesArray.length }}</h2>
                    <button @click="emit('closePopup')" class="button"><img src="@/images/close.svg" class="w-8" alt=""></button>
                </div>
                <div class="flex absolute right-0 left-0 justify-between mx-4">
                    <button @click="prevImage()"><img src="@/images/showCommsL.svg" class="w-8 button" alt=""></button>
                    <button @click="nextImage()"><img src="@/images/showComms.svg" class="w-8 button" alt=""></button>
                </div>
            </div>
        </Transition>

        <figure>
            <img @click.stop="" class="max-h-[90vh] h-max pointer-events-none rounded-md" :src="imagesArray[imageIndex].settings.url" :alt="imagesArray[imageIndex].settings.alt">
            <figcaption class="mt-4 text-lg text-center text-white">{{ imagesArray[imageIndex].settings.alt }}</figcaption>
        </figure>

    </section>
</Teleport>
</template>