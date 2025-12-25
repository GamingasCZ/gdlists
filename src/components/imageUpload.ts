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
]

export const notifyError = (ind: ImgFail) => {
    summonNotification(i18n.global.t('other.error'), i18n.global.t(errorMessages[ind]), 'error')
}

export const uploadImages = async (e: FileList | string, singleFile: boolean, folder = -1) => {
    if (typeof e == 'string') return e // Youtube link

    let imageData = new FormData()
    if (e.length == 0) return
    if (e.length > 10) return notifyError(ImgFail.TOO_MANY_IMG)

    if (singleFile) {
        if (!e?.item(0)?.type.match(/image\/(?!svg\+xml)/)) return notifyError(ImgFail.BAD_FORMAT)
        if (e.item(0)?.size <= 200) return notifyError(ImgFail.TOO_SMALL)
        imageData.append('image_0', e.item(0))
    }
    else {
        for (let i = 0; i < e.length; i++) {
            imageData.append(`image_${i}`, e?.item(i))
            if (!e?.item(i)?.type.match(/image\/(?!svg\+xml)/)) return notifyError(ImgFail.BAD_FORMAT)
            if (e?.item(i)?.size <= 200) return notifyError(ImgFail.TOO_SMALL)
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
        if (res.data == -3) notifyError(ImgFail.LOAD_FAILED)
        response = res.data
    })
    .catch(() => {
        notifyError(ImgFail.LOAD_FAILED)
        response = false
    })
    return response
}