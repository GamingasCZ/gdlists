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
import ProfilePicture from './ProfilePicture.vue';
import { currentCutout, currentUID, lastPFPchange, profileCutouts } from '@/Editor';

const openEditPopup = ref(false)
const discordLoading = ref(false)
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
    resizerTopLeft.value = [0,0]
    lastX = [-1,-1]
    editScale.value = 1
    let reader = new FileReader()
    reader.readAsDataURL(uploadData!)
    nextTick(() => {
        reader.onload = () => {
            if (typeof reader.result != 'string') return
            imageElement.src = reader.result
            basedData.value = reader.result

            imageElement.onload = updatePreviews
        }
    })
}

const domColor = ref(chroma.random())

const updatingCutout = ref(false)
const updateCutout = () => {
    let prevCutout = currentCutout.value
    updatingCutout.value = true
    axios.patch(import.meta.env.VITE_API + "/accounts.php", currentCutout.value).then(_ => {
        updatingCutout.value = false
    }).catch(() => currentCutout.value = prevCutout)
}

const updatePFPs = () => {
    editFinished.value = true

    document.body.addEventListener("mouseup", () => {
    emit('closePopup'); document.body.style.overflow = "auto"}, {once: true})
        
    nextTick(() => {
        let newPfp = document.querySelector("#finishedProfilePicture") as HTMLImageElement
        newPfp.onload = () => {
            domColor.value = getDominantColor(newPfp)
        }
    })
    lastPFPchange.value = Date.now()
}

