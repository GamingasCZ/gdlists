<script setup lang="ts">
import { provide, reactive, ref } from "vue";
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
import { reviewData, flexNames, DEFAULT_REVIEWDATA, pickFont, checkReview } from "@/Reviews";
import ReviewHelp from "./writer/ReviewHelp.vue"
import ListBackground from "./global/ListBackground.vue";
import BackgroundImagePicker from "./global/BackgroundImagePicker.vue";
import { dialog } from "@/components/ui/sizes";
import axios from "axios";
import { modifyListBG } from "@/Editor";
import { onUnmounted } from "vue";
import router from "@/router";
import ErrorPopup from "./editor/errorPopup.vue";

document.title = `${useI18n().t('reviews.reviewEditor')} | ${useI18n().t('other.websiteName')}`

const props = defineProps<{
    reviewID?: string
    editing?: boolean
}>()

let isNowHidden = false
if (props.editing) {
    axios.post(import.meta.env.VITE_API + "/pwdCheckAction.php", {id: props.reviewID, type: 'review'}).then(res => {
        isNowHidden = res.data.hidden != 0
        reviewData.value = res.data.data
        modifyListBG(reviewData.value.pageBGcolor, false, true)
    })
}

document.body.addEventListener("click", () => {
    selectedContainer.value = [-1, null]
    selectedNestContainer.value = [-1, -1, -1]
})

const openDialogs = reactive({
    "settings": false,
    "levels": false,
    "tags": false,
    "collabs": false,
    "lists": [false, 0],
    "bgPicker": [false, 0],
    "ratings": false,
    "bgPreview": false,
    "imagePicker": [false, 0]
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
    }
    // Review background
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

const uploadReview = () => {
    if (!checkForErrors()) {
        openDialogs.settings = false
        return
    }
    
    axios.post(import.meta.env.VITE_API + "/sendReview.php", reviewData.value).then(res => {
        sessionStorage.setItem("uploadFinished", "1")
        // todo: add error checking
        router.replace(`/review/${res.data[0]}`)
    })
}

const removeReview = () => {
    axios.post(import.meta.env.VITE_API + "/removeList.php", {id: props.reviewID, type: 'review'}).then(res => {
        router.replace("/browse/reviews")
    })
}

const updateReview = () => {
    if (!checkForErrors()) return

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
        router.replace(`/review/${res.data}`)
    })
}

onUnmounted(() => {
  reviewData.value = DEFAULT_REVIEWDATA()
})

const collabBackground = ref()
const preUpload = ref(false)
</script>

<template>
    <main class="p-2">
        <ErrorPopup
            :error-text="errorText"
            :previewing="false"
            :stamp="errorStamp"
        />

        <ListBackground v-if="openDialogs.bgPreview" :image-data="reviewData.titleImg" :list-color="reviewData.pageBGcolor" />

        <DialogVue :open="openDialogs.settings" @close-popup="openDialogs.settings = false; preUpload = false" :title="$t('other.settings')" :width="dialog.medium">
            <WriterSettings :uploading="preUpload" @upload="uploadReview" />
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
            @update="updateReview"
            @remove="removeReview"
            @upload="startUpload"
            @open-dialog="openDialogs[$event] = true"
        />
        
        <section class="max-w-[90rem] mx-auto">
            <!-- Hero -->
            <div class="pb-16 pl-10 bg-opacity-10 bg-gradient-to-t to-transparent rounded-b-md from-slate-400">
                <input v-model="reviewData.reviewName" type="text" :disabled="editing" :placeholder="$t('reviews.reviewName')" class="text-5xl disabled:opacity-70 disabled:cursor-not-allowed max-w-[85vw] font-black text-white bg-transparent border-b-2 border-b-transparent focus-within:border-b-lof-400 outline-none">
                <button v-if="!reviewData.tagline.length && !tagline" @click="tagline = true" class="flex gap-2 items-center mt-3 font-bold text-white">
                    <img src="@/images/plus.svg" class="w-6" alt="">
                    <span>{{ $t('reviews.addTagline') }}</span>
                </button>
                <div v-else class="flex gap-2 items-center w-2/5 text-white group">
                    <input type="text" v-once v-model="reviewData.tagline" autofocus class="text-lg italic bg-transparent border-b-2 outline-none grow border-b-transparent focus-within:border-lof-400" :placeholder="taglinePlaceholders[Math.floor(Math.random() * taglinePlaceholders.length)]">
                    <button @click="reviewData.tagline = ''; tagline = false">
                        <img src="@/images/trash.svg" alt="" class="hidden p-1 w-6 bg-black bg-opacity-40 rounded-md group-focus-within:block button">
                    </button>
                </div>
            </div>

            <!-- Formatting -->
            <FormattingBar
                @set-formatting="setFormatting"
                @add-container="addContainer"
                @set-alignment="setAlignment(selectedContainer[0], $event)"
            />

            <!-- Editor -->
            <section ref="writer" :style="{fontFamily: pickFont(reviewData.font)}" id="reviewText" :data-white-page="reviewData.whitePage" class="p-2 mx-auto text-white rounded-md" :class="{'readabilityMode': reviewData.readerMode,'shadow-drop bg-lof-200 shadow-black': reviewData.transparentPage == 0, 'outline-4 outline outline-lof-200': reviewData.transparentPage == 1, 'shadow-drop bg-black bg-opacity-30 backdrop-blur-md backdrop-brightness-[0.4]': reviewData.transparentPage == 2}">
                <ReviewHelp v-if="!reviewData.containers.length" @start-writing="startWriting" :inverted="reviewData.whitePage"/>

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
                <button @click="addContainer('default')" v-show="reviewData.containers.length && previewMode" class="flex gap-2 justify-center p-2 mx-auto mt-4 w-96 max-w-[90%] rounded-md border-2 border-white border-opacity-20 border-dashed font-[poppins]" :class="{'invert': reviewData.whitePage}">
                    <img class="w-6" src="@/images/plus.svg" alt="">
                    <span>{{ $t('reviews.addParagraph') }}</span>
                </button>
            </section>
        </section>

    </main>
</template>