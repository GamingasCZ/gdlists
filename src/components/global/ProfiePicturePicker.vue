<script setup lang="ts">
import axios from 'axios';
import HiddenFileUploader from '../ui/HiddenFileUploader.vue';
import Option from '../ui/Option.vue';
import Dialog from './Dialog.vue';
import { dialog } from '../ui/sizes';
import { nextTick, ref } from 'vue';

const openEditPopup = ref(false)
var uploadData: Blob | null
var basedData = ref<string>()

const pfpPreview = ref<HTMLCanvasElement>()
const editScale = ref(1)

const openEdit = () => {
    openEditPopup.value = true
    let reader = new FileReader()
    reader.readAsDataURL(uploadData!)
    nextTick(() => {
        reader.onload = () => {
            let ctx = pfpPreview.value?.getContext("2d")
            let img = new Image(128,128)
            basedData.value = reader.result
            img.src = basedData.value

            ctx?.drawImage(img, 0, 0, 0, 0)
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
const moveResizer = (e: MouseEvent) => {
    if (lastX[0] == -1) lastX = [e.x, e.y]
    resizerTopLeft.value = [lastX[0] - e.x, lastX[1] - e.y]
    lastX = [e.x, e.y]
}

</script>

<template>
    <section class="flex flex-col p-4">
        <Dialog :open="openEditPopup" @close-popup="openEditPopup = false; uploadData = null" :title="$t('settingsMenu.editPhoto')" :width="dialog.medium">
            <section class="p-2">
                <div class="flex justify-evenly items-center">
                    <div class="flex flex-col items-center">
                        <span>{{ $t('other.preview') }}</span>
                        <canvas ref="pfpPreview" class="w-32 h-32" width="128" height="128"></canvas>
                    </div>
        
                    <div class="relative">
                        <div class="relative max-h-64 overflow-clip cursor-move max-w-64" @mousemove="moveResizer">
                            <img :src="basedData" ref="dragPreview" :style="{transform: `scale(${editScale})`, left: `${resizerTopLeft[0]}px`, top: `${resizerTopLeft[1]}px`}" alt="">
                            <div class="absolute top-0 left-1/2 h-full border-4 -translate-x-1/2 border-lof-400 aspect-square"></div>
                        </div>

                        <div class="flex gap-2 items-center my-2">
                            <img src="@/images/zoom.svg" class="w-6" alt="">
                            <input type="range" class="slider grow" v-model="editScale" min="1" max="3" step="0.05" name="" id="">
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
            <HiddenFileUploader @data="uploadData = $event; openEdit()" />

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