import { ref } from "vue"
import type { LocalNotification } from "@/interfaces"
import { i18n } from "@/locales"

export const Stack = ref<LocalNotification[]>({})
export const summonNotification = (title: string, text: string, icon: string) => {
    Stack.value[Date.now()] = {
        title: title,
        text: text,
        icon: icon
    }
}

const errorMessages = [
    i18n.global.t('reviews.imgError'),
    i18n.global.t('other.imageBig'),
    i18n.global.t('other.imgSmall'),
    i18n.global.t('other.notEnoughSpace'),
    i18n.global.t('other.sameUploaded'),
    i18n.global.t('other.deleteFail'),
    i18n.global.t('other.loginFuckup'),
    i18n.global.t('other.unsupportedFormat'),
    i18n.global.t('other.clipboardEmpty'),
    i18n.global.t('other.imgInUse'),
]

export const notifyError = (ind: number) => {
    summonNotification(i18n.global.t('other.error'), errorMessages[ind], 'error')
}

// export const uploadImage = async (e: Event | FileList, singleFile: boolean) => {
//     if (loadingImages.value || uploadingImage.value) return

//     let file
//     if (!fileList)
//         file = imageInput.value?.files?.[0]
//     else
//         file = e[0]

//     if (file?.size > storage.value.maxUploadSize) return notifyError(1) // Too big
//     if (file?.size < 50) return notifyError(2) // Too small
//     else if (file?.size > storage.value.left) return notifyError(3) // Not enough storage

//     else {
//         let data = await file?.arrayBuffer()
//         uploadingImage.value = true
//         axios({
//             method: 'post',
//             url: import.meta.env.VITE_API + "/images.php",
//             data: data,
//             headers: {"Content-Type": 'image/png'},
//             maxBodyLength: Infinity,
//             maxContentLength: Infinity
//         }).then(res => {
//             uploadingImage.value = 0
//             if (res.data == -5) notifyError(7) // Bad format
//             else if (res.data == -3) notifyError(4) // Already uploaded
//             else if (typeof res.data == "object") {
//                 images.value.splice(0, 0, res.data.newImage)
//                 delete res.data.newImage
//                 storage.value = res.data
//                 setImgCache(images.value)
//                 setStorageCache(storage.value)
//                 uploadingImage.value = false
//             }
//         }).catch(() => uploadingImage.value = 0)
//     }
// }