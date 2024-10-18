import type { ImageFolder, ImageStorage } from "@/interfaces"

export var imageCache: string[] = []
export var folderCache: ImageFolder[] = []
export var storageCache: ImageStorage

export const setImgCache = (img: string[], fol: ImageFolder[]) => {
    imageCache = img
    folderCache = fol
}
export const setStorageCache = (val: ImageStorage) => storageCache = val