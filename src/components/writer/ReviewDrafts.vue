<script setup lang="ts">
import { prettyDate } from "@/Editor";
import { reviewData } from "@/Reviews";
import type { ReviewDraft, ReviewList } from "@/interfaces";
import { i18n } from "@/locales";
import { computed, inject, ref } from "vue";

const props = defineProps<{
    inUseID: number
    drafts: object
}>()

const emit = defineEmits<{
    (e: "save", duplicate: boolean): void
    (e: "preview", data: ReviewList): void
    (e: "load", data: {data: ReviewList, id: number, saved: number}): void
    (e: "remove", id: number): void
}>()

const searchBoxShown = ref(false)

const editName = (newName: string, key: string) => {
    props.drafts[key].name = newName
    localStorage.setItem("reviewDrafts", JSON.stringify(props.drafts))
}

const optionsOpen = ref(-1)
const editingName = ref(-1)
const justSaved = ref(false)
const query = ref("")

const filteredDrafts = computed(() => {
    let filtered = {}
    for (const [key, draft] of Object.entries(props.drafts)) {
        if (draft.name.toLowerCase().includes(query.value.toLowerCase())) filtered[key] = draft
    }
    return filtered
})

</script>

<template>
    <div v-if="searchBoxShown" class="flex items-center px-1 my-1">
        <button class="bg-black bg-opacity-40 rounded-md" @click="searchBoxShown = false; query = ''">
            <img src="@/images/moveUp.svg" class="p-2 w-8 -rotate-90" alt="">
        </button>
        <input type="text" @mouseover="$event.target.focus()" v-model="query" :placeholder="$t('other.search')" class="px-2 py-1 ml-1 bg-black bg-opacity-40 rounded-md grow">
    </div>
    <div v-else class="grid grid-cols-3 gap-1 p-1">
        <button @click="emit('save', false); justSaved = true" :disabled="justSaved || !reviewData.containers.length" class="flex gap-2 p-1 pl-2 bg-black bg-opacity-40 rounded-md disabled:opacity-20"><img src="@/images/symbolicSave.svg" class="w-4" alt="">{{ justSaved ? $t('reviews.justSaved') : $t('other.save') }}</button>
        <button @click="emit('save', true)" :disabled="inUseID == 0" class="flex gap-2 p-1 pl-2 bg-black bg-opacity-40 rounded-md disabled:opacity-20"><img src="@/images/copy.svg" class="w-4" alt="">{{ $t('other.duplicate') }}</button>
        <button @click="searchBoxShown = true" class="flex gap-2 p-1 pl-2 bg-black bg-opacity-40 rounded-md"><img src="@/images/searchOpaque.svg" class="w-4" alt="">{{ $t('other.search') }}</button>
    </div>

    <div
        class="bg-[url(@/images/fade.webp)] bg-repeat-x h-[40rem] relative p-1 overflow-y-auto flex flex-col gap-1 overflow-x-clip" @click="editingName = -1">

        <!-- Help -->
        <div v-if="!Object.keys(drafts).length" class="flex absolute top-1/2 left-1/2 flex-col gap-3 items-center w-3/4 text-center opacity-20 -translate-x-1/2 -translate-y-1/2">
            <img src="@/images/reviews.svg" alt="" class="w-48">
            <h2 class="text-2xl">{{ $t('reviews.draftHelp1') }}</h2>
            <p class="">{{ $t('reviews.draftHelp2') }}</p>
        </div>

        <div v-else-if="!Object.keys(filteredDrafts).length && query.length" class="flex absolute top-1/2 left-1/2 flex-col gap-3 items-center w-3/4 text-center opacity-20 -translate-x-1/2 -translate-y-1/2">
            <img src="@/images/searchOpaque.svg" alt="" class="w-48">
            <h2 class="text-2xl">{{ $t('editor.nothingFound') }}</h2>
        </div>

        <div v-for="(draft, key) in filteredDrafts" @click="optionsOpen = optionsOpen == -1 || optionsOpen != key ? key : -1; editingName = -1" class="w-full bg-black bg-opacity-40 rounded-md transition-transform" :class="{'hover:translate-x-1 active:translate-x-2': optionsOpen != key, 'border-l-4 border-lof-400 ': inUseID == key}">
            <div class="flex flex-col justify-between p-2">
                <div class="flex flex-col">
                    <h2 v-if="editingName != key" @click.stop="editingName = key" class="flex gap-2 items-center w-max text-xl leading-tight group">{{ draft.name }} <img src="@/images/edit.svg" class="w-2 opacity-0 transition-opacity group-hover:opacity-100"></h2>
                    <input v-else type="text" maxlength="40" :value="draft.name" @click.stop="" @change="editName($event.target.value, key)" class="px-2 bg-transparent bg-white bg-opacity-0 border-b-2 focus-within:outline-none focus-within:bg-opacity-10" autocomplete="off" @mouseover="$event.target.focus()" :placeholder="$t('reviews.reviewName')">

                    <ul class="flex gap-2 list-disc list-inside">
                        <li class="text-sm text-white text-opacity-40">{{ $t('reviews.saved') }}: {{ prettyDate((Date.now() - draft.saveDate)/1000) }}</li>
                        <li class="text-sm text-white text-opacity-40">{{ $t('reviews.created') }}: {{ prettyDate((Date.now() - draft.createDate)/1000) }}</li>
                        <li class="text-sm text-white text-opacity-40">{{ $t('other.words', draft.wordCount) }}</li>
                    </ul>
                </div>
                <hr class="my-2 opacity-20 rounded-">
                <div>
                    <h2 v-if="!draft.previewTitle && !draft.previewParagraph" class="opacity-20">{{ $t('reviews.draftNoPrev') }}</h2>
                    <h2>{{ draft.previewTitle }}</h2>
                    <p class="text-xs text-transparent bg-clip-text bg-gradient-to-b from-white to-transparent">{{ draft.previewParagraph }}</p>
                </div>
                <div v-if="optionsOpen == key" class="grid grid-cols-3 gap-2 p-1">
                    <button @click.stop="emit('remove', key)" class="flex gap-2 p-1 bg-black bg-opacity-40 rounded-md"><img class="w-6" src="@/images/trash.svg">{{ $t('editor.remove') }}</button>
                    <button @click.stop="emit('preview', draft.reviewData)" class="flex gap-2 p-1 bg-black bg-opacity-40 rounded-md"><img class="w-6" src="@/images/filePreview.svg">{{ $t('other.preview') }}</button>
                    <button :disabled="inUseID == key" @click.stop="emit('load', {data: draft.reviewData, id: draft.createDate, saved: draft.saveDate})" class="flex gap-2 p-1 bg-black bg-opacity-40 rounded-md disabled:opacity-20"><img class="w-6" src="@/images/checkThick.svg">{{ inUseID == key ? $t('other.inUse') : $t('other.use') }}</button>
                </div>
            </div>
        </div>
    </div>
</template>
