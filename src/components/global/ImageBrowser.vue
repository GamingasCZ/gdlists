<script setup lang="ts">
import { ref } from "vue";
import TabBar from "../ui/TabBar.vue";
import { computed } from "vue";
import axios from "axios";
import type { ImageFolder, ImageStorage } from "@/interfaces";
import { hasLocalStorage } from "@/siteSettings";
import type { ImageCache } from "./imageCache";
import { imageCache, storageCache, setImgCache, setStorageCache, lastVisitedPath, breakCache } from "./imageCache";
import Dropdown from "../ui/Dropdown.vue";
import Dialog from "./Dialog.vue";
import { onBeforeUnmount } from "vue";
import { dialog } from "../ui/sizes";
import { getDominantColor } from "@/Reviews";
import { notifyError, summonNotification, uploadImages } from "../imageUpload";
import HiddenFileUploader from "../ui/HiddenFileUploader.vue";
import UploadIndicator from './UploadIndicator.vue'
import ColorPicker from "./ColorPicker.vue";
import { currentUID, makeColor } from "@/Editor";
import chroma from "chroma-js";
import ImageViewer from "./ImageViewer.vue";

import fEdit from "@/images/edit.svg?url"
import fRemove from "@/images/trash.svg?url"
import fLink from "@/images/link.svg?url"

const MAX_SUBFOLDERS = 3
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
const folders = ref<ImageFolder[]>([])

const loadingImages = ref(true)

enum Folder {NOT_CREATING = 0, CREATING = 1, EDITING = 2}
const creatingNewFolder = ref(Folder.NOT_CREATING)

const currentFolder = ref<string[]>([])
const subfolderLevel = ref(0)

const folderEditButton = ref<HTMLDivElement>()
const editDropdownOpen = ref(false)
const imageAddButton = ref<HTMLDivElement>()
const imgAddOptsOpen = ref(false)

if (hasLocalStorage()) {
    externaImages.value = JSON.parse(localStorage.getItem("externalImages")!) ?? []
}

const getFolderPath = () => currentFolder.value.join('/') || '/'

const removeConfirmationOpen = ref(-1)
const startRemoval = (index: number) => {
    imageOptsShown.value -1
    if (holdingShift.value) removeImage(images.value[index], false)
    else removeConfirmationOpen.value = index
}
const removeImage = (hash: string, external: boolean) => {
    if (folderMoveMode.value) return

    if (!external) {
        loadingImages.value = true
        uploadingImage.value = 2
        let hashesSelected = selectedImages.value.map(h => images.value[h])
        axios.delete(import.meta.env.VITE_API + "/images.php", { params: { hash: hash ? [hash] : hashesSelected } }).then(res => {
            uploadingImage.value = 0
            if (res.data == "-3") return notifyError(5)
            if (res.data == "-5") return notifyError(9)

            storage.value = res.data
            if (hash)
                images.value.splice(images.value.indexOf(hash), 1)
            else
                images.value = images.value.filter(x => !hashesSelected.includes(x))

            selectedImages.value = []
            loadingImages.value = false
            setImgCache(images.value, folders.value, thumbnails.value, currentFolder.value, subfolderLevel.value)
            setStorageCache(storage.value)
            previewImage.value = false
        }).catch(() => {
            loadingImages.value = false
            uploadingImage.value = 0
            notifyError(5)
        })

        removeConfirmationOpen.value = -1
    }
    else {
        externaImages.value.splice(externaImages.value.indexOf(hash), 1)
        localStorage.setItem("externalImages", JSON.stringify(externaImages.value))
    }
}

const uploadingImage = ref(false)
const uploadImage = async (e: FileList, fileList?: boolean) => {
    if (loadingImages.value || uploadingImage.value || folderMoveMode.value) return

    let totalFilesize = 0
    for (let i = 0; i < e.length; i++) {
        let file = e.item(i)
        totalFilesize += file?.size
        if (!file?.type.startsWith("image")) return notifyError(7) // Too big
        if (file?.size < 50) return notifyError(2) // Too small
    }
    if (totalFilesize > storage.value.left) return notifyError(3) // Not enough storage

    uploadingImage.value = true
    let res = await uploadImages(e, false, currentFolder.value[subfolderLevel.value])
    if (typeof res == 'object') {
        images.value.splice(0, 0, ...res.newImage.filter(x => !images.value.includes(x)))

        delete res.newImage
        storage.value = res
        setImgCache(images.value, folders.value, thumbnails.value, currentFolder.value, subfolderLevel.value)
        setStorageCache(storage.value)
        uploadingImage.value = false
    }
    else {
        if (res == -4) notifyError(1) // Too big
    }
    uploadingImage.value = 0
}

