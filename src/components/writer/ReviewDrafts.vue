<script setup lang="ts">
import type { ReviewDraft, ReviewList } from "@/interfaces";
import { DraftAction } from "@/interfaces";
import { computed, ref } from "vue";
import DraftCard from "./DraftCard.vue";
import { reviewData } from "@/Reviews";
import type { Writer } from "@/writers/Writer";

const props = defineProps<{
    inUseID: number
    drafts: {[draft: string]: ReviewDraft}
    writer: Writer
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
    editingName.value = -1
    localStorage.setItem(props.writer.drafts.storageKey, JSON.stringify(props.drafts))
}

const optionsOpen = ref(-1)
const editingName = ref(-1)
const query = ref("")

const filteredDrafts = computed(() => {
    let filtered = {}
    for (const [key, draft] of Object.entries(props.drafts)) {
        if (draft.name.toLowerCase().includes(query.value.toLowerCase())) filtered[key] = draft
    }
    return filtered
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
            emit("preview", draft.reviewData)
            break;
        case DraftAction.Load:
            emit("load", {data: draft.reviewData, id: draft.createDate, saved: draft.saveDate})
            break;
    }
}

const openSearch = () => {
    searchBoxShown.value = true
}

defineExpose({
    openSearch
})

</script>

<template>    
    <div
    class="bg-[url(@/images/fade.webp)] bg-repeat-x h-[45rem] relative p-2 overflow-y-auto flex flex-col gap-2 overflow-x-clip" @click="editingName = -1">
        
        <!-- Search box -->
        <div v-if="searchBoxShown" class="flex items-center pb-1">
            <button class="bg-black bg-opacity-40 rounded-md" @click="searchBoxShown = false; query = ''">
                <img src="@/images/moveUp.svg" class="p-2 w-8 -rotate-90" alt="">
            </button>
            <input type="text" @mouseover="$event.target.focus()" v-model="query" :placeholder="$t('other.search')" class="px-2 py-1 ml-1 bg-black bg-opacity-40 rounded-md grow">
        </div>

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

        <button v-if="!inUseID && reviewData.containers.length" @click="doAction(DraftAction.Save)" class="flex gap-3 justify-center items-center py-2 w-full text-xl font-bold bg-black bg-opacity-40 rounded-md button">
            <img src="@/images/symbolicSave.svg" class="w-6" alt="">
            <span>{{ $t('other.save') }}</span>
        </button>

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
        />

        <!-- Show drafts sorted by newest -->
        <div class="flex flex-col-reverse gap-2">
            <DraftCard
                v-for="(draft, key, index) in filteredDrafts"
                @editedName="editName($event, key)"
                @startNameEdit="editingName = key"
                @open="optionsOpen = index"
                @action="doAction($event, key, draft)"
                :is-open="optionsOpen == index"
                :in-use="false"
                :hide="inUseID == key"
                :editing-name="editingName == key"
                :draft="draft"
                :key="draft.createDate"
            />
        </div>
    </div>
</template>
