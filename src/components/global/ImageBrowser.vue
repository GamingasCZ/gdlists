<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from "vue";
import { computed } from "vue";
import axios from "axios";
import type { ImageFolder, ImageStorage } from "@/interfaces";
import { hasLocalStorage } from "@/siteSettings";
import { imageCache, storageCache, setImgCache, setStorageCache, lastVisitedPath, breakCache, lastOpenedTab, setLastOpenedTab, lastVisitedExternalPath, setExtCache, lastColor, setLastColor } from "./imageCache";
import Dropdown from "../ui/Dropdown.vue";
import Dialog from "./Dialog.vue";
import { onBeforeUnmount } from "vue";
import { ImgFail, notifyError, uploadImages } from "../imageUpload";
import HiddenFileUploader from "../ui/HiddenFileUploader.vue";
import UploadIndicator from './UploadIndicator.vue'
import ColorPicker from "./ColorPicker.vue";
import { currentUID, makeColor } from "@/Editor";
import chroma, { Color } from "chroma-js";
import ImageViewer from "./ImageViewer.vue";

import fEdit from "@/images/edit.svg?url"
import fRemove from "@/images/trash.svg?url"
import fLink from "@/images/link.svg?url"

const props = defineProps<{
    unselectable: boolean
    disableExternal?: boolean
    allowMultiplePicks?: boolean
}>()

enum Tabs { Uploaded = 0, External = 1 }

const MAX_SUBFOLDERS = 3
const toMB = (val: number) => Math.round(val / 100_00) / 100
const currentTab = ref(props.disableExternal ? Tabs.Uploaded : lastOpenedTab)
const storageInUse = computed(() => (storage.value.left / storage.value.storageMax) * 100)
const pre = import.meta.env.VITE_USERCONTENT
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

const images = ref<string[]>(imageCache)
const folders = ref<ImageFolder[]>([])
var allExternalImages: [[string, number][] | string[]] = []
var allExternalFolders: ImageFolder[] = []
const externalImages = ref<string[]>([])
const extImgFolders = ref<ImageFolder[]>([])
const MAX_EXT_IMAGES = 200

const loadingImages = ref(true)

enum Folder { NOT_CREATING = 0, CREATING = 1, EDITING = 2 }
const creatingNewFolder = ref(Folder.NOT_CREATING)

const currentFolder = ref<[string, number][]>([])
const currentExtFolder = ref<[string, number][]>([])
const subfolderLevel = ref(0)
const subfolderExtLevel = ref(0)

const folderEditButton = ref<HTMLDivElement>()
const editDropdownOpen = ref(false)
const imageAddButton = ref<HTMLDivElement>()
const imgAddOptsOpen = ref(false)

const goToTab = (to: number) => {
    if (currentTab.value == to) return
    
    setLastOpenedTab(to)
    currentTab.value = to
    if (to == Tabs.Uploaded)
        gotoFolder(currentFolder.value[subfolderLevel.value], subfolderLevel.value)
    else
        gotoFolder(currentExtFolder.value[subfolderExtLevel.value], subfolderExtLevel.value)
}

const getImgSrc = (image: string) => {
    if (currentTab.value == Tabs.Uploaded)
        return `${pre}/userContent/${storage.value.uid}/${image}-thumb.webp`
    else
        return typeof image == 'object' ? image[0] : image
}

const removeConfirmationOpen = ref(-1)
const startRemoval = (index: number) => {
    if (currentTab.value == Tabs.External)
        return removeImage(externalImages.value[index], true)

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
            if (res.data == "-3") return notifyError(ImgFail.DELETE_FAIL)
            if (res.data == "-5") return notifyError(ImgFail.IMAGE_IN_USE)

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
            notifyError(ImgFail.DELETE_FAIL)
        })

    }
    else {
        for (let i = 0; i < allExternalImages.length; i++) {
            let img = typeof hash == 'object' ? hash[0] : hash
            if (typeof allExternalImages[i] == 'string') {
                if (allExternalImages[i] == img) {
                    allExternalImages.splice(i, 1)
                    break
                }
            }
            else {
                if (allExternalImages[i][0] == img) {
                    allExternalImages.splice(i, 1)
                    break
                }
            }
        }
        localStorage.setItem("externalImages", JSON.stringify(allExternalImages))
        refreshContent(currentExtFolder.value[subfolderExtLevel.value])
    }
    removeConfirmationOpen.value = -1
}

const uploadingImage = ref(false)
const uploadImage = async (e: FileList, fileList?: boolean) => {
    if (loadingImages.value || uploadingImage.value || folderMoveMode.value) return
    goToTab(Tabs.Uploaded)

    let totalFilesize = 0
    for (let i = 0; i < e.length; i++) {
        let file = e.item(i)
        totalFilesize += file?.size
        if (!file?.type.startsWith("image")) return notifyError(ImgFail.BAD_FORMAT) // Too big
        if (file?.size < 50) return notifyError(ImgFail.TOO_SMALL) // Too small
    }
    if (totalFilesize > storage.value.left) return notifyError(ImgFail.NO_FREE_SPACE) // Not enough storage

    uploadingImage.value = true
    let res = await uploadImages(e, false, currentFolder.value[subfolderLevel.value][1])
    if (typeof res == 'object') {
        images.value.splice(0, 0, ...res.newImage.filter(x => !images.value.includes(x)))

        delete res.newImage
        storage.value = res
        setImgCache(images.value, folders.value, thumbnails.value, currentFolder.value, subfolderLevel.value)
        setStorageCache(storage.value)
        uploadingImage.value = false
    }
    else {
        if (res == -4) notifyError(ImgFail.TOO_BIG) // Too big
    }
    uploadingImage.value = 0
}

