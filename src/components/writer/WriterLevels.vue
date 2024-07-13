<script setup lang="ts">
const emit = defineEmits(["closePopup"]);
import { makeColor, makeColorFromString } from "@/Editor";
import LevelCard from "../editor/EditorCard.vue";
import { inject, onBeforeUnmount, ref } from "vue";
import EditorCardHeader from "../editor/EditorCardHeader.vue";
import { DEFAULT_RATINGS, reviewData } from "@/Reviews";
import LevelImportPopup from "../editor/LevelImportPopup.vue";
import Dialog from "../global/Dialog.vue";
import type { FavoritedLevel, Level } from "@/interfaces";
import PickerPopup from "../global/PickerPopup.vue";
import LevelBubble from "../global/LevelBubble.vue";
import axios from "axios";

const addLevel = (levelData?: Level | FavoritedLevel) => {
    if (reviewData.value.levels.length >= 10) return
    let diff = levelData?.difficulty?.[0] ? levelData?.difficulty : [levelData?.difficulty, levelData?.rating]

    reviewData.value.levels.push({
        levelName: levelData?.levelName ?? "",
        creator: levelData?.creator ?? "",
        color: levelData?.levelName ? makeColorFromString(levelData.levelName).hsl() : makeColor(),
        difficulty: diff?.[0] ? diff : [0, 0],
        levelID: levelData?.levelID ?? "",
        platf: false,
        tags: [],
        video: "",
        ratings: [Array(DEFAULT_RATINGS.length).fill(-1), []]
    })

    openedCard.value = reviewData.value.levels.length - 1
}

const openedCard = ref(0)
const updatingPosition = ref(-1)
const dialogs = inject("openedDialogs")

defineExpose({
    openedCard,
    addLevel
})

const hashLevels = () => {
    let hashes: number[] = []
    reviewData.value.levels.forEach(level => {
        hashes.push(Math.pow(JSON.stringify(level).split("").map(x => x.charCodeAt(0)).reduce((x,y) => x+y), 2) % 65535)
    })
    return hashes
}

const {levelHashes, updateHashes} = inject("levelHashes")!
onBeforeUnmount(() => {
    updateHashes(hashLevels())
})

const enableMoveControls = (pos: number, nowOpenedIndex: number) => {
  if (pos == -1) {
    // Reset
    updatingPosition.value = -1;
    openedCard.value = nowOpenedIndex;
    return;
  }
  updatingPosition.value = openedCard.value;
  openedCard.value = -1;
};

const moveLevel = (from: number, to: number) => {
    if (to < 0 || to >= reviewData.value.levels.length) return

    let l = reviewData.value.levels[from]
    reviewData.value.levels.splice(from, 1, reviewData.value.levels[to])
    reviewData.value.levels[to] = l

    updatingPosition.value = -1
    openedCard.value = to
}

const levelDialogs = ref({
    import: false,
    saved: false
})

const getSavedLevels = () => {
    let saves: FavoritedLevel[] = JSON.parse(localStorage.getItem("favorites")!) ?? []
    return saves.filter(level => level.levelName.toLowerCase().includes(savedSearch.value.toLowerCase()))
}
const savedSearch = ref("")

const addRandomLevel = () => {
    if (reviewData.value.levels.length >= 10) return
    axios.get(import.meta.env.VITE_API + "/getLists.php?randomLevel").then(res => {
        if (res.data?.[0])
            addLevel(res.data[0])
    })
}

</script>

<template>
    <Dialog :open="levelDialogs.import" @close-popup="levelDialogs.import = false" :title="$t('editor.importLevels')">
        <LevelImportPopup @close-popup="levelDialogs.import = false" @add-level="addLevel($event)" />
    </Dialog>

    <Dialog :open="levelDialogs.saved" @close-popup="levelDialogs.saved = false" :title="$t('editor.importLevels')">
        <PickerPopup v-model="savedSearch">
            <LevelBubble v-for="level in getSavedLevels()" :data="level" @pick="addLevel($event)" />
        </PickerPopup>
    </Dialog>

    <div class="flex gap-2 mx-2 mb-2">
        <button @click="addLevel()" class="flex gap-2 p-1 mr-10 bg-black bg-opacity-60 rounded-md button max-sm:p-2 grow"><img class="w-5" src="@/images/addLevel.svg" alt="">{{ $t('other.add') }}</button>
        <button @click="dialogs.lists[0] = true; dialogs.lists[2] = 1" class="flex gap-2 p-1 bg-black bg-opacity-40 rounded-md button max-sm:p-2"><img class="w-5" src="@/images/searchOpaque.svg" alt=""><span class="max-sm:hidden">{{ $t('other.searchLevels') }}</span></button>
        <button @click="addRandomLevel" class="flex gap-2 p-1 bg-black bg-opacity-40 rounded-md button max-sm:p-2"><img class="w-5" src="@/images/dice.svg" alt=""><span class="max-sm:hidden">{{ $t('other.randomLevel') }}</span></button>
        <button @click="levelDialogs.saved = true" class="flex gap-2 p-1 bg-black bg-opacity-40 rounded-md button max-sm:p-2"><img class="w-5" src="@/images/savedMobHeader.svg" alt=""><span class="max-sm:hidden">{{ $t('navbar.saved') }}</span></button>
        <button @click="levelDialogs.import = true" class="flex gap-2 p-1 bg-black bg-opacity-40 rounded-md button max-sm:p-2"><img class="w-5" src="@/images/filePreview.svg" alt=""><span class="max-sm:hidden">{{ $t('reviews.import') }}</span></button>
    </div>
    <div
        class="bg-[url(@/images/fade.webp)] bg-repeat-x h-[40rem] relative p-2 overflow-y-auto flex flex-col gap-2">
        <div v-if="!reviewData.levels.length"
            class="flex absolute top-1/2 left-1/2 flex-col items-center w-full text-center opacity-40 -translate-x-1/2 -translate-y-1/2">
            <img src="@/images/reviews/help1.svg" alt="" class="w-96">
            <h2 class="text-2xl">{{ $t('reviews.noLevelsYet') }}</h2>
            <p>{{ $t('reviews.upToTen') }}</p>
        </div>
        
        <div v-for="(level, index) in reviewData.levels">
            <EditorCardHeader v-if="openedCard != index" :data="level" :updating-positions="updatingPosition" :index="index" @update-opened-card="openedCard = index" @do-move="moveLevel" />
            <LevelCard v-else
                @open-collab-tools="dialogs.collabs = true"
                @open-tag-popup="dialogs.tags = true"
                @do-move="moveLevel"
                @move-controls="enableMoveControls"
                :updating-positions="updatingPosition"
                :level-array="reviewData"
                :data="level"
                :index="index"
            />
        </div>
    </div>
</template>

