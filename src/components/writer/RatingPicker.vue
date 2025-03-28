<script setup lang="ts">
import type { ReviewRating } from '@/interfaces';
import chroma from 'chroma-js';
import { computed } from 'vue';
import { ref } from 'vue';

import Dropdown from '../ui/Dropdown.vue';
import Scroller from '../ui/Scroller.vue';

const props = defineProps<{
    defaultName?: string
    value: number
    editable?: boolean
    color?: boolean
}>()

const emit = defineEmits<{
    (e: "editAction", opt: number)
    (e: "modRating", rating: number)
}>()

const name = defineModel("name")

const scrollColors = [
    "#271019",
    "#4c4923",
    "#1996a8",
    "#321b99"
]
const scrollColors2 = [
    "#460202",
    "#a26e2b",
    "#75EEFB",
    "#951b99"
]
const names = [
    "sad",
    "mid",
    "nice",
    "noRating"
]

const BGcolor = computed(() => {
    if (props.value == -1) return chroma(scrollColors[3])

    let selOrder = [[0,1], [1, 2]][props.value >= 5 | 0]
    return chroma.mix(scrollColors[selOrder[0]], scrollColors[selOrder[1]], Math.min(props.value, 9) % 5 / 5, 'lab')
})

const rateSplit = computed(() => {
    if (props.value == -1) return 3
    return Math.min(Math.trunc((props.value-1)/3), 2)
})

const start = computed(() => {
    if (props.value == -1) return chroma(scrollColors2[3])

    let selOrder = [[0,1], [1, 2]][props.value >= 5 | 0]
    return chroma.mix(scrollColors2[selOrder[0]], scrollColors2[selOrder[1]], Math.min(props.value, 9) % 5 / 5, 'hcl')
})

const optionsOpen = ref(false)
const optsButton = ref(false)
const col = props.color || [0,0,0]

const rateScale = computed(() => chroma.scale([BGcolor.value, chroma.hsl(...col)]).mode('lab'))

const ratingGradient = computed(() => `linear-gradient(45deg, ${rateScale.value(0).css()}, ${rateScale.value(0.5).css()}, ${rateScale.value(1).css()})`)
const base = import.meta.env.BASE_URL
</script>

<template>
    <section class="flex relative transition-colors scrollingBG" :style="{backgroundColor: BGcolor.css(), backgroundImage: ratingGradient}">
        <div class="z-10 px-4 py-2 pl-2 sm:pr-6 grow">
            <div class="flex relative z-10 justify-between items-center">
                <input v-if="editable" v-model.lazy="name" type="text" maxlength="20" class="mb-1 text-2xl font-bold bg-transparent outline-none grow placeholder:backdrop-invert placeholder:text-white placeholder:text-opacity-60 focus-within:border-b-2" :placeholder="$t('reviews.ratingName')">
                <span v-else class="text-3xl font-bold">{{ defaultName }}</span>
                
                <button v-if="editable" class="p-1 ml-3 bg-black bg-opacity-40 rounded-full button" ref="optsButton" @click="optionsOpen = true">
                    <img src="@/images/more.svg" class="w-4">
                </button>
                <Dropdown v-if="optionsOpen" @picked-option="emit('editAction', $event)" @close="optionsOpen = false" :options="[$t('editor.remove'), $t('other.moveUp'), $t('other.moveDown')]" :button="optsButton" />
            </div>
            <Scroller
                :style="{
                    borderColor: chroma.hsl(...col).brighten(1).css(),
                    background: chroma.hsl(...col).darken(4).css()
                }"
                :track-col="chroma.hsl(...col)"
                :value="value"
                @update:value="emit('modRating', $event)"
                :min="0" :max="10" :step="0.1"
            />
        </div>

        <div :style="{backgroundImage: `url(${base}/rateBGs/${names[rateSplit]}.webp)`}" class="absolute inset-0 fade">
        </div>

        <div class="flex relative items-center px-2 pr-6 max-sm:hidden ratingContainer" :style="{background: `${chroma.hsl(...col).desaturate().darken(2).css()}`}">
            <span v-if="value > -1" class="text-4xl font-black text-white -translate-y-2 min-w-14">{{ props.value }}</span>
            <span v-else class="text-4xl font-black text-red-600 -translate-y-2 min-w-14">!</span>
            <span class="absolute bottom-2 right-4 text-xl font-black text-white text-opacity-30">/10</span>
        </div>
        
        <!-- <input :value="value > -1 ? value : 5" :style="`--col: ${chroma.hsl(...col).hex()}`" :data-customcolor="typeof color == 'object'"  type="range" min="0" step="0.1" max="10" class="relative z-10 w-full bg-transparent slider"> -->
    </section>
</template>

<style>
@keyframes scroll {
    from {
        background-position: 0 0;
    }
    to {
        background-position: 6rem -6rem;
    }
}

@media (prefers-reduced-motion) {
    .scrollingBG { animation: none; }
}

.fade {
    mask-image: linear-gradient(45deg, black, transparent);
    background-size: 6rem;
    animation: scroll 5s infinite linear;
    mix-blend-mode: soft-light;
    /* opacity: 0.2; */
}

.scrollingBG {
    @apply relative overflow-clip border-4;
    border-image-slice: 1;
    border-image-source: v-bind(ratingGradient);
    box-shadow: 0px 0px 16px v-bind(start);
    /* animation: scroll 5s infinite linear; */
}
.scrollingBG::before {
    @apply content-[''] absolute bottom-0 left-0 w-full h-full mix-blend-screen;
    background-image: linear-gradient(0deg, v-bind(start), transparent);
}

.ratingContainer::before {
    @apply content-[''] absolute skew-x-12 -left-4 bg-inherit h-full w-12
}

</style>