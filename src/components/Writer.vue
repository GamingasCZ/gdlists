<script setup lang="ts">
import { computed, nextTick, provide, reactive, ref, watch } from "vue";
import DialogVue from "./global/Dialog.vue";
import WriterSettings from "./writer/WriterSettings.vue";
import WriterRatings from "./writer/WriterRatings.vue";
import WriterLevels from "./writer/WriterLevels.vue";
import FormattingBar from "./writer/FormattingBar.vue"
import CONTAINERS from "./writer/containers";
import TagPickerPopup from "./editor/TagPickerPopup.vue";
import CollabEditor from "./editor/CollabEditor.vue";
import ListPickerPopup from "./global/ListPickerPopup.vue";
import ImageBrowser from "./global/ImageBrowser.vue";
import type { DataContainerAction, Level, PostData, WriterGallery, ReviewList, TEXT_ALIGNMENTS } from "@/interfaces";
import { pickFont, getDominantColor, getReviewPreview, getWordCount, getEmbeds, addReviewLevel } from "@/Reviews";
import ListBackground from "./global/ListBackground.vue";
import BackgroundImagePicker from "./global/BackgroundImagePicker.vue";
import { dialog } from "@/components/ui/sizes";
import axios from "axios";
import { modifyListBG, predefinedLevelList, prettyDate } from "@/Editor";
import { onUnmounted } from "vue";
import router, { timeLastRouteChange } from "@/router";
import ErrorPopup from "./editor/errorPopup.vue";
import RemoveListPopup from "./editor/RemoveListPopup.vue";
import TextEditor from "./global/TextEditor.vue";
import UserDialog from "./writer/UserDialog.vue";
import { i18n } from "@/locales";
import { SETTINGS, hasLocalStorage } from "@/siteSettings";
import NotLoggedInDialog from "./global/NotLoggedInDialog.vue";
import { onMounted } from "vue";
import { onBeforeRouteLeave } from "vue-router";
import ReviewDrafts from "./writer/ReviewDrafts.vue";
import CarouselPicker from "./writer/CarouselPicker.vue";
import { deleteCESelection } from "./global/parseEditorFormatting";
import LevelCard from "./global/LevelCard.vue";
import { ImgFail, notifyError } from "./imageUpload";
import WriterViewer from "./writer/WriterViewer.vue";
import WriterVisuals from "./writer/WriterVisuals.vue";
import { LIST, REVIEW, type Writer } from "@/writers/Writer";
import Dropdown from "./ui/Dropdown.vue";
import ColumnPreview from "./writer/ColumnPreview.vue";

const props = defineProps<{
    type: number
    postID?: string
    isLoggedIn: boolean
    editing?: boolean
}>()

const POST_DATA = ref<PostData>()
const WRITER = ref([LIST, REVIEW][props.type])
watch(() => props.type, () => {
    WRITER.value = [LIST, REVIEW][props.type]
    resetPost()
})
watch(timeLastRouteChange, () => resetPost())

document.title = `${WRITER.value.general.tabTitle} | ${i18n.global.t('other.websiteName')}`

provide("postData", POST_DATA)
if (predefinedLevelList.value.length) {
    POST_DATA.value.levels = predefinedLevelList.value
    predefinedLevelList.value = []
}

let isNowHidden = false
if (props.editing) {
    axios.post(import.meta.env.VITE_API + "/pwdCheckAction.php", { id: props.postID, type: WRITER.value.general.postType }).then(res => {
        if (res.data?.data) {
            isNowHidden = res.data.hidden != 0
            POST_DATA.value = res.data.data
            fetchEmbeds()
            modifyListBG(POST_DATA.value.pageBGcolor, false, true)
            containerLastAdded.value = Date.now()
        }
        else {
            openDialogs.editError = true
        }
    }).catch(() => openDialogs.editError = true)
}

const writer = ref<HTMLDivElement>()
const embedsContent = ref()
provide("batchEmbeds", embedsContent)

const fetchEmbeds = async (fake = false) => {
    if (fake) { embedsContent.value = -1; return }

    embedsContent.value = await getEmbeds(POST_DATA.value)
}

const addToInjected = () => {
    fetchEmbeds()
}
provide("addToInjected", addToInjected)

const resetPost = () => {
    document.title = `${WRITER.value.general.tabTitle} | ${i18n.global.t('other.websiteName')}`
    POST_DATA.value = WRITER.value.general.postObject()
    containerLastAdded.value = Date.now()
    modifyListBG(POST_DATA.value.pageBGcolor, true, true)
    setPreviewMode(true)
    selectedContainer.value[0] = -1
    disableEdits.value = false
    reviewSave.value = { backupID: 0, lastSaved: 0 }
}

const openDialogs = reactive({
    settings: false,
    levels: false,
    tags: false,
    collabs: false,
    lists: [false, 0, 0],
    BGpicker: [false, 0, 0],
    ratings: false,
    bgPreview: false,
    imagePicker: [false, 0, 0],
    carouselPicker: [false, 0],
    removeDialog: false,
    description: false,
    editError: false,
    userAdder: [false, 0],
    drafts: false,
})

