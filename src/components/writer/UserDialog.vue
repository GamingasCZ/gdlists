<script setup lang="ts">
const emit = defineEmits(["closePopup"]);
import { ref } from "vue";
import { reviewData } from "@/Reviews";
import type { CollabHumans } from "@/interfaces";
import MobileCollabCreator from "../global/MobileCollabCreator.vue";

const props = defineProps<{
    userArray: CollabHumans[]
}>()

const addLevel = () => {
    props.userArray.push({
        name: "",
        role: "",
        socials: [],
        verified: 0
    })
    openedCard.value = props.userArray.length - 1
}

const openedCard = ref(0)
const updatingPosition = ref(-1)

defineExpose({
    openedCard,
    addLevel
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

</script>

<template>
    <div class="bg-[url(@/images/fade.webp)] bg-repeat-x h-[40rem] relative p-2 overflow-y-auto flex flex-col gap-2">
        <div v-if="!reviewData.levels.length"
            class="flex absolute top-1/2 left-1/2 flex-col items-center w-full text-center -translate-x-1/2 -translate-y-1/2">
            <img src="@/images/collabDudes.svg" alt="" class="w-64 opacity-40">
            <h2 class="text-2xl opacity-40">{{ $t('reviews.noUsersYet') }}</h2>
            <button class="flex items-center p-1 mx-auto mt-2 bg-black bg-opacity-40 rounded-md button">
              <img src="@/images/savedMobHeader.svg" class="mr-4 w-8" alt="">
              <span class="mr-1">Načíst z collabu</span>
            </button>
        </div>
        
        <!-- <div v-for="(level, index) in userArray">
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
        </div> -->

        <!-- <MobileCollabCreator  /> -->
    </div>
</template>