const extImgInput = ref<HTMLInputElement>()
var lastAddedLink = ""
const uploadExternalImage = async (link: string) => {
    loadingImages.value = true

    setTimeout(async () => {
        const load = new Promise((res, err) => {
            let img = document.createElement("img")
            img.src = link
            img.onload = e => res(e)
            img.onerror = () => err("Image not found :D")
            img.remove()
        })

        await load.catch((err) => {
            notifyError(ImgFail.LOAD_FAILED)
            loadingImages.value = false
            extImgInput.value.value = ''
            return err;
        })
        
        await load.then(() => {
            extImgInput.value.value = ''
            if (lastAddedLink == link) {
                emit("pickImage", link)
                emit('closePopup')
            }
            else {
                allExternalImages.splice(0, 0, [link, currentExtFolder.value[subfolderExtLevel.value][1]])
            }
            lastAddedLink = link
            localStorage.setItem("externalImages", JSON.stringify(allExternalImages))

            refreshContent(currentExtFolder.value[subfolderExtLevel.value])
            loadingImages.value = false
        })
    }, 10);

}

const previewImage = ref(false)
const pickImage = (index: number | number[], external: boolean, event?: MouseEvent) => {
    let url;
    let singleSelect = typeof index == 'number'
    emit('closePopup')

    if (index == -1)
        return emit('pickImage', '')

    if (singleSelect) {
        if (external) url = externalImages.value[index]?.[0]
        else url = `${pre}/userContent/${storage.value.uid}/${images.value[index]}.webp`
    }
    else {
        if (external) url = index.map(x => externalImages.value[x]?.[0])
        else url = index.map(x => `${pre}/userContent/${storage.value.uid}/${images.value[x]}.webp`)
    }

    if (props.unselectable) {
        previewImage.value = true
        imageIndex.value = index
        return
    }
    else {
        if (props.disableExternal) {
            if (singleSelect)
                emit('pickImage', images.value[index])
            else
                emit('pickImage', index.map(x => images.value[x]))
        }
        else
            emit('pickImage', url)

    }
}

const selectedImages = ref<number[]>([])
const selectImage = (index: number) => {
    if (currentTab.value == Tabs.Uploaded)
        copyFromPath = currentFolder.value[subfolderLevel.value][1]
    else
        copyFromPath = currentExtFolder.value[subfolderExtLevel.value][1]

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

    serverResponse.forEach(x => thumbnails.value[x.folder] = [])
    serverResponse.forEach(x => thumbnails.value[x.folder].push(x.hash))
}

