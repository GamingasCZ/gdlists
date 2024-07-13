<script setup lang="ts">

import RatingPicker from "./RatingPicker.vue";
import TabBar from "../ui/TabBar.vue";
import Dropdown from "../ui/Dropdown.vue";
import { computed, ref } from "vue";
import { DEFAULT_RATINGS, reviewData } from "@/Reviews";
import { useI18n } from "vue-i18n";
import { makeColor } from "@/Editor";
import { i18n } from "@/locales";

const SUGGESTIONS = [
    i18n.global.t('reviews.theming'),
    i18n.global.t('reviews.sync'),
    i18n.global.t('reviews.music'),
    i18n.global.t('reviews.consistency'),
    i18n.global.t('reviews.sightreadability'),
    i18n.global.t('reviews.originality')
]

const levelNames = computed(() => {
    let names = []
    reviewData.value.levels.forEach(l => names.push(l.levelName || useI18n().t('other.unnamesd')))
    return names
}
)

const addRatingsToLevels = () => {
    for (let i = 0; i < reviewData.value.levels.length; i++) {
        let unadded = Array(Math.max(0, reviewData.value.ratings.length - reviewData.value.levels[i].ratings[1].length)).fill(-1)
        reviewData.value.levels[i].ratings[1] = reviewData.value.levels[i].ratings[1].concat(unadded)
    }
}
addRatingsToLevels() // Adds ratings to any newly added levels

const addRating = (name = '') => {
    if (reviewData.value.ratings.length > 3) return

    let col = [20*Math.ceil(Math.random()*18), 0.54, 0.72]
    reviewData.value.ratings.push({
        name: name,
        color: col,
        rating: -1
    })
    addRatingsToLevels()
}

const removeRating = (ind: number) => {
    reviewData.value.ratings.splice(ind, 1)
    for (let i = 0; i < reviewData.value.levels.length; i++) {
        reviewData.value.levels[i].ratings[1].splice(ind, 1)
    }
}

const moveRating = (ind: number, to: number) => {
    let data = reviewData.value.ratings[ind]
    reviewData.value.ratings.splice(ind, 1)
    reviewData.value.ratings.splice(ind+to, 0, data)
    for (let i = 0; i < reviewData.value.levels.length; i++) {
        let data = reviewData.value.levels[i].ratings[1][ind]
        reviewData.value.levels[i].ratings[1].splice(ind, 1)
        reviewData.value.levels[i].ratings[1].splice(ind+to, 0, data)
    }
}

const changeSetting = (option: number, ratingIndex: number) => {
    switch (option) {
        case 0: removeRating(ratingIndex); break;
        case 1: moveRating(ratingIndex, -1); break;
        case 2: moveRating(ratingIndex, 1); break;
    }
}

const pickedLevel = ref(0)
const suggShown = ref(false)
const suggestions = ref<HTMLButtonElement>()

const helpOpen = ref(false)
const helpText = [
    {
        title: i18n.global.t('reviews.gameplay'),
        content: i18n.global.t('reviews.gpHelp')
    },
    {
        title: i18n.global.t('collabTools.deco'),
        content: i18n.global.t('reviews.decoHelp')
    },
    {
        title: i18n.global.t('reviews.difficulty'),
        content: i18n.global.t('reviews.diffHelp')
    },
    {
        title: i18n.global.t('reviews.totalScore'),
        content: i18n.global.t('reviews.overallHelp')
    },
]
defineExpose({helpOpen})
const start = ref("#951b99")

</script>

<template>
    <TabBar class="mt-1" :tab-names="levelNames" @switched-tab="pickedLevel = $event" v-show="reviewData.levels.length" />

    <div v-if="!reviewData.levels.length" class="flex gap-2 items-center p-2 mx-2 bg-red-600 bg-opacity-80 rounded-md">
        <img src="@/images/info.svg" class="w-6" alt="">
        <span>{{ $t('reviews.noLevelsYet') }}</span>
    </div>

    <main v-if="!helpOpen" :class="{ 'opacity-20 pointer-events-none': !reviewData.levels.length }">
        <div class="grid gap-4 p-2 bg-black bg-opacity-60 sm:grid-cols-2">
            <RatingPicker v-for="(rating, index) in DEFAULT_RATINGS" :color="rating.color" :default-name="rating.name" :value="reviewData.levels?.[pickedLevel]?.ratings?.[0]?.[index]" @mod-rating="reviewData.levels[pickedLevel].ratings[0][index] = $event" :rating="rating" />
        </div>

        <section class="flex justify-between p-2 items-center bg-[url(@/images/headerBG.webp)]">
            <span class="text-2xl font-bold">{{ $t('other.custom') }}</span>
            <div class="flex relative z-20 gap-2 items-center">
                <button :disabled="reviewData.ratings.length > 3" ref="suggestions" @click="suggShown = true"
                    class="p-1 bg-black bg-opacity-40 rounded-md disabled:opacity-20 button disabled:opacity-40">
                    <img src="@/images/moveDown.svg" alt="" class="box-border p-1 w-7" />

                </button>
                <Dropdown v-if="suggShown" @close="suggShown = false" @picked-option="addRating(SUGGESTIONS[$event])" :button="suggestions" :options="SUGGESTIONS" :title="$t('collabTools.examples')" />
                <button :disabled="reviewData.ratings.length > 3" @click="addRating()" class="p-1 bg-black bg-opacity-40 rounded-md disabled:opacity-20 button">
                    <img src="@/images/addLevel.svg" alt="" class="w-7">
                </button>
            </div>
        </section>
        <section
            class="relative h-[30rem] overflow-y-auto bg-[url(@/images/fade.webp)] bg-repeat-x p-2 gap-4 flex flex-col">
            <div v-if="!reviewData.ratings.length"
                class="absolute top-1/2 left-1/2 text-center opacity-20 -translate-x-1/2 -translate-y-1/2">
                <img src="@/images/reviews/help2.svg" alt="">
                <h2 class="w-max text-xl">{{ $t('reviews.moreFeaturesHelp1') }}</h2>
                <p>{{ $t('reviews.moreFeaturesHelp2') }}</p>
            </div>

            <RatingPicker v-for="(rating, index) in reviewData.ratings" :key="rating.name" @edit-action="changeSetting($event, index)" :value="reviewData.levels?.[pickedLevel]?.ratings?.[1]?.[index]" @mod-rating="reviewData.levels[pickedLevel].ratings[1][index] = $event" v-model:name="reviewData.ratings[index].name" editable />
        </section>
    </main>

    <section v-else class="grid grid-cols-2 gap-3 m-3 h-[41rem]">
        <div v-for="help in helpText" class="scrollRating rounded-md bg-[#080417] p-2 bg-[url(@/images/reviews/noRating.webp)]">
            <h3 class="text-2xl">{{ help.title }}</h3>
            <hr>
            <p class="mt-2 text-center text-balance" v-html="help.content"></p>
        </div>
    </section>
</template>

<style>
.scrollRating::before {
    @apply content-[''] absolute bottom-0 left-0 w-full h-full mix-blend-screen;
    background-image: linear-gradient(20deg, v-bind(start), transparent);
}
</style>