const previewMode = ref(true)

const collabClipboard = ref([])
provide("openedDialogs", openDialogs)

const selectedContainer = ref<[number, HTMLDivElement | null]>([-1, null])
provide("selectedContainer", selectedContainer)

const selectedLevel = ref()

const selectedNestContainer = ref([-1, -1, -1])
provide("selectedNestContainer", selectedNestContainer)


const levelHashes = ref<number[]>([])
const updateHashes = (newVal: number[]) => levelHashes.value = newVal
provide("levelHashes", { levelHashes, updateHashes })


provide("settingsTitles", CONTAINERS)

const newID = (offset = 0) => (Date.now() + offset + JSON.stringify(POST_DATA.value).length) >> 1

const containerLastAdded = ref(0)
const addContainer = (key: string, addTo?: number, returnOnly = false, above = false) => {
    // Count of all components
    let contAm = 0
    let thisContAm = 0
    if (!returnOnly) {
        POST_DATA.value.containers.forEach(c => {
            if (c.type == "twoColumns") {
                contAm += c.settings.components.forEach(n => {
                    contAm += n.length
                    // add check for limit in nested containers if you ever need to :)
                });
            }
            if (c.type == key) thisContAm += 1
            contAm += 1
        })

        if (CONTAINERS[key]?.limit && thisContAm >= CONTAINERS[key].limit) {
            errorStamp.value = Date.now()
            errorText.value = i18n.global.t('reviews.thisTypeManyCont')
            return
        }

        if (contAm >= 100) {
            errorStamp.value = Date.now()
            errorText.value = i18n.global.t('reviews.tooManyContainers')
            return
        }
    }

    let settingObject = {}
    for (let i = 0; i < CONTAINERS[key].settings.length; i++)
        settingObject[CONTAINERS[key].settings[i].key] = JSON.parse(JSON.stringify(CONTAINERS[key].settings[i].default))

    let containerData = {
        type: key,
        data: "",
        align: "left",
        settings: settingObject,
        extraComponents: 0,
        id: newID()
    }

    if (returnOnly) return containerData

    // Adding regular container
    if (selectedNestContainer.value[0] == -1 || !CONTAINERS[key].nestable) {
        if (selectedContainer.value[0] == -1) {
            POST_DATA.value.containers
                .push(containerData)
            selectedContainer.value[0] = POST_DATA.value.containers.length - 1
        } else {
            POST_DATA.value.containers
                .splice(selectedContainer.value[0] + +(!above), 0, containerData)
            selectedContainer.value[0] += 1
        }
    }
    // Adding into a nested container
    else {
        if (key == "twoColumns") { // Adding a column to a nest container
            POST_DATA.value.containers[selectedNestContainer.value[0]].extraComponents += 1
            POST_DATA.value.containers[selectedNestContainer.value[0]].settings.components.splice(selectedNestContainer.value[1] + addTo, 0, [])
        }
        else {
            if (selectedContainer.value[2] == -1) {
                POST_DATA.value.containers[selectedNestContainer.value[0]].settings.components[selectedNestContainer.value[1]]
                    .push(containerData)
            } else {
                POST_DATA.value.containers[selectedNestContainer.value[0]].settings.components[selectedNestContainer.value[1]]
                    .splice(selectedNestContainer.value[2] + +(!above), 0, containerData)
            }

        }
    }
    containerLastAdded.value = Date.now()
}

provide("addContainer", addContainer)

const removeContainer = (index: number) => {
    POST_DATA.value.containers.splice(index, 1)

    selectedContainer.value[0] = -1
    selectedNestContainer.value = [-1, -1, -1]
}

const setAlignment = (index: number, alignment: TEXT_ALIGNMENTS) => {
    if (selectedContainer.value[0] == -1) return

    if (selectedNestContainer.value[0] == -1) {
        if (index < 0) return
        POST_DATA.value.containers[index].align = alignment
        selectedContainer.value[1]?.focus()
    }
    else {
        POST_DATA.value.containers[selectedNestContainer.value[0]].settings.components[selectedNestContainer.value[1]][selectedNestContainer.value[2]].align = alignment
    }

    containerLastAdded.value = Date.now()

}

const dataContainerCommand = (command: DataContainerAction, data: any[]) => {
    switch (command) {
        case DataContainerAction.Move:
            moveContainer(...data)
            break;
        case DataContainerAction.Remove:
            removeContainer(...data)
            break;
        case DataContainerAction.MakeParagraph:
            moveToParagraph(...data)
            break;
    }
}

