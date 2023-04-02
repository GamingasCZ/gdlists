<script setup lang="ts">
import type { CollabData, FavoritedLevel, LevelTag } from '@/interfaces'
import chroma from 'chroma-js';
import { onMounted, ref } from 'vue';
import CollabPreview from "../levelViewer/CollabPreview.vue";

const props = defineProps<{
  levelName: string
  creator: string | CollabData
  levelID: string | null
  video: string | null
  difficulty: [number, number]
  color: [number, number, number]
  tags: LevelTag[]
  favorited: boolean | undefined
}>()


const isFavorited = ref<boolean>(props.favorited)
const copyID = () => {
    navigator.clipboard.writeText(props.levelID!)
}
const doFavoriteLevel = () => {
    let faves: FavoritedLevel[] = JSON.parse(localStorage.getItem("favorites")!)
    let favesIDs: string[] = JSON.parse(localStorage.getItem("favoriteIDs")!)

    if (isFavorited.value) {
        let levelIndex = favesIDs.indexOf(props.levelID!)
        favesIDs.splice(levelIndex, 1)
        faves.splice(levelIndex, 1)
    }
    else {
        favesIDs.push(props.levelID!)
    
        let isCollab = typeof props.creator == 'object'
    
        // TODO: add proper list name (list name may not always be sex)
        faves.push({
            levelName: props.levelName,
            creator: isCollab ? props.creator[0][0] : props.creator,
            levelColor: chroma(props.color!).hex(),
            levelID: props.levelID!,
            listID: "1",
            listName: "sex",
            listPosition: 1,
            timeAdded: 1
        })
    }

    localStorage.setItem("favorites", JSON.stringify(faves))
    localStorage.setItem("favesIDs", JSON.stringify(favesIDs))
    isFavorited.value = !isFavorited.value
}

</script>

<template>
    <section class="max-w-[95vw] w-[70rem] mx-auto relative px-2 py-3 text-white rounded-lg backdrop-blur-sm" :style="{background: chroma(color).css()}">
        <div class="relative w-8">
            <img class="absolute left-1/2 z-10 w-4/5 t-1/2" :src="`/src/images/faces/${difficulty[0]}.webp`" alt="">
            <img class="absolute top-1/2 left-1/2 w-3/5" :src="`/src/images/${['', 'star', 'faces/featured','faces/epic'][difficulty[1]]}.webp`" alt="">
        </div>
        <h2 class="text-3xl font-black">{{ levelName }}</h2>
        <h3 v-if="typeof creator == 'string'">{{ creator }}</h3>
        <button class="button" v-if="video"><a :href="`https://youtu.be/${video}`"><img src="@/images/modYT.svg" alt=""></a></button>
        <button class="button" v-if="levelID?.match(/\d+/)"><a :href="`https://gdbrowser.com/${levelID}`"><img src="@/images/modGDB.svg" alt=""></a></button>
        <button class="button" v-if="levelID?.match(/\d+/)"><img src="@/images/modID.svg" alt=""></button>
        <button class="absolute top-0 right-0 button" @click="doFavoriteLevel" :class="{disabled: isFavorited}" v-if="favorited != undefined && levelID"><img src="@/images/star.webp" class="w-8" alt=""></button>
        <CollabPreview v-if="typeof creator == 'object'" :collab="creator" />
    </section>
</template>