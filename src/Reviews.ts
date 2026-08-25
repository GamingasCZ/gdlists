import { nextTick, type Ref, ref } from "vue"
import { DEFAULT_LEVEL, DEFAULT_LEVELLIST, modernizeLevels } from "./Editor"
import type { FavoritedLevel, Level, LevelList, ListFetchResponse, PostData, ReviewDetailsResponse, ReviewList, ReviewRating, Stop } from "./interfaces"
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
    fontTint: false
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

    if (postData.value.pallete) {
        applyPalleteColor(postData.value)
    }
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
        if (!level.levelName.length) error.mess = i18n.global.t('reviews.levelNo', [i, i18n.global.t('other.name').toLowerCase()])
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

export const colorizerPresets: {name: string, gradient: Stop[]}[] = [{"name":i18n.global.t('editor.palPres1'),"gradient":[{"color":[0,1,1],"position":0},{"color":[36.23529411764706,1,1],"position":0.1},{"color":[64.44444444444444,0.8513513513513513,0.8705882352941177],"position":0.2},{"color":[117.95918367346938,0.6712328767123288,0.8588235294117647],"position":0.3},{"color":[179.2207792207792,0.7096774193548387,0.8509803921568627],"position":0.4},{"color":[188.33333333333334,0.8,0.8823529411764706],"position":0.5},{"color":[211.56398104265404,0.8865546218487395,0.9333333333333333],"position":0.6},{"color":[260,0.921161825726141,0.9450980392156862],"position":0.7},{"color":[284.17021276595744,0.9475806451612904,0.9725490196078431],"position":0.8},{"color":[308.3265306122449,0.98,0.9803921568627451],"position":0.9},{"color":[0,1,1],"position":1}]},{"name":i18n.global.t('editor.palPres2'),"gradient":[{"color":[0,0.53,1],"position":0},{"color":[36.23529411764706,0.63,1],"position":0.1},{"color":[64.44444444444444,0.46,0.8705882352941177],"position":0.2},{"color":[117.95918367346938,0.35,0.8588235294117647],"position":0.3},{"color":[179.2207792207792,0.39,0.8509803921568627],"position":0.4},{"color":[188.33333333333334,0.4,0.8823529411764706],"position":0.5},{"color":[211.56398104265404,0.55,0.9333333333333332],"position":0.6},{"color":[260,0.57,0.9450980392156861],"position":0.7},{"color":[284.17021276595744,0.58,0.9725490196078431],"position":0.8},{"color":[308.3265306122449,0.56,0.9803921568627451],"position":0.9},{"color":[0,0.55,1],"position":1}]},{"name":i18n.global.t('editor.palPres3'),"gradient":[{"color":[62.49999999999999,0.09523809523809523,0.9882352941176471],"position":0},{"position":0.24305555555555555,"color":[37.9746835443038,0.7383177570093458,0.8392156862745098]},{"position":0.5092592592592593,"color":[15,0.4864864864864865,0.5803921568627451]},{"position":0.7175925925925926,"color":[15,0.4864864864864865,0.5803921568627451]},{"position":1,"color":[34.95652173913043,0.46184738955823296,0.9764705882352941]}]},{"name":i18n.global.t('editor.palPres4'),"gradient":[{"color":[214.54545454545453,0.3548387096774194,0.36470588235294116],"position":0},{"position":0.5486111111111112,"color":[39.053254437869825,0.7971698113207547,0.8313725490196079]},{"position":0.8263888888888888,"color":[24.90118577075099,0.9921568627450981,1]},{"position":1,"color":[25.5,0.9302325581395349,0.16862745098039217]}]},{"name":i18n.global.t('editor.palPres5'),"gradient":[{"color":[197.0886075949367,0.632,0.9803921568627451],"position":0},{"position":0.25,"color":[347.53246753246754,0.3142857142857143,0.9607843137254902]},{"position":0.5,"color":[null,0,1]},{"position":0.75,"color":[347.53246753246754,0.3142857142857143,0.9607843137254902]},{"color":[197.0886075949367,0.632,0.9803921568627451],"position":1}]},{"name":i18n.global.t('editor.palPres6'),"gradient":[{"color":[143.3009708737864,0.4204081632653061,0.9607843137254902],"position":0},{"color":[146.8421052631579,0.608,0.49019607843137253],"position":1}]},{"name":i18n.global.t('editor.palPres7'),"gradient":[{"color":[264,1,1],"position":0},{"position":0.4212962962962963,"color":[32.075471698113205,0.673728813559322,0.9254901960784314]},{"position":0.7291666666666666,"color":[60.86956521739131,0.552,0.9803921568627451]},{"color":[352.82608695652175,0.7215686274509804,1],"position":1}]},{"name":i18n.global.t('editor.palPres8'),"gradient":[{"color":[204,1,1],"position":0},{"position":0.42592592592592593,"color":[44.02597402597402,0.6337448559670782,0.9529411764705882]},{"color":[321.1764705882353,0.5804878048780487,0.803921568627451],"position":1}]},{"name":i18n.global.t('editor.palPres9'),"gradient":[{"color":[0,0.9710982658959537,0.6784313725490196],"position":0},{"color":[24.941176470588236,1,1],"position":0.3333333333333333},{"position":0.6064814814814815,"color":[52.99270072992701,0.5780590717299579,0.9294117647058824]},{"position":0.8055555555555556,"color":[0,0.5196850393700787,0.4980392156862745]},{"position":1,"color":[13.714285714285714,0.5555555555555556,0.24705882352941178]}]},{"name":i18n.global.t('editor.palPres10'),"gradient":[{"color":[null,0,1],"position":0},{"position":0.2962962962962963,"color":[175.78947368421052,0.2425531914893617,0.9215686274509803]},{"color":[252,0.321285140562249,0.9764705882352941],"position":0.7106481481481481},{"position":1,"color":[330.4761904761905,0.2540322580645161,0.9725490196078431]}]}]

