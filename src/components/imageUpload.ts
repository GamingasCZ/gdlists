import { reactive, ref } from "vue"
import type { LocalNotification } from "@/interfaces"
import { useI18n } from "vue-i18n"
import { i18n } from "@/locales"
import axios from "axios"
import { breakCache, setStorageCache } from "./global/imageCache"

export const Stack = ref<LocalNotification[]>({})
export const summonNotification = (title: string, text: string, icon: string) => {
    Stack.value[Math.floor(Date.now()*1000).toString()] = {
        title: title,
        text: text,
        icon: icon
    }
}

export enum ImgFail {
    LOAD_FAILED = 0,
    TOO_BIG = 1,
    TOO_SMALL = 2,
    NO_FREE_SPACE = 3,
    ALREADY_UPLOADED = 4,
    DELETE_FAIL = 5,
    SESSION_INVALID = 6,
    BAD_FORMAT = 7,
    CLIPBOARD_EMPTY = 8,
    IMAGE_IN_USE = 9,
    TOO_MANY_IMG = 10,
    MOVE_ERROR = 11,
    CAROUSEL_FULL = 12,
    WAY_TOO_BIG = 13,
    BAD_ASPECT_RATIO = 14
}
const errorMessages = [
    'reviews.imgError',
    'other.imageBig',
    'other.imgSmall',
    'other.notEnoughSpace',
    'other.sameUploaded',
    'other.deleteFail',
    'other.loginFuckup',
    'other.unsupportedFormat',
    'other.clipboardEmpty',
    'other.imgInUse',
    'other.tooManyImg',
    'other.moveError',
    'other.carouselFull',
    'other.wayTooBig',
    'other.badAspectRatio',
]

export const notifyError = (ind: ImgFail) => {
    summonNotification(i18n.global.t('other.error'), i18n.global.t(errorMessages[ind]), 'error')
    return ind
}

const compressImage: (file: File) => Promise<File> = async (file: File) =>
    new Promise((res,rej) => {
        let data = URL.createObjectURL(file)
        let image = new Image()
        
        image.src = data
        image.onload = async e => {
            let w = image.naturalWidth
            let h = image.naturalHeight
            let maxSize = [1920, (1920/w)*h]
            if (h > w)
                maxSize = [(1920/h)*w, 1920]
            let compressCanvas = new OffscreenCanvas(maxSize[0], maxSize[1])
            let ctx = compressCanvas.getContext("2d")
            ctx?.drawImage(image, 0, 0, maxSize[0], maxSize[1])
            res(new File([await compressCanvas.convertToBlob({type: 'image/webp'})], 'compImage'))
        }
        image.onerror = rej
    })

var maxSize = 99999
export const setMaxSize = (to: number) => maxSize = to
export const uploadImages = async (e: FileList | string, singleFile: boolean, folder = -1) => {
    if (typeof e == 'string') return e // Youtube link

    let imageData = new FormData()
    if (e.length == 0) return
    if (e.length > 10) return notifyError(ImgFail.TOO_MANY_IMG)

    if (singleFile) {
        if (!e?.item(0)?.type.match(/image\/(?!svg\+xml)/)) return notifyError(ImgFail.BAD_FORMAT)

        let size = e.item(0)?.size!
        let image = e.item(0)
        if (size <= 2048) return notifyError(ImgFail.TOO_SMALL)
        if (size > maxSize) {
            let error = false
            image = await compressImage(e.item(0)!).catch(_ => error = true)
            if (error) return notifyError(ImgFail.BAD_FORMAT)
            if (image.size > maxSize)
                return notifyError(ImgFail.TOO_BIG)
        }
        imageData.append('image_0', image)
    }
    else {
        for (let i = 0; i < e.length; i++) {
            let size = e.item(i)?.size!
            let image = e?.item(i)
            if (size <= 2048) return notifyError(ImgFail.TOO_SMALL)
            if (size > maxSize) {
                let error = false
                image = await compressImage(e.item(i)!).catch(_ => error = true)
                if (error) return notifyError(ImgFail.BAD_FORMAT)
                if (image.size > maxSize)
                    return notifyError(ImgFail.TOO_BIG)
            }
            if (!e?.item(i)?.type.match(/image\/(?!svg\+xml)/)) return notifyError(ImgFail.BAD_FORMAT)
            imageData.append(`image_${i}`, image)
        }
    }

    breakCache()
    setStorageCache("")
    let response: any = null
    await axios.post(import.meta.env.VITE_API + "/images.php", imageData, {
        headers: {"Content-Type": 'multipart/form-data', "Image-Folder": folder},
        maxBodyLength: Infinity,
        maxContentLength: Infinity
    })
    .then(res => {
        if (res.data == -10) notifyError(ImgFail.TOO_MANY_IMG)
        if (res.data == -6) notifyError(ImgFail.NO_FREE_SPACE)
        if (res.data == -5) notifyError(ImgFail.LOAD_FAILED)
        if (res.data == -4) notifyError(ImgFail.TOO_BIG)
        if (res.data == -11) notifyError(ImgFail.TOO_SMALL)
        if (res.data == -3) notifyError(ImgFail.LOAD_FAILED)
        if (res.data == -12) notifyError(ImgFail.WAY_TOO_BIG)
        if (res.data == -13) notifyError(ImgFail.BAD_ASPECT_RATIO)
        response = res.data
    })
    .catch(() => {
        notifyError(ImgFail.LOAD_FAILED)
        response = false
    })
    return response
}