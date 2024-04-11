<script setup lang="ts">
const emit = defineEmits(["closePopup"]);
import { levelList, makeColor } from "@/Editor";
import LevelCard from "../editor/EditorCard.vue";
import { computed, inject, ref } from "vue";
import EditorCardHeader from "../editor/EditorCardHeader.vue";

const addLevel = () => {
    levelList.value.levels.push({
        "levelName": "",
        "creator": "",
        "color": makeColor(),
        "difficulty": [0, 0],
        "levelID": "",
        "platf": false,
        "tags": [],
        "video": ""
    })
    openedCard.value = levelList.value.levels.length - 1
}

const openedCard = ref(0)
const updatingPosition = ref(-1)
const dialogs = inject("openedDialogs")

defineExpose({
    openedCard,
    addLevel
})

</script>

<template>
    <div
        class="bg-[url(@/images/fade.webp)] bg-repeat-x h-[40rem] relative p-2 overflow-y-auto flex flex-col gap-2">
        <div v-if="!levelList.levels.length"
            class="flex absolute top-1/2 left-1/2 flex-col items-center w-full text-center opacity-40 -translate-x-1/2 -translate-y-1/2">
            <img src="@/images/collabDudes.svg" alt="" class="w-64">
            <h2 class="text-2xl">{{ $t('reviews.noLevelsYet') }}</h2>
            <p>{{ $t('reviews.upToTen') }}</p>
        </div>
        
        <div v-for="(level, index) in levelList.levels">
            <EditorCardHeader v-if="openedCard != index" :data="level" :updating-positions="updatingPosition" :index="index" @update-opened-card="openedCard = index" />
            <LevelCard v-else :updating-positions="-1"
                :data="level" :index="index" @open-tag-popup="dialogs.tags = true" @open-collab-tools="dialogs.collabs = true"/>
        </div>
    </div>
</template>