const columnCommand = (index: number) => {
    let nest = POST_DATA.value.containers[selectedNestContainer.value[0]]
    let column = POST_DATA.value.containers[selectedNestContainer.value[0]].settings.components[selectedNestContainer.value[1]]
    switch (index) {
        case 0: addContainer("twoColumns", 0); break;
        case 1: addContainer("twoColumns", 1); break;
        case 2:
        case 3:
            let duplicate = JSON.parse(JSON.stringify(nest.settings.components[selectedNestContainer.value[1]]))
            for (let i = 0; i < duplicate.length; i++) {
                if (duplicate[i] === Object(duplicate[i]))
                    duplicate[i].id = newID(i)
            }

            nest.settings.components
                .splice(selectedNestContainer.value[1] + (index - 3), 0, duplicate)
            nest.extraComponents += 1
            break;
        case 6: // fit width / fill space
            column[10] = !Boolean(column[10])
            break;
        case 7:
            if (nest.settings.components.length == 2) {
                let columnData = JSON.parse(JSON.stringify(nest.settings.components[1 - selectedNestContainer.value[1]]))
                removeContainer(selectedNestContainer.value[0])
                POST_DATA.value.containers.splice(selectedNestContainer.value[0], 0, ...columnData.filter(x => x === Object(x)))
            }
            else {
                nest.extraComponents -= 1
                nest.settings.components.splice(selectedNestContainer.value[1], 1);
            }
            break;
        case 8: moveContainer(selectedNestContainer.value[0], -1); break;
        case 9: moveContainer(selectedNestContainer.value[0], 1); break;
        case 10: removeContainer(selectedNestContainer.value[0]); break;
        case 11: column[11] = 0; break;
        case 12: column[11] = 1; break;
        case 13: column[11] = 2; break;
    }
    // setTimeout(() => selectedNestContainer.value = nestAttay, 5); // great coding, gamingaaaas (body click event unselects containers, need to offset this)
}

const setPreviewMode = (preview: boolean) => {
    previewMode.value = preview
    // nextTick(() => dataContainers.value.forEach(c => c.togglePreview()))
}

const previewContent = ref(0)
const setFormatting = (format: string, ind: number) => {
    switch (format) {
        case "view":
            document.activeElement?.blur()
            setPreviewMode(!previewMode.value)
            break;
        case "mode":
            previewContent.value = ind
            break;
    }
}

const moveToParagraph = (currentContainerIndex: number) => {
    if (POST_DATA.value.containers?.[currentContainerIndex + 1]?.type == "default") {
        selectedContainer.value[0] += 1
        dataContainers.value[selectedContainer.value[0]].doFocusText()
    }
    else {
        let sel = selectedContainer.value[0] + 1

        addContainer("default")
        nextTick(() => dataContainers.value[sel].doFocusText())
    }
}

const startWriting = () => {
    addContainer("heading1")
    addContainer("default")
}

const moveContainer = (index: number, by: number) => {
    let data = POST_DATA.value.containers[index]
    POST_DATA.value.containers.splice(index, 1)
    POST_DATA.value.containers.splice(index + by, 0, data)
    selectedContainer.value[0] += by
    if (selectedNestContainer.value[0] != -1)
        selectedNestContainer.value[0] += by
}

const splitParagraph = () => {
    let selectedText = deleteCESelection(document.activeElement)
    let newPos = selectedContainer.value[0] + 1
    let newParagraph = addContainer("default", 0, true)
    newParagraph.data = selectedText
    POST_DATA.value.containers.splice(newPos, 0, newParagraph)
}

const tagline = ref(false)

const dataContainers = ref()
const modifyImageURL = (newUrl: string) => {
    // Review background
    if (openDialogs.imagePicker[1] == WriterGallery.ReviewBackground) {
        POST_DATA.value.titleImg[0] = newUrl
        let img = document.createElement("img")
        img.src = newUrl
        img.onload = () => {
            POST_DATA.value.pageBGcolor = modifyListBG(getDominantColor(img).hex())
            img.remove()
        }
    }
    // Level card background
    else if (openDialogs.imagePicker[1] == WriterGallery.LevelCardBG) {
        POST_DATA.value.levels[openDialogs.imagePicker[2]].BGimage.image[0] = newUrl
    }
    // Review thumbnail
    else if (openDialogs.imagePicker[1] == WriterGallery.ReviewThumbnail) {
        POST_DATA.value.thumbnail[0] = newUrl
    }
    // Carousel item
    else if (openDialogs.imagePicker[1] == WriterGallery.CarouselItem) {
        if (typeof newUrl == 'string')
            newUrl = [newUrl]

        let imgCurrAmount = POST_DATA.value.containers[openDialogs.carouselPicker[1]].settings.components.length
        let maxImages = 25 - imgCurrAmount
        if (newUrl.length > maxImages)
            notifyError(ImgFail.CAROUSEL_FULL)

        let newImgs = newUrl.slice(0, maxImages)
        newImgs.forEach(x => {
            let img = addContainer("showImage", 0, true)
            img.settings.url = x
            img.settings.height = POST_DATA.value.containers[openDialogs.carouselPicker[1]].settings.height
            POST_DATA.value.containers[openDialogs.carouselPicker[1]].settings.components.push(img)
        })
    }
    // Carousel change
    else if (openDialogs.imagePicker[1] == WriterGallery.CarouselModifyItem) {
        POST_DATA.value.containers[openDialogs.carouselPicker[1]].settings.components[openDialogs.imagePicker[2]].settings.url = newUrl
    }
    // Image container
    else if (selectedNestContainer.value[0] == WriterGallery.ImageContainerNested) {
        let link = typeof newUrl == 'object' ? newUrl[0] : newUrl
        POST_DATA.value.containers[openDialogs.imagePicker[1]].settings.url = link
    }
    // Image container in nested container
    else {
        let link = typeof newUrl == 'object' ? newUrl[0] : newUrl
        POST_DATA.value.containers[selectedNestContainer.value[0]].settings.components[selectedNestContainer.value[1]][selectedNestContainer.value[2]].settings.url = link
    }
}

