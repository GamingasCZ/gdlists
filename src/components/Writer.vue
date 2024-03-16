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
import parseText from "./global/parseEditorFormatting";


const reviewData = reactive<any[]>([])
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

    reviewData.push({
        type: key,
        data: "",
        align: "left",
        settings: settingObject
    })
}

const setAlignment = (index: number, alignment: string) => {
    if (index < 0) return
    reviewData[index].align = alignment
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
    reviewData[0].data = `${val?.slice(0, range?.startOffset)}${signs[format]}${signs[format]}${val?.slice(range?.startOffset, range?.endOffset)}${signs[format]}/${val?.slice(range?.endOffset)}`
    
    el.parentElement.innerHTML = reviewData[0].data.replace("**", "<b>").replace("*/", "</b>")
}

const moveContainer = (index: number, by: number) => {
    reviewData.splice(index+by, 1, reviewData[index])
}


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
            <ListPickerPopup @close-popup="openDialogs.lists[0] = false" :data="reviewData" />
        </DialogVue>


        <Header @open-dialog="openDialogs[$event] = true" />

        <section class="max-w-[90rem] mx-auto leadin">
            <!-- Hero -->
            <div class="pb-16 pl-10 bg-opacity-10 bg-gradient-to-t to-transparent rounded-b-md from-slate-400">
                <input type="text" :placeholder="$t('reviews.reviewName')" class="text-5xl max-w-[85vw] font-black text-white bg-transparent focus-within:border-b-2 border-b-lof-400 focus-within:outline-none">
                <button class="flex gap-2 items-center mt-3 font-bold text-white">
                    <img src="@/images/plus.svg" class="w-6" alt="">
                    <span>{{ $t('reviews.addTagline') }}</span>
                    <div>
                        <input type="text" placeholder="Tagline">
                    </div>
                </button>
            </div>

            <!-- Formatting -->
            <FormattingBar
                @set-formatting="setFormatting"
                @add-container="addContainer"
                @set-alignment="setAlignment(selectedContainer[0], $event)"
            />

            <!-- Editor -->
            <section class="p-2 text-white rounded-md shadow-md bg-lof-200 shadow-black">
                <DataContainer
                    v-for="(container, index) in reviewData"
                    v-bind="CONTAINERS[container.type]"
                    @has-focus="selectedContainer = [index, $event]"
                    @remove-container="reviewData.splice(index, 1)"
                    @move-container="moveContainer(index, $event)"
                    @text-modified="container.data = $event"
                    :type="container.type"
                    :current-settings="container.settings"
                    :class="[CONTAINERS[container.type].styling ?? '']"
                    :style="{textAlign: container.align}"
                >
                    <component v-for="elements in CONTAINERS[container.type].additionalComponents" :is="elements" :settings="container.settings" :index="index" />
                </DataContainer>
                <button @click="addContainer('default')" class="flex gap-2 justify-center p-2 mx-auto mt-4 w-96 max-w-[90%] rounded-md border-2 border-white border-opacity-20 border-dashed">
                    <img class="w-6" src="@/images/plus.svg" alt="">
                    <span>{{ $t('reviews.addParagraph') }}</span>
                </button>
            </section>
        </section>

    </main>
</template>