const extImgInput = ref('')
const uploadExternalImage = async (link: string) => {
    loadingImages.value = true

    setTimeout(async () => {
        const load = new Promise((res, err) => {
            let img = document.createElement("img")
            img.src = link
            img.onload = () => res(true)
            img.onerror = () => err("Image not found :D")
            img.remove()
        })

        await load.catch((err) => {
            notifyError(0)
            loadingImages.value = false
            return err;
        })

        await load.then(() => {
            if (externaImages.value.includes(link)) {
                emit("pickImage", link)
                emit('closePopup')
            }
            else {
                externaImages.value.splice(0, 0, link)
                externaImages.value = externaImages.value.slice(0, 20)
            }
            localStorage.setItem("externalImages", JSON.stringify(externaImages.value))
            loadingImages.value = false
            extImgInput.value = ""
        })
    }, 10);
}

const previewImage = ref(false)
const pickImage = (index: number, external: boolean, event?: MouseEvent) => {
    let url;
    if (external) url = externaImages.value[index]
    else url = `${pre}/userContent/${storage.value.uid}/${images.value[index]}.webp`

    if (props.unselectable) {
        previewImage.value = true
        imageIndex.value = index
        return
    }
    else {
        if (props.disableExternal)
            emit('pickImage', images.value[index])
        else {
            emit('pickImage', url)
        }
        emit('closePopup')
    }
}

const selectedImages = ref<number[]>([])
const selectImage = (index: number) => {
    let ind = selectedImages.value.indexOf(index)
    if (ind != -1)
        selectedImages.value.splice(ind, 1)
    else {
        if (selectedImages.value.length >= 25) return
        selectedImages.value.push(index)
    }

    if (selectedImages.value.length == 0) {
        folderMoveMode.value = false
        imagesToMove.value = []
    }
}

const thumbnails = ref<{ [path: string]: string }>({})
const parseThumbs = (serverResponse: object) => {
    thumbnails.value = {}

    serverResponse.forEach(x => thumbnails.value[x.name] = [])
    serverResponse.forEach(x => thumbnails.value[x.name].push(x.hash))
}

const refreshContent = async (currPath: string | object) => {
    loadingImages.value = true

    if (typeof currPath != 'string') {
        currentFolder.value = currPath.tree
        subfolderLevel.value = currPath.subfolder
        return refreshContent(currPath.tree[currPath.subfolder])
    }

    if (!currentFolder.value.includes(currPath)) {
        for (let i = subfolderLevel.value; i < MAX_SUBFOLDERS; i++)
            currentFolder.value.splice(subfolderLevel.value, 1)
    }
    currentFolder.value[subfolderLevel.value] = currPath

    let hasCache = imageCache[currPath]
    let getReq = { currentFolder: encodeURIComponent(currPath) }

    let content;
    if (hasCache) {
        content = [storageCache, imageCache]
        loadingImages.value = false
    }
    else content = await axios.get(import.meta.env.VITE_API + "/images.php", { params: getReq }).then(res => {
        loadingImages.value = false
        return res.data
    })

    images.value = hasCache ? content[1][currPath].images : content[1]
    folders.value = hasCache ? content[1][currPath].folders : content[2]
    storage.value = content[0]

    if (hasCache)
        thumbnails.value = content[1][currPath].thumbnails
    else
        parseThumbs(content[3])

    setImgCache(images.value, folders.value, thumbnails.value, currentFolder.value, subfolderLevel.value)
    setStorageCache(storage.value)

}

