import { ref } from "vue"
import { DEFAULT_LEVELLIST } from "./Editor"
import type { ReviewList, ReviewRating } from "./interfaces"
import { i18n } from "./locales"
import chroma from "chroma-js"
import containers from "./components/writer/containers"

export const DEFAULT_RATINGS: ReviewRating[] = [
    {
        name: "Gameplay",
        rating: 5,
        color: [0, 0.74, 0.52]
    },
    {
        name: "Dekorace",
        rating: 5,
        color: [90, 0.74, 0.52]
    },
    {
        name: "Obtížnost",
        rating: 5,
        color: [180, 0.74, 0.52]
    },
    {
        name: "Celkové",
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
    rateTheme: 0,
    private: false,
    transparentPage: 0,
    language: 0,
    whitePage: false,
    readerMode: false,
    font: 0
}

export const DEFAULT_REVIEWDATA = () => ({ ...DEFAULT_LEVELLIST, ...REVIEW_EXTRAS })
export const reviewData = ref(DEFAULT_REVIEWDATA())


export function checkReview() {
    const err = (err: string) => ({ success: false, error: err })
    if (!reviewData.value.containers.length) return err(i18n.global.t('reviews.bro'))
    if (reviewData.value.reviewName.length < 3) return err(i18n.global.t('reviews.nameToo', [i18n.global.t('other.short')]))
    if (reviewData.value.reviewName.length > 30) return err(i18n.global.t('reviews.nameToo', [i18n.global.t('other.long')]))

    if (!reviewData.value.levels.length && reviewData.value.rateTheme != 2) return err(i18n.global.t('reviews.noLevels'))

    let error = { success: true, mess: '' }
    reviewData.value.ratings.forEach(customRating => {
        if (!customRating.name.length) {
            error.mess = 'Jedno z hodnocení nemá jméno!'
            error.success = false
        }
    })

    let i = 0
    reviewData.value.levels.forEach(level => {
        i += 1
        if (!level.levelName.length) error.mess = i18n.global.t('reviews.levelNo', [i, i18n.global.t('other.name')])
        if (!level.creator.length) error.mess = i18n.global.t('reviews.levelNo', [i, i18n.global.t('other.creator')]) // COLLABY TOD
        if (!level.levelID && level.levelID?.match(/\d+/)) error.mess = i18n.global.t('reviews.levelNo', [i, 'ID'])
        if (level.ratings?.[0].concat(level.ratings[1]).includes(-1)) error.mess = i18n.global.t('reviews.notRatedYet', [i])
    })

    reviewData.value.containers.filter(c => c.type != 'twoColumns').forEach(container => {
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
    if (!error.success) return err(error.mess)

    if (!reviewData.value.containers.length) return err('')

    return { success: true, error: '' }
}

export const selectedNestContainer = ref(0)
export const flexNames = { left: "start", center: "center", right: "end", justify: "left" }

export function parseReviewContainers(containers: object[]) {
    // types: 0 - image; 1,2,3 - title 1,2,3; 4 - video
    let main: [number, string][] = []
    containers.forEach(container => {
        switch (container.type) {
            case "heading1":
            case "heading2":
            case "heading3":
                main.push([parseInt(container.type.slice(-1)), container.data])
                break;

            case "showImage":
                main.push([0, container.settings.description || container.settings.alt || i18n.global.t('reviews.picture')])
                break;
            case "addVideo":
                main.push([4, container.settings.description || i18n.global.t("level.video")])
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