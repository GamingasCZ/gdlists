import type { ImageStorage } from "@/interfaces"

export var imageCache: string[] = []
export var storageCache: ImageStorage

export const setImgCache = (val: string[]) => imageCache = val
export const setStorageCache = (val: ImageStorage) => storageCache = val