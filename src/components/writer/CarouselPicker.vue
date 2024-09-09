<script setup lang="ts">
import { inject, ref } from "vue";

const props = defineProps<{
    index: number
}>()

const emit = defineEmits<{
    (e: "save", duplicate: boolean): void
}>()

const carouselData = ref([])
const base = import.meta.env.BASE_URL

const openDialogs = inject("openedDialogs")
const openGallery = () => {
    openDialogs.imagePicker = [true, props.index]
}

const addContent = () => {

}

</script>

<template>
    <div class="grid grid-cols-2 gap-1 p-1">
        <button @click="openGallery" class="flex gap-2 p-1 pl-2 bg-black bg-opacity-40 rounded-md disabled:opacity-20"><img :src="`${base}/formatting/showImage.svg`" class="w-4" alt="">Přidat obrázek</button>
        <button @click="addContent" class="flex gap-2 p-1 pl-2 bg-black bg-opacity-40 rounded-md disabled:opacity-20"><img :src="`${base}/formatting/addVideo.svg`" class="w-4" alt="">Přidat video</button>
    </div>

    <div
        class="bg-[url(@/images/fade.webp)] bg-repeat-x h-[40rem] relative p-1 overflow-y-auto flex flex-col gap-1 overflow-x-clip">

        <!-- Help -->
        <div v-if="!Object.keys(carouselData).length" class="flex absolute top-1/2 left-1/2 flex-col gap-3 items-center w-3/4 text-center opacity-20 -translate-x-1/2 -translate-y-1/2">
            <img src="@/images/image.svg" alt="" class="w-48">
            <h2 class="text-2xl">Zatím jsi nic nepřidal...</h2>
            <p class="">Můžeš sem přetáhnout obrázky a YouTube odkazy.</p>
            <p class="">Obrázky či odkazy ve schránce můžeš vložit pomocí CTRL+V.</p>
        </div>

        <div v-for="(media, key) in carouselData" class="w-full bg-black bg-opacity-40 rounded-md transition-transform">
            <div class="flex flex-col justify-between p-2">
            </div>
        </div>
    </div>
</template>