const errorStamp = ref(Date.now())
const errorText = ref("")
const checkForErrors = () => {
    let check = WRITER.value.general.clientPostValidation()
    if (!check?.success) {
        errorStamp.value = Date.now()
        errorText.value = check?.error
    }
    return check?.success
}

const startUpload = () => {
    if (!checkForErrors()) return

    preUpload.value = true
    openDialogs.settings = true
}

const reviewUploadErrors = (err: number) => {
    let errs = {
        "4": i18n.global.t('reviews.noChanges'),
        "2": i18n.global.t('reviews.loginFail'),
        "7": i18n.global.t('reviews.changesFail')
    }
    let errText = errs[err] ?? i18n.global.t('reviews.unexpectedError', [err])

    errorStamp.value = Date.now()
    errorText.value = errText
}

const uploadInProgress = ref(false)
const uploadReview = () => {
    if (uploadInProgress.value) return

    if (!checkForErrors()) {
        openDialogs.settings = false
        return
    }

    uploadInProgress.value = true
    axios.post(import.meta.env.VITE_API + "/uploadPost.php", {
        postData: POST_DATA.value,
        postName: POST_DATA.value.reviewName,
        hidden: POST_DATA.value.private ? 1 : 0,
        postType: WRITER.value.general.postType
    }).then(res => {
        sessionStorage.setItem("uploadFinished", "1")

        if (res.data[0] != -1) router.replace(`/review/${res.data[0]}`)
        else reviewUploadErrors(res.data[1])

        uploadInProgress.value = false
        removeDraft(reviewSave.value.backupID)
    })
        .catch(() => {
            errorStamp.value = Date.now()
            errorText.value = i18n.global.t('reviews.uploadFail')
            uploadInProgress.value = false
        })
}

const removeReview = () => {
    if (uploadInProgress.value) return

    uploadInProgress.value = true
    axios.post(import.meta.env.VITE_API + "/removeList.php", {
        id: props.postID,
        type: WRITER.value.general.postType
    }).then(res => {
        if (res.data == 3) router.replace("/browse/reviews")
        else {
            errorStamp.value = Date.now()
            errorText.value = i18n.global.t('reviews.removeFail')
        }
        uploadInProgress.value = false
        removeDraft(reviewSave.value.backupID)
    }).catch(() => {
        errorStamp.value = Date.now()
        errorText.value = i18n.global.t('reviews.removeFail')
        uploadInProgress.value = false
    })
}

const updateReview = () => {
    if (uploadInProgress.value) return
    if (!checkForErrors()) return

    uploadInProgress.value = true
    axios.post(import.meta.env.VITE_API + "/updateList.php", {
        id: props.postID,
        type: WRITER.value.general.postType,
        listData: JSON.stringify(POST_DATA.value),
        tagline: POST_DATA.value.tagline,
        hidden: POST_DATA.value.private | 0,
        isNowHidden: isNowHidden ? "true" : "false",
        disComments: POST_DATA.value.disComments | 0
    })
        .then(res => {
            sessionStorage.setItem("uploadFinished", "2")

            if (res.data[0] != -1) router.replace(`/review/${res.data[0]}`)
            else reviewUploadErrors(res.data[1])

            uploadInProgress.value = false
            removeDraft(reviewSave.value.backupID)
        })
        .catch(() => {
            errorStamp.value = Date.now()
            errorText.value = i18n.global.t('reviews.uploadFail')
            uploadInProgress.value = false
        })
}

let mStarted = [-1, -1]
const setMouseStart = (e: MouseEvent) => mStarted = [e.x, e.y]
const unfocusContainer = (e: MouseEvent) => {
    let rect = writer.value?.getBoundingClientRect()
    if (!rect) return
    if (mStarted[0] < rect.x || mStarted[1] < rect.y || mStarted[0] > rect.x + rect?.width || mStarted[1] > rect.y + rect?.height) {
        selectedContainer.value = [-1, null]
        selectedNestContainer.value = [-1, -1, -1]
    }
}

let autosaveInterval: number
onMounted(() => {
    POST_DATA.value = WRITER.value.general.postObject()

    if (SETTINGS.value.autosave) {
        // Save when leaving the site
        window.addEventListener("beforeunload", () => {
            if (reviewSave.value.backupID) saveDraft(false, true)
        })
        onBeforeRouteLeave((from, to) => {
            let res = doBackup(from, to)
            if (res) saveDraft(false, true)
        })

        autosaveInterval = setInterval(() => {
            if (!SETTINGS.value.autosave) // If setting changes, do not autosave
                return clearInterval(autosaveInterval)

            saveDraft(false, false)

        }, SETTINGS.value.autosave * 1000)
    }

    document.body.addEventListener("mousedown", setMouseStart)
    document.body.addEventListener("click", unfocusContainer)
})

