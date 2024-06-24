<script setup lang="ts">
import { provide, reactive, ref, watch } from "vue";
import DialogVue from "./global/Dialog.vue";
import Header from "./writer/WriterHeader.vue";
import WriterSettings from "./writer/WriterSettings.vue";
import WriterRatings from "./writer/WriterRatings.vue";
import WrtierLevels from "./writer/WriterLevels.vue";
import DataContainer from "./writer/DataContainer.vue"
import FormattingBar from "./writer/FormattingBar.vue"
import CONTAINERS from "./writer/containers";
import TagPickerPopup from "./editor/TagPickerPopup.vue";
import CollabEditor from "./editor/CollabEditor.vue";
import ListPickerPopup from "./global/ListPickerPopup.vue";
import ImageBrowser from "./global/ImageBrowser.vue";
import { useI18n } from "vue-i18n";
import type { TEXT_ALIGNMENTS } from "@/interfaces";
import { reviewData, flexNames, DEFAULT_REVIEWDATA, pickFont, checkReview, getDominantColor } from "@/Reviews";
import ReviewHelp from "./writer/ReviewHelp.vue"
import ListBackground from "./global/ListBackground.vue";
import BackgroundImagePicker from "./global/BackgroundImagePicker.vue";
import { dialog } from "@/components/ui/sizes";
import axios from "axios";
import { modifyListBG } from "@/Editor";
import { onUnmounted } from "vue";
import router from "@/router";
import ErrorPopup from "./editor/errorPopup.vue";
import RemoveListPopup from "./editor/RemoveListPopup.vue";
import TextEditor from "./global/TextEditor.vue";
import UserDialog from "./writer/UserDialog.vue";
import { i18n } from "@/locales";
import { hasLocalStorage } from "@/siteSettings";
import NotLoggedInDialog from "./global/NotLoggedInDialog.vue";

document.title = `${useI18n().t('reviews.reviewEditor')} | ${useI18n().t('other.websiteName')}`

const props = defineProps<{
    reviewID?: string
    isLoggedIn: boolean
    editing?: boolean
}>()

let isNowHidden = false
if (props.editing) {
    axios.post(import.meta.env.VITE_API + "/pwdCheckAction.php", {id: props.reviewID, type: 'review'}).then(res => {
        if (res.data?.data) {
            isNowHidden = res.data.hidden != 0
            reviewData.value = res.data.data
            modifyListBG(reviewData.value.pageBGcolor, false, true)
        }
        else {
            openDialogs.editError = true
        }
    }).catch(() => openDialogs.editError = true)
}

watch(props, () => {
    if (!props.editing) {
        reviewData.value = DEFAULT_REVIEWDATA()
        modifyListBG(reviewData.value.pageBGcolor, true, true)
    }
})

document.body.addEventListener("click", () => {
    selectedContainer.value = [-1, null]
    selectedNestContainer.value = [-1, -1, -1]
})

