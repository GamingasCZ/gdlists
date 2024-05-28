<script setup lang="ts">
import { ref } from "vue";
import TabBar from "../ui/TabBar.vue";
import { computed } from "vue";
import axios from "axios";
import type { ImageStorage } from "@/interfaces";
import { hasLocalStorage } from "@/siteSettings";
import { nextTick } from "vue";
import { imageCache, storageCache, setImgCache, setStorageCache } from "./imageCache";
import Dropdown from "../ui/Dropdown.vue";
import Notification from "./Notification.vue";
import Dialog from "./Dialog.vue";
import { onBeforeUnmount } from "vue";
import { useI18n } from "vue-i18n";
import { dialog } from "../ui/sizes";

const toMB = (val: number) => Math.round(val / 100_00) / 100
const currentTab = ref(0)
const storageInUse = computed(() => (storage.value.left / storage.value.storageMax) * 100)
const pre = import.meta.env.VITE_USERCONTENT
const imageInput = ref<HTMLInputElement>()
const fileDrag = ref(false)

const props = defineProps<{
    unselectable: boolean
    disableExternal?: boolean
}>()

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
const images = ref<string[]>(imageCache)
const externaImages = ref<string[]>([])
const loadingImages = ref(true)

if (!storageCache) {
    axios.get(import.meta.env.VITE_API + "/images.php?storage").then(res => {
        storage.value = res.data
    
        // Fetch images
        if (storage.value.filecount > 0) refreshContent()
        else loadingImages.value = false
    })
}
else {
    loadingImages.value = false
    storage.value = storageCache
}

if (hasLocalStorage()) {
    externaImages.value = JSON.parse(localStorage.getItem("externalImages")!) ?? []
}

const removeConfirmationOpen = ref(-1)
const startRemoval = (index: number) => {
    if (holdingShift.value) removeImage(images.value[index], false)
    else removeConfirmationOpen.value = index
}
const removeImage = (hash: string, external: boolean) => {
    if (!external) {
        loadingImages.value = true
        uploadingImage.value = 2
        axios.delete(import.meta.env.VITE_API + "/images.php", { params: { hash: hash } }).then(res => {
            uploadingImage.value = 0
            if (res.data == "-3") return notify(5)
            
            storage.value = res.data
            images.value.splice(images.value.indexOf(hash), 1)
            loadingImages.value = false
            setImgCache(images.value)
            setStorageCache(storage.value)
            previewImage.value = -1
        }).catch(() => {
            loadingImages.value = false
            uploadingImage.value = 0
            notify(5)
        })
        
        removeConfirmationOpen.value = -1
    }
    else {
        externaImages.value.splice(externaImages.value.indexOf(hash), 1)
        localStorage.setItem("externalImages", JSON.stringify(externaImages.value))
    }
}

const uploadingImage = ref(0)
const uploadImage = async (e: Event | FileList, fileList?: boolean) => {
    if (loadingImages.value || uploadingImage.value) return

    let file
    if (!fileList)
        file = imageInput.value?.files?.[0]
    else
        file = e[0]

    if (file?.size > storage.value.maxUploadSize) return notify(1) // Too big
    if (file?.size < 50) return notify(2) // Too small
    else if (file?.size > storage.value.left) return notify(3) // Not enough storage

    else {
        let data = await file?.arrayBuffer()
        uploadingImage.value = true
        axios({
            method: 'post',
            url: import.meta.env.VITE_API + "/images.php",
            data: data,
            maxBodyLength: Infinity,
            maxContentLength: Infinity
        }).then(res => {
            uploadingImage.value = 0
            if (res.data == -5) notify(7) // Bad format
            if (res.data == -3) notify(4) // Already uploaded
            else refreshContent()
        }).catch(() => uploadingImage.value = 0)
    }
}

const extImgInput = ref('')
const uploadExternalImage = async (link: string) => {
    loadingImages.value = true

    setTimeout(async () => {
        const load = new Promise((res, err) => {
            let img = document.createElement("img")
            img.src = extImgInput.value
            img.onload = () => res(true)
            img.onerror = () => err("Image not found :D")
            img.remove()
        })
        await load.catch((err) => {
            notify(0)
            loadingImages.value = false
            return err;
        })
        await load.then(() => {
            if (externaImages.value.includes(extImgInput.value)) {
                emit("pickImage", extImgInput.value)
                emit('closePopup')
            }
            else {
                externaImages.value.splice(0, 0, extImgInput.value)
                externaImages.value = externaImages.value.slice(0, 20)
            }
            localStorage.setItem("externalImages", JSON.stringify(externaImages.value))
            loadingImages.value = false
            extImgInput.value = ""
        })
    }, 10);
}

