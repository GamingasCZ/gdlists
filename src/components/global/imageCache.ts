import type { ImageFolder, ImageStorage } from "@/interfaces"

export type ImageCache = {[path: string]: {folders: ImageFolder[], images: string[], thumbnails: {[path: string]: string}, currFolderData: ImageFolder}}
export var imageCache: ImageCache = {}
export var lastVisitedPath = {
    tree: ["/"],
    subfolder: 0
}
export var storageCache: ImageStorage

export const setImgCache = (img: string[], fol: ImageFolder[], thumb: {[path: string]: string}, tree: string[], currSub: number) => {
    lastVisitedPath = {
        tree: tree,
        subfolder: currSub
    }
    imageCache[tree[currSub]] = {
        images: img,
        folders: fol,
        thumbnails: thumb,
    }
}

export const breakCache = (path?: string) => {
    if (path)
        delete imageCache[path]
    else
        imageCache = {}
}

export const setStorageCache = (val: ImageStorage) => storageCache = val