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
]

export const notifyError = (ind: number) => {
    summonNotification(i18n.global.t('other.error'), i18n.global.t(errorMessages[ind]), 'error')
}

export const uploadImages = async (e: FileList | string, singleFile: boolean, folder = -1) => {
    if (typeof e == 'string') return e // Youtube link

    let imageData = new FormData()
    if (e.length == 0) return
    if (e.length > 10) return notifyError(10)

    if (singleFile)
        imageData.append('image_0', e.item(0))
    else {
        for (let i = 0; i < e.length; i++) {
            imageData.append(`image_${i}`, e?.item(i))
            if (!e?.item(i)?.type.match(/image\/(?!svg\+xml)/)) return notifyError(7)
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
        if (res.data == -4) notifyError(1)
        if (res.data == -3) notifyError(0)
        response = res.data
    })
    .catch(() => {
        notifyError(0)
        response = false
    })
    return response
}