const mediaContent = ref<HTMLDivElement>()
const refreshContent = async (currPath: [string, number] | object, external: boolean) => {
    loadingImages.value = true

    if ((currentTab.value == Tabs.External || external)) {
        if (external === false) return

        if (currPath?.tree) {
            currentExtFolder.value = currPath.tree
            subfolderExtLevel.value = currPath.subfolder

            if (lastColor)
                modifyColors(chroma(lastColor))
            return refreshContent(currPath.tree[currPath.subfolder], true)
        }

        // Root directory
        if (currPath[1] == -1)
            externalImages.value = allExternalImages.filter(x => {
                return typeof x == "string" || x[1] == -1
            })
        else {
            externalImages.value = allExternalImages.filter(x => {
                if (typeof x != "string") {
                    return x[1] == currPath[1]
                }
            })
        }
        extImgFolders.value = allExternalFolders.filter(x => {
            return x.base == currPath[1]
        })

        extImgFolders.value.forEach(x => {
            thumbnails.value[x.id] = []

            let thumb = allExternalImages.find(y => y[1] == x.id)
            if (thumb)
                thumbnails.value[x.id].push(thumb)
        });

        if (!currentExtFolder.value.includes(currPath)) {
            for (let i = subfolderExtLevel.value; i < MAX_SUBFOLDERS; i++)
                currentExtFolder.value.splice(subfolderExtLevel.value, 1)
        }
        currentExtFolder.value[subfolderExtLevel.value] = currPath
        setExtCache(currentExtFolder.value, subfolderExtLevel.value)

        loadingImages.value = false
        return
    }

    if (currPath?.tree) {
        currentFolder.value = currPath.tree
        subfolderLevel.value = currPath.subfolder
        
        if (lastColor)
            modifyColors(chroma(lastColor))
        return refreshContent(currPath.tree[currPath.subfolder])
    }

    if (!currentFolder.value.includes(currPath)) {
        for (let i = subfolderLevel.value; i < MAX_SUBFOLDERS; i++)
            currentFolder.value.splice(subfolderLevel.value, 1)
    }
    currentFolder.value[subfolderLevel.value] = currPath

    let hasCache = imageCache[currPath[1]]
    let getReq = { folderID: encodeURIComponent(currPath[1]) }

    let content;
    if (hasCache) {
        content = [storageCache, imageCache]
        nextTick(() => mediaContent.value?.children?.[0]?.focus())
        loadingImages.value = false
    }
    else content = await axios.get(import.meta.env.VITE_API + "/images.php", { params: getReq }).then(res => {
        loadingImages.value = false
        nextTick(() => mediaContent.value?.children?.[0]?.focus())
        return res.data
    })

    images.value = hasCache ? content[1][currPath[1]].images : content[1]
    folders.value = hasCache ? content[1][currPath[1]].folders : content[2]
    storage.value = content[0]

    if (hasCache)
        thumbnails.value = content[1][currPath[1]].thumbnails
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

const imageOptsShown = ref<HTMLButtonElement | false>(false)
const imageHovering = ref(-1)

const imageAction = (id: number, external: boolean, val: string | number) => {
    previewImage.value = false
    switch (id) {
        case 0: // Remove
            if (external) removeImage(externalImages.value[val], true);
            else startRemoval(val);
            break;
        case 1:
            downloadImage(val, external); break
        case 2:
            selectImage(val)
            startMoveMode();
            break;
    }
}

const holdingShift = ref(false)
const modifierHeld = (e: KeyboardEvent) => {
    holdingShift.value = e.shiftKey

    switch (e.key) {
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
            e.preventDefault()
            break;
    }

    if (e.type != "keyup") return

    // Up folder
    let currSelected = +(document?.activeElement?.dataset?.ind)
    if (e.key == 'ArrowDown')
        mediaContent.value?.children[Math.max(0, Math.min(currSelected+4, images.value.length+folders.value.length))].focus()
    if (e.key == 'ArrowUp')
        mediaContent.value?.children[Math.max(0, Math.min(currSelected-4, images.value.length+folders.value.length))].focus()
    if (e.key == 'ArrowLeft')
        mediaContent.value?.children[Math.max(0, Math.min(currSelected-1, images.value.length+folders.value.length))].focus()
    if (e.key == 'ArrowRight')
        mediaContent.value?.children[Math.max(0, Math.min(currSelected+1, images.value.length+folders.value.length))].focus()
        

    // Up folder
    if (e.key == 'Backspace')
        gotoFolder(currentFolder.value[subfolderLevel.value-1] , subfolderLevel.value-1)

    // CTRL + X = move mode
    if (e.ctrlKey && e.key == 'x')
        startMoveMode()

    // CTRL + V = paste into folder
    if (e.ctrlKey && e.key == 'v') {
        moveToFolder(imagesToMove.value)
    }

}
document.addEventListener("keydown", modifierHeld)
document.addEventListener("keyup", modifierHeld)

onBeforeUnmount(() => {
    document.removeEventListener("keydown", modifierHeld)
    document.removeEventListener("keyup", modifierHeld)
})

const button = ref<HTMLButtonElement>()

const checkFolderName = (name: string) => {
    for (let i = 0; i < name.length; i++) {
        let ord = name.charCodeAt(i)
        if (ord < 32 || ord >= 127 || [47].includes(ord))
            return false
    }
    return true
}

const folderCreateMessages = [
    "",
    'other.folderNameShort',
    'other.folderNameExists',
    'other.folderInvChar',
]
const folderValid = ref([0, false]) // [Error text, is valid]
const checkFolder = () => {
    let name = folderDetails.value.name
    if (name.length == 0)
        folderValid.value = [0, false]
    else if (name.length < 3)
        folderValid.value = [1, false]
    else if (!checkFolderName(name))
        folderValid.value = [3, false]
    else if (currentTab.value == Tabs.Uploaded && imageCache[currentFolder.value[subfolderLevel.value][1]].folders.findIndex(x => x.name == '/' + name) != -1)
        folderValid.value = [2, false]
    else if (currentTab.value == Tabs.External && currentExtFolder.value.findIndex(x => x[0] == name) != -1)
        folderValid.value = [2, false]
    else
        folderValid.value = [0, true]
}

const folderDetails = ref({
    name: "",
    color: makeColor()
})
watch(() => folderDetails.value.name, checkFolder)

const folderColor = computed(() => {
    return chroma.hsl(folderDetails.value.color[0], 1, folderDetails.value.color[2] / 64).hex()
})

const modifyFolder = () => {
    let data = {
        action: 'createFolder',
        name: folderDetails.value.name,
        color: folderColor.value,
    }

    if (creatingNewFolder.value == Folder.CREATING) {
        if (currentTab.value == Tabs.External) {
            let newFolder = {
                name: '/'+data.name,
                id: Date.now(),
                color: data.color,
                base: currentExtFolder.value[subfolderExtLevel.value][1]
            }
            allExternalFolders.push(newFolder)
            localStorage.setItem("extImgFolders", JSON.stringify(allExternalFolders))
            refreshContent(currentExtFolder.value[subfolderExtLevel.value])
        }
        else {
            data.currentFolder = currentFolder.value[subfolderLevel.value][1]
            axios.put(import.meta.env.VITE_API + "/images.php", data).then(() => {
                breakCache()
                refreshContent(currentFolder.value[subfolderLevel.value])
            })
        }

    }
    else {
        modifyColors(chroma(folderColor.value))
        if (currentTab.value == Tabs.External) {
            let folderInd = allExternalFolders.findIndex(x => x.id == currentExtFolder.value[subfolderExtLevel.value][1])
            currentExtFolder.value[subfolderExtLevel.value][0] = "/" + folderDetails.value.name
            allExternalFolders[folderInd].name = '/'+data.name
            allExternalFolders[folderInd].color = data.color

            localStorage.setItem("extImgFolders", JSON.stringify(allExternalFolders))
            refreshContent(currentExtFolder.value[subfolderExtLevel.value])
        }
        else {
            axios.patch(import.meta.env.VITE_API + "/images.php", data).then(() => {
                currentFolder.value[subfolderLevel.value][0] = "/" + folderDetails.value.name
                breakCache()
                refreshContent(currentFolder.value[subfolderLevel.value])
            })
        }
    }
    creatingNewFolder.value = Folder.NOT_CREATING
}

const getFolderName = (path: string) => {
    return path.slice(1)
}

const getFolderGradient = (hex: string) => {
    return `linear-gradient(0deg, ${hex}, transparent)`
}

const gotoFolder = (folder: [string, number], subLevel: number) => {
    if (loadingImages.value) return
    if (subLevel < 0) return

    let searchSub = subLevel - 1
    if (searchSub < 0)
        modifyColors(null, true)
    else if (currentTab.value == Tabs.External) {
        let col: Color;
        allExternalFolders.forEach(x => {
            if (folder[1] == x.id)
                col = chroma(x.color)
        })

        modifyColors(col!)
    }
    else if (!imageCache?.[currentFolder.value?.[searchSub][1]])
        modifyColors(null, true)
    else {
        let col: Color;
        imageCache[currentFolder.value[searchSub][1]].folders.forEach(x => {
            if (folder[0] == x.name)
                col = chroma(x.color)
        })

        modifyColors(col!)
    }

    loadingImages.value = true
    if (currentTab.value == Tabs.Uploaded)
        subfolderLevel.value = subLevel
    else
        subfolderExtLevel.value = subLevel

    if (!folderMoveMode.value)
        selectedImages.value = []

    if (!folder)
        refreshContent(["/", -1])
    else
        refreshContent(folder)
}

const removeCurrentFolder = (keepImages: boolean) => {
    if (currentTab.value == Tabs.Uploaded)
        removeFolder(currentFolder.value[subfolderLevel.value][1], keepImages)
    else
        removeFolder(currentExtFolder.value[subfolderExtLevel.value][1], keepImages)
}

const folderAction = (opt: number) => {
    switch (opt) {
        case 0: editFolder(); break;
        case 1:
            if (!images.value.length && !folders.value.length)
                removeCurrentFolder(false)
            else {
                removingFolder.value = true
                removeConfirmationOpen.value = 1
            }
            break;
    }
}

const folderNameEl = ref<HTMLInputElement>()
const createNewFolder = () => {
    folderDetails.value.name = ""
    creatingNewFolder.value = Folder.CREATING
    folderDetails.value.color = makeColor()
    nextTick(() => folderNameEl.value?.focus())
}

const editFolder = () => {
    creatingNewFolder.value = Folder.EDITING
    let name;
    if (currentTab.value == Tabs.Uploaded)
        name = currentFolder.value[subfolderLevel.value][0].slice(1)
    else
        name = currentExtFolder.value[subfolderExtLevel.value][0].slice(1)

    folderDetails.value = {
        name: name,
        color: chroma(folderColor.value).hsl()
    }
    folderDetails.value.color[2] *= 64
    nextTick(() => folderNameEl.value?.focus())
}

const folderMoveMode = ref(false)
var copyFromPath = -1
const imagesToMove = ref<string[]>([])
const moveToFolder = (imgs: string[]) => {
    if (!imgs.length) return
    if (loadingImages.value) return

    let folderID: number
    if (currentTab.value == Tabs.Uploaded)
        folderID = currentFolder.value[subfolderLevel.value][1]
    else
        folderID = currentExtFolder.value[subfolderExtLevel.value][1]

    let data = {
        action: "moveToFolder",
        folderID: folderID,
        images: imgs
    }
    imagesToMove.value = []
    folderMoveMode.value = false
    selectedImages.value = []

    if (folderID == copyFromPath)
        return

    if (currentTab.value == Tabs.Uploaded) {
        axios.put(import.meta.env.VITE_API + "/images.php", data).then(newCache => {
            breakCache()

            parseThumbs(newCache.data[3])
            setImgCache(newCache.data[1], newCache.data[2], thumbnails.value, currentFolder.value, subfolderLevel.value)

            refreshContent(currentFolder.value[subfolderLevel.value])
        }).catch((_) => {
            notifyError(ImgFail.MOVE_ERROR)
        })
    }
    else {
        let onlyURIs = imgs.map(x => x[0])
        allExternalImages = allExternalImages.filter(x => {
            if (typeof x == 'string')
                return !imgs.includes(x)
            else
                return !(onlyURIs.includes(x[0]) && x[1] == copyFromPath)
        })
        imgs.forEach(x => allExternalImages.push([typeof x == 'string' ? x : x[0], folderID]))
        localStorage.setItem("externalImages", JSON.stringify(allExternalImages))
        refreshContent(currentExtFolder.value[subfolderExtLevel.value])
    }
}

const startMoveMode = () => {
    if (!selectedImages.value.length) return
    if (loadingImages.value) return

    folderMoveMode.value = true
    if (currentTab.value == Tabs.Uploaded)
        imagesToMove.value = selectedImages.value.map(x => images.value[x])
    else
        imagesToMove.value = selectedImages.value.map(x => externalImages.value[x])
}

const imageIndex = ref(0)
const removingFolder = ref(false)
const removeFolder = (folderID: number, keepImages: boolean, recursive = false) => {
    removeConfirmationOpen.value = -1
    removingFolder.value = false

    if (currentTab.value == Tabs.External) {
        let currFolderID = folderID
        let rmInd = allExternalFolders.findIndex(x => x.id == currFolderID)
        allExternalFolders.splice(rmInd, 1)
        if (keepImages) {
            let keptImages = allExternalImages.filter(x => x[1] == currFolderID)
            for (let i = 0; i < keptImages.length; i++)
                keptImages[i][1] = currentExtFolder.value[subfolderExtLevel.value-1][1]
        }
        else
          allExternalImages = allExternalImages.filter(x => x[1] != currFolderID)

        let subfolders = allExternalFolders.filter(x => x.base == currFolderID)
        subfolders.forEach(x => removeFolder(x.id, keepImages, true))

        if (recursive) return

        currentExtFolder.value.splice(subfolderExtLevel.value, currentExtFolder.value.length - subfolderExtLevel.value)
        localStorage.setItem("externalImages", JSON.stringify(allExternalImages))
        localStorage.setItem("extImgFolders", JSON.stringify(allExternalFolders))
        
        return gotoFolder(currentExtFolder.value[Math.max(0, subfolderExtLevel.value - 1)], subfolderExtLevel.value - 1)
    }

    let addto = currentFolder.value[Math.max(0, subfolderLevel.value - 1)]
    let params = {
        removeFolder: folderID,
        folderAddTo: addto[1],
        keepImages: !keepImages,
    }

    loadingImages.value = true
    axios.delete(import.meta.env.VITE_API + "/images.php", { params: params }).then(() => {
        currentFolder.value.splice(subfolderLevel.value, currentFolder.value.length - subfolderLevel.value)
        breakCache()
        loadingImages.value = false
        gotoFolder(addto, subfolderLevel.value - 1)
    })
}

const isSelected = (index: number) => {
    let path: boolean
    if (currentTab.value == Tabs.Uploaded)
        path = copyFromPath == currentFolder.value?.[subfolderLevel.value]?.[1]
    else
        path = copyFromPath == currentExtFolder.value?.[subfolderExtLevel.value]?.[1]
    return path && selectedImages.value.includes(index)
}

const randomAssElement = ref<HTMLDivElement>()
let currentColor = "#000000"
const modifyColors = (newColor: Color | null, reset?: boolean) => {

    console.log(newColor)
    let assParent = randomAssElement.value?.parentElement
    if (reset && !newColor) {
        assParent?.style.setProperty("--primaryColor", null)
        assParent?.style.setProperty("--secondaryColor", null)
        assParent?.style.setProperty("--brightGreen", null)
        setLastColor(null)
        return
    }
    currentColor = newColor?.hex()!
    setLastColor(currentColor)
    let hue = newColor?.hsl()[0] ?? 0
    assParent?.style.setProperty("--primaryColor", chroma.hsl(hue, 0.9, 0.17).hex())
    assParent?.style.setProperty("--secondaryColor", chroma.hsl(hue, 0.23, 0.1).hex())
    assParent?.style.setProperty("--brightGreen", chroma.hsl(hue, 0.53, 0.63).hex())
}

onMounted(() => {
    // Load images from cache or server
    refreshContent(lastVisitedPath, false)
    
    if (hasLocalStorage()) {
        allExternalImages = JSON.parse(localStorage.getItem("externalImages")!) ?? []
        allExternalFolders = JSON.parse(localStorage.getItem("extImgFolders")!) ?? []
        refreshContent(lastVisitedExternalPath, true)
    }
})


</script>

<template>
    <div ref="randomAssElement" class="pb-2 mx-2">
        <ImageViewer v-if="previewImage" @close-popup="previewImage = false" @remove="imageAction(0, currentTab == Tabs.External, imageIndex)"
            @download="imageAction(1, currentTab == Tabs.External, imageIndex)" @move="imageAction(2, currentTab == Tabs.External, imageIndex)"
            :url-array="currentTab ? externalImages : undefined" :hash-array="!currentTab ? images : undefined"
            v-model="imageIndex" :uid="currentUID" />

        <!-- Remove confirmation -->
        <Dialog :title="$t('other.removal')" @close-popup="removeConfirmationOpen = -1"
            :open="removeConfirmationOpen > -1">
            <div class="flex gap-2 items-center px-2 py-4 max-sm:flex-col">
                <img src="@/images/trash.svg" class="mr-2 opacity-10 min-w-28" alt="">
                <div>
                    <h2 class="text-xl font-black">{{ $t('other.imgRemove1', [removingFolder ? $t('other.thisFolder') :
                        $t('other.thisPic')]) }}?</h2>
                    <p v-if="currentTab == Tabs.External">
                        {{ $t('other.extFolderRm') }}
                    </p>
                    <p v-else-if="removingFolder" class="flex flex-col gap-3 pr-2 text-balance">
                        <p v-if="images.length">{{ $t('other.folderRemove2') }}</p>
                        <p v-if="folders.length">{{ $t('other.folderRemove3') }}
                            <span v-if="images.length && folders.length">{{ $t('other.folderRemove4') }}</span>.
                        </p>
                    </p>
                    <p v-else>{{ $t('other.imgRemove2') }}</p>

                    <p v-if="!removingFolder" class="my-2 text-sm text-yellow-200">{{ $t('other.imgRemove3') }}</p>

                </div>
            </div>

            <div v-if="removingFolder" class="grid gap-2 m-2 sm:grid-cols-2">
                <button v-if="currentTab != Tabs.External && folders.length && !images.length" @click="removeCurrentFolder(false)"
                    class="flex col-span-2 gap-2 items-center p-2 text-lg font-bold text-black bg-red-400 rounded-md button">
                    <img src="@/images/del.svg" class="w-6">{{ $t('other.deleteFolders') }}</button>
                <button v-if="images.length || currentTab == Tabs.External" @click="removeCurrentFolder(false)"
                    class="flex gap-2 items-center p-2 font-bold text-black bg-red-400 rounded-md button">
                    <img src="@/images/del.svg" class="w-6">{{ $t('other.deleteImgs') }}</button>
                <button v-if="images.length || currentTab == Tabs.External" @click="removeCurrentFolder(true)"
                    class="flex gap-2 items-center p-2 font-bold text-black bg-yellow-400 rounded-md button">
                    <img src="@/images/move.svg" class="w-6 invert">{{ $t('images.imgMoveDel') }}</button>
            </div>
            <button v-else @click="removeImage(images[removeConfirmationOpen], currentTab == Tabs.External)"
                class="flex gap-2 items-center px-2 py-1 mx-auto my-2 w-max text-2xl font-bold text-black bg-red-400 rounded-md button">
                <img src="@/images/del.svg" class="w-6">
                {{ $t('editor.remove') }}
            </button>
        </Dialog>

        <!-- New folder Dialog -->
        <Dialog :title="$t('other.newFolder')" @close-popup="creatingNewFolder = Folder.NOT_CREATING"
            :open="creatingNewFolder != Folder.NOT_CREATING">
            <form @submit.prevent="modifyFolder()" class="p-2">
                <label for="folderNameInput" class="text-xl font-bold">{{ $t('other.folderName') }}</label>
                <input ref="folderNameEl" v-model="folderDetails.name"
                    class="block px-2 py-1 w-full bg-white bg-opacity-20 rounded-md" name="folderNameInput" type="text"
                    maxlength="20">
                <div class="pt-2" :class="{ 'opacity-0': folderValid[1] || !folderValid[0] }">
                    <img src="@/images/info.svg" class="inline mr-2 w-4" alt="">
                    <span>{{ $t(folderCreateMessages[folderValid[0]]) }}</span>
                </div>

                <div class="flex gap-2 items-center mt-6 mb-2">
                    <div :style="{ backgroundColor: folderColor }" class="w-8 rounded-full border-2 aspect-square">
                    </div>
                    <span class="text-xl font-bold">{{ $t('other.folderColor') }}</span>
                </div>
                <ColorPicker :hue="folderDetails.color[0]" :saturation="1"
                    :lightness="folderDetails.color[2]" @colors-modified="folderDetails.color = $event" />
                <div class="flex justify-between">
                    <button type="button" @click="creatingNewFolder = Folder.NOT_CREATING"
                        class="font-bold text-lof-400">{{
                            $t('other.cancel') }}</button>


                    <button :disabled="!folderValid[1]" v-if="creatingNewFolder == Folder.CREATING" type="submit"
                        class="p-2 font-bold text-black rounded-md disabled:grayscale disabled:opacity-20 bg-lof-400"><img
                            src="@/images/check.svg" class="inline mr-1 w-5" alt="">{{ $t('other.create') }}</button>
                    <button :disabled="!folderValid[1]" v-else type="submit"
                        class="p-2 font-bold text-black rounded-md disabled:grayscale disabled:opacity-20 bg-lof-400"><img
                            src="@/images/symbolicSave.svg" class="inline mr-1 w-5 invert" alt="">{{ $t('other.save')
                        }}</button>
                </div>
            </form>
        </Dialog>

        <!-- Folder options -->
        <Dropdown v-if="editDropdownOpen" @picked-option="folderAction" @close="editDropdownOpen = false"
            :icons="[fEdit, fRemove]" :options="[$t('level.edit'), $t('editor.remove')]" :button="folderEditButton" />

        <!-- Image Add options -->
        <Dropdown v-if="imgAddOptsOpen" @picked-option="goToTab(1)" @close="imgAddOptsOpen = false" :icons="[fLink]"
            :options="[$t('other.addExternal')]" :button="imageAddButton" />

        <div class="flex gap-10 justify-between">
            <!-- External image input -->
            <form v-if="currentTab == Tabs.External" action="."
                @submit.prevent="uploadExternalImage($event.target[3].value)" class="flex w-full">
                <button @click="goToTab(0)" type="button"
                    class="flex gap-1 items-center pr-2 mr-2 min-w-max bg-black bg-opacity-40 rounded-md button"><img
                        class="w-6 rotate-180" src="@/images/play.svg" alt="">{{ $t('other.back') }}</button>

                <div class="flex gap-2 items-center p-1 pl-2 mr-2 min-w-max bg-black bg-opacity-40 rounded-md">
                    <button type="button" :disabled="subfolderExtLevel >= MAX_SUBFOLDERS" @click="createNewFolder"
                        class="button disabled:opacity-20"><img src="@/images/folder.svg" class="inline w-5"
                            alt=""><span class="ml-2 max-sm:hidden">{{ $t('other.createFolder') }}</span></button>
                    <hr class="w-0.5 h-4/5 bg-white rounded-md border-none opacity-20">
                    <button type="button" :disabled="subfolderExtLevel == 0" ref="folderEditButton"
                        @click="editDropdownOpen = true" class="w-3 h-full button disabled:opacity-20"><img
                            src="@/images/levelIcon.svg" class="w-2 rotate-180" alt=""></button>
                </div>

                <input ref="extImgInput" :placeholder="$t('other.enterURI')" :disabled="loadingImages"
                    @paste="uploadExternalImage($event.clipboardData?.getData('Text'))"
                    class="p-1 bg-[url(@/images/searchOpaque.svg)] bg-[size:1rem] bg-[0.5rem] bg-no-repeat pl-8 w-full bg-black bg-opacity-40 rounded-md transition-opacity grow disabled:opacity-40">
            </form>

            <!-- Image upload header -->
            <div v-else class="flex gap-2">
                <div class="flex items-center p-1 px-2 bg-black bg-opacity-40 rounded-md">
                    <button @click="imageInput?.uploader?.click()" :disabled="uploadingImage"
                        class="button disabled:opacity-20"><img src="@/images/upload2.svg" class="inline w-5"
                            alt=""><span class="ml-2 max-sm:hidden">{{ $t('editor.uploadFile') }}</span></button>
                    <hr v-if="!disableExternal" class="mx-2 w-0.5 h-4/5 bg-white rounded-md border-none opacity-20">
                    <button v-if="!disableExternal" ref="imageAddButton" @click="imgAddOptsOpen = true"
                        class="h-full button disabled:opacity-20"><img src="@/images/levelIcon.svg"
                            class="w-2 rotate-180" alt=""></button>
                </div>

                <div class="flex gap-2 items-center p-1 pl-2 bg-black bg-opacity-40 rounded-md">
                    <button :disabled="subfolderLevel >= MAX_SUBFOLDERS" @click="createNewFolder"
                        class="button disabled:opacity-20"><img src="@/images/folder.svg" class="inline w-5"
                            alt=""><span class="ml-2 max-sm:hidden">{{ $t('other.createFolder') }}</span></button>
                    <hr class="w-0.5 h-4/5 bg-white rounded-md border-none opacity-20">
                    <button :disabled="subfolderLevel == 0" ref="folderEditButton" @click="editDropdownOpen = true"
                        class="w-3 h-full button disabled:opacity-20"><img src="@/images/levelIcon.svg"
                            class="w-2 rotate-180" alt=""></button>
                </div>
            </div>

            <!-- Storage left -->
            <div class="flex flex-col" v-show="currentTab == Tabs.Uploaded">
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
        <div v-if="((subfolderLevel > 0 || currentFolder.length > 1) && currentTab == Tabs.Uploaded) || ((subfolderExtLevel > 0 || currentExtFolder.length > 1) && currentTab == Tabs.External)"
            class="flex overflow-auto items-center px-2 pt-4 mx-auto w-max max-w-full">
            <div class="flex items-center" v-for="(folder, subLevel) in (currentTab ? currentExtFolder : currentFolder)">
                <span v-show="subLevel != 0" class="inline mx-2 text-xl font-bold">/</span>
                <button @click="gotoFolder(folder, subLevel)"
                    :class="{ 'bg-black bg-opacity-40': (subfolderLevel == subLevel && currentTab == Tabs.Uploaded) || (subfolderExtLevel == subLevel && currentTab == Tabs.External) }"
                    class="inline-flex items-center px-2 py-1 w-max rounded-md border-b-2 border-b-lof-400 hover:bg-opacity-80">
                    <img src="@/images/folder.svg" class="mr-2 w-4" alt="">
                    {{ folder[0].slice(1) || $t('other.topFolder') }}</button>
            </div>
        </div>
    </div>

    <form action="." method="post" @dragover.prevent="fileDrag = true" @drop.prevent="dragInImage"
        @dragexit="fileDrag = false" @dragleave="fileDrag = false" @submit.prevent=""
        :class="{ 'opacity-40 pointer-events-none': loadingImages }"
        class="h-[40rem] overflow-y-auto relative bg-[url(@/images/fade.webp)] bg-repeat-x">
        <HiddenFileUploader v-if="currentTab == Tabs.Uploaded" @data="uploadImage" ref="imageInput" unclickable multiple
            :disabled="loadingImages || uploadingImage != 0 || folderMoveMode" />

        <div ref="mediaContent" class="grid grid-cols-4 gap-2 m-2" :class="{ 'opacity-20 pointer-events-none': uploadingImage }">

            <!-- Folders -->
            <button v-for="(folder, ind) in (currentTab ? extImgFolders : folders)"
                @click.exact="gotoFolder([folder.name, folder.id], (currentTab ? subfolderExtLevel : subfolderLevel) + 1)"
                class="relative h-24 bg-center rounded-sm transition-all cursor-pointer focus-within:outline-4 focus-within:outline focus-within:outline-lof-400 group shadow-drop min-w-5 hover:bg-black hover:bg-opacity-80 hover:z-10"
                :style="{ borderColor: folder.color, background: chroma(folder.color).alpha(0.4).hex() }" :data-ind="ind">

                <div class="grid absolute inset-2 grid-cols-2 gap-2 overflow-clip">
                    <img v-for="thumb in thumbnails[folder.id]"
                        :class="{ 'col-span-2 w-full': thumbnails[folder.id].length == 1 }" class="object-cover h-full"
                        :src="getImgSrc(thumb)" alt="">
                </div>
                <div class="absolute inset-0" :style="{ backgroundImage: getFolderGradient(folder.color) }"></div>
                <span
                    class="overflow-hidden absolute bottom-1 z-10 w-full text-lg rounded-sm -translate-x-1/2 left-1/ 2 text-ellipsis"
                    :class="{ 'group-hover:bg-black group-hover:bg-opacity-40 group-hover:px-2 group-hover:w-max': folder.name.length > 12 }">{{
                        getFolderName(folder.name) }}</span>
            </button>

            <!-- Images -->
            <button v-for="(image, index) in (currentTab ? externalImages : images)"
                v-memo="[imageHovering == index, imageOptsShown, folderMoveMode, selectedImages.length]"
                @click.exact="pickImage(index, currentTab == Tabs.External, $event)" @click.right.exact.prevent=""
                @click.ctrl="selectImage(index)" @click.middle.exact="startRemoval(index)"
                @mouseenter="imageHovering = index" @mouseleave="imageHovering = -1" :key="image"
                class="relative h-24 bg-center rounded-sm transition-all duration-75 cursor-pointer border-lof-400 focus-within:outline-4 focus-within:outline focus-within:outline-lof-400 shadow-drop min-w-5 hover:bg-black hover:bg-opacity-80 hover:z-10"
                :class="{ 'opacity-20 pointer-events-none': folderMoveMode && !isSelected(index), '!border-4': isSelected(index) }" :data-ind="index + folders.length">
                <!-- Image settings -->
                <button :key="image" tabindex="-1" v-show="imageOptsShown == index || imageHovering == index"
                    @click.stop="button = $event.target; imageOptsShown = index"
                    class="absolute top-1 right-1 z-20 w-5 bg-white rounded-full duration-75">
                    <img src="@/images/more.svg" class="p-1 invert">

                    <Dropdown :button="button" @close="imageOptsShown = -1"
                        @picked-option="imageAction($event, currentTab == Tabs.External, index)" v-if="imageOptsShown === index"
                        :options="[$t('editor.remove'), $t('other.download'), $t('other.move')]"
                        :title="$t('other.options')" />
                </button>

                <!-- Selected check -->
                <img v-if="isSelected(index)" src="@/images/check.svg"
                    class="absolute top-1 left-1 p-0.5 w-6 rounded-full border-2 border-black bg-lof-400" alt="">

                <!-- Thumbnail -->
                <img loading="lazy" :src="getImgSrc(image)" alt=""
                    class="object-cover z-10 w-full h-full transition-transform pointer-events-none aspect-auto"
                    :class="{ 'hover:scale-125': !unselectable }">
            </button>
        </div>

        <!-- Help -->
        <div v-show="loadingImages"
            class="absolute top-1/2 left-1/2 z-20 w-max text-center -translate-x-1/2 -translate-y-1/2">
            <img src="@/images/loading.webp" class="mb-2 w-32 animate-spin" alt="">
            <h2 class="text-xl">{{ $t('other.loading') }}...</h2>
        </div>

        <div v-show="!loadingImages && ((!images.length && !folders.length) && currentTab == Tabs.Uploaded || (!externalImages.length && !extImgFolders.length) && currentTab == Tabs.External)"
            class="absolute top-1/2 left-1/2 text-center opacity-40 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div v-if="currentTab == Tabs.Uploaded && currentFolder == '/' && !fileDrag"
                class="flex flex-col items-center w-max">
                <img src="@/images/image.svg" class="mb-2 w-48" alt="">
                <h2 class="text-xl">{{ $t('other.uploadHelp1') }}</h2>
                <p>{{ $t('other.uploadHelp2') }}</p>
                <p>{{ $t('other.maxFilesize', [toMB(storage.maxUploadSize)]) }}</p>
                <p>{{ $t('other.formats') }}: .jpg, .png, .webp</p>
            </div>
            <div v-else-if="currentTab == Tabs.Uploaded && !fileDrag" class="flex flex-col items-center w-max">
                <img src="@/images/folder.svg" class="mb-2 w-48" alt="">
                <h2 class="text-xl">{{ $t('other.folderEmptyHelp') }}</h2>
                <p>{{ $t('other.folderHelp') }}</p>
            </div>
            <div v-else-if="currentTab == Tabs.Uploaded && fileDrag"
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

        <!-- <p v-if="images.length" class="grid grid-cols-3 justify-between py-2 mt-auto text-center opacity-40">
        <div><kbd>CTRL</kbd><span>{{ $t('other.pick') }}</span></div>
        <div><kbd>CTRL</kbd>+<kbd>X</kbd><span>{{ $t('other.cut') }}</span></div>
        <div><kbd>CTRL</kbd>+<kbd>V</kbd><span>{{ $t('other.paste') }}</span></div>
        </p> -->

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
                <button @click="removeImage('', currentTab == Tabs.External)" class="p-1 bg-black bg-opacity-40 rounded-md button"><img
                    class="inline mr-2 w-5" src="@/images/trash.svg" alt="">{{ $t('editor.remove') }}</button>
                <button v-if="allowMultiplePicks && !unselectable" @click="pickImage(selectedImages, currentTab == Tabs.External, $event)" class="p-1 bg-black bg-opacity-40 rounded-md button"><img
                        class="inline mr-2 w-5" src="@/images/checkThick.svg" alt="">{{ $t('other.pick') }}</button>
            </div>
            <button v-if="folderMoveMode" @click="moveToFolder(imagesToMove)"
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
