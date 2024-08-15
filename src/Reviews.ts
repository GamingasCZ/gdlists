import { ref } from "vue"
import { DEFAULT_LEVELLIST } from "./Editor"
import type { ReviewList, ReviewRating } from "./interfaces"
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

export const REVIEW_EXTRAS: ReviewList = {
    reviewName: "",
    thumbnail: ["", 0, 33, 1, true],
    tagline: "",
    containers: [],
    ratings: [],
    settings: [],
    disabledRatings: false,
    private: false,
    transparentPage: 0,
    language: SETTINGS.value.language ? 'en' : 'cs',
    whitePage: false,
    readerMode: false,
    font: 0
}

export const DEFAULT_REVIEWDATA = () => ({ ...DEFAULT_LEVELLIST, ...REVIEW_EXTRAS })
export const reviewData = ref(DEFAULT_REVIEWDATA())

const funnyErrorMessages = [
    "",
    "Umm... ",
    "Stop that, ",
    " STOP BEING SILLY!!",
    `You dare defy the lord of darkness, `
]

let uploadTries = 0
export function checkReview() {
    const err = (err: string) => {
        let fancyErr = err
        switch (uploadTries) {
            case 1:
            case 2: fancyErr = funnyErrorMessages[uploadTries] + err.slice(0,1).toLowerCase() + err.slice(1); break;
            
            case 3: fancyErr = err.toUpperCase() + funnyErrorMessages[uploadTries]; break;
            case 4: fancyErr = funnyErrorMessages[uploadTries] + JSON.parse(localStorage.getItem("account_info"))[0] + "?"; break;

            default: break;
        }

        uploadTries = (uploadTries + 1) % 5 // TODO
        return { success: false, error: err }
    }
    let error = { success: true, mess: '' }
    if (!reviewData.value.containers.length) return err(i18n.global.t('reviews.bro'))
    if (reviewData.value.reviewName.length < 3) return err(i18n.global.t('reviews.nameToo', [i18n.global.t('other.short')]))
    if (reviewData.value.reviewName.length > 40) return err(i18n.global.t('reviews.nameToo', [i18n.global.t('other.long')]))

    if (!reviewData.value.levels.length && !reviewData.value.disabledRatings) return err(i18n.global.t('reviews.noLevels'))

    reviewData.value.ratings.forEach(customRating => {
        if (!customRating.name.length) {
            error.mess = i18n.global.t('reviews.ratingMissingName')
            error.success = false
        }
    })

    let i = 0
    reviewData.value.levels.forEach(level => {
        i += 1
        if (!level.levelName.length) error.mess = i18n.global.t('reviews.levelNo', [i, i18n.global.t('other.name')])
        if (!level.creator.length) error.mess = i18n.global.t('reviews.levelNo', [i, i18n.global.t('other.creator')]) // COLLABY TOD
        if (!level.levelID && level.levelID?.match(/\d+/)) error.mess = i18n.global.t('reviews.levelNo', [i, 'ID'])
        if (level.ratings?.[0].concat(level.ratings[1]).includes(-1) && !reviewData.value.disabledRatings) error.mess = i18n.global.t('reviews.notRatedYet', [i])
        
        if (error.mess) error.success = false
    })

    reviewData.value.containers.forEach(container => {
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
    reviewData.value.containers.filter(c => c.type == "twoColumns").forEach(nest => {
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
    if (!error.success) return err(error.mess)

    uploadTries = 0
    return { success: true, error: '' }
}

export const selectedNestContainer = ref(0)
export const flexNames = { left: "start", center: "center", right: "end", justify: "left" }

export function parseReviewContainers(containers: object[]) {
    // types: 0 - image; 1,2,3 - title 1,2,3; 4 - video
    let main: [number, number, string][] = []
    let indicies = [0,0,0]
    containers.forEach(container => {
        if (container !== Object(container)) return

        switch (container.type) {
            case "heading1":
            case "heading2":
            case "heading3":
                indicies[0] += 1
                main.push([container.type, indicies[0], container.type.slice(-1), container.data])
                break;

            case "showImage":
                indicies[1] += 1
                main.push([container.type, indicies[1], 0, container.settings.description || container.settings.alt || i18n.global.t('reviews.picture')])
                break;
            case "addVideo":
                indicies[2] += 1
                main.push([container.type, indicies[2], 4, container.settings.description || i18n.global.t("level.video")])
                break;

            case "twoColumns":
                container.settings.components.forEach(column => main.push(...parseReviewContainers(column)))
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

export function getWordCount() {
    let count = 0
    reviewData.value.containers.forEach(c => {
        count += (c.data.match(/\w+/g) ?? []).length
        if (c.type == "twoColumns") {
            c.settings.components.forEach(con => {
                con.forEach(sub => (count += (sub.data.match(/\w+/g) ?? []).length))
            })
        }
    })
    return count
}

export const getReviewPreview = () => {
    let firstHeading = (document.querySelector("div[data-type*=heading] > p")?.innerText ?? "").trim()
    let firstParagraph = (document.querySelector("div[data-type=default] > p")?.innerText ?? "").trim()
    if (firstHeading.length > 100) firstHeading = firstHeading.slice(0, 100)+"..."
    if (firstParagraph.length > 100) firstParagraph = firstParagraph.slice(0, 100)+"..."
    return [firstHeading, firstParagraph]
}

export const getEmbeds = async (data: ReviewList | null, forceIDs: number[][] | false = false) => {
    let ids: number[][] = [[], [], []]
    if (forceIDs === false) {
        data.containers.forEach(container => {
            // embeds aren't nestable, no need to check for columns (phew :D)
            if (container.type == "showList") {
                ids[container.settings.postType].push(container.settings.post)
            }
        })
    } else ids = forceIDs
    if (ids.map(i => i.length).reduce((a, b) => a + b) < 1) return

    let postData = await axios.get(import.meta.env.VITE_API + "/getLists.php", {params: {batch: true, lists: ids[0].join(','), reviews: ids[1].join(','), levels: ids[2].join(',')}}).then(res => res.data)
    return postData
}