onUnmounted(() => {
    document.body.removeEventListener("click", unfocusContainer)
    document.body.removeEventListener("mousedown", setMouseStart)
})

const preUpload = ref(false)
const userDialog = ref()
const writerRatings = ref<HTMLDivElement>()
const openRatingHelp = () => {
    if (writerRatings) writerRatings.value.helpOpen = !writerRatings.value.helpOpen
}

const hasUnrated = computed(() => {
    if (!POST_DATA.value.levels.length) return true

    let unrated = false
    POST_DATA.value.levels.forEach(l => {
        if (l.ratings[0].concat(l.ratings[1]).includes(-1)) unrated = true
    })
    return unrated
})

const hasLevels = computed(() => !POST_DATA.value.levels.length && !POST_DATA.value.disabledRatings)
const reviewSave = ref({ backupID: 0, lastSaved: 0 })
const draftPopup = ref<HTMLDivElement>()
const loadDraft = (newData: { data: ReviewList, id: number, saved: number }) => {
    POST_DATA.value = newData.data
    reviewSave.value.backupID = newData.id
    reviewSave.value.lastSaved = newData.saved
    fetchEmbeds()
    modifyListBG(newData.data.pageBGcolor, false, true)
    containerLastAdded.value = Date.now()
}

let previewHold: [ReviewList, object] | null
const disableEdits = ref(false)
const previewDraft = (previewData: ReviewList) => {
    previewHold = [POST_DATA.value, embedsContent.value]
    POST_DATA.value = previewData
    fetchEmbeds(true)
    modifyListBG(previewData.pageBGcolor, false, true)
    setPreviewMode(false)
    disableEdits.value = true
    openDialogs.drafts = false
}
const exitPreview = () => {
    if (!previewHold) return

    POST_DATA.value = previewHold[0]
    embedsContent.value = previewHold[1]
    modifyListBG(previewHold[0].pageBGcolor, false, true)
    previewHold = null

    setPreviewMode(true)
    disableEdits.value = false
    openDialogs.drafts = true

}

const funnySaveAsMessages = [i18n.global.t('reviews.copy1'), i18n.global.t('reviews.copy2'), i18n.global.t('reviews.copy3'), i18n.global.t('reviews.copy4'), i18n.global.t('reviews.copy5'), i18n.global.t('reviews.copy6'), i18n.global.t('reviews.copy2')]
const drafts = ref<object>(JSON.parse(localStorage.getItem("reviewDrafts")!) ?? {})
const saveDraft = (saveAs: boolean, leavingPage?: boolean) => {
    if (!POST_DATA.value.containers.length) return
    if (disableEdits.value) return
    let now = Date.now()
    let backupID;
    let preview = getReviewPreview()
    if (reviewSave.value.backupID == 0 || saveAs) {
        let saveAsName = POST_DATA.value.reviewName || i18n.global.t('editor.unnamedReview')
        if (saveAs && reviewSave.value.backupID != 0) {
            let i = 1
            funnySaveAsMessages.forEach(x => {
                if (drafts.value[reviewSave.value.backupID].name.includes(x)) saveAsName = " " + funnySaveAsMessages[Math.min(i, funnySaveAsMessages.length - 1)]
                i += 1
            })
            if (saveAsName == "") saveAsName = " " + funnySaveAsMessages[0]
        }

        drafts.value[now] = {
            reviewData: POST_DATA.value,
            name: saveAsName,
            createDate: now,
            saveDate: now,
            wordCount: getWordCount(),
            previewTitle: preview[0],
            previewParagraph: preview[1]
        }
        backupID = now
    }
    else {
        drafts.value[reviewSave.value.backupID].reviewData = POST_DATA.value,
        drafts.value[reviewSave.value.backupID].saveDate = now
        drafts.value[reviewSave.value.backupID].wordCount = getWordCount()
        drafts.value[reviewSave.value.backupID].previewTitle = preview[0]
        drafts.value[reviewSave.value.backupID].previewParagraph = preview[1]
        backupID = reviewSave.value.backupID
    }
    localStorage.setItem("reviewDrafts", JSON.stringify(drafts.value))
    reviewSave.value = { backupID: backupID, lastSaved: now }
}

const removeDraft = (key: number) => {
    if (!drafts.value[key]) return

    if (key == reviewSave.value.backupID) reviewSave.value = { backupID: 0, lastSaved: 0 }
    delete drafts.value[key]
    localStorage.setItem("reviewDrafts", JSON.stringify(drafts.value))
}

const burstTimer = ref(Date.now) // makes "last saved" in footer less jarring
setInterval(() => burstTimer.value = Date.now(), 5000)
const pretty = computed(() => prettyDate(Math.max(1, (burstTimer.value - reviewSave.value.lastSaved) / 1000)))

const listPickerPick = (level: Level) => {
    console.log(level)
    addReviewLevel(POST_DATA!, level)
}

const highlightedCreateColumns = ref(-1)

</script>