const previewImage = ref(-1)
const pickImage = (index: number, external: boolean) => {
    if (props.unselectable) {
        previewImage.value = index
        return
    }
    else {
        if (props.disableExternal)
            emit('pickImage', images.value[index])
        else {
            if (external) emit('pickImage', externaImages.value[index])
            else emit('pickImage', `${pre}/userContent/${storage.value.uid}/${images.value[index]}.webp`)
        }
        emit('closePopup')
    }
}

const refreshContent = () => {
    loadingImages.value = true
    axios.get(import.meta.env.VITE_API + "/images.php").then(res => {
        images.value = res.data[1]
        storage.value = res.data[0]
        setImgCache(images.value)
        setStorageCache(storage.value)
        loadingImages.value = false
    })
}

const downloadImage = (hash: string, external: boolean) => {
    if (external) navigator.clipboard.writeText(hash)
    else {
        let link = document.createElement("a")
        link.href = `${pre}/userContent/${storage.value.uid}/${hash}.webp`
        link.click()
        link.remove()
    }
}

const dragInImage = (e: DragEvent) => {
    fileDrag.value = false
    let files = e.dataTransfer?.files
    uploadImage(files, true)
}

const imageOptsShown = ref(-1)
const imageHovering = ref(-1)
const dropdown = ref()

const imageAction = (id: number, external: boolean, val: string | number) => {
    switch (id) {
        case 0: // Remove
            startRemoval(val); break
        case 1:
            downloadImage(val, external); break
    }
}

const errorMessages = [
    useI18n().t('reviews.imgError'),
    useI18n().t('other.imageBig'),
    useI18n().t('other.imgSmall'),
    useI18n().t('other.notEnoughSpace'),
    useI18n().t('other.sameUploaded'),
    useI18n().t('other.deleteFail'),
    useI18n().t('other.loginFuckup'),
    useI18n().t('other.unsupportedFormat'),
    useI18n().t('other.clipboardEmpty')
]
const notifStamp = ref(-1)
const notifContent = ref("")
const notify = (error: number) => {
    notifContent.value = errorMessages[error]
    notifStamp.value = Date.now()
}

const holdingShift = ref(false)
const modShift = (e: KeyboardEvent) => holdingShift.value = e.shiftKey
document.addEventListener("keydown", modShift)
document.addEventListener("keyup", modShift)

const pasteImage = (e: Event) => {
    e.preventDefault()
    if (currentTab.value == 1) return // Not on external images
    if (!e.clipboardData.files.length) return notify(8)
    uploadImage(e.clipboardData?.files, true)
}
window.addEventListener("paste", pasteImage)

onBeforeUnmount(() => {
    window.removeEventListener("paste", pasteImage)
    document.removeEventListener("keydown", modShift)
    document.removeEventListener("keyup", modShift)
})

const button = ref()
</script>

