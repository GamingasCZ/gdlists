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

    let col = makeColor()
    col[2] = 0.5 * Math.random() / 2
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

</script>

<template>
    <TabBar :tab-names="levelNames" @switched-tab="pickedLevel = $event" v-show="reviewData.levels.length" />

    <div v-if="!reviewData.levels.length" class="flex gap-2 items-center p-2 mx-2 bg-red-600 bg-opacity-80 rounded-md">
        <img src="@/images/info.svg" class="w-6" alt="">
        <span>{{ $t('reviews.noLevelsYet') }}</span>
    </div>

    <main :class="{ 'opacity-20 pointer-events-none': !reviewData.levels.length }">
        <div class="grid grid-cols-2 gap-4 m-2">
            <RatingPicker v-for="(rating, index) in DEFAULT_RATINGS" :default-name="rating.name" v-model:rating.number="reviewData.levels[pickedLevel].ratings[0][index]" :rating="rating" />
        </div>

        <section class="flex justify-between p-2 items-center bg-[url(@/images/headerBG.webp)]">
            <span class="text-2xl font-bold">{{ $t('other.custom') }}</span>
            <div class="flex relative z-20 gap-2 items-center">
                <button :disabled="reviewData.ratings.length > 3" ref="suggestions" :title="$t('collabTools.presetsTitle')" @click="suggShown = true"
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
                <img src="@/images/collabDudes.svg" alt="">
                <h2 class="w-max text-xl">{{ $t('reviews.moreFeaturesHelp1') }}</h2>
                <p>{{ $t('reviews.moreFeaturesHelp2') }}</p>
            </div>

            <RatingPicker v-for="(rating, index) in reviewData.ratings" :key="rating.name" @edit-action="changeSetting($event, index)" v-model:name="reviewData.ratings[index].name" v-model:rating="reviewData.levels[pickedLevel].ratings[1][index]" editable />
        </section>
    </main>
</template>