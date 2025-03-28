<script setup lang="ts">
import type { ReviewDraft, ReviewList } from "@/interfaces";
import { DraftAction } from "@/interfaces";
import { computed, nextTick, onMounted, ref } from "vue";
import DraftCard from "./DraftCard.vue";
import type { Writer } from "@/writers/Writer";

const props = defineProps<{
    inUseID: number
    drafts: {[draft: string]: ReviewDraft}
    writer: Writer
}>()

const emit = defineEmits<{
    (e: "save", duplicate: boolean): void
    (e: "preview", data: ReviewList, id_saved: string): void
    (e: "load", draft: ReviewDraft): void
    (e: "remove", id: number): void
    (e: "close"): void
}>()

const editName = (newName: string, key: string) => {
    props.drafts[key].name = newName
    editingName.value = -1
    localStorage.setItem(props.writer.drafts.storageKey, JSON.stringify(props.drafts))
}

const optionsOpen = ref(-1)
const editingName = ref(-1)
const query = ref("")

const filteredDrafts = computed(() => {
    let filtered: {[key: string]: ReviewDraft}
    if (query.value.length) {
        let filtered = {}
        for (const [key, draft] of Object.entries(props.drafts)) {
            if (draft.name.toLowerCase().includes(query.value.toLowerCase())) filtered[key] = draft
        }
    }
    else filtered = props.drafts

    return Object.keys(filtered).reverse()
})

const doAction = (action: DraftAction, key: string, draft: ReviewDraft) => {
    switch (action) {
        case DraftAction.Save:
            emit("save", false)
            break;
        case DraftAction.Clone:
            emit("save", true)
            break;
        case DraftAction.Disjoin:
            // TODO
            break;
        case DraftAction.Remove:
            emit("remove", key)
            break;
        case DraftAction.Preview:
            emit("preview", draft.reviewData, key)
            break;
        case DraftAction.Load:
            emit("load", draft)
            emit("close", draft)
            break;
    }
}

onMounted(() => {
    let firstCard = document.querySelector(".draftCard")
    if (firstCard && !props.inUseID)
        nextTick(() => firstCard.focus())
})

</script>

<template>
    <header class="flex gap-2 items-center px-2 my-2 mt-1">
        <input type="text" v-model="query" :placeholder="$t('other.search')" class="px-2 py-1.5 bg-black bg-opacity-40 rounded-md p grow">

        <button v-if="!inUseID" @click="doAction(DraftAction.Save)" class="flex gap-3 justify-center items-center px-2 py-1.5 w-max font-bold bg-black bg-opacity-40 rounded-md button">
            <img src="@/images/symbolicSave.svg" class="w-6" alt="">
            <span>{{ $t('other.save') }}</span>
        </button>
        <!-- <button v-if="!inUseID" @click="doAction(DraftAction.Save)" class="flex gap-3 justify-center items-center px-2 py-1.5 w-max font-bold bg-black bg-opacity-40 rounded-md button">
            <img src="@/images/more.svg" class="w-6" alt="">
        </button> -->
    </header>
    <div
    class="bg-[url(@/images/fade.svg)] bg-repeat-x h-[45rem] relative p-2 overflow-y-auto flex flex-col gap-2 overflow-x-clip" @click="editingName = -1">
        <!-- Help -->
        <div v-if="!Object.keys(drafts).length" class="flex absolute top-1/2 left-1/2 flex-col gap-3 items-center w-3/4 text-center opacity-20 -translate-x-1/2 -translate-y-1/2">
            <img src="@/images/edit.svg" alt="" class="w-48">
            <h2 class="text-2xl">{{ $t('reviews.draftHelp1') }}</h2>
            <p class="">{{ $t('reviews.draftHelp2') }}</p>
        </div>

        <div v-else-if="!Object.keys(filteredDrafts).length && query.length" class="flex absolute top-1/2 left-1/2 flex-col gap-3 items-center w-3/4 text-center opacity-20 -translate-x-1/2 -translate-y-1/2">
            <img src="@/images/searchOpaque.svg" alt="" class="w-48">
            <h2 class="text-2xl">{{ $t('editor.nothingFound') }}</h2>
        </div>
        <DraftCard
            v-if="inUseID"
            @editedName="editName($event, inUseID)"
            @startNameEdit="editingName = inUseID"
            @action="doAction($event, key, drafts[inUseID])"
            :is-open="true"
            :in-use="true"
            :draft="drafts[inUseID]"
            :editing-name="editingName == inUseID"
            :key="inUseID"
            :counter-key="writer.drafts.counterLangKey"
        />

        <!-- Show drafts sorted by newest -->
        <div class="flex flex-col gap-2">
            <DraftCard
                v-for="(draft, index) in filteredDrafts"
                @editedName="editName($event, draft)"
                @startNameEdit="editingName = draft"
                @open="optionsOpen = index"
                @action="doAction($event, draft, drafts[filteredDrafts[index]])"
                :is-open="optionsOpen == index"
                :in-use="false"
                :hide="inUseID == draft"
                :editing-name="editingName == draft"
                :draft="drafts[filteredDrafts[index]]"
                :key="drafts[filteredDrafts[index]].createDate"
                :counter-key="writer.drafts.counterLangKey"
            />
        </div>
    </div>
</template>