<template>
    <div class="flex gap-10 justify-between mx-2 mb-2">
        <Notification :content="notifContent" :title="$t('other.error')" icon="error" :stamp="notifStamp" />

        <Dialog :title="$t('other.preview')" :width="dialog.large" :open="previewImage >= 0" @close-popup="previewImage = -1">
            <div class="flex relative flex-col gap-2 items-center p-2 w-full bg-black bg-opacity-40">
                <img :src="`${pre}/userContent/${storage.uid}/${images[previewImage]}.webp`" :alt="images[previewImage]" class="absolute inset-0 w-full max-w-full h-full text-center text-white rounded-md opacity-50 mix-blend-overlay blur-lg pointer-events-none">
                <img :src="`${pre}/userContent/${storage.uid}/${images[previewImage]}.webp`" :alt="images[previewImage]" class="w-max pointer-events-none isolate max-w-full text-white max-h-[80vh] text-center rounded-md">
                <div class="grid grid-cols-2 gap-2 w-full">
                    <button @click="imageAction(0, currentTab == 1, previewImage)" class="flex gap-2 p-2 text-xl text-left bg-black bg-opacity-40 rounded-md transition-colors hover:bg-opacity-60"><img class="w-6" src="@/images/trash.svg">Smazat</button>
                    <button @click="imageAction(1, currentTab == 1, previewImage)" class="flex gap-2 p-2 text-xl text-left bg-black bg-opacity-40 rounded-md transition-colors hover:bg-opacity-60"><img class="w-6" src="@/images/copy.svg">Stáhnout</button>
                </div>
            </div>
        </Dialog>

        <!-- Remove confirmation -->
        <Dialog :title="$t('other.removal')" @close-popup="removeConfirmationOpen = -1" :open="removeConfirmationOpen > -1">
            <div class="flex px-2 py-4">
                <img src="@/images/trash.svg" class="mr-2 w-32 opacity-10" alt="">
                <div>
                    <h2 class="text-xl font-black">{{ $t('other.imgRemove1') }}</h2>
                    <p>{{ $t('other.imgRemove2') }}</p>
                    <p class="my-2 text-sm text-yellow-200">{{ $t('other.imgRemove3') }}</p>
                    <button @click="removeImage(images[removeConfirmationOpen], false)" class="flex gap-2 items-center px-2 py-1 text-2xl font-bold text-black bg-red-400 rounded-md button">
                        <img src="@/images/del.svg" class="w-6">
                        {{ $t('editor.remove') }}
                    </button>
                </div>
            </div>
        </Dialog>

        <!-- External image input -->
        <form v-if="currentTab == 1" action="." @submit.prevent="uploadExternalImage($event.target[0].value)" class="w-full">
            <input :placeholder="$t('other.enterURI')" :disabled="loadingImages" v-model="extImgInput" @paste="uploadExternalImage($event.target.value)"
                class="p-1 pl-8 w-full bg-white bg-opacity-20 rounded-md transition-opacity disabled:opacity-40">
        </form>


        <button v-else @click="imageInput?.click()" :disabled="uploadingImage"
            class="flex gap-2 items-center p-1 px-2 bg-black bg-opacity-40 rounded-md disabled:opacity-20 button">
            <img src="@/images/copy.svg" alt="" class="w-6">
            <span>{{ $t('editor.uploadFile') }}</span>
        </button>

        <!-- Storage left -->
        <div class="flex flex-col" v-show="currentTab == 0">
            <div class="flex justify-between">
                <label for="storageLeft">{{ $t('other.storage') }}</label>
                <span>{{ toMB(storage.left) }}/{{ toMB(storage.storageMax) }}MB</span>
            </div>
            <div class="w-40 h-2 overflow-clip bg-black bg-opacity-40 rounded-full">
                <div :style="{ width: `${storageInUse}%` }" class="h-full bg-lof-400"></div>
            </div>
        </div>
    </div>
    <TabBar :tab-names="[$t('homepage.uploaded')].concat(disableExternal ? [] : [$t('other.external')])" @switched-tab="currentTab = $event" />
    <form action="." method="post" @dragover.prevent="fileDrag = true" @drop.prevent="dragInImage"
        @dragexit="fileDrag = false" @submit.prevent=""
        class="h-[40rem] overflow-y-auto relative bg-[url(@/images/fade.webp)] bg-repeat-x">
        <input @change="uploadImage" ref="imageInput" type="file"
            class="absolute w-full h-full opacity-0 pointer-events-none">

        <!-- Images -->
        <div class="flex flex-wrap gap-4 justify-evenly m-4" v-show="currentTab == 0" :class="{'opacity-20 pointer-events-none': uploadingImage}">
            <button v-for="(image, index) in images"
                @click="pickImage(index, false)"
                @auxclick="startRemoval(index)"
                @mouseover="imageHovering = index"
                @mouseout="imageHovering = -1"
                class="relative h-20 bg-center rounded-md border-2 transition-all cursor-pointer shadow-drop min-w-5 hover:bg-black hover:bg-opacity-80 hover:z-10 border-lof-400"
                :class="{ 'bg-white bg-opacity-20 group bg-[url(@/images/trash.svg)] bg-[length:2rem] bg-no-repeat': false,  }">
                <!-- Image settings -->
                <button ref="button" v-show="imageOptsShown == index || imageHovering == index" @click.stop="imageOptsShown = index"
                    class="absolute top-1 right-1 z-20 w-5 bg-white rounded-full duration-75">
                    <img src="@/images/more.svg" class="p-1 invert">

                    <Dropdown :button="button[index]" @close="imageOptsShown = -1" @picked-option="imageAction($event, false, index)" v-if="imageOptsShown == index" :options="[$t('editor.remove'), $t('other.download')]" :title="$t('other.options')" />
                </button>
                
                <img :src="`${pre}/userContent/${storage.uid}/${image}-thumb.webp`" alt=""
                    class="object-cover z-10 w-full h-full transition-transform aspect-auto" :class="{'hover:scale-125': !unselectable}">
            </button>
        </div>

        <!-- Images -->
        <div class="flex flex-wrap gap-4 justify-evenly m-4" v-show="currentTab == 1">
            <button v-for="(image, index) in externaImages"
                @click="pickImage(index, true)"
                @auxclick="removeImage(externaImages[index], true)"
                class="relative h-20 bg-center rounded-md border-2 transition-all cursor-pointer group shadow-drop hover:scale-125 min-w-5 hover:bg-black hover:bg-opacity-80 hover:z-10 border-lof-400"
                :class="{ 'bg-white bg-opacity-20 group bg-[url(@/images/trash.svg)] bg-[length:2rem] bg-no-repeat': false }">
                <!-- Image settings -->
                <button ref="button" @click.stop=""
                    class="absolute top-1 right-1 z-20 w-5 overflow-clip bg-white rounded-full opacity-0 transition-opacity duration-75 button group-hover:opacity-100">
                    <img src="@/images/more.svg" class="p-1 invert">

                    <Dropdown  @close="imageOptsShown = -1" @picked-option="imageAction($event, image, false)" ref="dropdown" class="top-8" v-if="imageOptsShown == index" :options="['Smazat', 'Odkaz']" :title="'Možnosti'" />
                </button>

                <img :src="image" alt="" class="object-cover z-10 w-full h-full aspect-auto">
            </button>
        </div>

        <!-- Help -->
        <div v-show="!images.length && currentTab == 0 || !externaImages.length && currentTab == 1"
            class="absolute top-1/2 left-1/2 text-center opacity-40 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div v-if="loadingImages" class="w-max">
                <img src="@/images/loading.webp" class="mb-2 w-32 animate-spin" alt="">
                <h2 class="text-xl">{{ $t('other.loading') }}...</h2>
            </div>
            <div v-else-if="currentTab == 0 && !fileDrag" class="flex flex-col items-center w-max">
                <img src="@/images/image.svg" class="mb-2 w-48" alt="">
                <h2 class="text-xl">{{ $t('other.uploadHelp1') }}</h2>
                <p>{{ $t('other.uploadHelp2') }}</p>
                <p>{{ $t('other.maxFilesize', [toMB(storage.maxUploadSize)]) }}</p>
                <p>{{ $t('other.formats') }}: .jpg, .png, .webp</p>
            </div>
            <div v-else-if="currentTab == 0 && fileDrag" class="pt-2 pr-8 pb-4 pl-4 w-max bg-black rounded-xl animate-pulse">
                <img src="@/images/dropfile.svg" class="mb-2 w-64" alt="">
                <h2 class="text-xl">{{ $t('other.uploadHelp5') }}</h2>
            </div>
            <div v-else class="w-max">
                <img src="@/images/searchOpaque.svg" class="mx-auto mb-2 w-32" alt="">
                <h2 class="text-xl">{{ $t('other.uploadHelp6') }}</h2>
                <p>{{ $t('other.uploadHelp7') }}</p>
                <p>{{ $t('other.uploadHelp8') }}</p>
            </div>
        </div>

        <Transition name="fade">
            <div v-show="uploadingImage" class="sticky bottom-0 w-full h-24 bg-opacity-40 bg-gradient-to-t from-[#0005] to-transparent">
                <div class="absolute bottom-0 w-full text-3xl text-center">
                    <h2 class="opacity-60">{{ uploadingImage == 2 ? $t('other.removing') : $t('other.uploading') }}...</h2>
                    <div :class="{'invert': uploadingImage == 2}" class="relative mt-3 h-2 overflow-clip rounded-b-md border-none bg-lof-400">
                        <div id="barAnim" class="absolute w-32 h-full bg-white blur-sm"></div>
                    </div>
                </div>
            </div>
        </Transition>
    </form>
</template>

<style>

@keyframes slide {
    from {left: -40px;}
    to {left: calc(100% + 40px);}
}

#barAnim {
    @apply animate-[slide_1s_infinite]
}

</style>