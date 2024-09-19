<script setup lang="ts">
import { inject, nextTick, ref } from "vue";
import { reviewData } from "@/Reviews";
import { computed } from "vue";
import Dialog from "../global/Dialog.vue";
import HiddenFileUploader from "../ui/HiddenFileUploader.vue";
import { uploadImages } from "../imageUpload";
import { currentUID, shortenYTLink } from "@/Editor";
import UploadIndicator from "../global/UploadIndicator.vue";

const emit = defineEmits<{
    (e: "save", duplicate: boolean): void
}>()

const base = import.meta.env.BASE_URL

const openDialogs = inject("openedDialogs")
const index = computed(() => openDialogs.carouselPicker[1])

const openGallery = () => openDialogs.imagePicker = [true, -3]
const changeImage = (ind: number, isVideo: boolean) => {
    if (isVideo) {
        textDialogOpen.value = ind
        dialogType.value = 2
        nextTick(() => document.querySelector("#carp_inputs input").focus())
    }
    else {
        openDialogs.imagePicker = [true, -4, ind]
        nextTick(() => document.querySelector("#carp_inputs input").focus())
    }
}

var carouselComp = reviewData.value.containers[index.value].settings.components
const addContainer = inject("addContainer")
const addVideo = () => {
    if (maxLen.value) return
    textDialogOpen.value = carouselComp.length
    let video = addContainer("addVideo", 0, true)
    carouselComp.push(video)
    dialogType.value = 2
    nextTick(() => {
        document.querySelector("#carp_inputs input").focus()
        video.settings.height = carouselComp[textDialogOpen.value].settings.height
    })
}

const removeContent = (ind: number) => {
    carouselComp.splice(ind, 1)
}

const moveContent = (ind: number, by: number) => {
    let content = carouselComp[ind]
    carouselComp.splice(ind, 1)
    carouselComp.splice(Math.min(Math.max(0, ind+by), carouselComp.length), 0, content)
}

const uploading = ref(false)
const doUpload = async (files: FileList) => {
    if (maxLen.value) return
    uploading.value = true
    let res = await uploadImages(files, false)
    uploading.value = false
    if (typeof res == 'string') {
        if (res.startsWith("-3")) { // Existing image
            let img = addContainer("showImage", 0, true)
            img.settings.url = `${import.meta.env.VITE_USERCONTENT}/userContent/${currentUID.value}/${res.split(";")[1]}.webp`
            img.settings.height = reviewData.value.containers[index.value].settings.height
            carouselComp.push(img)
            return
        }
        else { // Youtube link
            let video = addContainer("addVideo", 0, true)
            video.settings.url = res
            carouselComp.push(video)
            nextTick(() => {
                video.settings.height = carouselComp[textDialogOpen.value].settings.height
            })
            return
        }
    }
    if (res?.newImage) {
        res.newImage.forEach(i => {
            let img = addContainer("showImage", 0, true)
            img.settings.url = `${import.meta.env.VITE_USERCONTENT}/userContent/${currentUID.value}/${i}.webp`
            img.settings.height = reviewData.value.containers[index.value].settings.height
            carouselComp.push(img)
        })
    }
}

const closePopup = () => {
    if (!shortenYTLink(carouselComp[textDialogOpen.value].settings.url))
        removeContent(textDialogOpen.value)
    textDialogOpen.value = -1
}

const textDialogOpen = ref(-1)
const dialogType = ref(0)

const uploader = ref<HTMLInputElement>()
const maxLen = computed(() => carouselComp.length >= 25)


</script>