const openDialogs = reactive({
    settings: false,
    levels: false,
    tags: false,
    collabs: false,
    lists: [false, 0],
    bgPicker: [false, 0],
    ratings: false,
    bgPreview: false,
    imagePicker: [false, 0],
    removeDialog: false,
    description: false,
    editError: false,
    userAdder: [false, 0]
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
provide("levelHashes", {levelHashes, updateHashes})


provide("settingsTitles", CONTAINERS)

const addContainer = (key: string) => {
    let settingObject = {}
    for (let i = 0; i < CONTAINERS[key].settings.length; i++)
        settingObject[CONTAINERS[key].settings[i].key] = JSON.parse(JSON.stringify(CONTAINERS[key].settings[i].default))

    let containerData = {
        type: key,
        data: "",
        align: "left",
        settings: settingObject,
        extraComponents: 0,
        id: Date.now()
    }

    // Adding regular container
    if (selectedNestContainer.value[0] == -1 || !CONTAINERS[key].nestable) {
        if (selectedContainer.value[0] == -1) {
            reviewData.value.containers
            .push(containerData)
            selectedContainer.value[0] = reviewData.value.containers.length - 1
        } else {
            reviewData.value.containers
            .splice(selectedContainer.value[0] + 1, 0, containerData)
            selectedContainer.value[0] += 1
        }
    }
    // Adding into a nested container
    else {
        if (key == "twoColumns") { // Adding a column to a nest container
            reviewData.value.containers[selectedNestContainer.value[0]].extraComponents += 1
            reviewData.value.containers[selectedNestContainer.value[0]].settings.components.push([])
        }
        else
            reviewData.value.containers[selectedNestContainer.value[0]].settings.components[selectedNestContainer.value[1]]
            .push(containerData)
    }
}

const removeContainer = (index: number) => {
    reviewData.value.containers.splice(index, 1)
    setTimeout(() => {
        selectedNestContainer.value = [-1, -1]
    }, 5)
}

const setAlignment = (index: number, alignment: TEXT_ALIGNMENTS) => {
    if (selectedNestContainer.value[0] == -1) {
        if (index < 0) return
        reviewData.value.containers[index].align = alignment
        selectedContainer.value[1]?.focus()
    }
    else {
        reviewData.value.containers[selectedNestContainer.value[0]].settings.components[selectedNestContainer.value[1]][selectedNestContainer.value[2]].align = alignment
    }

}

const columnCommand = (index: number) => {
    switch (index) {
        case 0: addContainer("twoColumns", -1); break;
        case 1: addContainer("twoColumns", 1); break;
        case 2: moveContainer(selectedNestContainer[0], -1); break;
        case 3: moveContainer(selectedNestContainer[0], 1); break;
        case 4: reviewData.value.containers[selectedNestContainer.value[0]].settings.components.splice(selectedNestContainer[1], 1); break;
        case 5: removeContainer(selectedNestContainer[0]); break;
    }
}

const setFormatting = (format: string) => {
    switch (format) {
        case "view": previewMode.value = !previewMode.value; break;
    }
}

const moveToParagraph = (currentContainerIndex: number) => {
    if (reviewData.value.containers?.[currentContainerIndex+1]?.type == "default") {
        selectedContainer.value[0] += 1
        dataContainers.value[selectedContainer.value[0]].doFocusText()
    }
    else
        addContainer("default")
}

const startWriting = () => {
    addContainer("heading1")
    addContainer("default")
}

const moveContainer = (index: number, by: number) => {
    let data = reviewData.value.containers[index]
    reviewData.value.containers.splice(index, 1)
    reviewData.value.containers.splice(index+by, 0, data)
}

const taglinePlaceholders = [
    useI18n().t('reviews.p1'),
    useI18n().t('reviews.p2'),
    useI18n().t('reviews.p3'),
    useI18n().t('reviews.p4'),
    useI18n().t('reviews.p5'),
    useI18n().t('reviews.p6'),
]
const tagline = ref(reviewData.value.tagline)

const buttonState = ref("")

const dataContainers = ref()
const modifyImageURL = (newUrl: string) => {
    // Review background
    if (openDialogs.imagePicker[1] == -1) {
        reviewData.value.titleImg[0] = newUrl
        let img = document.createElement("img")
        img.src = newUrl
        img.onload = () => {
            reviewData.value.pageBGcolor = modifyListBG(getDominantColor(img).hex())
            img.remove()
        }
    }
    // Review thumbnail
    else if (openDialogs.imagePicker[1] == -2) {
        reviewData.value.thumbnail[0] = newUrl
    }
    // Image container
    else if (selectedNestContainer.value[0] == -1) {
        reviewData.value.containers[openDialogs.imagePicker[1]].settings.url = newUrl
    }
    // Image container in nested container
    else {
        reviewData.value.containers[selectedNestContainer.value[0]].settings.components[selectedNestContainer.value[1]][selectedNestContainer.value[2]].settings.url = newUrl
    }
}

const errorStamp = ref(Date.now())
const errorText = ref("")
const checkForErrors = () => {
    let check = checkReview()
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
    if (!checkForErrors()) {
        openDialogs.settings = false
        return
    }
    
    uploadInProgress.value = true
    axios.post(import.meta.env.VITE_API + "/sendReview.php", reviewData.value).then(res => {
        sessionStorage.setItem("uploadFinished", "1")

        if (res.data[0] != -1) router.replace(`/review/${res.data[0]}`)
        else reviewUploadErrors(res.data[1])

        uploadInProgress.value = false
    })
        .catch(() => {
            errorStamp.value = Date.now()
            errorText.value = i18n.global.t('reviews.uploadFail')
            uploadInProgress.value = false
        })
}

const removeReview = () => {
    uploadInProgress.value = true
    axios.post(import.meta.env.VITE_API + "/removeList.php", {id: props.reviewID, type: 'review'}).then(res => {
        if (res.data == 3) router.replace("/browse/reviews")
        else {
            errorStamp.value = Date.now()
            errorText.value = i18n.global.t('reviews.removeFail')
        }
        uploadInProgress.value = false
    }).catch(() => {
        errorStamp.value = Date.now()
        errorText.value = i18n.global.t('reviews.removeFail')
        uploadInProgress.value = false
    })
}

const updateReview = () => {
    if (!checkForErrors()) return

    uploadInProgress.value = true
    axios.post(import.meta.env.VITE_API + "/updateList.php", {
        id: props.reviewID,
        type: 'review',
        listData: JSON.stringify(reviewData.value),
        tagline: reviewData.value.tagline,
        hidden: reviewData.value.private | 0,
        isNowHidden: isNowHidden ? "true" : "false",
        disComments: reviewData.value.disComments | 0
    }) 
        .then(res => {
        sessionStorage.setItem("uploadFinished", "2")

        if (res.data[0] != -1) router.replace(`/review/${res.data[0]}`)
        else reviewUploadErrors(res.data[1])

        uploadInProgress.value = false
    })
        .catch(() => {
            errorStamp.value = Date.now()
            errorText.value = i18n.global.t('reviews.uploadFail')
            uploadInProgress.value = false
        })
}

onUnmounted(() => {
  reviewData.value = DEFAULT_REVIEWDATA()
})

const collabBackground = ref()
const preUpload = ref(false)
</script>

<template>
    <section v-if="openDialogs.editError" class="flex flex-col gap-3 items-center mt-10 text-center text-white opacity-40">
        <img class="w-64" src="@/images/listError.svg" alt="">
        <span class="text-2xl">{{ $t('reviews.editError') }}</span>
    </section>

    <div v-else-if="!isLoggedIn && hasLocalStorage()">
        <NotLoggedInDialog
            :mess="$t('editor.loginToCreateReviews')"
        />
    </div>

    <div v-else-if="!hasLocalStorage()" class="flex flex-col gap-4 justify-center items-center mx-auto mt-5">
        <img src="../images/disCookies.svg" class="w-48 opacity-20" alt="">
        <h1 class="max-w-sm text-2xl text-center text-white opacity-20">{{ $t('editor.cookDisabled') }}</h1>
    </div>

    <main v-else class="p-2">
        <ErrorPopup
            :error-text="errorText"
            :previewing="false"
            :stamp="errorStamp"
        />

        <Transition name="fade">
            <RemoveListPopup v-if="openDialogs.removeDialog" is-review @delete-list="removeReview" @close-popup="openDialogs.removeDialog = false" />
        </Transition>

        <DialogVue :open="openDialogs.description" @close-popup="openDialogs.description = false" :title="$t('editor.descriptionEditor')" :width="dialog.xl">
            <TextEditor
            :edit-value="reviewData"
            />
        </DialogVue>

        <ListBackground v-if="openDialogs.bgPreview" :image-data="reviewData.titleImg" :list-color="reviewData.pageBGcolor" />

        <DialogVue :open="openDialogs.settings" @close-popup="openDialogs.settings = false; preUpload = false" :title="$t('other.settings')" :width="dialog.medium">
            <WriterSettings :uploading="preUpload" @upload="uploadReview" />
        </DialogVue>

        <DialogVue :open="openDialogs.userAdder[0]" :action="selectedLevel?.addLevel" :title="$t('editor.levels')" :side-button-text="$t('other.add')" :side-button-disabled="reviewData.containers?.[openDialogs.userAdder[1]]?.settings?.users?.length >= 10" @close-popup="openDialogs.userAdder[0] = false" :width="dialog.large">
            <template #icon><img src="@/images/plus.svg" alt="" class="w-6"></template>
            <UserDialog />
        </DialogVue>

        <DialogVue :open="openDialogs.levels" :action="selectedLevel?.addLevel" :title="$t('editor.levels')" :side-button-text="$t('reviews.addLevel')" :side-button-disabled="reviewData.levels.length >= 10" @close-popup="openDialogs.levels = false" :width="dialog.large">
            <template #icon><img src="@/images/plus.svg" alt="" class="w-6"></template>
            <WrtierLevels ref="selectedLevel" />
            <DialogVue :custom-color="collabBackground?.background" :open="openDialogs.collabs" @close-popup="openDialogs.collabs = false" :title="$t('collabTools.funny1')" :width="dialog.xl" :top-most="true">
                <CollabEditor ref="collabBackground" :level-array="reviewData.levels" :index="0" :clipboard="collabClipboard" @close-popup="openDialogs.collabs = false" />
            </DialogVue>
        </DialogVue>

        <DialogVue :open="openDialogs.tags" @close-popup="openDialogs.tags = false" :title="$t('editor.tagTitle')" :width="dialog.medium" :top-most="true">
            <TagPickerPopup @add-tag="reviewData.levels[selectedLevel.openedCard].tags.push($event)" />
        </DialogVue>
        
        
        <DialogVue :title="$t('help.Lists')" :open="openDialogs.lists[0]" @close-popup="openDialogs.lists[0] = false">
            <ListPickerPopup @close-popup="openDialogs.lists[0] = false" :data="reviewData.containers" />
        </DialogVue>
        
        <DialogVue :open="openDialogs.bgPicker[0]" @close-popup="openDialogs.bgPicker[0] = false" disable-tap-close :title="$t('other.imageSettings')" :width="dialog.xl">
            <BackgroundImagePicker :force-aspect-height="openDialogs.bgPicker[1] ? 0 : 10.8" :source="openDialogs.bgPicker[1] ? reviewData.titleImg : reviewData.thumbnail" />
        </DialogVue>

        <DialogVue :open="openDialogs.ratings" @close-popup="openDialogs.ratings = false" :title="$t('reviews.rating')">
            <WriterRatings />
        </DialogVue>

        <DialogVue :open="openDialogs.imagePicker[0]" @close-popup="openDialogs.imagePicker[0] = false" :title="$t('reviews.bgImage')" :width="dialog.large">
            <ImageBrowser :disable-external="openDialogs.imagePicker[1] == -2" :unselectable="false" @close-popup="openDialogs.imagePicker[0] = false" @pick-image="modifyImageURL" />
        </DialogVue>

        
        <Header
            :editing="editing"
            :uploading="uploadInProgress"
            @update="updateReview"
            @remove="openDialogs.removeDialog = true"
            @upload="startUpload"
            @open-dialog="openDialogs[$event] = true"
        />
        
        <section class="max-w-[90rem] mx-auto">
            <!-- Hero -->
            <div class="pb-16 pl-10 bg-opacity-10 bg-gradient-to-t to-transparent rounded-b-md from-slate-400">
                <input v-model="reviewData.reviewName" type="text" :maxlength="40" :disabled="editing" :placeholder="$t('reviews.reviewName')" class="text-5xl disabled:opacity-70 disabled:cursor-not-allowed max-w-[85vw] font-black text-white bg-transparent border-b-2 border-b-transparent focus-within:border-b-lof-400 outline-none">
                <button v-if="!reviewData.tagline.length && !tagline" @click="tagline = true" class="flex gap-2 items-center mt-3 font-bold text-white">
                    <img src="@/images/plus.svg" class="w-6" alt="">
                    <span>{{ $t('reviews.addTagline') }}</span>
                </button>
                <div v-else class="flex gap-2 items-center w-2/5 text-white group">
                    <input type="text" v-once :maxlength="60" v-model="reviewData.tagline" autofocus class="text-lg italic bg-transparent border-b-2 outline-none grow border-b-transparent focus-within:border-lof-400" :placeholder="taglinePlaceholders[Math.floor(Math.random() * taglinePlaceholders.length)]">
                    <button @click="reviewData.tagline = ''; tagline = false">
                        <img src="@/images/trash.svg" alt="" class="hidden p-1 w-6 bg-black bg-opacity-40 rounded-md group-focus-within:block button">
                    </button>
                </div>
            </div>

            <!-- Formatting -->
            <FormattingBar
                :selected-nest="selectedNestContainer"
                @set-formatting="setFormatting"
                @add-container="addContainer"
                @set-alignment="setAlignment(selectedContainer[0], $event)"
                @column-command="columnCommand($event)"
            />

            <!-- Editor -->
            <section ref="writer" :style="{fontFamily: pickFont(reviewData.font)}" id="reviewText" :data-white-page="reviewData.whitePage" class="p-2 mx-auto text-white rounded-md" :class="{'readabilityMode': reviewData.readerMode, '!text-black': reviewData.whitePage, 'shadow-drop bg-lof-200 shadow-black': reviewData.transparentPage == 0, 'outline-4 outline outline-lof-200': reviewData.transparentPage == 1, 'shadow-drop bg-black bg-opacity-30 backdrop-blur-md backdrop-brightness-[0.4]': reviewData.transparentPage == 2}">
                <ReviewHelp v-if="!reviewData.containers.length" :no-ratings="reviewData.disabledRatings" @start-writing="startWriting" :inverted="reviewData.whitePage"/>

                <DataContainer
                    v-for="(container, index) in reviewData.containers"
                    v-bind="CONTAINERS[container.type]"
                    ref="dataContainers"
                    @remove-container="removeContainer(index)"
                    @move-container="moveContainer(index, $event)"
                    @has-focus="selectedContainer = [index, $event]; selectedNestContainer = [-1, -1, -1]"
                    @text-modified="container.data = $event"
                    @settings-button="buttonState = $event"
                    @add-paragraph="moveToParagraph(index)"
                    v-model="container.data"
                    :type="container.type"
                    :current-settings="container.settings"
                    :class="[CONTAINERS[container.type].styling ?? '']"
                    :style="{textAlign: container.align}"
                    :key="container.id"
                    :focused="previewMode && selectedContainer[0] == index"
                    :editable="previewMode"
                    :text="container.data"
                >
                    <div class="flex flex-wrap w-full" :style="{justifyContent: flexNames[container.align]}">
                        <component
                            v-for="(elements, subIndex) in (CONTAINERS[container.type].additionalComponents ?? []).concat(Array(container.extraComponents).fill(CONTAINERS[container.type].additionalComponents?.[0] ?? []))"
                            :is="elements"
                            v-bind="CONTAINERS[container.type].componentProps ?? {}"
                            @clear-button="buttonState = ''"
                            @remove-subcontainer="container.extraComponents -= 1"
                            @remove="removeContainer(index)"
                            :button-state="buttonState"
                            :settings="container.settings"
                            :index="index"
                            :sub-index="subIndex"
                            :key="container.id"
                            :editable="previewMode"
                        />
                    </div>
                </DataContainer>
                <button @click="addContainer('default')" v-show="previewMode" class="flex gap-2 justify-center p-2 mx-auto mt-4 w-96 max-w-[90%] rounded-md border-2 border-white border-opacity-20 border-dashed font-[poppins]" :class="{'invert': reviewData.whitePage}">
                    <img class="w-6" src="@/images/plus.svg" alt="">
                    <span>{{ $t('reviews.addParagraph') }}</span>
                </button>
            </section>
        </section>

    </main>
</template>