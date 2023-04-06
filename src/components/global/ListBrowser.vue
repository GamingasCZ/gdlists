<script setup lang="ts">
import type { ListPreview } from '@/interfaces';
import ListPrevElement from '@/components/global/ListPreview.vue'
import axios, { type AxiosResponse } from 'axios';
import { ref, onMounted } from 'vue';
import FavoritePreview from './FavoritePreview.vue';

const props = defineProps({
    browserName: String,
    search: String,
    onlineBrowser: {type: Boolean, required: true}
})

const scrollingStart = (i: number) => i+2
const scrollingBetween = (i: number) => i+PAGE.value-1
const scrollingEnd = (i: number) => maxPages.value-(5-i)
const listScroll = () => Array.from({length: Math.min(5, maxPages.value-1)}, (_,i) => (PAGE.value >= 3 && maxPages.value > 4 ? (PAGE.value < maxPages.value-4 ? scrollingBetween(i) : scrollingEnd(i)) : scrollingStart(i)))

const loadFailed = ref<boolean>(false)
const searchNoResults = ref<boolean>(false)

const LISTS_ON_PAGE = 8
const PAGE = ref<number>(0)
const maxPages = ref<number>(1)
const pagesArray = ref<number[]>(listScroll())
const LISTS = ref<ListPreview[]>()
const SEARCH_QUERY = ref<string>(props.search ?? "")

function switchPage(setPage: number) {
    if (setPage < 0 || setPage >= maxPages.value) return
    PAGE.value = setPage
    
    pagesArray.value = listScroll()
    refreshBrowser()
}

function doSearch() {
    searchNoResults.value = false
    refreshBrowser()
}

function refreshBrowser() {
    // document.querySelectorAll(".listPreviews").forEach((previews: Element) => previews.remove())

    axios.get(`http://localhost:8000/php/getLists.php?startID=999999&searchQuery=${SEARCH_QUERY.value}&page=${PAGE.value}&path=%2Fphp%2FgetLists.php&fetchAmount=${LISTS_ON_PAGE}&sort=0`)    
    .then((res: AxiosResponse) => {
        if (res.status != 200) {loadFailed.value = true; return}
        if (res.data == 3) {searchNoResults.value = true; LISTS.value = []; maxPages.value = 0;return}
        
        maxPages.value = res.data[2].maxPage
        pagesArray.value = listScroll()
        LISTS.value = res.data[0]
})
    .catch(() => loadFailed.value = true)
}

onMounted(() => {
    if (props.onlineBrowser) refreshBrowser()
    else { // Hardcoded for now, maybe change later
        LISTS.value = JSON.parse(localStorage.getItem('favorites')!)
        maxPages.value = Math.ceil(LISTS.value?.length!/LISTS_ON_PAGE)
        pagesArray.value = listScroll()
    }
})

</script>

<template>
    <section class="text-white translate-y-16 w-[80rem] mx-auto max-w-[95vw]">
        <h2 class="text-3xl text-center">{{ browserName }}</h2>
        
        <main class="mt-3">
            <header class="flex gap-3 justify-center" v-show="false">
                <button class="button bg-greenGradient rounded-full border-[0.1rem] px-4 py-0.5 border-green-800 border-solid">Nejnovější</button>
                <button class="button rounded-full border-[0.1rem] px-4 py-0.5 border-green-800 border-solid">Moje</button>
                <button class="button rounded-full border-[0.1rem] border-green-800 border-solid box-border"><img class="p-1 w-7" src="@/images/hidden.svg" alt=""></button>
            </header>
            <header class="flex gap-3 justify-between max-sm:flex-col max-sm:items-center">
                <form action="" class="flex gap-2 items-center" @submit.prevent="doSearch">
                    <input v-model="SEARCH_QUERY" type="text" max="30" class="px-3 w-64 h-11 text-xl bg-white bg-opacity-10 rounded-full" placeholder="Hledat...">
                    <button type="submit" class="box-border rounded-full bg-greenGradient"><img src="@/images/searchOpaque.svg" alt="" class="p-2 w-11"></button>
                </form>
                <div class="flex gap-2 items-center" v-if="maxPages > 1">
                    <button class="mr-2 button" @click="switchPage(PAGE-1)"><img src="@/images/showCommsL.svg" class="w-4" alt=""></button>
                    <button class="w-8 bg-white bg-opacity-5 rounded-md button" :class="{'bg-greenGradient': PAGE == 0}" @click="switchPage(0)">1</button>
                    <hr v-if="PAGE > 3" class="w-1 h-4 rounded-full border-none bg-greenGradient">
                    <button class="w-8 bg-white bg-opacity-5 rounded-md button" :class="{'bg-greenGradient': index-1 == PAGE}" @click="switchPage(index-1)" v-for="index in pagesArray">{{ index }}</button>
                    <hr v-if="PAGE < maxPages-4" class="w-1 h-4 rounded-full border-none bg-greenGradient">
                    <button v-if="maxPages > 4" class="w-8 bg-white bg-opacity-5 rounded-md button" :class="{'bg-greenGradient': PAGE == maxPages-1}" @click="switchPage(maxPages-1)">{{ maxPages }}</button>
                    <button class="ml-2 button" @click="switchPage(PAGE+1)"><img src="@/images/showComms.svg" class="w-4" alt=""></button>
                </div>
            </header>
            <main class="flex flex-col gap-3 items-center mt-6">
                <div v-if="searchNoResults" class="flex flex-col gap-3 justify-center items-center">
                    <img src="@/images/searchOpaque.svg" alt="" class="w-48 opacity-25">
                    <p class="text-xl opacity-90">Žádné výsledky!</p>
                </div>
                <div v-if="loadFailed" class="flex flex-col gap-3 justify-center items-center">
                    <img src="@/images/listError.svg" alt="" class="w-48 opacity-25">
                    <p class="text-xl opacity-90">Nepodařilo se načíst obsah!</p>
                    <button class="flex gap-3 items-center px-2 rounded-md bg-greenGradient button">
                        <img src="@/images/replay.svg" class="w-10 text-2xl" alt="">Načíst znova
                    </button>
                </div>
                <component :is="onlineBrowser ? ListPrevElement : FavoritePreview" class="min-w-full listPreviews" v-for="list in LISTS" v-bind="list"></component>
            </main>
        </main>
    </section>

</template>