import type { ImageFolder, ImageStorage } from "@/interfaces"

export type ImageCache = { [path: string]: { folders: ImageFolder[], images: string[], thumbnails: { [path: string]: string }, } }
export var imageCache: ImageCache = {}
export var lastVisitedPath = {
    tree: [["/", -1]],
    subfolder: 0
}
export var lastVisitedExternalPath = {
    tree: [["/", -1]],
    subfolder: 0
}
export var storageCache: ImageStorage
export var lastOpenedTab = 0
export const setLastOpenedTab = (to: number) => lastOpenedTab = to
export var lastColor = null
export const setLastColor = (to: string | null) => lastColor = to

export const setExtCache = (currTree: [string, number][], currSub: number) => {
    lastVisitedExternalPath = {
        tree: currTree,
        subfolder: currSub
    }
}
export const setImgCache = (img: string[], fol: ImageFolder[], thumb: { [path: string]: string }, currTree: [string, number][], currSub: number) => {
    lastVisitedPath = {
        tree: currTree,
        subfolder: currSub
    }
    imageCache[currTree[currSub][1]] = {
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