<template>
    <Dialog @close-popup="closePopup" :open="textDialogOpen != -1" :title="$t('other.metadata')">
        <div id="carp_inputs" class="flex flex-col p-2">
            <label v-show="dialogType == 2" for="car_url">{{ $t('reviews.ytLink') }}</label>
            <input v-show="dialogType == 2" @paste.stop="" class="p-1 bg-white bg-opacity-10 rounded-md" v-model="reviewData.containers[index].settings.components[textDialogOpen].settings.url" type="text" id="car_url">
            <label v-show="dialogType != 2" for="car_desc">{{ $t('other.desc') }}</label>
            <input v-show="dialogType != 2" class="p-1 bg-white bg-opacity-10 rounded-md" v-model="reviewData.containers[index].settings.components[textDialogOpen].settings.description" type="text" id="car_desc">
            <label v-show="dialogType == 1" class="mt-4" for="car_alt">{{ $t('reviews.alttext') }}</label>
            <textarea v-show="dialogType == 1" class="p-1 bg-white bg-opacity-10 rounded-md resize-none" v-model="reviewData.containers[index].settings.components[textDialogOpen].settings.alt" name="" id="car_alt"></textarea>
        </div>
    </Dialog>

    <div class="grid grid-cols-2 gap-1 p-1">
        <button :disabled="maxLen" @click="openGallery" class="flex gap-2 p-1 pl-2 bg-black bg-opacity-40 rounded-md disabled:opacity-20"><img :src="`${base}/formatting/showImage.svg`" class="w-4" alt="">{{ $t('reviews.addImage') }}</button>
        <button :disabled="maxLen" @click="addVideo" class="flex gap-2 p-1 pl-2 bg-black bg-opacity-40 rounded-md disabled:opacity-20"><img :src="`${base}/formatting/addVideo.svg`" class="w-4" alt="">{{ $t('reviews.addVideo') }}</button>
    </div>
    
    <UploadIndicator :visible="uploading" :removing="false" />
    <div
    class="bg-[url(@/images/fade.webp)] bg-repeat-x h-[40rem] relative p-1 overflow-y-auto  flex flex-col gap-1 overflow-x-clip">
    
        <!-- Help -->
        <div v-if="!reviewData.containers[index].settings.components.length && !uploading" class="flex absolute top-1/2 left-1/2 z-10 flex-col items-center w-3/4 text-center -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div class="flex flex-col gap-3 items-center mb-2 opacity-20">
                <img src="@/images/image.svg" alt="" class="w-48">
                <h2 class="text-2xl">{{ $t('reviews.noAddedYet') }}</h2>
                <p class="">{{ $t('reviews.carHelp1') }}</p>
                <p class="">{{ $t('reviews.carHelp2') }}</p>
            </div>
        </div>

        <div class="z-10 w-full">
            <div class="grid grid-cols-4 gap-2 p-1">
                <div v-for="(media, ind) in reviewData.containers[index].settings.components">
                    <div class="relative h-32 overflow-clip bg-center bg-cover rounded-md border border-lof-400" :style="{backgroundImage: `url(${media.type != 'addVideo' ? media.settings.url : 'https://img.youtube.com/vi/'+shortenYTLink(media.settings.url, true)+'/mqdefault.jpg'})`}">
                        <img v-show="media.type == 'addVideo'" src="@/images/play.svg" class="absolute top-1/2 left-1/2 p-1 w-10 bg-black bg-opacity-70 rounded-full -translate-x-1/2 -translate-y-1/2 aspect-square" alt="">
                        <div class="relative w-full h-full opacity-0 transition-opacity duration-75 hover:opacity-100">

                            <button @click="changeImage(ind, media.type == 'addVideo')" class="flex absolute top-2 left-1/2 gap-1 p-1 w-max bg-black bg-opacity-60 rounded-md backdrop-blur-sm transition-opacity -translate-x-1/2 button">
                                <img src="@/images/copy.svg" class="w-5" alt="">
                                <span>{{ $t('other.modify') }}</span>
                            </button>
                            <button @click="textDialogOpen = ind; dialogType = 1" class="flex absolute top-12 left-1/2 gap-1 p-1 w-max bg-black bg-opacity-60 rounded-md backdrop-blur-sm transition-opacity -translate-x-1/2 button">
                                <img src="@/images/edit.svg" class="w-5" alt="">
                                <span>{{ $t('other.desc') }}</span>
                            </button>
                            <div class="flex absolute right-0 bottom-0 left-0 p-2 bg-black bg-opacity-60 backdrop-blur-md transition-opacity">
                                <button @click="moveContent(ind, -1)"><img src="@/images/moveUp.svg" class="w-6 -rotate-90" alt=""></button>
                                <button @click="moveContent(ind, 1)"><img src="@/images/moveUp.svg" class="ml-2 w-6 rotate-90" alt=""></button>
                                <button @click="removeContent(ind)" class="ml-auto"><img src="@/images/trash.svg" class="w-6" alt=""></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <HiddenFileUploader ref="uploader" @data="doUpload" multiple unclickable allow-youtube-links :disabled="openDialogs?.imagePicker?.[0]" />
    </div>
</template>