const downloadImage = (hash: string, external: boolean) => {
    if (external) navigator.clipboard.writeText(hash)
    else {
        let link = document.createElement("a")
        link.href = `${pre}/userContent/${storage.value.uid}/${images.value[hash]}.webp`
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
    previewImage.value = false
    switch (id) {
        case 0: // Remove
            if (external) removeImage(externaImages.value[val], true);
            else startRemoval(val);
            break;
        case 1:
            downloadImage(val, external); break
        case 2:
            selectedImages.value = [val];
            startMoveMode();
            break;
    }
}

const holdingShift = ref(false)
const modifierHeld = (e: KeyboardEvent) => {
    holdingShift.value = e.shiftKey

    // CTRL + X = move mode
    if (e.type == "keyup" && e.ctrlKey && e.key == 'x')
        startMoveMode()

    // CTRL + V = paste into folder
    if (e.type == "keyup" && e.ctrlKey && e.key == 'v')
        moveToFolder(imagesToMove.value, currentFolder.value[subfolderLevel.value])

}
document.addEventListener("keydown", modifierHeld)
document.addEventListener("keyup", modifierHeld)

onBeforeUnmount(() => {
    document.removeEventListener("keydown", modifierHeld)
    document.removeEventListener("keyup", modifierHeld)
})
const previewDominant = ref()

const button = ref()
const extButton = ref()

const folderDetails = ref({
    name: "",
    color: makeColor()
})
const folderColor = computed(() => {
    return chroma.hsl(folderDetails.value.color[0], folderDetails.value.color[1], folderDetails.value.color[2] / 64).hex()
})
const folderCreateMessages = [
    "Jméno je moc krátké!",
    "Jméno složky nemůže obsahovat lomítko",
]
const modifyFolder = () => {
    let data = {
        action: 'createFolder',
        name: folderDetails.value.name,
        color: folderColor.value,
        currentFolder: currentFolder.value[subfolderLevel.value]
    }

    if (creatingNewFolder.value == Folder.CREATING)
        axios.put(import.meta.env.VITE_API + "/images.php", data).then(() => {
            breakCache()
            refreshContent(currentFolder.value[subfolderLevel.value])
        })
    else {
        axios.patch(import.meta.env.VITE_API + "/images.php", data).then(() => {
            currentFolder.value[subfolderLevel.value] = "/" + folderDetails.value.name
            breakCache()
            refreshContent(currentFolder.value[subfolderLevel.value])
        })
    }
    creatingNewFolder.value = Folder.NOT_CREATING
}

const getFolderName = (path: string) => {
    let splitPath = path.split("/")
    return splitPath[splitPath.length - 1]
}

const getFolderGradient = (hex: string) => {
    return `linear-gradient(0deg, ${hex}, transparent)`
}

const gotoFolder = (folderName: string, subLevel: number) => {
    if (loadingImages.value) return

    loadingImages.value = true
    subfolderLevel.value = subLevel
    if (!folderMoveMode.value)
        selectedImages.value = []

    refreshContent(folderName).then()
}

const folderAction = (opt: number) => {
    switch (opt) {
        case 0: editFolder(); break;
        case 1:
            removingFolder.value = true
            removeConfirmationOpen.value = 1
        break;
    }
}

const editFolder = () => {
    creatingNewFolder.value = Folder.EDITING
    folderDetails.value = {
        name: currentFolder.value[subfolderLevel.value].slice(1),
        color: "#000000"
    }
}

const folderMoveMode = ref(false)
const imagesToMove = ref<string[]>([])
const moveToFolder = (imgs: string[], folderName: string) => {
    if (!imgs.length) return
    if (loadingImages.value) return

    let data = {
        action: "moveToFolder",
        folderName: folderName,
        images: imgs
    }
    imagesToMove.value = []
    folderMoveMode.value = false
    selectedImages.value = []
    axios.put(import.meta.env.VITE_API + "/images.php", data).then(newCache => {
        images.value = newCache.data[1]
        breakCache()

        parseThumbs(newCache.data[3])
        setImgCache(newCache.data[1], newCache.data[2], thumbnails.value, currentFolder.value, subfolderLevel.value)

        refreshContent(currentFolder.value[subfolderLevel.value])
    }).catch((_) => {
        notifyError(11)
    })
}

const startMoveMode = () => {
    if (!selectedImages.value.length) return

    folderMoveMode.value = true
    imagesToMove.value = selectedImages.value.map(x => images.value[x])
}

// Load images from cache or server
refreshContent(lastVisitedPath)

const imageIndex = ref(0)
const removingFolder = ref(false)
const removeFolder = (keepImages: boolean) => {
    let params = {
        removeFolder: currentFolder.value[subfolderLevel.value],
        folderAddTo: currentFolder.value[Math.max(0, subfolderLevel.value-1)],
        keepImages: !keepImages,
    }
    loadingImages.value = true
    
    removeConfirmationOpen.value = -1
    removingFolder.value = false

    axios.delete(import.meta.env.VITE_API + "/images.php", {params: params}).then(() => {
        currentFolder.value.splice(subfolderLevel.value, 1)
        subfolderLevel.value -= 1
        breakCache()
        refreshContent(params.folderAddTo)
    })
}

</script>

<template>
    <div class="flex gap-10 justify-between mx-2">
        <ImageViewer v-if="previewImage" @close-popup="previewImage = false" @remove="imageAction(0, false, imageIndex)"
            @download="imageAction(1, false, imageIndex)" @move="imageAction(2, false, imageIndex)" :hash-array="images" v-model="imageIndex" :uid="currentUID" />

        <!-- Remove confirmation -->
        <Dialog :title="$t('other.removal')" @close-popup="removeConfirmationOpen = -1"
            :open="removeConfirmationOpen > -1">
            <div class="flex gap-2 items-center px-2 py-4 max-sm:flex-col">
                <img src="@/images/trash.svg" class="mr-2 w-32 opacity-10" alt="">
                <div>
                    <h2 class="text-xl font-black">{{ $t('other.imgRemove1', [removingFolder ? $t('other.thisFolder') : $t('other.thisPic')]) }}?</h2>
                    <p v-if="removingFolder">{{ $t('other.folderRemove2') }}</p>
                    <p v-else>{{ $t('other.imgRemove2') }}</p>
                    
                    <p v-if="!removingFolder" class="my-2 text-sm text-yellow-200">{{ $t('other.imgRemove3') }}</p>

                    <div v-if="removingFolder">
                        <button @click="removeFolder(false)"
                            class="flex gap-2 items-center px-2 py-1 my-2 text-lg font-bold text-black bg-red-400 rounded-md button">
                            <img src="@/images/del.svg" class="w-6">{{ $t('other.deleteImgs') }}</button>
                        <button @click="removeFolder(true)"
                            class="flex gap-2 items-center px-2 py-1 text-lg font-bold text-black bg-yellow-400 rounded-md button">
                            <img src="@/images/move.svg" class="w-6 invert">{{ $t('images.imgMoveDel') }}</button>
                    </div>
                    <button v-else @click="removeImage(images[removeConfirmationOpen], false)"
                        class="flex gap-2 items-center px-2 py-1 text-2xl font-bold text-black bg-red-400 rounded-md button">
                        <img src="@/images/del.svg" class="w-6">
                        {{ $t('editor.remove') }}
                    </button>
                </div>
            </div>
        </Dialog>

        <!-- New folder Dialog -->
        <Dialog :title="$t('other.newFolder')" @close-popup="creatingNewFolder = Folder.NOT_CREATING" :open="creatingNewFolder != Folder.NOT_CREATING">
            <form @submit.prevent="modifyFolder()" class="p-2">
                <label for="folderNameInput" class="text-xl font-bold">{{ $t('other.folderName') }}</label>
                <input v-model="folderDetails.name" class="block px-2 py-1 w-full bg-white bg-opacity-20 rounded-md"
                    name="folderNameInput" type="text" maxlength="20">
                <!-- <div>
                    <img src="@/images/info.svg" class="inline mr-2 w-4" alt="">
                    <span>Jméno je moc krátké!</span>
                </div> -->

                <div class="flex gap-2 items-center mt-8 mb-2">
                    <div :style="{ backgroundColor: folderColor }" class="w-8 rounded-full border-2 aspect-square"></div>
                    <span class="text-xl font-bold">{{ $t('other.folderColor') }}</span>
                </div>
                <ColorPicker :hue="folderDetails.color[0]" :saturation="folderDetails.color[1]"
                    :lightness="folderDetails.color[1]" @colors-modified="folderDetails.color = $event" />
                <div class="flex justify-between">
                    <button type="button" @click="creatingNewFolder = Folder.NOT_CREATING" class="font-bold text-lof-400">{{
                        $t('other.cancel') }}</button>

                    
                    <button v-if="creatingNewFolder == Folder.CREATING" type="submit" class="p-2 font-bold text-black rounded-md bg-lof-400"><img
                            src="@/images/check.svg" class="inline mr-1 w-5" alt="">{{ $t('other.create') }}</button>
                    <button v-else type="submit" class="p-2 font-bold text-black rounded-md bg-lof-400"><img
                            src="@/images/symbolicSave.svg" class="inline mr-1 w-5 invert" alt="">{{ $t('other.save') }}</button>
                </div>
            </form>
        </Dialog>

        <!-- Folder options -->
        <Dropdown v-if="editDropdownOpen" @picked-option="folderAction" @close="editDropdownOpen = false"
            :icons="[fEdit, fRemove]" :options="[$t('level.edit'), $t('editor.remove')]"
            :button="folderEditButton" />

        <!-- Image Add options -->
        <Dropdown v-if="imgAddOptsOpen" @picked-option="currentTab = 1" @close="imgAddOptsOpen = false"
            :icons="[fLink]" :options="[$t('other.addExternal')]"
            :button="imageAddButton" />

        <!-- External image input -->
        <form v-if="currentTab == 1" action="." @submit.prevent="uploadExternalImage($event.target[0].value)"
            class="flex w-full">
            <button @click="currentTab = 0" class="flex gap-1 items-center pr-2 mr-2 min-w-max bg-black bg-opacity-40 rounded-md button"><img class="w-6 rotate-180" src="@/images/play.svg" alt="">{{ $t('other.back') }}</button>
            <input :placeholder="$t('other.enterURI')" :disabled="loadingImages"
                @change="uploadExternalImage($event.target.value)"
                @paste="uploadExternalImage($event.clipboardData?.getData('Text'))"
                class="p-1 pl-8 w-full bg-black bg-opacity-40 rounded-md transition-opacity grow disabled:opacity-40">
        </form>

        <div v-else class="flex gap-2">
            <div class="flex gap-2 items-center p-1 pl-2 bg-black bg-opacity-40 rounded-md">
                <button @click="imageInput?.uploader?.click()" :disabled="uploadingImage"
                    class="button disabled:opacity-20"><img src="@/images/upload2.svg" class="inline w-5" alt=""><span
                        class="ml-2 max-sm:hidden">{{ $t('editor.uploadFile') }}</span></button>
                <hr class="w-0.5 h-4/5 bg-white rounded-md border-none opacity-20">
                <button ref="imageAddButton" @click="imgAddOptsOpen = true"
                    class="w-3 h-full button disabled:opacity-20"><img src="@/images/levelIcon.svg"
                        class="w-2 rotate-180" alt=""></button>
            </div>

            <div class="flex gap-2 items-center p-1 pl-2 bg-black bg-opacity-40 rounded-md">
                <button :disabled="subfolderLevel >= MAX_SUBFOLDERS" @click="creatingNewFolder = Folder.CREATING"
                    class="button disabled:opacity-20"><img src="@/images/folder.svg" class="inline w-5" alt=""><span
                        class="ml-2 max-sm:hidden">{{ $t('other.createFolder') }}</span></button>
                <hr class="w-0.5 h-4/5 bg-white rounded-md border-none opacity-20">
                <button :disabled="subfolderLevel == 0" ref="folderEditButton" @click="editDropdownOpen = true"
                    class="w-3 h-full button disabled:opacity-20"><img src="@/images/levelIcon.svg"
                        class="w-2 rotate-180" alt=""></button>
            </div>
        </div>

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

    <!-- Pathbar -->
    <div v-if="subfolderLevel > 0 || currentFolder.length > 1"
        class="flex sticky top-1 z-20 justify-center items-center pt-4 pl-2">
        <div class="flex items-center" v-for="(folder, subLevel) in currentFolder">
            <span v-show="subLevel != 0" class="inline mx-2 text-xl font-bold">/</span>
            <button @click="gotoFolder(folder, subLevel)"
                class="inline-flex items-center px-2 py-1 bg-black bg-opacity-20 rounded-md border-b-2 border-b-lof-400 hover:bg-opacity-80">
                <img src="@/images/folder.svg" class="mr-2 w-4 rounded-l-md" alt="">
                {{ folder.slice(1) || $t('other.topFolder') }}</button>
        </div>
    </div>

    <!-- <TabBar :tab-names="[$t('homepage.uploaded')].concat(disableExternal ? [] : [$t('other.external')])"
        @switched-tab="currentTab = $event" /> -->

    <form action="." method="post" @dragover.prevent="fileDrag = true" @drop.prevent="dragInImage"
        @dragexit="fileDrag = false" @dragleave="fileDrag = false" @submit.prevent="" :class="{ 'opacity-40 pointer-events-none': loadingImages }"
        class="h-[40rem] mt-2 overflow-y-auto relative bg-[url(@/images/fade.webp)] bg-repeat-x">
        <HiddenFileUploader v-if="currentTab == 0" @data="uploadImage" ref="imageInput" unclickable multiple
            :disabled="loadingImages || uploadingImage != 0 || folderMoveMode" />

        <div class="grid grid-cols-4 gap-2 m-2" v-show="currentTab == 0"
            :class="{ 'opacity-20 pointer-events-none': uploadingImage }">

            <!-- Folders -->
            <button v-for="folder in folders" @click.exact="gotoFolder(folder.name, subfolderLevel + 1)"
                class="relative h-24 bg-center rounded-sm border-2 transition-all cursor-pointer shadow-drop min-w-5 hover:bg-black hover:bg-opacity-80 hover:z-10"
                :style="{ borderColor: folder.color, background: chroma(folder.color).alpha(0.4).hex() }">

                <div class="grid absolute inset-2 grid-cols-2 gap-2 overflow-clip">
                    <img v-for="thumb in thumbnails[folder.name]"
                        :class="{ 'col-span-2 w-full': thumbnails[folder.name].length == 1 }" class="object-cover h-full"
                        :src="`${pre}/userContent/${storage.uid}/${thumb}-thumb.webp`" alt="">
                </div>
                <div class="absolute inset-0" :style="{ backgroundImage: getFolderGradient(folder.color) }"></div>
                <span class="overflow-hidden absolute bottom-1 left-1/2 z-10 w-full text-lg rounded-sm -translate-x-1/2 hover:bg-black hover:px-2 hover:w-max text-ellipsis">{{
                    getFolderName(folder.name) }}</span>
            </button>

            <!-- Images -->
            <button
                v-for="(image, index) in images"
                @click.exact="pickImage(index, false, $event)"
                @click.right.exact.prevent="imageOptsShown = index"
                @click.ctrl="selectImage(index)"
                @click.middle.exact="startRemoval(index)"
                @mouseover="imageHovering = index"
                @mouseout="imageHovering = -1" :key="image"
                class="relative h-24 bg-center rounded-sm border-2 transition-all duration-75 cursor-pointer shadow-drop min-w-5 hover:bg-black hover:bg-opacity-80 hover:z-10 border-lof-400"
                :class="{ 'opacity-20 pointer-events-none': folderMoveMode && !selectedImages.includes(index), '!border-4': selectedImages.includes(index) }"
            >
                <!-- Image settings -->
                <button ref="button" v-show="imageOptsShown == index || imageHovering == index"
                    @click.stop="imageOptsShown = index"
                    class="absolute top-1 right-1 z-20 w-5 bg-white rounded-full duration-75">
                    <img src="@/images/more.svg" class="p-1 invert">

                    <Dropdown :button="button[index]" @close="imageOptsShown = -1"
                        @picked-option="imageAction($event, false, index)"
                        v-if="imageOptsShown == index && currentTab == 0"
                        :options="[$t('editor.remove'), $t('other.download'), $t('other.move')]" :title="$t('other.options')" />
                </button>

                <!-- Selected check -->
                <img v-if="selectedImages.includes(index)" src="@/images/check.svg"
                    class="absolute top-1 left-1 p-0.5 w-6 rounded-full border-2 border-black bg-lof-400" alt="">

                <!-- Thumbnail -->
                <img loading="lazy" :src="`${pre}/userContent/${storage.uid}/${image}-thumb.webp`" alt=""
                    class="object-cover z-10 w-full h-full transition-transform pointer-events-none aspect-auto"
                    :class="{ 'hover:scale-125': !unselectable }">
            </button>
        </div>

        <!-- External Image -->
        <div class="grid grid-cols-4 gap-2 m-2" v-show="currentTab == 1">
            <button v-for="(image, index) in externaImages" @click="pickImage(index, true)"
                @click.middle.exact="removeImage(externaImages[index], true)"
                @click.right.exact.prevent="imageOptsShown = index"
                @click.ctrl="selectImage(index)"
                class="relative h-24 bg-center rounded-sm border-2 transition-all cursor-pointer group shadow-drop min-w-5 hover:bg-black hover:bg-opacity-80 hover:z-10 border-lof-400"
                :class="{ 'bg-white bg-opacity-20 group bg-[url(@/images/trash.svg)] bg-[length:2rem] bg-no-repeat': false }">
                <!-- Image settings -->
                <button ref="extButton" @click.stop="imageOptsShown = index"
                    class="absolute top-1 right-1 z-20 w-5 overflow-clip bg-white rounded-full opacity-0 transition-opacity duration-75 button group-hover:opacity-100">
                    <img src="@/images/more.svg" class="p-1 invert">

                    <Dropdown :button="extButton[index]" @close="imageOptsShown = -1"
                        @picked-option="imageAction($event, true, index)" ref="dropdown" class="top-8"
                        v-if="imageOptsShown == index && currentTab == 1" :options="[$t('editor.remove'), $t('other.link'), $t('other.move')]" />
                </button>

                <img loading="lazy" :src="image" :alt="image" class="object-cover z-10 w-full h-full aspect-auto">
            </button>
        </div>

        <!-- Help -->
        <div v-show="loadingImages"
            class="absolute top-1/2 left-1/2 z-20 w-max text-center -translate-x-1/2 -translate-y-1/2">
            <img src="@/images/loading.webp" class="mb-2 w-32 animate-spin" alt="">
            <h2 class="text-xl">{{ $t('other.loading') }}...</h2>
        </div>

        <div v-show="(!images.length && !folders.length) && currentTab == 0 || !externaImages.length && currentTab == 1"
            class="absolute top-1/2 left-1/2 text-center opacity-40 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div v-if="currentTab == 0 && currentFolder == '/' && !fileDrag" class="flex flex-col items-center w-max">
                <img src="@/images/image.svg" class="mb-2 w-48" alt="">
                <h2 class="text-xl">{{ $t('other.uploadHelp1') }}</h2>
                <p>{{ $t('other.uploadHelp2') }}</p>
                <p>{{ $t('other.maxFilesize', [toMB(storage.maxUploadSize)]) }}</p>
                <p>{{ $t('other.formats') }}: .jpg, .png, .webp</p>
            </div>
            <div v-else-if="currentTab == 0 && !fileDrag" class="flex flex-col items-center w-max">
                <img src="@/images/folder.svg" class="mb-2 w-48" alt="">
                <h2 class="text-xl">{{ $t('other.folderEmptyHelp') }}</h2>
                <p>{{ $t('other.folderHelp') }}</p>
            </div>
            <div v-else-if="currentTab == 0 && fileDrag"
                class="pt-2 pr-8 pb-4 pl-4 w-max rounded-xl animate-pulse">
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

        <p v-if="images.length" class="grid grid-cols-3 justify-between py-1 py-2 mt-auto text-center opacity-40">
        <div><kbd>CTRL</kbd><span>{{ $t('other.pick') }}</span></div>
        <div><kbd>CTRL</kbd>+<kbd>X</kbd><span>{{ $t('other.cut') }}</span></div>
        <div><kbd>CTRL</kbd>+<kbd>V</kbd><span>{{ $t('other.paste') }}</span></div>
        </p>

    </form>

    <!-- Selected count -->
    <Transition name="fade">
        <div v-show="selectedImages.length"
            class="flex absolute right-0 bottom-0 left-0 z-20 justify-between items-center px-2 py-2 rounded-b-md backdrop-blur-md bg-lof-300">
            <button @click="selectedImages = []; folderMoveMode = false" class="p-1 button"><img class="inline mr-2 w-5"
                    src="@/images/close.svg" alt="">{{ $t('other.cancel') }}</button>
            <h2 class="text-2xl">{{ $t('other.selImg', selectedImages.length) }}</h2>
            <div v-show="!folderMoveMode" class="flex gap-2">
                <button @click="startMoveMode" class="p-1 bg-black bg-opacity-40 rounded-md button"><img
                        class="inline mr-2 w-5" src="@/images/move.svg" alt="">{{ $t('other.move') }}</button>
                <button @click="removeImage('', false)" class="p-1 bg-black bg-opacity-40 rounded-md button"><img
                        class="inline mr-2 w-5" src="@/images/trash.svg" alt="">{{ $t('editor.remove') }}</button>
            </div>
            <button v-if="folderMoveMode" @click="moveToFolder(imagesToMove, currentFolder[subfolderLevel])"
                class="p-1 bg-black bg-opacity-40 rounded-md button"><img class="inline mr-2 w-5"
                    src="@/images/move.svg" alt="">Move here</button>
        </div>
    </Transition>

    <!-- Upload progress -->
    <UploadIndicator :removing="uploadingImage == 2" :visible="uploadingImage > 0" />
</template>

<style>
@keyframes slide {
    from {
        left: -40px;
    }

    to {
        left: calc(100% + 40px);
    }
}

#barAnim {
    @apply animate-[slide_1s_infinite]
}
</style>