export const applyPalleteColor = (postData: PostData) => {
    if (postData.levels.length == 0) return

    let canvas = new OffscreenCanvas(postData.levels.length, 1)
    let ctx = canvas.getContext("2d")
    if (!ctx) return
    let grad = ctx?.createLinearGradient(0, 0, canvas.width, canvas.height)

    let gradArray: Stop[]
    if (typeof postData.pallete == "object")
        gradArray = postData.pallete
    else if (typeof postData.pallete == 'number') {
        if (postData.pallete < 0) { // preset
            gradArray = colorizerPresets[Math.abs(postData.pallete)-1].gradient
            if (!gradArray) return
        }
        else if (postData.pallete > 0) {
            let sP = localStorage.getItem("savedPalletes")
            if (!sP) return

            let palletes = JSON.parse(sP)
            let key = String(postData.pallete)
            if (!palletes[key]) return

            gradArray = palletes[key].gradient
            console.log(palletes, key, gradArray)
        }
        else {
            return
        }
    }
    if (!postData.pallete)
        return

    for (let i = 0; i < gradArray.length; i++)
        grad?.addColorStop(gradArray[i].position, chroma.hsv(...gradArray[i].color).hex())

    ctx.fillStyle = grad
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    let data = ctx?.getImageData(0, 0, canvas.width, canvas.height)


    let i = 0
    for (let i = 0; i < postData.levels.length; i++) {
        postData.levels[i].color = chroma(data.data[i*4], data.data[i*4+1], data.data[i*4+2]).hsl().slice(0, 3)
    }
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
    let fonts = ['poppins', 'domine', 'outfit', 'oswald', 'martianmono', 'Pusab']
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
    let ids: number[][] = [[], [], [], []]
    if (!data?.containers) return ids
    if (forceIDs === false) {
        data.containers.forEach(container => {
            // embeds aren't nestable, no need to check for columns (phew :D)
            // 23.12.24 : fuck off
            if (container.type == "showList") {
                ids[container.settings.postType].push(container.settings.post)
            }
            if (container.type == "listTable") {
                ids[3].push(container.settings.post)
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

    let postData = await axios.get(import.meta.env.VITE_API + "/getLists.php", {params: {batch: true, lists: ids[0].join(','), reviews: ids[1].join(','), levels: ids[2].join(','), listInnards: ids[3].join(',')}}).then(res => res.data)
    return postData
}

export const makeTogglableCheckboxes = (parentContainer: HTMLParagraphElement, checkFun: (i: number | number[], togg: boolean | boolean[])=> void) => {
    let checkboxes: NodeListOf<HTMLInputElement> = parentContainer.querySelectorAll("input[type='checkbox']")
    var indicies = 0
    checkboxes.forEach(cbox => {
        cbox.disabled = false
        cbox.classList.add("button")
        cbox.dataset.index = indicies++

        cbox.oninput = async () => {
            for (let i = 0; i < checkboxes.length; i++) {
                if (checkboxes[i] === cbox) {
                    // check the parent check, if child checks are checked; uncheck parent check, if 1 or more checks unchecked
                    let toCheck: number[] = []
                    let checkParams: boolean[] = []
                    let currBox = cbox
                    while (true) {
                        let closest = currBox.closest("ul")
                        if (closest?.parentElement?.tagName == 'P') // is a top-level check
                            break

                        let listItems = closest?.children
                        let parentCheckbox = closest?.parentElement?.querySelector("input")!
                        currBox = parentCheckbox
                        parentCheckbox.checked = true
                        for (let i = 0; i < listItems?.length; i++) {
                            if (!listItems[i].querySelector("input")?.checked) {
                                parentCheckbox.checked = false
                                break
                            }
                        }

                        toCheck.push(+parentCheckbox.dataset.index)
                        checkParams.push(parentCheckbox.checked)
                    }

                    // checking the checkbox above a nested checklist
                    let nestList = cbox.nextElementSibling
                    if (nestList && nestList?.tagName == 'UL') {
                        let sub = nestList.querySelectorAll("input")
                        let checkArr: number[] = Array(sub.length).fill(i+1)
                        for (let j = 0; j < sub.length; j++) {
                            sub[j].checked = cbox.checked
                            checkArr[j] += j
                        }
                        checkArr.push(i)
                        return checkFun(checkArr.concat(toCheck), Array(checkArr.length).fill(cbox.checked).concat(checkParams))
                    }

                    checkFun([i].concat(toCheck), [cbox.checked].concat(checkParams))
                }
            }
        }
    })
}

export function parseLocalReviewRatings(reviewData: PostData) {
    let ratings = [{
        level_count: 0,
        reviewID: 69,
        gameplay: [],
        decoration: [],
        difficulty: [],
        overall: []
    }]
    for (let i = 0; i < reviewData.levels.length; i++) {
        let levelID = reviewData.levels[i].levelID
        if (levelID && (isNaN(parseInt(levelID)) || levelID < 128 || levelID > 200000000)) continue

        ratings[0].level_count++
        let levelRatings = reviewData.levels[i].ratings?.[0]
        if (levelRatings) {
            if (levelRatings[0] > -1)
                ratings[0].gameplay.push(levelRatings[0])
            if (levelRatings[1] > -1)
                ratings[0].decoration.push(levelRatings[1])
            if (levelRatings[2] > -1)
                ratings[0].difficulty.push(levelRatings[2])
            if (levelRatings[3] > -1)
                ratings[0].overall.push(levelRatings[3])
        }
    }
    let rateCounts = Object.values(ratings[0]).filter(x => typeof x != "number").map(x => x.length)
    ratings[0].gameplay = ratings[0].gameplay.reduce((a,b) => a+b, 0)/rateCounts[0]
    ratings[0].decoration = ratings[0].decoration.reduce((a,b) => a+b, 0)/rateCounts[1]
    ratings[0].difficulty = ratings[0].difficulty.reduce((a,b) => a+b, 0)/rateCounts[2]
    ratings[0].overall = ratings[0].overall.reduce((a,b) => a+b, 0)/rateCounts[3]
    return ratings as unknown as ReviewDetailsResponse[]
}
export const containerSettingsOpen = ref(false)
