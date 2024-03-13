<script setup lang="ts">
import { inject, ref, watch } from "vue";
import TabBar from "../ui/TabBar.vue";
import axios from "axios";
import ListPreview from "./ListPreview.vue";
import type { ListFetchResponse } from "@/interfaces";

const props = defineProps<{
    data: any[]
}>()

const emit = defineEmits(["closePopup"]);

const lists = ref<Level[]>([])
const users = ref([])
const query = ref("")
const state = ref(0) // -3 - Loading, -2 - Error, -1 - No results, 0 - Nothing, 1 - Has lists
const tab = ref(0)

watch(query, () => {
    if (query.value.length < 2) {
        lists.value = []
        state.value = 0
    }
    else 
        getLists()
})

const switchTab = (newTab: number) => {
    tab.value = newTab
    state.value = 0
    query.value = ""
    getLists()
}

var typeTimeout = 0
const getLists = () => {
    if (typeTimeout > 0) clearTimeout(typeTimeout)
    if (query.value.length < 2 && tab.value == 0) return
    
    typeTimeout = setTimeout(() => {
        state.value = -3
        let params = {fetchAmount: 10, sort: 0, startID: 999999, page: 0, searchQuery: query.value}
        if (tab.value == 1) params.user = true
        
        axios.get(import.meta.env.VITE_API + "/getLists.php", {params: params}).then(res => {
            if (res.data == 3) state.value = -1
            else {
                state.value = 1
                lists.value = res.data[0]
                users.value = res.data[1]
            }
        }).catch(() => {
            state.value = -2
            lists.value = []
        })
        typeTimeout = 0
    }, 250);
}

const dialogs = inject("openedDialogs")
const pickList = (listData: ListFetchResponse, creator: string) => {
    listData.creator = creator
    props.data[dialogs.lists[1]].settings.level = listData
    emit('closePopup')
}

</script>

<template>
    <section @click.stop=""
        class="absolute top-1/2 left-1/2 flex max-h-[95vh] w-[35rem] max-w-[95vw] -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg bg-greenGradient text-white shadow-lg shadow-black">
        <div class="relative m-2">
            <h1 class="text-xl font-bold text-center">{{ $t('help.Lists') }}</h1>
            <img src="@/images/close.svg" alt="" class="absolute top-0 right-0 w-6 button"
                @click="emit('closePopup')" />
        </div>

        <input autofocus type="text" v-model="query" :placeholder="$t('other.search')" class="px-2 py-1 mx-2 my-3 bg-white bg-opacity-10 rounded-md">

        <TabBar @switched-tab="switchTab" :tab-names="[$t('other.all'), $t('other.myLists')]" />

        <div
            class="bg-[url(@/images/fade.webp)] bg-repeat-x h-[40rem] relative p-2 overflow-y-auto flex flex-col gap-2">
            <div v-if="state != 1"
                class="absolute top-1/2 left-1/2 w-full text-center opacity-40 -translate-x-1/2 -translate-y-1/2">
                <div v-if="state == 0" class="flex flex-col gap-3 items-center">
                    <img src="@/images/searchOpaque.svg" alt="" class="w-48">
                    <h2 class="text-2xl">Začni psát pro hledání seznamů.</h2>
                </div>
                <div v-else-if="state == -3" class="flex flex-col gap-3 items-center">
                    <img src="@/images/loading.webp" alt="" class="w-48 animate-spin">
                    <h2 class="text-2xl">{{ $t('other.loading') }}...</h2>
                </div>
                <div v-else-if="state == -1" class="flex flex-col gap-3 items-center">
                    <img src="@/images/searchOpaque.svg" alt="" class="w-48">
                    <h2 class="text-2xl">Nenašly se žádné seznamy!</h2>
                </div>
                <div v-else-if="state == -2" class="flex flex-col gap-3 items-center">
                    <img src="@/images/close.svg" alt="" class="w-48">
                    <h2 class="text-2xl">Nastala chyba při hledání!</h2>
                </div>
            </div>
            
            <div v-else class="flex flex-col gap-2 w-full">
                <ListPreview
                    v-for="list in lists"
                    v-bind="list"
                    @selected-link="pickList(list, $event)"
                    class="w-full"
                    :user-array="users"
                    :disable-link="true"
                />
            </div>
        </div>
    </section>
</template>