<template>
    <section v-if="openDialogs.editError"
        class="flex flex-col gap-3 items-center mt-10 text-center text-white opacity-40">
        <img class="w-64" src="@/images/listError.svg" alt="">
        <span class="text-2xl">{{ $t('reviews.editError') }}</span>
    </section>

    <div v-else-if="!isLoggedIn && hasLocalStorage()">
        <NotLoggedInDialog :mess="$t('editor.loginToCreateReviews')" />
    </div>

    <div v-else-if="!hasLocalStorage()" class="flex flex-col gap-4 justify-center items-center mx-auto mt-5">
        <img src="../images/disCookies.svg" class="w-48 opacity-20" alt="">
        <h1 class="max-w-sm text-2xl text-center text-white opacity-20">{{ $t('editor.cookDisabled') }}</h1>
    </div>

    <main v-else-if="POST_DATA" class="p-2">
        <ErrorPopup :error-text="errorText" :previewing="false" :stamp="errorStamp" />

        <Transition name="fade">
            <RemoveListPopup v-if="openDialogs.removeDialog" is-review @delete-list="removeReview"
                @close-popup="openDialogs.removeDialog = false" />
        </Transition>

        <ListBackground v-if="openDialogs.bgPreview" :image-data="POST_DATA.titleImg"
            :list-color="POST_DATA.pageBGcolor" />

        <DialogVue :open="openDialogs.settings" @close-popup="openDialogs.settings = false; preUpload = false"
            :title="$t('other.settings')" :width="dialog.medium">
            <WriterSettings :uploading="preUpload" :writer="WRITER" @upload="uploadReview" />
            <DialogVue :open="openDialogs.description" @close-popup="openDialogs.description = false"
                :title="$t('editor.descriptionEditor')" :width="dialog.xl">
                <TextEditor :edit-value="POST_DATA" />
            </DialogVue>
        </DialogVue>

        <DialogVue :open="openDialogs.userAdder[0]" :title="$t('editor.levels')" :action="userDialog?.addUser"
            :side-button-text="$t('other.add')"
            :side-button-disabled="POST_DATA.containers?.[openDialogs.userAdder[1]]?.settings?.users?.length >= 10"
            @close-popup="openDialogs.userAdder[0] = false" :width="dialog.large">
            <template #icon><img src="@/images/plus.svg" alt="" class="w-6"></template>
            <UserDialog ref="userDialog" :user-array="POST_DATA.containers[selectedContainer[0]].settings.users" />
        </DialogVue>

        <DialogVue :open="openDialogs.levels" :title="$t('editor.levels')" @close-popup="openDialogs.levels = false"
            :width="dialog.large">
            <template #icon><img src="@/images/plus.svg" alt="" class="w-6"></template>
            <CollabEditor v-if="openDialogs.collabs" :level-array="POST_DATA.levels" :index="0"
                :clipboard="collabClipboard" @close-popup="openDialogs.collabs = false" />
            <DialogVue :open="openDialogs.tags" @close-popup="openDialogs.tags = false" :title="$t('editor.tagTitle')"
                :width="dialog.medium" :top-most="true">
                <TagPickerPopup @add-tag="POST_DATA.levels[selectedLevel.openedCard].tags.push($event)" />
            </DialogVue>
        </DialogVue>



        <DialogVue :title="$t('help.Lists')" :open="openDialogs.lists[0]" @close-popup="openDialogs.lists[0] = false"
            :width="dialog.large">
            <ListPickerPopup @close-popup="openDialogs.lists[0] = false" :data="POST_DATA.containers"
                :only-pick-levels="openDialogs.lists[2]" @add-level="listPickerPick" />
        </DialogVue>

        <DialogVue :open="openDialogs.BGpicker[0]" @close-popup="openDialogs.BGpicker[0] = false" disable-tap-close
            :title="$t('other.imageSettings')" :width="dialog.xl">
            <BackgroundImagePicker
                :disable-controls="openDialogs.BGpicker[1] == 1"
                :force-aspect-height="[0, 100, 150][openDialogs.BGpicker[1]]"
                :source="[POST_DATA.titleImg, POST_DATA.levels?.[openDialogs?.BGpicker?.[2]]?.BGimage?.image, POST_DATA.thumbnail][openDialogs.BGpicker[1]]" />
        </DialogVue>

        <DialogVue :open="openDialogs.ratings" :side-button-text="$t('other.help')" :action="openRatingHelp"
            @close-popup="openDialogs.ratings = false" :title="$t('reviews.rating')">
            <template #icon><img src="@/images/info.svg" alt="" class="w-6"></template>
            <WriterRatings ref="writerRatings" />
        </DialogVue>

        <DialogVue :open="openDialogs.carouselPicker[0]" @close-popup="openDialogs.carouselPicker[0] = false"
            :title="$t('reviews.carMedia')">
            <CarouselPicker :post-data="POST_DATA" />
        </DialogVue>

        <DialogVue :open="openDialogs.imagePicker[0]" @close-popup="openDialogs.imagePicker[0] = false"
            :title="$t('reviews.bgImage')" :width="dialog.large">
            <ImageBrowser
                :disable-external="[WriterGallery.ReviewThumbnail, WriterGallery.LevelCardBG].includes(openDialogs.imagePicker[1])"
                :allow-multiple-picks="openDialogs.imagePicker[1] == WriterGallery.CarouselItem"
                :unselectable="false"
                @close-popup="openDialogs.imagePicker[0] = false"
                @pick-image="modifyImageURL"
            />
        </DialogVue>


        <DialogVue :open="openDialogs.drafts" @close-popup="openDialogs.drafts = false" :title="$t('reviews.drafts')"
            :width="dialog.medium" :side-button-text="$t('other.search')" :action="draftPopup?.openSearch">
            <template #icon><img src="@/images/searchOpaque.svg" alt="" class="-mr-1 w-4"></template>
            <ReviewDrafts @save="saveDraft" :drafts="drafts" :in-use-i-d="reviewSave.backupID" ref="draftPopup"
                @load="loadDraft" @preview="previewDraft" @remove="removeDraft" />
        </DialogVue>

        <!-- <Header :class="{ 'pointer-events-none opacity-20': disableEdits }" :editing="editing" :has-levels="hasLevels"
            :has-unrated="hasUnrated" :uploading="uploadInProgress" @update="updateReview"
            @remove="openDialogs.removeDialog = true" @upload="startUpload" @open-dialog="openDialogs[$event] = true" /> -->

        <section class="max-w-[90rem] flex flex-col gap-y-8 mx-auto">
            <!-- Hero -->
            <div class="flex flex-col items-center mt-8 text-center"
                :class="{ 'pointer-events-none opacity-20': disableEdits }">
                <input v-model="POST_DATA.reviewName" type="text" :maxlength="40" :disabled="editing"
                    :placeholder="WRITER.general.titlePlaceholder"
                    class="text-6xl text-center disabled:opacity-70 disabled:cursor-not-allowed max-w-[85vw] font-black text-white bg-transparent border-b-2 border-b-transparent focus-within:border-b-lof-400 outline-none">
                <button v-if="!(POST_DATA?.tagline ?? '').length && !tagline" @click="tagline = true"
                    class="flex gap-2 justify-center items-center mt-3 font-bold text-white">
                    <img src="@/images/plus.svg" class="w-6" alt="">
                    <span>{{ $t('reviews.addTagline') }}</span>
                </button>
                <div v-else class="flex gap-2 items-center w-2/5 text-white group">
                    <input type="text" v-once :maxlength="60" v-model="POST_DATA.tagline" autofocus
                        class="text-lg italic text-center bg-transparent border-b-2 outline-none grow border-b-transparent focus-within:border-lof-400"
                        :placeholder="WRITER.general.placeholderTaglines[Math.floor(Math.random() * WRITER.general.placeholderTaglines.length)]">
                    <button @click="POST_DATA.tagline = ''; tagline = false">
                        <img src="@/images/trash.svg" alt=""
                            class="hidden p-1 w-6 bg-black bg-opacity-40 rounded-md min-w-6 group-focus-within:block button">
                    </button>
                </div>
            </div>

            <!-- Back from draft preview -->
            <div v-if="disableEdits" @click="exitPreview"
                class="flex fixed top-14 left-1/2 z-40 justify-between items-center p-2 w-96 text-white rounded-md -translate-x-1/2 bg-greenGradient">
                <span class="text-xl">{{ $t('reviews.preview') }}</span>
                <button class="flex gap-2 p-1 bg-black bg-opacity-40 rounded-md"><img src="@/images/checkThick.svg"
                        class="w-6" alt=""> {{ $t('reviews.back') }}</button>
            </div>

            <!-- Levels -->
            <WriterLevels :subtext="WRITER.general.levelsSubtext" :max-levels="WRITER.general.maxLevels" />

            <!-- Editor -->
            <section v-show="previewContent == 0 || previewMode" ref="writer" v-if="WRITER.general.allowWriter"
                :style="{ fontFamily: pickFont(POST_DATA.font) }" id="reviewText" :data-white-page="POST_DATA.whitePage"
                class="p-2 mx-auto text-white rounded-md max-w-[90rem] w-full"
                :class="{ 'readabilityMode': POST_DATA.readerMode, '!text-black': POST_DATA.whitePage, 'shadow-drop bg-lof-200 shadow-black': POST_DATA.transparentPage == 0 || SETTINGS.disableTL, 'outline-4 outline outline-lof-200': POST_DATA.transparentPage == 1, 'shadow-drop bg-black bg-opacity-30 backdrop-blur-md backdrop-brightness-[0.4]': POST_DATA.transparentPage == 2 && !SETTINGS.disableTL }">
                
            <Dropdown v-if="writer" :button="writer">
                <template #header>
                    <section class="p-4 text-center text-white min-w-64">
                        <ColumnPreview v-model="highlightedCreateColumns" :col-amount="10" />
                        <p v-show="highlightedCreateColumns == -1" class="mt-2 text-lg text-white text-opacity-40">Vyber počet sloupců</p>
                        <p v-show="highlightedCreateColumns == 1" class="mt-2 text-lg text-white text-opacity-40">Vyber více než jeden</p>
                        <p v-show="highlightedCreateColumns > 1" class="mt-2 text-lg text-white">{{ highlightedCreateColumns }} sloupců</p>
                    </section>
                </template>
            </Dropdown>

                <!-- Formatting -->
                <FormattingBar :class="{ 'pointer-events-none opacity-20': disableEdits }"
                    :selected-nest="selectedNestContainer" @set-formatting="setFormatting"
                    @add-container="(el, above) => addContainer(el, 0, false, above)"
                    @set-alignment="setAlignment(selectedContainer[0], $event)" @column-command="columnCommand($event)"
                    @split-paragraph="splitParagraph" :writer="WRITER" />
                
                <!-- Help when no components in writer -->
                <component
                    :is="WRITER.general.writerHelp"
                    v-if="!POST_DATA.containers.length"
                    @start-writing="startWriting"
                    :inverted="POST_DATA.whitePage"
                    :writer="WRITER"
                />

                <WriterViewer
                    @call-command="dataContainerCommand($event.command, $event.data)"
                    :writer-data="POST_DATA"
                    :editable="previewMode"
                    :container-last-added="containerLastAdded"
                />

                <section v-if="!disableEdits && POST_DATA.containers.length" class="grid grid-cols-3 mt-4">
                    <button @click="saveDraft(false)" class="text-white rounded-md opacity-40 transition-opacity hover:opacity-80 hover:bg-white hover:bg-opacity-10">
                        <img src="@/images/symbolicSave.svg" class="inline mr-4 w-6" alt="">
                        <span v-if="reviewSave.backupID == 0">{{ $t('other.save') }}</span>
                        <span v-else>{{ pretty }}</span>
                    </button>
                    <button class="text-white rounded-md opacity-40 transition-opacity hover:opacity-80 hover:bg-white hover:bg-opacity-10">
                        <img src="@/images/key.svg" class="inline mr-4 w-6" alt="">
                        <span>Klávesové zkratky</span>
                    </button>
                    <button class="text-white rounded-md opacity-40 transition-opacity hover:opacity-80 hover:bg-white hover:bg-opacity-10">
                        <img src="@/images/zen.svg" class="inline mr-4 w-6" alt="">
                        <span>Mód Zen</span>
                    </button>
                </section>
                <!-- <div class="text-xs" >
                    <p  class="mt-2 text-center">
                        <span class="opacity-30 text-inherit">{{ $t('review.unsaved') }}</span> <span
                            @click="" class="underline opacity-60 cursor-pointer">{{ $t('other.save')
                            }}</span>
                    </p>
                    <p v-else class="mt-2 italic text-center">
                        <span class="opacity-30 text-inherit">{{ $t('review.savedLast') }}: </span> <span
                            @click="saveDraft(false)" class="ml-3 not-italic underline opacity-60 cursor-pointer">{{
                            $t('other.save') }}</span>
                    </p>
                </div> -->
            </section>
            
            <!-- Level Preview -->
            <section v-if="previewContent == 1 && !previewMode" class="flex flex-col gap-2 items-center">
                <LevelCard v-for="(l, index) in POST_DATA.levels" v-bind="l" :disable-stars="true"
                    :level-index="index" />
                </section>
                
            <!-- Decoration -->
            <WriterVisuals :review-data="POST_DATA" />

            <!-- Footer buttons (upload, settings...) -->
            <div class="flex gap-3 justify-center items-center mt-8 text-xl">

                <button @click="openDialogs.settings = true" class="flex gap-2 px-2 py-1 rounded-md text-lof-400 hover:underline">
                    <span >{{ $t('other.settings') }}</span>
                </button>

                <button :disabled="uploadInProgress" v-if="!editing" @click="uploadReview()" class="flex gap-4 px-3 py-2 font-bold text-black rounded-md button bg-lof-400">
                    <img v-if="uploadInProgress" src="@/images/loading.webp" class="my-auto w-4 h-4 animate-spin" alt="">
                    <img v-else src="@/images/upload.svg" alt="" class="w-7">
                    <span class="max-sm:hidden">{{ $t('editor.upload') }}</span>
                </button>
                <div class="flex gap-2" v-else>
                    <button :disabled="uploadInProgress" @click="updateReview()" class="flex gap-4 px-3 py-2 font-bold text-black rounded-md button bg-lof-400">
                        <img v-if="uploadInProgress" src="@/images/loading.webp" class="my-auto w-4 h-4 animate-spin" alt="">
                        <img v-else src="@/images/upload.svg" alt="" class="w-7">
                        <span class="max-sm:hidden">{{ $t('editor.update') }}</span>
                    </button>
                    <button :disabled="uploadInProgress" @click="removeReview()" class="flex gap-4 px-3 py-2 text-black bg-red-400 rounded-md button">
                        <img src="@/images/del.svg" alt="" class="w-7">
                    </button>
                </div>

                <button @click="openDialogs.drafts = true" class="flex gap-2 px-2 py-1 rounded-md text-lof-400 hover:underline">
                    <span >{{ $t('reviews.drafts') }}</span>
                </button>

            </div>
        </section>

    </main>
</template>

<style></style>