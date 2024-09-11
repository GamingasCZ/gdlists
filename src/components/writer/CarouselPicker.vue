<script setup lang="ts">
import { inject, ref } from "vue";
import { reviewData } from "@/Reviews";
import { computed } from "vue";
import Dialog from "../global/Dialog.vue";

const emit = defineEmits<{
    (e: "save", duplicate: boolean): void
}>()

const carouselData = ref([])
const base = import.meta.env.BASE_URL

const openDialogs = inject("openedDialogs")
const index = computed(() => openDialogs.carouselPicker[1])
const openGallery = () => {
    openDialogs.imagePicker = [true, -3]
}

const addContainer = inject("addContainer")
const addVideo = () => {
    textDialogOpen.value = reviewData.value.containers[index.value].settings.components.length
    let video = addContainer("addVideo", 0, true)
    video.settings.height = reviewData.value.containers[index.value].settings.components[textDialogOpen.value].settings.height
    reviewData.value.containers[index.value].settings.components.push(video)
    dialogType.value = 2
}

const removeContent = (ind: number) => {
    reviewData.value.containers[index.value].settings.components.splice(ind, 1)
}

const moveContent = (ind: number, by: number) => {
    let content = reviewData.value.containers[index.value].settings.components[ind]
    reviewData.value.containers[index.value].settings.components.splice(ind, 1)
    reviewData.value.containers[index.value].settings.components.splice(Math.min(Math.max(0, ind+by), reviewData.value.containers[index.value].settings.components.length), 0, content)
}

const textDialogOpen = ref(-1)
const dialogType = ref(0)

const ytThumb = (ind: number) => `https://img.youtube.com/vi/${reviewData.value.containers[index.value].settings.components[ind].settings.url}/mqdefault.jpg`

</script>

<template>
    <Dialog @close-popup="textDialogOpen = -1" :open="textDialogOpen != -1" :title="$t('other.metadata')">
        <div class="flex flex-col p-2">
            <label v-show="dialogType == 2" for="car_url">{{ $t('reviews.ytLink') }}</label>
            <input v-show="dialogType == 2" class="p-1 bg-white bg-opacity-10 rounded-md" v-model="reviewData.containers[index].settings.components[textDialogOpen].settings.url" type="text" id="car_url">
            <label v-show="dialogType != 2" for="car_desc">{{ $t('other.desc') }}</label>
            <input v-show="dialogType != 2" class="p-1 bg-white bg-opacity-10 rounded-md" v-model="reviewData.containers[index].settings.components[textDialogOpen].settings.description" type="text" id="car_desc">
            <label v-show="dialogType == 1" class="mt-4" for="car_alt">{{ $t('reviews.alttext') }}</label>
            <textarea v-show="dialogType == 1" class="p-1 bg-white bg-opacity-10 rounded-md resize-none" v-model="reviewData.containers[index].settings.components[textDialogOpen].settings.alt" name="" id="car_alt"></textarea>
        </div>
    </Dialog>

    <div class="grid grid-cols-2 gap-1 p-1">
        <button @click="openGallery" class="flex gap-2 p-1 pl-2 bg-black bg-opacity-40 rounded-md disabled:opacity-20"><img :src="`${base}/formatting/showImage.svg`" class="w-4" alt="">{{ $t('reviews.addImage') }}</button>
        <button @click="addVideo" class="flex gap-2 p-1 pl-2 bg-black bg-opacity-40 rounded-md disabled:opacity-20"><img :src="`${base}/formatting/addVideo.svg`" class="w-4" alt="">{{ $t('reviews.addVideo') }}</button>
    </div>

    <div
        class="bg-[url(@/images/fade.webp)] bg-repeat-x h-[40rem] relative p-1 overflow-y-auto flex flex-col gap-1 overflow-x-clip">

        <!-- Help -->
        <div v-if="!reviewData.containers[index].settings.components.length" class="flex absolute top-1/2 left-1/2 flex-col gap-3 items-center w-3/4 text-center opacity-20 -translate-x-1/2 -translate-y-1/2">
            <img src="@/images/image.svg" alt="" class="w-48">
            <h2 class="text-2xl">{{ $t('reviews.noAddedYet') }}</h2>
            <p class="">{{ $t('reviews.carHelp1') }}</p>
            <p class="">{{ $t('reviews.carHelp2') }}</p>
        </div>

        <div class="w-full">
            <div class="grid grid-cols-4 gap-2 p-1">
                <div v-for="(media, ind) in reviewData.containers[index].settings.components">
                    <div class="relative h-32 overflow-clip bg-center bg-cover rounded-md border border-lof-400" :style="{backgroundImage: `url(${media.type != 'addVideo' ? media.settings.url : ytThumb(ind)})`}">
                        <div class="w-full h-full opacity-0 transition-opacity duration-75 hover:opacity-100">
                            <button class="flex absolute top-2 left-1/2 gap-1 p-1 w-max bg-black bg-opacity-60 rounded-md backdrop-blur-sm transition-opacity -translate-x-1/2 button">
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
    </div>
</template>
