<script setup lang="ts">
import type { ReviewRating } from '@/interfaces';
import chroma from 'chroma-js';
import { computed } from 'vue';
import { ref } from 'vue';

import Sad from "@/images/reviews/sad.webp"
import Mid from "@/images/reviews/mid.webp"
import Nice from "@/images/reviews/nice.webp"

const props = defineProps<{
    rating: ReviewRating
    editable?: boolean
}>()

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
    let selOrder = [[0,1], [1, 2]][props.rating.rating >= 5 | 0]
    return chroma.mix(scrollColors[selOrder[0]], scrollColors[selOrder[1]], Math.min(props.rating.rating, 9) % 5 / 5, 'lab')
})

const rateSplit = computed(() => Math.min(Math.trunc((props.rating.rating-1)/3), 2))

const start = computed(() => {
    let selOrder = [[0,1], [1, 2]][props.rating.rating >= 5 | 0]
    return chroma.mix(scrollColors2[selOrder[0]], scrollColors2[selOrder[1]], Math.min(props.rating.rating, 9) % 5 / 5, 'hcl')
})
</script>

<template>
    <section class="px-4 py-2 rounded-md transition-colors scrollRating" :style="{backgroundColor: BGcolor.css(), backgroundImage: `url(${[Sad, Mid, Nice][rateSplit]})`}">
        <div class="flex relative z-10 justify-between">
            <input v-if="editable" type="text" maxlength="20" class="text-2xl font-bold bg-transparent outline-none grow placeholder:backdrop-invert placeholder:text-white placeholder:text-opacity-60 focus-within:border-b-2" placeholder="Název hodnocení">
            <span v-else class="text-2xl font-bold">{{ rating.name }}</span>

            <span class="text-2xl font-black">{{ rating.rating }}/10</span>
        </div>
        <input v-model="rating.rating" type="range" min="0" max="10" class="relative z-10 w-full bg-transparent slider">
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