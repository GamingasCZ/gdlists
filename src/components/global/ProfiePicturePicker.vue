<script setup lang="ts">
import axios from 'axios';
import HiddenFileUploader from '../ui/HiddenFileUploader.vue';
import Option from '../ui/Option.vue';
import Dialog from './Dialog.vue';
import { dialog } from '../ui/sizes';
import { nextTick, ref } from 'vue';
import ImageBrowser from './ImageBrowser.vue';
import { getDominantColor } from '@/Reviews';
import chroma from 'chroma-js';

const openEditPopup = ref(false)
var imageElement = new Image()
var basedData = ref<string>()

const emit = defineEmits<{
    (e: "openGallery"): void
    (e: "closePopup"): void
}>()

const galleryOpen = ref(false)
const pfpPreview = ref<HTMLCanvasElement>()
const bigPreview = ref<HTMLCanvasElement>()
const editScale = ref(1)

const openEdit = (uploadData: Blob) => {
    openEditPopup.value = true
    let reader = new FileReader()
    reader.readAsDataURL(uploadData!)
    nextTick(() => {
        reader.onload = () => {
            if (reader.result == null) return
            imageElement.src = reader.result
            basedData.value = reader.result

            imageElement.onload = updatePreviews
        }
    })
}

let uid = JSON.parse(localStorage.getItem("account_info")!)?.[1] ?? "0"
const domColor = ref(chroma.random())
const pickedFile = (file: Blob) => {
    axios.put(import.meta.env.VITE_API + "/accounts.php", file).then(res => {
        let time = Date.now()
        editFinished.value = true
        document.body.addEventListener("mousedown", () => {
            emit('closePopup'); document.body.style.overflow = "auto"}, {once: true})
        
        domColor.value = getDominantColor(imageElement)
        document.querySelectorAll(".profilePicture").forEach((pfp: HTMLImageElement) => {
            if (pfp.src.includes(uid)) {
                let imgSrc = new URL(pfp.src)
                imgSrc.search = `?v=${time}`
                pfp.src = imgSrc.toString()
            }
        })
    })
}

const pickGalleryFile = (url: string) => {
    let uid = JSON.parse(localStorage.getItem("account_info")!)?.[1]
    if (!uid) return
    axios.get(import.meta.env.VITE_USERCONTENT + `/userContent/${uid}/${url}.webp`, {responseType: 'blob'}).then(res => {
        openEdit(res.data)
    })
}

const useDiscord = () => {
    axios.put(import.meta.env.VITE_API + "/accounts.php", "-1").then(res => {
        console.log(res.data)
    })
}

let lastX = [-1, -1]
const resizerTopLeft = ref([0, 0])
let movingImage = false
const startMove = () => {
    movingImage = true
    document.body.addEventListener("mouseup", endMove, {once: true})
}
const endMove = () => {
    movingImage = false
    lastX = [-1, -1]
    updatePreviews()
}
const moveResizer = (e: MouseEvent) => {
    if (!movingImage) return
    if (lastX[0] == -1) lastX = [e.x, e.y]
    updatePreviews()
    let w = imageElement.naturalWidth
    let h = imageElement.naturalHeight
    let r = w/h
    let r2 = h/w
    resizerTopLeft.value = [
        Math.max(-(256*r*editScale.value)+256, Math.min(resizerTopLeft.value[0] + e.x - lastX[0], 0)),
        Math.max(-(256*editScale.value)+256, Math.min(resizerTopLeft.value[1] + e.y - lastX[1], 0))
    ]
    
    lastX = [e.x, e.y]
}

const updateScale = () => {
    resizerTopLeft.value[0] /= editScale.value
    resizerTopLeft.value[1] /= editScale.value
    updatePreviews()
}

const saveCrop = () => {
    pfpPreview.value?.toBlob((b) => {
        if (b != null) pickedFile(b)
    })
    openEditPopup.value = false
}

const updatePreviews = () => {
    let ctxSmall = pfpPreview.value?.getContext("2d")
    let ctxBig = bigPreview.value?.getContext("2d")
    let ratio = imageElement.naturalWidth/imageElement.naturalHeight
    ctxSmall?.reset()
    ctxSmall?.drawImage(imageElement, resizerTopLeft.value[0]/2, resizerTopLeft.value[1]/2, 128*ratio*editScale.value, 128*editScale.value)

    ctxBig?.reset()
    ctxBig?.drawImage(imageElement, resizerTopLeft.value[0], resizerTopLeft.value[1], 256*ratio*editScale.value, 256*editScale.value)
}

