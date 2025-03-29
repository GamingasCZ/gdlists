import { type Ref, ref } from "vue"
import { DEFAULT_LEVEL, DEFAULT_LEVELLIST, modernizeLevels } from "./Editor"
import type { FavoritedLevel, Level, LevelList, ListFetchResponse, PostData, ReviewList, ReviewRating } from "./interfaces"
import { i18n } from "./locales"
import chroma from "chroma-js"
import containers from "./components/writer/containers"
import { SETTINGS } from "./siteSettings"
import axios from "axios"

export const DEFAULT_RATINGS: ReviewRating[] = [
    {
        name: i18n.global.t('reviews.gameplay'),
        rating: 5,
        color: [0, 0.74, 0.52]
    },
    {
        name: i18n.global.t('collabTools.deco'),
        rating: 5,
        color: [90, 0.74, 0.52]
    },
    {
        name: i18n.global.t('reviews.difficulty'),
        rating: 5,
        color: [180, 0.74, 0.52]
    },
    {
        name: i18n.global.t('reviews.totalScore'),
        rating: 5,
        color: [270, 0.74, 0.52]
    },
]

export const REVIEW_EXTRAS: () => ReviewList = () => ({
    containers: [],
    ratings: [],
    settings: [],
    private: false,
    transparentPage: 0,
    language: SETTINGS.value.language ? 'en' : 'cs',
    whitePage: false,
    readerMode: true,
    font: 0,
    fontTint: false,
})

export const addReviewLevel = (postData: Ref<LevelList>, levelData?: Level | FavoritedLevel, maxLevels = 10) => {
    if (postData.value.levels.length >= maxLevels) return
    let diff = levelData?.difficulty?.[0] ? levelData?.difficulty : [levelData?.difficulty, levelData?.rating]

    let levelInfo = DEFAULT_LEVEL()
    if (levelData?.levelName) levelInfo.levelName = levelData.levelName
    if (levelData?.creator) levelInfo.creator = levelData.creator
    if (levelData?.color) levelInfo.color = levelData.color
    if (levelData?.diff?.[0]) levelInfo.diff = diff
    if (levelData?.levelID) levelInfo.levelID = levelData.levelID

    postData.value.levels.push(levelInfo)
}

export const DEFAULT_REVIEWDATA = () => ({ ...DEFAULT_LEVELLIST(), ...REVIEW_EXTRAS() })

export const modernizeReview = (serverResponse: ListFetchResponse) => {
    // Modernize levels
    modernizeLevels(serverResponse.data.levels)
    return serverResponse.data
}

const funnyErrorMessages = [
    "",
    "Umm... ",
    "Stop that, ",
    " STOP BEING SILLY!!",
    `You dare defy the lord of darkness, `
]