const pickedFile = (file: Blob) => {
    axios.put(import.meta.env.VITE_API + "/accounts.php", file).then(_ => {
        updatePFPs()
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
    discordLoading.value = true
    axios.put(import.meta.env.VITE_API + "/accounts.php", "-1").then(_ => {
        discordLoading.value = false
        updatePFPs()
    })
}

const dragHelp = ref(true)
let lastX = [-1, -1]
const resizerTopLeft = ref([0, 0])
let movingImage = false
const startMove = () => {
    movingImage = true
    dragHelp.value = false
    document.body.addEventListener("mouseup", endMove, {once: true})
    document.body.addEventListener("touchend", endMove, {once: true})
}
const endMove = () => {
    movingImage = false
    lastX = [-1, -1]
    updatePreviews()
}

const moveResizer = (e: MouseEvent | TouchEvent) => {
    if (!movingImage) return
    let pos;
    if (e.type == "mousemove") pos = {x: e.x, y: e.y}
    else {
        pos = {x: e.touches[0].clientX, y: e.touches[0].clientY}
    }

    if (lastX[0] == -1) lastX = [pos.x, pos.y]
    updatePreviews()
    let w = imageElement.naturalWidth
    let h = imageElement.naturalHeight
    let r = w/h
    let r2 = h/w
    if (r < 1) {
        resizerTopLeft.value = [
            Math.max(-(256*editScale.value)+256, Math.min(resizerTopLeft.value[0] + pos.x - lastX[0], 0)),
            Math.max(-(256*r2*editScale.value)+256, Math.min(resizerTopLeft.value[1] + pos.y - lastX[1], 0))
        ]
    }
    else {
        resizerTopLeft.value = [
            Math.max(-(256*r*editScale.value)+256, Math.min(resizerTopLeft.value[0] + pos.x - lastX[0], 0)),
            Math.max(-(256*editScale.value)+256, Math.min(resizerTopLeft.value[1] + pos.y - lastX[1], 0))
        ]
    }
    
    lastX = [pos.x, pos.y]
}

const updateScale = () => {
    let w = imageElement.naturalWidth
    let h = imageElement.naturalHeight
    let r = w/h
    let r2 = h/w
    // resizerTopLeft.value[0] /= editScale.value
    // resizerTopLeft.value[1] /= editScale.value
    if (r < 1) {
        resizerTopLeft.value[0] = Math.max(-(256*editScale.value)+256, Math.min(resizerTopLeft.value[0], 0)),
        resizerTopLeft.value[1] = Math.max(-(256*r2*editScale.value)+256, Math.min(resizerTopLeft.value[1], 0))
    }
    else {
        resizerTopLeft.value[0] = Math.max(-(256*r*editScale.value)+256, Math.min(resizerTopLeft.value[0], 0)),
        resizerTopLeft.value[1] = Math.max(-(256*editScale.value)+256, Math.min(resizerTopLeft.value[1], 0))
    }

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
    let ratioWide = imageElement.naturalWidth/imageElement.naturalHeight
    let ratioTall = imageElement.naturalHeight/imageElement.naturalWidth
    
    ctxSmall?.reset()
    if (ratioTall < 1)
        ctxSmall?.drawImage(imageElement, resizerTopLeft.value[0]/2, resizerTopLeft.value[1]/2, 128*ratioWide*editScale.value, 128*editScale.value)
    else
        ctxSmall?.drawImage(imageElement, resizerTopLeft.value[0]/2, resizerTopLeft.value[1]/2, 128*editScale.value, 128*ratioTall*editScale.value)

    ctxBig?.reset()
    if (ratioTall < 1)
        ctxBig?.drawImage(imageElement, resizerTopLeft.value[0], resizerTopLeft.value[1], 256*ratioWide*editScale.value, 256*editScale.value)
    else
        ctxBig?.drawImage(imageElement, resizerTopLeft.value[0], resizerTopLeft.value[1], 256*editScale.value, 256*ratioTall*editScale.value)
}

const clickUploader = () => {
    document.querySelector("#PFPuploader")?.click()
}


const editFinished = ref(false)

</script>

<template>
    <section v-show="!editFinished" class="flex flex-col p-4">
        <Dialog :open="openEditPopup" @close-popup="openEditPopup = false" :title="$t('settingsMenu.editPhoto')" :width="dialog.medium" disable-tap-close>
            <section class="p-2">
                <div class="flex justify-evenly items-center max-sm:flex-col">
                    <div class="flex flex-col items-center drop-shadow-[0px_0px_5px_black]">
                        <canvas ref="pfpPreview" class="mb-3 w-32 h-32 max-h-[20vh] max-w-[20vh]" :style="{clipPath: profileCutouts[currentCutout]}" width="128" height="128"></canvas>
                        <span>{{ $t('other.preview') }}</span>
                    </div>
        
                    <div class="relative">
                        <div class="relative w-64 h-64 cursor-grab active:cursor-grabbing shadow-drop" @mousedown="startMove" @mousemove="moveResizer" @touchmove="moveResizer" @touchstart="startMove">
                            <div v-show="dragHelp" class="flex absolute bottom-1 left-1/2 gap-2 items-center p-1 w-max text-sm bg-black bg-opacity-80 rounded-md -translate-x-1/2">
                                <img src="@/images/move.svg" class="w-5" alt="">
                                <span>{{ $t('settingsMenu.dragSelect') }}</span>
                            </div>
                            <canvas ref="bigPreview" width="256" height="256"></canvas>
                        </div>

                        <div class="flex gap-2 items-center my-2">
                            <img src="@/images/zoom.svg" class="w-6" alt="">
                            <input type="range" class="slider grow" v-model="editScale" @input="updateScale" min="1" max="3" step="0.05" name="" id="">
                        </div>
                    </div>
                </div>
                <div class="flex justify-between">
                    <button @click="openEditPopup = false" class="p-2 text-lof-400">{{ $t('other.cancel') }}</button>
                    <button @click="saveCrop" class="flex gap-2 items-center px-2 py-1 text-xl font-bold text-black rounded-md bg-lof-400"><img src="@/images/check.svg" class="w-5" alt="">{{ $t('other.use') }}</button>
                </div>
            </section>
        </Dialog>

        <Dialog :open="galleryOpen" :title="$t('other.gallery')" :width="dialog.large" @close-popup="galleryOpen = false">
          <ImageBrowser disable-external :unselectable="false" @pick-image="pickGalleryFile" @close-popup="galleryOpen = false" />
        </Dialog>

        <div class="relative mb-4 text-center rounded-xl border-white border-opacity-20 border-dashed cursor-pointer sm:p-4 sm:border-4">
            <HiddenFileUploader id="PFPuploader" :disabled="discordLoading" @data="openEdit($event)" />

            <div class="grid grid-cols-[1fr_max-content_1fr] justify-items-center sm:mt-3 sm:mb-12">
                <div class="pointer-events-none">
                    <img src="@/images/dropfile.svg" class="mx-auto w-24 opacity-20 max-sm:hidden" alt="">
                    <p class="text-xl opacity-20 max-sm:hidden">{{ $t('settingsMenu.dragPhoto') }}</p>
                </div>
                <hr class="w-1 h-full bg-white rounded-full border-none opacity-20 max-sm:hidden">
                <div class="pointer-events-none">
                    <ProfilePicture class="w-24 aspect-square" :uid="currentUID" :cutout="currentCutout" />
                    <p class="text-xl opacity-20 max-sm:mb-4">Current</p>
                </div>
            </div>
            
            <div class="grid gap-4 mt-2 max-sm:grid-rows-3 sm:grid-cols-2">
                <button @click="clickUploader" :disabled="discordLoading" class="flex gap-2 p-2 bg-black bg-opacity-40 rounded-md disabled:opacity-40 sm:hidden button">
                    <img src="@/images/copy.svg" class="w-6" alt="">
                    {{ $t('editor.upload') }}
                </button>
                <button @click="galleryOpen = true" :disabled="discordLoading" class="flex gap-2 p-2 bg-black bg-opacity-40 rounded-md disabled:opacity-40 button">
                    <img src="@/images/image.svg" class="w-6" alt="">
                    {{ $t('settingsMenu.pickFromGallery') }}
                </button>
                <button @click="useDiscord" :disabled="discordLoading" class="flex gap-2 p-2 bg-black bg-opacity-40 rounded-md disabled:opacity-40 button">
                    <img v-if="discordLoading" src="@/images/loading.webp" class="w-6 animate-spin" alt="">
                    <img v-else src="@/images/discord.svg" class="w-6" alt="">
                    {{ $t('settingsMenu.pickDiscord') }}
                </button>
            </div>
        </div>
        <Option :disabled="updatingCutout" :name="$t('settingsMenu.cutout')" control="dropdown" :desc="$t('settingsMenu.cutoutHelp')" @updated="updateCutout" v-model="currentCutout" :control-options="[[$t('other.circle'), 0], [$t('other.square'), 1], [$t('other.star'), 2], [$t('other.hexagon'), 3], [$t('other.demon'), 4]]" />
    </section>

    <Dialog header-disabled :open="editFinished" :custom-color="`linear-gradient(9deg, ${domColor}, ${domColor.darken(2)})`">
        <div class="flex flex-col items-center px-4 py-8 overflow-clip rounded-md" :style="{boxShadow: `0px 0px 80px ${domColor.alpha(0.5).hex()}`}">
            <div class="relative">
                <ProfilePicture :uid="currentUID" :cutout="currentCutout" class="absolute w-32 blur-3xl -z-10" />
                <ProfilePicture :uid="currentUID" :cutout="currentCutout" id="finishedProfilePicture" class="z-10 w-32 shadow-drop" />
            </div>
            <h2 class="mt-2 text-2xl">{{ $t('settingsMenu.pfpSet') }}</h2>
            <p class="mt-6 opacity-50">{{ $t('settingsMenu.closeDialog') }}</p>
        </div>
    </Dialog>
</template>