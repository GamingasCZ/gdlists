<script setup lang="ts">
import axios from 'axios';
import HiddenFileUploader from '../ui/HiddenFileUploader.vue';
import Option from '../ui/Option.vue';
import Dialog from './Dialog.vue';
import { dialog } from '../ui/sizes';
import { nextTick, ref } from 'vue';

const openEditPopup = ref(false)
var imageElement = new Image()
var basedData = ref<string>()


const dragPreview = ref<HTMLImageElement>()
const pfpPreview = ref<HTMLCanvasElement>()
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

            updateSmallPreview()
        }
    })
}

const pickedFile = (file: Blob) => {
    axios.put(import.meta.env.VITE_API + "/accounts.php", file).then(res => {
        console.log(res.data)
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
    updateSmallPreview()
}
const moveResizer = (e: MouseEvent) => {
    if (!movingImage) return
    updateSmallPreview()
    if (lastX[0] == -1) lastX = [e.x, e.y]
    let ratio = imageElement.naturalWidth/imageElement.naturalHeight
    resizerTopLeft.value = [
        Math.max(-192*editScale.value, Math.min(resizerTopLeft.value[0] + e.x - lastX[0], 0)),
        Math.max(0, Math.min(resizerTopLeft.value[1] + e.y - lastX[1], 0))
    ]
    
    lastX = [e.x, e.y]
}

const updateSmallPreview = () => {
    let ctx = pfpPreview.value?.getContext("2d")
    let ratio = imageElement.naturalWidth/imageElement.naturalHeight
    ctx?.reset()
    ctx?.drawImage(imageElement, resizerTopLeft.value[0]/2, resizerTopLeft.value[1]/2, 128*ratio*editScale.value, 128*editScale.value)
}

</script>

<template>
    <section class="flex flex-col p-4">
        <Dialog :open="openEditPopup" @close-popup="openEditPopup = false" :title="$t('settingsMenu.editPhoto')" :width="dialog.medium" disable-tap-close>
            <section class="p-2">
                <div class="flex justify-evenly items-center">
                    <div class="flex flex-col items-center">
                        <span>{{ $t('other.preview') }}</span>
                        <canvas ref="pfpPreview" class="w-32 h-32 rounded-full" width="128" height="128"></canvas>
                    </div>
        
                    <div class="relative">
                        <div class="relative w-64 h-64 overflow-clip cursor-move" @mousedown="startMove" @mousemove="moveResizer">
                            <div class="w-full h-full bg-no-repeat bg-cover origin-top-left" :style="{backgroundImage: `url(${basedData})`, transform: `scale(${editScale})`, backgroundPosition: `${resizerTopLeft[0]}px ${resizerTopLeft[1]}px`}"></div>
                            <!-- <canvas ref="bigPreview" width="256" height="256" /> -->
                            <div class="absolute top-0 left-1/2 h-full border-4 -translate-x-1/2 border-lof-400 aspect-square"></div>
                        </div>

                        <div class="flex gap-2 items-center my-2">
                            <img src="@/images/zoom.svg" class="w-6" alt="">
                            <input type="range" class="slider grow" v-model="editScale" @input="updateSmallPreview" min="1" max="3" step="0.05" name="" id="">
                        </div>
                    </div>
                </div>
                <div class="flex justify-between">
                    <button>{{ $t('other.cancel') }}</button>
                    <button class="p-2 text-xl font-bold text-black rounded-md bg-lof-400">{{ $t('other.use') }}</button>
                </div>
            </section>
        </Dialog>

        <div class="relative p-4 mb-4 text-center rounded-xl border-4 border-white border-opacity-20 border-dashed">
            <HiddenFileUploader @data="openEdit($event)" />

            <img src="@/images/dropfile.svg" class="mx-auto w-32 opacity-20" alt="">
            <p class="mb-6 text-2xl opacity-20">Přetáhni nebo vyber novou fotku</p>
            <span class="opacity-20">nebo</span>
            <div class="grid grid-cols-2 gap-4 mt-2">
                <button class="flex gap-2 p-2 bg-black bg-opacity-40 rounded-md button">
                    <img src="@/images/image.svg" class="w-6" alt="">
                    Vybrat z galerie
                </button>
                <button @click="useDiscord" class="flex gap-2 p-2 bg-black bg-opacity-40 rounded-md button">
                    <img src="@/images/discord.svg" class="w-6" alt="">
                    Použít z Discordu
                </button>
            </div>
        </div>
        <Option :name="$t('settingsMenu.cutout')" control="dropdown" desc="Změní tvar profilové fotky" :control-options="[['Kruh', 0], ['Čtverec', 0], ['Hvězda', 0], ['Démon', 0]]" />
    </section>
</template>