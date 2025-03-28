<script setup lang="ts">
const emit = defineEmits(["closePopup"]);
import { ref } from "vue";
import type { CollabHumans } from "@/interfaces";
import MobileCollabCreator from "../global/MobileCollabCreator.vue";

const props = defineProps<{
    userArray: CollabHumans[]
}>()

const addUser = () => {
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
    addUser
})

</script>

<template>
    <div class="bg-[url(@/images/fade.svg)] bg-repeat-x h-[40rem] relative p-2 overflow-y-auto flex flex-col gap-2">
        <div
            class="flex absolute top-1/2 left-1/2 flex-col items-center w-full text-center -translate-x-1/2 -translate-y-1/2">
            <img src="@/images/collabDudes.svg" alt="" class="w-64 opacity-40">
            <h2 class="text-2xl opacity-40">{{ $t('reviews.noUsersYet') }}</h2>
            <p class="opacity-40">Začni sem přidávat lidi!</p>
            <button class="flex items-center p-1 mx-auto mt-6 bg-black bg-opacity-40 rounded-md button">
              <img src="@/images/savedMobHeader.svg" class="mr-4 w-8" alt="">
              <span class="mr-1">Načíst z collabu</span>
            </button>
        </div>

        <MobileCollabCreator v-for="person in userArray" />
    </div>
</template>

