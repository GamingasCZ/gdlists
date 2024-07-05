<script setup lang="ts">
import { inject, ref, watch } from "vue";
import TabBar from "../ui/TabBar.vue";
import axios from "axios";
import ListPreview from "./ListPreview.vue";
import type { ListFetchResponse } from "@/interfaces";
import ReviewPreview from "./ReviewPreview.vue";
import FavoritePreview from "./FavoritePreview.vue";
import ListBrowser from "./ListBrowser.vue";

const props = defineProps<{
    data: any[]
}>()

const emit = defineEmits(["closePopup"]);

const query = ref("")
const state = ref(0) // -3 - Loading, -2 - Error, -1 - No results, 0 - Nothing, 1 - Has lists
const tab = ref(0)

const switchTab = (newTab: number) => {
    tab.value = newTab
    state.value = 0
    query.value = ""
}

const contentType = ref(0)

const dialogs = inject("openedDialogs")
const pickList = () => {
    console.log("aaa")
    props.data[dialogs.lists[1]].settings.level = null
    switchTab(2)
    // emit('closePopup')
}

</script>

<template>
    <div class="flex gap-2 items-center mx-2">
        <input autofocus type="text" v-model="query" :placeholder="$t('other.search')" class="px-2 py-1 my-3 bg-white bg-opacity-10 rounded-md grow">
        <select v-model="contentType">
            <option :value="0">{{ $t('other.all') }}</option>
            <option :value="1">{{ $t('other.mine') }}</option>
            <option :value="2">{{ $t('other.private') }}</option>
        </select>

    </div>

    <TabBar @switched-tab="switchTab" :tab-names="[$t('help.Lists'), $t('reviews.review'), $t('editor.levels')]" />

    <div
        class="bg-[url(@/images/fade.webp)] bg-repeat-x h-[40rem] relative p-2 pt-0 overflow-y-auto flex flex-col gap-2">
        <div v-if="false"
            class="absolute top-1/2 left-1/2 w-full text-center opacity-40 -translate-x-1/2 -translate-y-1/2">
            <div v-if="state == 0" class="flex flex-col gap-3 items-center">
                <img src="@/images/searchOpaque.svg" alt="" class="w-48">
                <h2 class="text-2xl">{{ $t('other.typeToFindList') }}</h2>
            </div>
            <div v-else-if="state == -3" class="flex flex-col gap-3 items-center">
                <img src="@/images/loading.webp" alt="" class="w-48 animate-spin">
                <h2 class="text-2xl">{{ $t('other.loading') }}...</h2>
            </div>
            <div v-else-if="state == -1" class="flex flex-col gap-3 items-center">
                <img src="@/images/searchOpaque.svg" alt="" class="w-48">
                <h2 class="text-2xl">{{ $t('other.noListsFound') }}</h2>
            </div>
            <div v-else-if="state == -2" class="flex flex-col gap-3 items-center">
                <img src="@/images/close.svg" alt="" class="w-48">
                <h2 class="text-2xl">{{ $t('other.listFindError') }}</h2>
            </div>
        </div>
        
        <div v-else-if="true">
            <ListBrowser
                online-browser
                :component="[ListPreview, ReviewPreview, FavoritePreview][tab]"
                :search="query"
                :online-type="['', 'user', 'hidden'][contentType]"
                :online-subtype="['lists', 'reviews', 'levels'][tab]"
                hide-search hide-tabs is-logged-in picking
                @switch-browser="contentType = $event"
                @selected-post-option="pickList()"
            />
        </div>
    </div>
</template>
