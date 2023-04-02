<script setup lang="ts">
import axios, { type AxiosResponse } from 'axios';
import type { ListFetchResponse, FavoritedLevel } from '@/interfaces'
import LevelCard from './global/LevelCard.vue';
import { ref } from 'vue';
import { modifyListBG } from '@/Editor';
import chroma from 'chroma-js';


const props = defineProps({
    listID: String
})

const favoritedIDs = ref<string[] | null>()
if (localStorage != undefined) {
    favoritedIDs.value = JSON.parse(localStorage.getItem("favoriteIDs")!)
}

const LIST_DATA = ref<ListFetchResponse>()
axios.get("http://localhost:8000/php/getLists.php?id="+props.listID).then((res: AxiosResponse) => {
    LIST_DATA.value = res.data[0]
    if (!LIST_DATA.value?.data.levels) {
        LIST_DATA.value!.data.levels = []
        Object.keys(LIST_DATA.value?.data!).filter((x: string) => x.match(/\d+/g)).forEach((level: string) => {
            LIST_DATA.value?.data.levels.push(LIST_DATA.value.data[level])
        })
    }

    let listColors: number[] | string = LIST_DATA.value?.data.pageBGcolor! // TODO: old lists have hex values
    modifyListBG(typeof listColors == 'string' ? chroma(listColors).hsl() : listColors)

    let listBG = LIST_DATA.value?.data?.titleImg!
    document.querySelector("#listBG").style.backgroundImage = `url('${typeof listBG == 'string' ? listBG : listBG[0] ?? ""}')`
})

const positionListBackground = () => ['left', 'center', 'right'][LIST_DATA.value?.data?.titleImg[3]! ?? 1]

</script>

<template>
    <div id="listBG" class="absolute top-0 left-0 w-full h-full bg-cover" :style="{backgroundPositionX: positionListBackground()}"></div>
    <section class="text-white translate-y-10">
        <header>
            <div class=""></div>
            <h1>{{ LIST_DATA?.name }}</h1>
        </header>
        <main class="flex flex-col gap-3">
            <LevelCard v-for="(level, index) in LIST_DATA?.data.levels" v-bind="level" :favorited="favoritedIDs?.includes(level.levelID!)"/>
        </main>
    </section>
</template>