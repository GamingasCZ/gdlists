<script setup lang="ts">
const emit = defineEmits(["closePopup"]);
import { makeColor } from "@/Editor";
import LevelCard from "../editor/EditorCard.vue";
import { inject, ref } from "vue";
import EditorCardHeader from "../editor/EditorCardHeader.vue";
import { reviewData } from "@/Reviews";

const addLevel = () => {
    reviewData.value.levels.push({
        "levelName": "",
        "creator": "",
        "color": makeColor(),
        "difficulty": [0, 0],
        "levelID": "",
        "platf": false,
        "tags": [],
        "video": ""
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

/*
        @do-move="startMove"
        @update-opened-card="updateOpenedCard"
        @move-controls="enableMoveControls"
        @throw-error="throwError($event, false)"
*/

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

</script>

<template>
    <div
        class="bg-[url(@/images/fade.webp)] bg-repeat-x h-[40rem] relative p-2 overflow-y-auto flex flex-col gap-2">
        <div v-if="!reviewData.levels.length"
            class="flex absolute top-1/2 left-1/2 flex-col items-center w-full text-center opacity-40 -translate-x-1/2 -translate-y-1/2">
            <img src="@/images/collabDudes.svg" alt="" class="w-64">
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