let uploadTries = 0
export function checkReview(post: ReviewList) {
    const err = (err: string, warn: number[]) => {
        let fancyErr = err
        switch (uploadTries) {
            case 1:
            case 2: fancyErr = funnyErrorMessages[uploadTries] + err.slice(0,1).toLowerCase() + err.slice(1); break;
            
            case 3: fancyErr = err.toUpperCase() + funnyErrorMessages[uploadTries]; break;
            case 4: fancyErr = funnyErrorMessages[uploadTries] + JSON.parse(localStorage.getItem("account_info"))[0] + "?"; break;

            default: break;
        }

        uploadTries = (uploadTries + 1) % 5 // TODO
        return { success: false, error: err, warn: warn }
    }
    let error = { success: true, mess: '', warn: [0, 0, 0] }
    if (!post.containers.length) return err(i18n.global.t('reviews.bro'))
    if (post.reviewName.length < 3) return err(i18n.global.t('reviews.nameToo', [i18n.global.t('other.short')]))
    if (post.reviewName.length > 40) return err(i18n.global.t('reviews.nameToo', [i18n.global.t('other.long')]))

    post.ratings.forEach(customRating => {
        if (!customRating.name.length) {
            error.mess = i18n.global.t('reviews.ratingMissingName')
            error.success = false
        }
    })

    if (post.levels.length == 0)
        error.warn[0] = 1

    let i = 0
    let allLevelIDs: string[] = []
    post.levels.forEach((level: Level) => {
        i += 1
        if (!level.levelName.length) error.mess = i18n.global.t('reviews.levelNo', [i, i18n.global.t('other.name')])
        if (!level.creator.length) error.mess = i18n.global.t('reviews.levelNo', [i, i18n.global.t('other.creator')]) // COLLABY TOD
        if (!level.levelID && level.levelID?.match(/\d+/)) error.mess = i18n.global.t('reviews.levelNo', [i, 'ID'])
        if (level.levelID) allLevelIDs.push(level.levelID)

        let allRatings = level.ratings?.[0].concat(level.ratings[1])
        if (allRatings.filter(x => x == -1).length == allRatings.length)
            error.warn[1] = 1

        else if (allRatings.includes(-1))
            error.warn[2] = 1
        
        if (error.mess) error.success = false
    })
    
    for (let i = 0; i < allLevelIDs.length; i++) {
        for (let j = i+1; j < allLevelIDs.length; j++) {
            if (allLevelIDs[i] == allLevelIDs[j]) {
                error.mess = i18n.global.t('editor.noDuplicates')
                error.success = false
            }
        }
    }

    post.containers.forEach(container => {
        if (containers[container.type].canEditText) {
            if (!container.data) {
                error.mess = i18n.global.t('reviews.notFilledIn', [containers[container.type].placeholder])
                error.success = false
            }
        }

        let valCheck = containers[container.type].errorCheck?.(container.settings) ?? { success: true }
        if (!valCheck.success) {
            error.mess = valCheck.error.replace("%s", containers[container.type].settings[valCheck.index].title)
            error.success = false
        }
    })
    post.containers.filter(c => c.type == "twoColumns").forEach(nest => {
        nest.settings.components.forEach(column => {
            column.filter(x => x === Object(x)).forEach(container => { // filter out maxWidth
                if (containers[container.type].canEditText) {
                    if (!container.data) {
                        error.mess = i18n.global.t('reviews.notFilledIn', [containers[container.type].placeholder])
                        error.success = false
                    }
                }
        
                let valCheck = containers[container.type].errorCheck?.(container.settings) ?? { success: true }
                if (!valCheck.success) {
                    error.mess = valCheck.error.replace("%s", containers[container.type].settings[valCheck.index].title)
                    error.success = false
                }
            });
        });
    })
    if (!error.success) return err(error.mess, error.warn)

    uploadTries = 0
    return { success: true, error: '', warn: error.warn }
}

export const selectedNestContainer = ref(0)
export const flexNames = { left: "start", center: "center", right: "end", justify: "space-between" }

let lastHeader = 0
export const resetIndentation = () => lastHeader = 0
export function parseReviewContainers(containers: object[], indicies: number[]) {
    // types: 0 - image; 1,2,3 - title 1,2,3; 4 - video
    let main: [number, number, number, string][] = []
    containers.forEach(container => {
        if (container !== Object(container)) return

        switch (container.type) {
            case "heading1":
            case "heading2":
            case "heading3":
                lastHeader = +container.type.slice(-1)
                indicies[lastHeader-1] += 1
                main.push([container.type, indicies[lastHeader-1], lastHeader, container.data])
                break;

            case "showImage":
                // Decorative only image
                if (container.settings?.onlyDeco) return

                indicies[3] += 1
                main.push([container.type, indicies[3], lastHeader+1, container.settings.description || container.settings.alt || i18n.global.t('reviews.picture')])
                break;

            case "addVideo":
                indicies[4] += 1
                main.push([container.type, indicies[4], lastHeader+1, container.settings.description || i18n.global.t("level.video")])
                break;

            case "addCarousel":
                indicies[5] += 1
                main.push([container.type, indicies[5], lastHeader+1, container.settings.components?.[0]?.settings?.description || i18n.global.t("reviews.imgCount", container.settings.components.length)])
                break;

            case "twoColumns":
                container.settings.components.forEach(column => main.push(...parseReviewContainers(column, indicies)))
                break;

            default:
                break;
        }
    });
    return main
}

