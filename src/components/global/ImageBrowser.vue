<script setup lang="ts">
import { ref } from "vue";
import TabBar from "../ui/TabBar.vue";
import { computed } from "vue";
import axios from "axios";
import type { ImageStorage } from "@/interfaces";

const toMB = (val: number) => Math.round(val/100_00) / 100
const currentTab = ref(0)
const storageInUse = computed(() => (storage.value.left/storage.value.storageMax) * 100)
const pre = import.meta.env.VITE_API
const imageInput = ref<HTMLInputElement>()
const fileDrag = ref(false)

const emit = defineEmits<{
    (e: "pickImage", url: string): void
    (e: "closePopup"): void
}>()

const storage = ref<ImageStorage>({
    uid: "0",
    filecount: 0,
    left: 1,
    maxUploadSize: 2,
    storageMax: 2,
    maxFilecount: 2
})
axios.get(import.meta.env.VITE_API + "/images.php?storage").then(res => {
    storage.value = res.data

    // Fetch images
    if (storage.value.filecount > 0) refreshContent()
    else loadingImages.value = false
})

const uploadImage = async (e: Event | FileList, fileList?: boolean) => {
    if (loadingImages.value) return
    
    let file
    if (!fileList)
        file = imageInput.value?.files?.[0]
    else
        file = e[0]

    if (file?.size > storage.value.maxUploadSize) {
        alert("moc vellký vole")
    }
    else if (file?.size > storage.value.left) {
        alert("moc vellký vole")
    }
    else {
        let data = await file?.arrayBuffer()
        axios({
            method: 'post',
            url: import.meta.env.VITE_API + "/images.php",
            data: data,
            maxBodyLength: Infinity,
            maxContentLength: Infinity
        }).then(() => refreshContent())
    }
}

const loadingImages = ref(true)
const images = ref<string[]>([])
const refreshContent = () => {
    loadingImages.value = true
    axios.get(import.meta.env.VITE_API + "/images.php").then(res => {
        images.value = res.data[1]
        storage.value = res.data[0]
        loadingImages.value = false
    })
}

const dragInImage = (e: DragEvent) => {
    fileDrag.value = false
    let files = e.dataTransfer?.files
    uploadImage(files, true)
}


</script>

<template>
    <div class="flex gap-10 justify-between mx-2 mb-2">
        <input v-if="currentTab == 1" :placeholder="'Zadej URL obrázku'" class="p-1 w-full bg-white bg-opacity-20 rounded-md">
        <button v-else @click="imageInput?.click()" class="flex gap-2 items-center p-1 px-2 bg-black bg-opacity-40 rounded-md button">
            <img src="@/images/copy.svg" alt="" class="w-6">
            <span>{{ $t('editor.uploadFile') }}</span>
        </button>
        
        <div class="flex flex-col">
            <div class="flex justify-between">
                <label for="storageLeft">{{ $t('other.storage') }}</label>
                <span>{{ toMB(storage.left) }}/{{ toMB(storage.storageMax) }}MB</span>
            </div>
            <div class="w-40 h-2 overflow-clip bg-black bg-opacity-40 rounded-full">
                <div :style="{width: `${storageInUse}%`}" class="h-full bg-lof-400"></div>
            </div>
        </div>
    </div>
    <TabBar :tab-names="[$t('homepage.uploaded'), $t('other.external')]" @switched-tab="currentTab = $event" />
    <form action="." method="post" @dragover.prevent="fileDrag = true" @drop.prevent="dragInImage" @dragexit="fileDrag = false" @submit.prevent="" class="h-[40rem] relative bg-[url(@/images/fade.webp)] bg-repeat-x">
        <input @change="uploadImage" ref="imageInput" type="file" class="absolute w-full h-full opacity-0 pointer-events-none">
        
        <!-- Images -->
        <div class="flex flex-wrap gap-4 justify-evenly m-4">
            <button 
                v-for="image in images"
                @click="emit('pickImage', `${pre}/userContent/${storage.uid}/${image}-thumb.webp`); emit('closePopup')"
                class="relative h-20 bg-center rounded-md border-2 transition-all cursor-pointer shadow-drop hover:scale-125 min-w-5 hover:bg-black hover:bg-opacity-80 hover:z-10 border-lof-400"
                :class="{'bg-white bg-opacity-20 group bg-[url(@/images/trash.svg)] bg-[length:2rem] bg-no-repeat': false}"
            >
                <button class="absolute top-1 right-1 overflow-clip bg-white rounded-full opacity-0 transition-opacity duration-75 button group-hover:opacity-100"><img src="@/images/more.svg" class="p-1 invert"></button>
                <img :src="`${pre}/userContent/${storage.uid}/${image}-thumb.webp`" alt="" class="object-cover w-full h-full aspect-auto -z-10">
            </button>
        </div>

        <!-- Help -->
        <div v-if="!images.length" class="absolute top-1/2 left-1/2 text-center opacity-40 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div v-if="loadingImages" class="w-max">
                <img src="@/images/loading.webp" class="mb-2 w-32 animate-spin" alt="">
                <h2 class="text-xl">Načítání...</h2>
            </div>
            <div v-else-if="currentTab == 0 && !fileDrag" class="w-max">
                <img src="@/images/collabDudes.svg" class="mb-2 w-96" alt="">
                <h2 class="text-xl">Sem můžeš přetáhnout obrázky!</h2>
                <p>Max. velikost souboru {{ toMB(storage.maxUploadSize) }}MB</p>
                <p>Formáty: .jpg, .png, .webp</p>
            </div>
            <div v-else-if="currentTab == 0 && fileDrag" class="w-max">
                <img src="@/images/collabDudes.svg" class="mb-2 w-96" alt="">
                <h2 class="text-xl">Upusť soubor sem!</h2>
            </div>
            <div v-else class="w-max">
                <img src="@/images/searchOpaque.svg" class="mx-auto mb-2 w-32" alt="">
                <h2 class="text-xl">Přidej obrázek polem nahoře!</h2>
                <p>URL obrázku většinou končí na .png, .jpg atp.</p>
                <p>Můžeš použít i animované obrázky!</p>
            </div>
        </div>
    </form>
</template>