const editFinished = ref(false)

</script>

<template>
    <section v-show="!editFinished" class="flex flex-col p-4">
        <Dialog :open="openEditPopup" @close-popup="openEditPopup = false" :title="$t('settingsMenu.editPhoto')" :width="dialog.medium" disable-tap-close>
            <section class="p-2">
                <div class="flex justify-evenly items-center">
                    <div class="flex flex-col items-center">
                        <canvas ref="pfpPreview" class="mb-3 w-32 h-32 rounded-full border-4 border-white" width="128" height="128"></canvas>
                        <span>{{ $t('other.preview') }}</span>
                    </div>
        
                    <div class="relative">
                        <div class="relative w-64 h-64 cursor-grab active:cursor-grabbing shadow-drop" @mousedown="startMove" @mousemove="moveResizer">
                            <canvas ref="bigPreview" width="256" height="256"></canvas>
                            <!-- <div class="absolute top-0 left-1/2 h-full border-4 -translate-x-1/2 border-lof-400 aspect-square"></div> -->
                        </div>

                        <div class="flex gap-2 items-center my-2">
                            <img src="@/images/zoom.svg" class="w-6" alt="">
                            <input type="range" class="slider grow" v-model="editScale" @input="updateScale" min="1" max="3" step="0.05" name="" id="">
                        </div>
                    </div>
                </div>
                <div class="flex justify-between">
                    <button @click="openEditPopup = false">{{ $t('other.cancel') }}</button>
                    <button @click="saveCrop" class="p-2 text-xl font-bold text-black rounded-md bg-lof-400">{{ $t('other.use') }}</button>
                </div>
            </section>
        </Dialog>

        <Dialog :open="galleryOpen" :title="$t('other.gallery')" :width="dialog.large" @close-popup="galleryOpen = false">
          <ImageBrowser disable-external :unselectable="false" @pick-image="pickGalleryFile" @close-popup="galleryOpen = false" />
        </Dialog>

        <div class="relative p-4 mb-4 text-center rounded-xl border-white border-opacity-20 border-dashed sm:border-4">
            <HiddenFileUploader @data="openEdit($event)" />

            <img src="@/images/dropfile.svg" class="mx-auto w-32 opacity-20 max-sm:hidden" alt="">
            <p class="mb-6 text-2xl opacity-20 max-sm:hidden">{{ $t('settingsMenu.dragPhoto') }}</p>
            <span class="opacity-20 max-sm:hidden">{{ $t('other.or') }}</span>
            <div class="grid gap-4 mt-2 sm:grid-cols-2 max-sm:grid-rows-3">
                <button @click="galleryOpen = true" class="flex gap-2 p-2 bg-black bg-opacity-40 rounded-md sm:hidden button">
                    <img src="@/images/copy.svg" class="w-6" alt="">
                    {{ $t('editor.upload') }}
                </button>
                <button @click="galleryOpen = true" class="flex gap-2 p-2 bg-black bg-opacity-40 rounded-md button">
                    <img src="@/images/image.svg" class="w-6" alt="">
                    {{ $t('settingsMenu.pickFromGallery') }}
                </button>
                <button @click="useDiscord" class="flex gap-2 p-2 bg-black bg-opacity-40 rounded-md button">
                    <img src="@/images/discord.svg" class="w-6" alt="">
                    {{ $t('settingsMenu.pickDiscord') }}
                </button>
            </div>
        </div>
        <Option :name="$t('settingsMenu.cutout')" control="dropdown" :desc="$t('settingsMenu.cutoutHelp')" :value="0" :control-options="[[$t('other.circle'), 0], [$t('other.square'), 1], [$t('other.star'), 2], [$t('other.demon'), 3]]" />
    </section>

    <Dialog header-disabled :open="editFinished" :custom-color="`linear-gradient(9deg, ${domColor}, ${domColor.darken(2)})`">
        <div class="flex flex-col items-center px-4 py-8 overflow-clip rounded-md" :style="{boxShadow: `0px 0px 80px ${domColor.alpha(0.5).hex()}`}">
            <div class="relative">
                <img :src="basedData" class="absolute w-32 blur-3xl -z-10" alt="">
                <img :src="basedData" class="z-10 w-32 shadow-drop" alt="">
            </div>
            <h2 class="mt-2 text-2xl">Profilová fotka byla nastavena</h2>
            <p class="mt-6 opacity-50">Klikni pro zavření dialogu!</p>
        </div>
    </Dialog>
</template>