<script setup lang="ts">
import { provide, reactive, ref } from "vue";
import DialogVue from "./global/Dialog.vue";
import Header from "./writer/WriterHeader.vue";
import WriterSettings from "./writer/WriterSettings.vue";
import WriterRatings from "./writer/WriterRatings.vue";
import LevelPopup from "./writer/LevelPopup.vue";
import DataContainer from "./writer/DataContainer.vue"
import FormattingBar from "./writer/FormattingBar.vue"
import CONTAINERS from "./writer/containers";
import TagPickerPopup from "./editor/TagPickerPopup.vue";
import CollabEditor from "./editor/CollabEditor.vue";
import ListPickerPopup from "./global/ListPickerPopup.vue";
import ImageBrowser from "./global/ImageBrowser.vue";
import { useI18n } from "vue-i18n";
import type { ReviewContainer, TEXT_ALIGNMENTS } from "@/interfaces";
import { reviewData, flexNames } from "@/Reviews";
import ReviewHelp from "./writer/ReviewHelp.vue"
import ListBackground from "./global/ListBackground.vue";
import BackgroundImagePicker from "./global/BackgroundImagePicker.vue";
import { dialog } from "@/components/ui/sizes";

document.title = `${useI18n().t('reviews.reviewEditor')} | ${useI18n().t('other.websiteName')}`

const openDialogs = reactive({
    "settings": false,
    "levels": false,
    "tags": false,
    "collabs": false,
    "lists": [false, 0],
    "bgPicker": false,
    "ratings": false,
    "bgPreview": false,
    "imagePicker": [false, 0]
})

document.body.addEventListener("click", () => selectedContainer.value = [-1, -1])

const collabClipboard = ref([])
provide("openedDialogs", openDialogs)

const selectedContainer = ref<[number, HTMLDivElement | null]>([-1, null])
provide("settingsTitles", CONTAINERS)

const selectedLevel = ref()

const selectedNestContainer = ref([-1, -1])
provide("selectedNestContainer", selectedNestContainer)

