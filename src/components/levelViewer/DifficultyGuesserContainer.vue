<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
    difficulty: [number, number]
}>()

const emit = defineEmits<{
  (e: "guessed", result: number): void;
}>();

const difficultyFaces = ref<string[]>([])
const ratings = ref<string[]>([""])
const ratingClasses = ref([
    "",
    "w-6 translate-x-0.5 -bottom-1",
    "top-0 left-0 scale-[1.4] -z-10 -translate-y-1/2",
    "-translate-y-6 left-0 scale-[1.5] -z-10"
])

async function getFaces() {
    for (let i = 0; i <= 11; i++) {
        difficultyFaces.value.push(await import(`../../images/faces/${i}.webp`).then(res => res.default))
    }

    ratings.value?.push(await import('../../images/faces/star.webp').then(res => res.default))
    ratings.value?.push(await import('../../images/faces/featured.webp').then(res => res.default))
    ratings.value?.push(await import('../../images/faces/epic.webp').then(res => res.default))
}

getFaces()

const guessingDifficulty = ref(true)

const selectedFace = ref(0)
const selectedRate = ref(0)
function selectFace(selection: number) {
    if (selection == 0) return checkResult() // N/A levels don't have ratings
    selectedFace.value = selection
    guessingDifficulty.value = false
}

function checkResult() {
    let result: number

    if (props.difficulty[0] == selectedFace.value && props.difficulty[1] == selectedRate.value) result = 1 // Both correct
    else if (props.difficulty[0] == selectedFace.value) result = 2 // Only difficulty correct
    else if (props.difficulty[1] == selectedRate.value) result = 3 // Only rating correct
    else result = 0 // dumbass

    emit('guessed', result)
}

</script>

<template>
    <article v-if="guessingDifficulty">
        <h2 class="mb-2 text-xl font-bold text-center drop-shadow-lg shadow-black">{{ $t('listViewer.whatDiff') }}</h2>
        <section class="flex flex-wrap gap-3 justify-center items-center py-2 bg-black bg-opacity-40 rounded-md">
            <button @click="selectFace(index)"
                class="button focus-visible:drop-shadow-lg shadow-black focus-visible:scale-125"
                v-for="(face, index) in difficultyFaces">
                <img :src="face" alt="" class="w-10">
            </button>
        </section>
    </article>

    <article v-else>
        <h2 class="mb-2 text-xl font-bold text-center drop-shadow-lg shadow-black">{{ $t('listViewer.whatRate') }}</h2>
        <section class="flex relative flex-wrap gap-4 justify-center items-center py-2 bg-black bg-opacity-40 rounded-md">
            <button class="absolute left-2 top-1/2 -translate-y-1/2 button" @click="guessingDifficulty = true">
                <img src="@/images/showCommsL.svg" class="w-5" alt="">
            </button>
            <button @click="selectedRate = index; checkResult()"
                class="relative button focus-visible:drop-shadow-lg shadow-black focus-visible:scale-125"
                v-for="(face, index) in ratings">

                <img :src="difficultyFaces[selectedFace]" alt="" class="top-1/2 left-1/2 w-10" >
                <img :src="face" alt="" class="absolute top-1/2 left-1/2 -translate-x-1/2" :class="ratingClasses[index]">
            </button>
        </section>
    </article>
</template>