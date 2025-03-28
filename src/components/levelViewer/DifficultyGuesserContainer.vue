<script setup lang="ts">
import { nextTick, ref } from 'vue';
import { diffScaleOffsets, diffTranslateOffsets } from "@/Editor";
import DifficultyIcon from '../global/DifficultyIcon.vue';

const props = defineProps<{
    difficulty: [number, number];
    diffGuessArray: [boolean, boolean, boolean];
}>()

const emit = defineEmits<{
  (e: "guessed", result: number): void;
}>();

async function getFaces() {
    nextTick(() => {
        (document.querySelector(".guessFace") as HTMLButtonElement).focus()
    })
}

getFaces()

const guessingDifficulty = ref(true)
if (!props.diffGuessArray?.[1]) guessingDifficulty.value = false

const selectedFace = ref(0)
const selectedRate = ref(0)
function selectFace(selection: number) {
    selectedFace.value = selection
    if (!props.diffGuessArray[2]) { // Ratings guessing not enabled
        selectedRate.value = props.difficulty[1]
        checkResult()
        return
    }
    if (selection == 0) return checkResult() // N/A levels don't have ratings
    guessingDifficulty.value = false
    focusedFace = 0;
    nextTick(() => {
        (document.querySelector(".guessFace") as HTMLButtonElement).focus()
    })
}

function checkResult() {
    let result: number
    let bothEnabled = props.diffGuessArray[1] && props.diffGuessArray[2]

    if (!props.diffGuessArray[1]) { // Difficulty guessing not enabled
        selectedFace.value = props.difficulty[0]
    }

    if (props.difficulty[0] == selectedFace.value && props.difficulty[1] == selectedRate.value) result = 1 // Both correct
    else if (props.difficulty[0] == selectedFace.value && bothEnabled) result = 2 // Only difficulty correct
    else if (props.difficulty[1] == selectedRate.value && bothEnabled) result = 3 // Only rating correct
    else result = 0 // dumbass

    emit('guessed', result)
}

let focusedFace = 0
function moveFocus(by: number) {
    let idk = guessingDifficulty.value ? 1 : 0
    focusedFace = Math.min(Math.max(focusedFace + by, 0), document.querySelectorAll(".guessFace").length-idk)

    let selectElement = document.querySelector(`.guessFace:nth-child(${focusedFace+1})`) as HTMLButtonElement
    selectElement?.focus()
}

function rateBack() {
    guessingDifficulty.value = true;
    focusedFace = selectedFace.value; 
    nextTick(() => moveFocus(0))
}

</script>

<template>
    <article class="z-10" v-if="guessingDifficulty">
        <h2 class="mb-2 text-xl font-bold text-center drop-shadow-lg shadow-black">{{ $t('listViewer.whatDiff') }}</h2>
        <section class="flex flex-wrap gap-3 justify-center items-center py-2 bg-black bg-opacity-40 rounded-md">
            <button @click="selectFace(index-1)" @keydown.down.prevent="selectFace(index-1)" @keydown.right="moveFocus(1)" @keydown.left="moveFocus(-1)"
                class="button focus-visible:drop-shadow-lg shadow-black focus-visible:scale-125 guessFace"
                v-for="index in 12">
                <DifficultyIcon class="w-14" :difficulty="index-1" :rating="0" />
            </button>
        </section>
    </article>

    <article class="z-10" v-else>
        <h2 class="mb-2 text-xl font-bold text-center drop-shadow-lg shadow-black">{{ $t('listViewer.whatRate') }}</h2>
        <section class="flex relative flex-wrap gap-6 justify-center items-center py-2 bg-black bg-opacity-40 rounded-md">
            <button class="absolute left-2 top-1/2 -translate-y-1/2 button" @click="rateBack()" v-if="diffGuessArray[1]">
                <img src="@/images/showCommsL.svg" class="w-5" alt="">
            </button>
            <button @click="selectedRate = i; checkResult()" @keydown.down.prevent="selectedRate = i; checkResult()" @keydown.right="moveFocus(1)" @keyup.up.prevent="rateBack()" @keydown.left="moveFocus(-1)"
                class="relative button focus-visible:drop-shadow-lg shadow-black focus-visible:scale-125 guessFace"
                v-for="i in 6">
                <DifficultyIcon class="w-14" :difficulty="selectedFace-1" :rating="i" />
            </button>
        </section>
    </article>
</template>