const addContainer = (key: string) => {
    let settingObject = {}
    for (let i = 0; i < CONTAINERS[key].settings.length; i++)
        settingObject[CONTAINERS[key].settings[i].key] = JSON.parse(JSON.stringify(CONTAINERS[key].settings[i].default))

    // Adding regular container
    if (selectedNestContainer.value[0] == -1 || !CONTAINERS[key].nestable) {
        reviewData.value.containers.push({
            type: key,
            data: "",
            align: "left",
            settings: settingObject,
            extraComponents: 0,
            id: Date.now()
        })
    }
    // Adding into a nested container
    else {
        if (key == "twoColumns") { // Adding a column to a nest container
            reviewData.value.containers[selectedNestContainer.value[0]].extraComponents += 1
            reviewData.value.containers[selectedNestContainer.value[0]].settings.components.push([])
        }
        else
            reviewData.value.containers[selectedNestContainer.value[0]].settings.components[selectedNestContainer.value[1]].push({
                type: key,
                data: "",
                align: "left",
                settings: settingObject,
                extraComponents: 0,
                id: Date.now()
            })
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
    let sel = window.getSelection()
    let el = sel?.focusNode
    let range = sel?.getRangeAt(0)
    let signs = {
        bold: "*",
        underline: "_",
        strike: "-",
        cursive: "/",
    }

    let val = el?.nodeValue
    reviewData.value.containers[0].data = `${val?.slice(0, range?.startOffset)}${signs[format]}${signs[format]}${val?.slice(range?.startOffset, range?.endOffset)}${signs[format]}/${val?.slice(range?.endOffset)}`
    
    el.parentElement.innerHTML = reviewData.value.containers[0].data.replace("**", "<b>").replace("*/", "</b>")
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
    // Image container
    else if (selectedNestContainer.value[0] == -1) {
        reviewData.value.containers[openDialogs.imagePicker[1]].settings.url = newUrl
    }
    // Image container in nested container
    else {
        reviewData.value.containers[selectedNestContainer.value[0]].settings.components[selectedNestContainer.value[1]][selectedNestContainer.value[2]].settings.url = newUrl
    }
}
</script>

<template>
    <main class="p-2">
        <ListBackground v-if="openDialogs.bgPreview" :image-data="reviewData.titleImg" :list-color="reviewData.pageBGcolor" />

        <DialogVue :open="openDialogs.settings" @close-popup="openDialogs.settings = false" :title="$t('other.settings')" :width="dialog.medium">
            <WriterSettings />
        </DialogVue>

        <DialogVue :open="openDialogs.levels" @close-popup="openDialogs.levels = false" :width="dialog.large">
            <LevelPopup ref="selectedLevel" @close-popup="openDialogs.levels = false" />
        </DialogVue>

        <DialogVue :open="openDialogs.tags" @close-popup="openDialogs.tags = false" :title="$t('editor.tagTitle')" :width="dialog.medium">
            <TagPickerPopup @add-tag="reviewData.levels[selectedLevel.openedCard].tags.push($event)" />
        </DialogVue>
        
        <DialogVue :open="openDialogs.collabs" @close-popup="openDialogs.collabs = false">
            <CollabEditor :index="0" :clipboard="collabClipboard" @close-popup="openDialogs.collabs = false" />
        </DialogVue>
        
        <DialogVue :open="openDialogs.lists[0]" @close-popup="openDialogs.lists[0] = false">
            <ListPickerPopup @close-popup="openDialogs.lists[0] = false" :data="reviewData.containers" />
        </DialogVue>
        
        <DialogVue :open="openDialogs.bgPicker" @close-popup="openDialogs.bgPicker = false" :title="$t('other.imageSettings')">
            <BackgroundImagePicker :source="reviewData" @close-popup="openDialogs.bgPicker = false" />
        </DialogVue>

        <DialogVue :open="openDialogs.ratings" @close-popup="openDialogs.ratings = false" :title="$t('reviews.rating')">
            <WriterRatings />
        </DialogVue>

        <DialogVue :open="openDialogs.imagePicker[0]" @close-popup="openDialogs.imagePicker[0] = false" :title="$t('reviews.bgImage')" :width="dialog.large">
            <ImageBrowser @close-popup="openDialogs.imagePicker[0] = false" @pick-image="modifyImageURL" />
        </DialogVue>

        
        <Header @open-dialog="openDialogs[$event] = true" />
        <section class="max-w-[90rem] mx-auto">
            <!-- Hero -->
            <div class="pb-16 pl-10 bg-opacity-10 bg-gradient-to-t to-transparent rounded-b-md from-slate-400">
                <input type="text" :placeholder="$t('reviews.reviewName')" class="text-5xl max-w-[85vw] font-black text-white bg-transparent border-b-2 border-b-transparent focus-within:border-b-lof-400 outline-none">
                <button v-if="!tagline" @click="tagline = true" class="flex gap-2 items-center mt-3 font-bold text-white">
                    <img src="@/images/plus.svg" class="w-6" alt="">
                    <span>{{ $t('reviews.addTagline') }}</span>
                </button>
                <div v-else class="flex gap-2 items-center w-2/5 text-white group">
                    <input type="text" v-model="reviewData.tagline" autofocus class="text-lg italic bg-transparent border-b-2 outline-none grow border-b-transparent focus-within:border-lof-400" :placeholder="taglinePlaceholders[Math.floor(Math.random() * taglinePlaceholders.length)]">
                    <button @click="tagline = false">
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
            <section class="p-2 text-white rounded-md" :class="{'shadow-drop bg-lof-300 shadow-black': reviewData.transparentPage == 0, 'outline-4 outline outline-lof-200': reviewData.transparentPage == 1, 'shadow-drop bg-black bg-opacity-30 backdrop-blur-md backdrop-brightness-[0.4]': reviewData.transparentPage == 2}">
                <ReviewHelp v-if="!reviewData.containers.length" @start-writing="startWriting" />

                <DataContainer
                    v-for="(container, index) in reviewData.containers"
                    v-bind="CONTAINERS[container.type]"
                    ref="dataContainers"
                    @has-focus="selectedContainer = [index, $event]; selectedNestContainer = [-1, -1]"
                    @remove-container="removeContainer(index)"
                    @move-container="moveContainer(index, $event)"
                    @text-modified="container.data = $event"
                    @settings-button="buttonState = $event"
                    :type="container.type"
                    :current-settings="container.settings"
                    :class="[CONTAINERS[container.type].styling ?? '']"
                    :style="{textAlign: container.align}"
                    :key="container.id"
                    :focused="selectedContainer[0] == index"
                >
                    <div class="flex w-full" :style="{justifyContent: flexNames[container.align]}">
                        <component
                            v-for="(elements, subIndex) in (CONTAINERS[container.type].additionalComponents ?? []).concat(Array(container.extraComponents).fill(CONTAINERS[container.type].additionalComponents?.[0] ?? []))"
                            class="grow"
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
                        />
                    </div>
                </DataContainer>
                <button @click="addContainer('default')" v-show="reviewData.containers.length" class="flex gap-2 justify-center p-2 mx-auto mt-4 w-96 max-w-[90%] rounded-md border-2 border-white border-opacity-20 border-dashed">
                    <img class="w-6" src="@/images/plus.svg" alt="">
                    <span>{{ $t('reviews.addParagraph') }}</span>
                </button>
            </section>
        </section>

    </main>
</template>