export const pickFont = (ind: number) => {
    let fonts = ['Poppins', 'serif', 'sans-serif', 'monospace', 'system-ui', 'Pusab']
    return fonts[ind]
}

export function getDominantColor(image: HTMLImageElement) {
    if (!image) return chroma(0)

    let canvas = new OffscreenCanvas(1, 1)
    let ctx = canvas.getContext("2d")
    ctx?.drawImage(image, 0, 0, 1, 1)
    let dominantColor = chroma.rgb(...ctx?.getImageData(0, 0, 1, 1).data)
    return dominantColor
}

export function getDominantLine(image: HTMLImageElement) {
    if (!image) return 0
    const w = 48, h = 27

    let canvas = new OffscreenCanvas(w,h)
    let ctx = canvas.getContext("2d", {alpha: false})
    ctx?.drawImage(image, 0, 0, w, h)
    let imageData = ctx?.getImageData(0, 0, w, h)
    if (!imageData) return 0

    let differenceArray = Array(h).fill(0)
    let lineCounter = 0
    const pixelSize = w*4
    for (let i = 0; i < imageData?.data.length; i += 4) {
        differenceArray[lineCounter] += 8290687 - imageData?.data[i] * imageData?.data[i+1] * imageData?.data[i+2]
        if (i >= pixelSize*(lineCounter+1))
            lineCounter++
    }

    let maxDiff = Math.min(...differenceArray)
    return Math.trunc(differenceArray.findIndex(x => x == maxDiff) / h * 100)
}

export function getWordCount(post: ReviewList) {
    let count = 0
    post.containers.forEach(c => {
        count += (c.data.match(/\w+/g) ?? []).length
        if (c.type == "twoColumns") {
            c.settings.components.forEach(con => {
                con.forEach(sub => (count += (sub?.data?.match(/\w+/g) ?? []).length))
            })
        }
    })
    return count
}

export const getReviewPreview = (postData: PostData) => {
    let firstHeading = (document.querySelector("div[data-type*=heading] > p")?.innerText ?? "").trim()
    let firstParagraph = (document.querySelector("div[data-type=default] > p")?.innerText ?? "").trim()
    if (firstHeading.length > 100) firstHeading = firstHeading.slice(0, 100)+"..."
    if (firstParagraph.length > 100) firstParagraph = firstParagraph.slice(0, 100)+"..."
    return {title: firstHeading, preview: firstParagraph, counter: getWordCount(postData)}
}

export const getEmbeds = async (data: ReviewList | null, forceIDs: number[][] | false = false) => {
    let ids: number[][] = [[], [], []]
    if (!data?.containers) return ids
    if (forceIDs === false) {
        data.containers.forEach(container => {
            // embeds aren't nestable, no need to check for columns (phew :D)
            // 23.12.24 : fuck off
            if (container.type == "showList") {
                ids[container.settings.postType].push(container.settings.post)
            }
            if (container.type == "twoColumns") {
                container.settings.components.forEach(con => {
                    con.forEach(sub => {
                        if (sub?.type == "showList")
                            ids[sub.settings.postType].push(sub.settings.post)
                    })
                })
            }
        })
    } else ids = forceIDs
    if (ids.map(i => i.length).reduce((a, b) => a + b) < 1) return

    let postData = await axios.get(import.meta.env.VITE_API + "/getLists.php", {params: {batch: true, lists: ids[0].join(','), reviews: ids[1].join(','), levels: ids[2].join(',')}}).then(res => res.data)
    return postData
}
