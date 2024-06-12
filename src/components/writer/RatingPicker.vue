<script setup lang="ts">
import type { ReviewRating } from '@/interfaces';
import chroma from 'chroma-js';
import { computed } from 'vue';
import { ref } from 'vue';

import Sad from "@/images/reviews/sad.webp"
import Mid from "@/images/reviews/mid.webp"
import Nice from "@/images/reviews/nice.webp"
import Dropdown from '../ui/Dropdown.vue';

const props = defineProps<{
    defaultName?: string
    editable?: boolean
}>()

const emit = defineEmits<{
    (e: "editAction", opt: number)
}>()

const rating = defineModel("rating")
const name = defineModel("name")

const scrollColors = [
    "#271019",
    "#4c4923",
    "#1996a8"
]
const scrollColors2 = [
    "#460202",
    "#a26e2b",
    "#75EEFB"
]

const BGcolor = computed(() => {
    let selOrder = [[0,1], [1, 2]][rating.value >= 5 | 0]
    return chroma.mix(scrollColors[selOrder[0]], scrollColors[selOrder[1]], Math.min(rating.value, 9) % 5 / 5, 'lab')
})

const rateSplit = computed(() => Math.min(Math.trunc((rating.value-1)/3), 2))

const start = computed(() => {
    let selOrder = [[0,1], [1, 2]][rating.value >= 5 | 0]
    return chroma.mix(scrollColors2[selOrder[0]], scrollColors2[selOrder[1]], Math.min(rating.value, 9) % 5 / 5, 'hcl')
})

const optionsOpen = ref(false)
const optsButton = ref(false)
</script>

<template>
    <section class="px-4 py-2 rounded-md transition-colors scrollRating" :style="{backgroundColor: BGcolor.css(), backgroundImage: `url(${[Sad, Mid, Nice][rateSplit]})`}">
        <div class="flex relative z-10 justify-between items-center">
            
            <input v-if="editable" v-model="name" type="text" maxlength="20" class="text-2xl font-bold bg-transparent outline-none grow placeholder:backdrop-invert placeholder:text-white placeholder:text-opacity-60 focus-within:border-b-2" :placeholder="$t('reviews.ratingName')">
            <span v-else class="text-2xl font-bold">{{ defaultName }}</span>
            
            <span class="text-2xl font-black">{{ rating }}/10</span>
            <button v-if="editable" class="p-1 ml-3 bg-black bg-opacity-40 rounded-full button" ref="optsButton" @click="optionsOpen = true">
                <img src="@/images/more.svg" class="w-4">
            </button>
            <Dropdown v-if="optionsOpen" @picked-option="emit('editAction', $event)" @close="optionsOpen = false" :options="[$t('editor.remove'), $t('other.moveUp'), $t('other.moveDown')]" :button="optsButton" />
        </div>
        <input v-model="rating" type="range" min="0" max="10" class="relative z-10 w-full bg-transparent slider">
    </section>
</template>

<style scoped>
@keyframes scroll {
    from {
        background-position: 0 0;
    }
    to {
        background-position: 64px -64px;
    }
}

@keyframes shake {
    0% {
        transform: translateX(-10px);
    }
    50% {
        transform: translateX(10px);
    }
}

@media (prefers-reduced-motion) {
    .scrollRating { animation: none; }
}

.scrollRating {
    @apply relative overflow-clip;
    animation: scroll 5s infinite linear;
}
.scrollRating::before {
    @apply content-[''] absolute bottom-0 left-0 w-full h-full mix-blend-screen;
    background-image: linear-gradient(0deg, v-bind(start), transparent);
}

</style>