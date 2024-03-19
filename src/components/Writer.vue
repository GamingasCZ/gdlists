<script setup lang="ts">
import { provide, reactive, ref } from "vue";
import DialogVue from "./global/Dialog.vue";
import Header from "./writer/WriterHeader.vue";
import WriterSettings from "./writer/WriterSettings.vue";
import LevelPopup from "./writer/LevelPopup.vue";
import DataContainer from "./writer/DataContainer.vue"
import FormattingBar from "./writer/FormattingBar.vue"
import CONTAINERS from "./writer/containers";
import TagPickerPopup from "./editor/TagPickerPopup.vue";
import CollabEditor from "./editor/CollabEditor.vue";
import ListPickerPopup from "./global/ListPickerPopup.vue";
import { useI18n } from "vue-i18n";
import type { ReviewContainer, TEXT_ALIGNMENTS } from "@/interfaces";
import { reviewData } from "@/Reviews";
import ReviewHelp from "./writer/ReviewHelp.vue"


const reviewData.containers = reactive<ReviewContainer[]>([])
const openDialogs = reactive({
    "settings": false,
    "levels": false,
    "tags": false,
    "collabs": false,
    "lists": [false, 0]
})

const collabClipboard = ref([])
provide("openedDialogs", openDialogs)

const selectedContainer = ref<[number, HTMLDivElement | null]>([-1, null])
provide("settingsTitles", CONTAINERS)


const addContainer = (key: string) => {
    let settingObject = {}
    for (let i = 0; i < CONTAINERS[key].settings.length; i++)
        settingObject[CONTAINERS[key].settings[i].key] = CONTAINERS[key].settings[i].default

    reviewData.value.containers.push({
        type: key,
        data: "",
        align: "left",
        settings: settingObject
    })
}

const setAlignment = (index: number, alignment: TEXT_ALIGNMENTS) => {
    if (index < 0) return
    reviewData.value.containers[index].align = alignment
    selectedContainer.value[1]?.focus()
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
    reviewData.containers[0].data = `${val?.slice(0, range?.startOffset)}${signs[format]}${signs[format]}${val?.slice(range?.startOffset, range?.endOffset)}${signs[format]}/${val?.slice(range?.endOffset)}`
    
    el.parentElement.innerHTML = reviewData.containers[0].data.replace("**", "<b>").replace("*/", "</b>")
}

const moveContainer = (index: number, by: number) => {
    reviewData.containers.splice(index+by, 1, reviewData.containers[index])
}

const taglinePlaceholders = [
    useI18n().t('reviews.p1'),
    useI18n().t('reviews.p2'),
    useI18n().t('reviews.p3'),
    useI18n().t('reviews.p4'),
    useI18n().t('reviews.p5'),
    useI18n().t('reviews.p6'),
]
const tagline = ref(reviewData.tagline)

const buttonState = ref("")
</script>

<template>
    <main class="p-2">

        <DialogVue :open="openDialogs.settings" @close-popup="openDialogs.settings = false">
            <WriterSettings @close-popup="openDialogs.settings = false" />
        </DialogVue>

        <DialogVue :open="openDialogs.levels" @close-popup="openDialogs.levels = false">
            <LevelPopup @close-popup="openDialogs.levels = false" />
        </DialogVue>

        <DialogVue :open="openDialogs.tags" @close-popup="openDialogs.tags = false">
            <TagPickerPopup @close-popup="openDialogs.tags = false" />
        </DialogVue>
        
        <DialogVue :open="openDialogs.collabs" @close-popup="openDialogs.collabs = false">
            <CollabEditor :index="0" :clipboard="collabClipboard" @close-popup="openDialogs.collabs = false" />
        </DialogVue>
        
        <DialogVue :open="openDialogs.lists[0]" @close-popup="openDialogs.lists[0] = false">
            <ListPickerPopup @close-popup="openDialogs.lists[0] = false" :data="reviewData.containers" />
        </DialogVue>


        <Header @open-dialog="openDialogs[$event] = true" />

        <section class="max-w-[90rem] mx-auto leadin">
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
            <section class="p-2 text-white rounded-md shadow-md bg-lof-200 shadow-black">
                <ReviewHelp v-if="!reviewData.containers.length" />

                <DataContainer
                    v-for="(container, index) in reviewData.containers"
                    v-bind="CONTAINERS[container.type]"
                    @has-focus="selectedContainer = [index, $event]"
                    @remove-container="reviewData.containers.splice(index, 1)"
                    @move-container="moveContainer(index, $event)"
                    @text-modified="container.data = $event"
                    @settings-button="buttonState = $event"
                    :type="container.type"
                    :current-settings="container.settings"
                    :class="[CONTAINERS[container.type].styling ?? '']"
                    :style="{textAlign: container.align}"
                >
                    <div class="flex col-span-2 w-full">
                        <component
                            v-for="elements in CONTAINERS[container.type].additionalComponents"
                            class="grow"
                            :is="elements"
                            v-bind="CONTAINERS[container.type].componentProps ?? {}"
                            @clear-button="buttonState = ''"
                            :button-state="buttonState"
                            :settings="container.settings"
                            :index="index"
                        />
                    </div>
                </DataContainer>
                <button @click="addContainer('default')" class="flex gap-2 justify-center p-2 mx-auto mt-4 w-96 max-w-[90%] rounded-md border-2 border-white border-opacity-20 border-dashed">
                    <img class="w-6" src="@/images/plus.svg" alt="">
                    <span>{{ $t('reviews.addParagraph') }}</span>
                </button>
            </section>
        </section>

    </main>
</template>