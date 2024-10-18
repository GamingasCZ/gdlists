<script setup lang="ts">
import { ref } from "vue";
import TabBar from "../ui/TabBar.vue";
import { computed } from "vue";
import axios from "axios";
import type { ImageFolder, ImageStorage } from "@/interfaces";
import { hasLocalStorage } from "@/siteSettings";
import { imageCache, storageCache, setImgCache, setStorageCache, folderCache } from "./imageCache";
import Dropdown from "../ui/Dropdown.vue";
import Dialog from "./Dialog.vue";
import { onBeforeUnmount } from "vue";
import { dialog } from "../ui/sizes";
import { getDominantColor } from "@/Reviews";
import { notifyError, uploadImages } from "../imageUpload";
import HiddenFileUploader from "../ui/HiddenFileUploader.vue";
import UploadIndicator from './UploadIndicator.vue'
import ColorPicker from "./ColorPicker.vue";
import { makeColor } from "@/Editor";
import chroma from "chroma-js";

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
const creatingNewFolder = ref(false)
const currentFolder = ref("/")

if (hasLocalStorage()) {
    externaImages.value = JSON.parse(localStorage.getItem("externalImages")!) ?? []
}

const removeConfirmationOpen = ref(-1)
const startRemoval = (index: number) => {
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
            setImgCache(images.value, folders.value)
            setStorageCache(storage.value)
            previewImage.value[0] = -1
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
        if (file?.size > storage.value.maxUploadSize) return notifyError(1) // Too big
        if (file?.size < 50) return notifyError(2) // Too small
    }
    if (totalFilesize > storage.value.left) return notifyError(3) // Not enough storage
    
    uploadingImage.value = true
    let res = await uploadImages(e)
    if (typeof res == 'object') {
        images.value.splice(0, 0, ...res.newImage.filter(x => !images.value.includes(x)))

        delete res.newImage
        storage.value = res
        setImgCache(images.value, folders.value)
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

const previewImage = ref([-1, ""])
const pickImage = (index: number, external: boolean) => {
    let url;
    if (external) url = externaImages.value[index]
    else url = `${pre}/userContent/${storage.value.uid}/${images.value[index]}.webp`

    if (props.unselectable) {
        let el = document.createElement("img")
        el.src = url
        previewImage.value = [index, url]
        el.onload = () => {
            let getColor = getDominantColor(el)
            previewDominant.value = `linear-gradient(9deg, ${getColor.darken().hex()}, ${getColor.brighten().hex()})`
            el.remove()
        }
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
}

const refreshContent = async (data?: [string[], string[], ImageFolder[]]) => {
    loadingImages.value = true
    let getReq = {currentFolder: encodeURIComponent(currentFolder.value)}

    let content;
    if (data) content = data
    else content = await axios.get(import.meta.env.VITE_API + "/images.php", {params: getReq}).then(res => res.data)
   
    images.value = content[1]
    folders.value = content[2]
    storage.value = content[0]
    setImgCache(images.value, folders.value)
    setStorageCache(storage.value)
    loadingImages.value = false
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
    previewImage.value = [-1, ""]
    switch (id) {
        case 0: // Remove
            if (external) removeImage(externaImages.value[val], true);
            else startRemoval(val);
            break;
        case 1:
            downloadImage(val, external); break
    }
}

const holdingShift = ref(false)
const modShift = (e: KeyboardEvent) => holdingShift.value = e.shiftKey
document.addEventListener("keydown", modShift)
document.addEventListener("keyup", modShift)

onBeforeUnmount(() => {
    document.removeEventListener("keydown", modShift)
    document.removeEventListener("keyup", modShift)
})
const previewDominant = ref()

const button = ref()
const extButton = ref()

const folderDetails = ref({
    name: "",
    color: makeColor()
})
const folderColor = computed(() => {
    return chroma.hsl(folderDetails.value.color[0], folderDetails.value.color[1], folderDetails.value.color[2]/64).hex()
})
const folderCreateMessages = [
    "Jméno je moc krátké!",
    "Jméno složky nemůže obsahovat lomítko",
]
const createFolder = () => {
    let data = {
        action: 'createFolder',
        name: folderDetails.value.name,
        color: folderColor.value,
        currentFolder: "/"
    }
    axios.put(import.meta.env.VITE_API+"/images.php", data).then(() => {
        refreshContent()
        creatingNewFolder.value = false
    })
}

const getFolderName = (path: string) => {
    let splitPath = path.split("/")
    return splitPath[splitPath.length - 1]
}

const getFolderGradient = (hex: string) => {
    return `linear-gradient(0deg, ${hex}, transparent)`
}

const gotoFolder = (folderName: string) => {
    currentFolder.value = folderName
    refreshContent()
}

const goUpFolder = () => {
    if (currentFolder.value == '/') return

    let splitPath = currentFolder.value.split("/")
    if (splitPath.length == 2)
        gotoFolder("/")
    else
        gotoFolder(splitPath.slice(0, splitPath.length - 1).join("/"))
}

const folderMoveMode = ref(false)
const imagesToMove = ref<string[]>([])
const moveToFolder = (imgs: string[], folderID: number) => {
    let data = {
        action: "moveToFolder",
        folderID: folderID,
        images: imgs
    }
    axios.put(import.meta.env.VITE_API+"/images.php", data).then(() => {
        refreshContent()
        folderMoveMode.value = false
        selectedImages.value = []
    })
}

// Load images from cache or server
if (!storageCache) {
    refreshContent()
}
else {
    refreshContent([storageCache, imageCache, folderCache])
}

</script>

<template>
    <div class="flex gap-10 justify-between mx-2 mb-2">
        <Dialog :custom-color="previewDominant" :title="$t('other.preview')" :width="dialog.large" :open="previewImage[0] !== -1" @close-popup="previewImage[0] = -1">
            <div class="flex relative flex-col gap-2 items-center p-2 w-full bg-black bg-opacity-40">
                <img :src="previewImage[1]" :alt="previewImage[1]" class="absolute inset-0 w-full max-w-full h-full text-center text-white rounded-md opacity-50 mix-blend-overlay blur-lg pointer-events-none">
                <img :src="previewImage[1]" :alt="previewImage[1]" class="w-max pointer-events-none isolate max-w-full text-white max-h-[80vh] text-center rounded-md">
                <div class="grid grid-cols-2 gap-2 w-full">
                    <button @click="imageAction(0, currentTab == 1, previewImage[0])" class="flex gap-2 p-2 text-xl text-left bg-black bg-opacity-40 rounded-md transition-colors hover:bg-opacity-60"><img class="w-6" src="@/images/trash.svg">{{ $t('editor.remove') }}</button>
                    <button v-show="currentTab == 0" @click="imageAction(1, false, previewImage[0])" class="flex gap-2 p-2 text-xl text-left bg-black bg-opacity-40 rounded-md transition-colors hover:bg-opacity-60"><img class="w-6" src="@/images/copy.svg">{{ $t('other.download') }}</button>
                    <button v-show="currentTab == 1" @click="imageAction(1, true, previewImage[1])" class="flex gap-2 p-2 text-xl text-left bg-black bg-opacity-40 rounded-md transition-colors hover:bg-opacity-60"><img class="w-6" src="@/images/link.svg">{{ $t('other.link') }}</button>
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

        <!-- New folder Dialog -->
        <Dialog :title="$t('other.newFolder')" @close-popup="creatingNewFolder = false" :open="creatingNewFolder">
            <form @submit.prevent="createFolder()" class="p-2">
                <label for="folderNameInput" class="text-xl font-bold">Jméno složky</label>
                <input v-model="folderDetails.name" class="block px-2 py-1 w-full bg-white bg-opacity-20 rounded-md" name="folderNameInput" type="text">
                <div>
                    <img src="@/images/info.svg" class="inline mr-2 w-4" alt="">
                    <span>Jméno je moc krátké!</span>
                </div>

                <div class="flex gap-2 items-center mt-8 mb-2">
                    <div :style="{backgroundColor: folderColor}" class="w-8 rounded-full border-2 aspect-square"></div>
                    <span class="text-xl font-bold">Barva složky</span>
                </div>
                <ColorPicker :hue="folderDetails.color[0]" :saturation="folderDetails.color[1]" :lightness="folderDetails.color[1]" @colors-modified="folderDetails.color = $event"/>
                <div class="flex justify-between">
                    <button type="button" @click="creatingNewFolder = false" class="font-bold text-lof-400">{{ $t('other.cancel') }}</button>
                    <button type="submit" class="p-2 font-bold text-black rounded-md bg-lof-400"><img src="@/images/check.svg" class="inline mr-1 w-5" alt="">{{ $t('other.create') }}</button>
                </div>
            </form>
        </Dialog>

        <!-- External image input -->
        <form v-if="currentTab == 1" action="." @submit.prevent="uploadExternalImage($event.target[0].value)" class="w-full">
            <input :placeholder="$t('other.enterURI')" :disabled="loadingImages" @change="uploadExternalImage($event.target.value)" @paste="uploadExternalImage($event.clipboardData?.getData('Text'))"
                class="p-1 pl-8 w-full bg-white bg-opacity-20 rounded-md transition-opacity disabled:opacity-40">
        </form>


        <button v-else @click="imageInput?.uploader?.click()" :disabled="uploadingImage"
            class="flex gap-2 items-center p-1 px-2 bg-black bg-opacity-40 rounded-md disabled:opacity-20 button">
            <img src="@/images/copy.svg" alt="" class="w-6">
            <span class="max-sm:hidden">{{ $t('editor.uploadFile') }}</span>
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
    
    <div class="flex items-center p-2">
        <button @click="goUpFolder()" :disabled="currentFolder == '/'" class="p-1 bg-black bg-opacity-40 rounded-md disabled:opacity-20 button"><img src="@/images/plus.svg" class="inline mr-2 w-5" alt="">Up</button>
        <span class="ml-2 text-lg">{{ currentFolder == '/' ? 'Top Folder' : currentFolder }}</span>
        <button @click="creatingNewFolder = true" class="p-1 ml-auto bg-black bg-opacity-40 rounded-md button"><img src="@/images/plus.svg" class="inline mr-2 w-5" alt="">Create Folder</button>
    </div>
    
    <form action="." method="post" @dragover.prevent="fileDrag = true" @drop.prevent="dragInImage"
        @dragexit="fileDrag = false" @submit.prevent=""
        class="h-[40rem] overflow-y-auto relative bg-[url(@/images/fade.webp)] bg-repeat-x">
        <HiddenFileUploader v-if="currentTab == 0" @data="uploadImage" ref="imageInput" unclickable multiple :disabled="loadingImages || uploadingImage != 0" />

        <!-- Images + folders -->
        <div class="grid grid-cols-4 gap-2 m-2" v-show="currentTab == 0" :class="{'opacity-20 pointer-events-none': uploadingImage}">
            <button v-for="(folder, index) in folders"
                @click.exact="() => folderMoveMode ? moveToFolder(imagesToMove, folder.id) : gotoFolder(folder.name)"
                class="relative h-24 bg-center rounded-sm border-2 transition-all cursor-pointer shadow-drop min-w-5 hover:bg-black hover:bg-opacity-80 hover:z-10"
                :style="{borderColor: folder.color, background: chroma(folder.color).alpha(0.4).hex()}"
            >
                
                <div class="absolute inset-0" :style="{backgroundImage: getFolderGradient(folder.color)}"></div>
                <span class="absolute bottom-1 left-1/2 text-lg -translate-x-1/2">{{ getFolderName(folder.name) }}</span>
            </button>

            <button v-for="(image, index) in images"
                @click.exact="pickImage(index, false)"
                @click.ctrl="selectImage(index)"
                @auxclick="startRemoval(index)"
                @mouseover="imageHovering = index"
                @mouseout="imageHovering = -1"
                class="relative h-24 bg-center rounded-sm border-2 transition-all cursor-pointer shadow-drop min-w-5 hover:bg-black hover:bg-opacity-80 hover:z-10 border-lof-400"
                :class="{'opacity-20 pointer-events-none': folderMoveMode, '!border-4': selectedImages.includes(index)}">
                <!-- Image settings -->
                <button ref="button" v-show="imageOptsShown == index || imageHovering == index" @click.stop="imageOptsShown = index"
                    class="absolute top-1 right-1 z-20 w-5 bg-white rounded-full duration-75">
                    <img src="@/images/more.svg" class="p-1 invert">

                    <Dropdown :button="button[index]" @close="imageOptsShown = -1" @picked-option="imageAction($event, false, index)" v-if="imageOptsShown == index && currentTab == 0" :options="[$t('editor.remove'), $t('other.download')]" :title="$t('other.options')" />
                </button>

                <!-- Selected check -->
                <img v-if="selectedImages.includes(index)" src="@/images/check.svg" class="absolute top-1 left-1 p-0.5 w-6 rounded-full border-2 border-black bg-lof-400" alt="">

                 <!-- Thumbnail -->
                <img loading="lazy" :src="`${pre}/userContent/${storage.uid}/${image}-thumb.webp`" alt=""
                    class="object-cover z-10 w-full h-full transition-transform pointer-events-none aspect-auto" :class="{'hover:scale-125': !unselectable}">
            </button>
        </div>

        <!-- External Image -->
        <div class="grid grid-cols-4 gap-2 m-2" v-show="currentTab == 1">
            <button v-for="(image, index) in externaImages"
                @click="pickImage(index, true)"
                @auxclick="removeImage(externaImages[index], true)"
                class="relative h-24 bg-center rounded-sm border-2 transition-all cursor-pointer group shadow-drop min-w-5 hover:bg-black hover:bg-opacity-80 hover:z-10 border-lof-400"
                :class="{ 'bg-white bg-opacity-20 group bg-[url(@/images/trash.svg)] bg-[length:2rem] bg-no-repeat': false }">
                <!-- Image settings -->
                <button ref="extButton" @click.stop="imageOptsShown = index"
                    class="absolute top-1 right-1 z-20 w-5 overflow-clip bg-white rounded-full opacity-0 transition-opacity duration-75 button group-hover:opacity-100">
                    <img src="@/images/more.svg" class="p-1 invert">

                    <Dropdown :button="extButton[index]" @close="imageOptsShown = -1" @picked-option="imageAction($event, true, index)" ref="dropdown" class="top-8" v-if="imageOptsShown == index && currentTab == 1" :options="['Smazat', 'Odkaz']" :title="'Možnosti'" />
                </button>

                <img loading="lazy" :src="image" :alt="image" class="object-cover z-10 w-full h-full aspect-auto">
            </button>
        </div>

        <!-- Help -->
        <div v-show="!images.length && currentTab == 0 || !externaImages.length && currentTab == 1"
            class="absolute top-1/2 left-1/2 text-center opacity-40 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div v-if="loadingImages" class="w-max">
                <img src="@/images/loading.webp" class="mb-2 w-32 animate-spin" alt="">
                <h2 class="text-xl">{{ $t('other.loading') }}...</h2>
            </div>
            <div v-else-if="currentTab == 0 && currentFolder == '/' && !fileDrag" class="flex flex-col items-center w-max">
                <img src="@/images/image.svg" class="mb-2 w-48" alt="">
                <h2 class="text-xl">{{ $t('other.uploadHelp1') }}</h2>
                <p>{{ $t('other.uploadHelp2') }}</p>
                <p>{{ $t('other.maxFilesize', [toMB(storage.maxUploadSize)]) }}</p>
                <p>{{ $t('other.formats') }}: .jpg, .png, .webp</p>
            </div>
            <div v-else-if="currentTab == 0 && !fileDrag" class="flex flex-col items-center w-max">
                <img src="@/images/image.svg" class="mb-2 w-48" alt="">
                <h2 class="text-xl">Tato složka je prázdná!</h2>
                <p>Můžes sem přetáhnout a vkládat nové obrázky, nebo je vybrat z jiné složky a vložit je sem!</p>
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

        <p v-if="images.length" class="py-1 mt-auto text-center">Hold <kbd>CTRL</kbd> to select multiple images!</p>
        
    </form>

    <!-- Selected count -->
    <Transition name="fade">
        <div v-show="selectedImages.length" class="flex absolute right-0 bottom-0 left-0 z-20 justify-between items-center px-2 py-2 rounded-b-md backdrop-blur-md bg-lof-300">
            <button @click="selectedImages = []; folderMoveMode = false" class="p-1 button"><img class="inline mr-2 w-5" src="@/images/close.svg" alt="">{{ $t('other.cancel') }}</button>
            <h2 class="text-2xl">{{ $t('other.selImg', selectedImages.length) }}</h2>
            <div v-show="!folderMoveMode" class="flex gap-2">
                <button @click="folderMoveMode = true; imagesToMove = selectedImages.map(x => images[x])" class="p-1 bg-black bg-opacity-40 rounded-md button"><img class="inline mr-2 w-5" src="@/images/move.svg" alt="">{{ $t('other.move') }}</button>
                <button @click="removeImage('', false)" class="p-1 bg-black bg-opacity-40 rounded-md button"><img class="inline mr-2 w-5" src="@/images/trash.svg" alt="">{{ $t('editor.remove') }}</button>
            </div>
        </div>
    </Transition>
    
    <!-- Upload progress -->
    <UploadIndicator :removing="uploadingImage == 2" :visible="uploadingImage > 0" />
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
