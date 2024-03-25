<script setup lang="ts">

import RatingPicker from "./RatingPicker.vue";
import TabBar from "../ui/TabBar.vue";
import Dropdown from "../ui/Dropdown.vue";
import { computed } from "vue";
import { DEFAULT_RATINGS, reviewData } from "@/Reviews";
import { useI18n } from "vue-i18n";
import { makeColor } from "@/Editor";

const levelNames = computed(() => {
    let names = []
    reviewData.value.levels.forEach(l => names.push(l.levelName || useI18n().t('other.unnamesd')))
    return names
}
)

const addRating = (name = '') => {
    reviewData.value.ratings.push({
        name: "",
        color: makeColor(),
        rating: 5
    })
}

</script>

<template>
    <TabBar :tab-names="levelNames" />

    <div v-if="!reviewData.levels.length" class="flex gap-2 items-center p-2 mx-2 bg-red-600 bg-opacity-80 rounded-md">
        <img src="@/images/info.svg" class="w-6" alt="">
        <span>{{ $t('reviews.noLevelsYet') }}</span>
    </div>

    <main :class="{ 'opacity-20 pointer-events-none': !reviewData.levels.length }">
        <div class="grid grid-cols-2 gap-4 m-2">
            <RatingPicker v-for="(rating) in DEFAULT_RATINGS" :rating="rating" />
        </div>

        <section class="flex justify-between p-2 items-center bg-[url(@/images/headerBG.webp)]">
            <span class="text-2xl font-bold">{{ $t('other.custom') }}</span>
            <div class="flex relative z-20 gap-2 items-center">
                <div class="relative">
                    <button :title="$t('collabTools.presetsTitle')"
                        class="bg-black bg-opacity-40 rounded-md button disabled:opacity-40">
                        <img src="@/images/moveDown.svg" alt="" class="box-border p-2 w-8" />
    
                    </button>
                    <Dropdown :options="['Theming', 'Sync', 'Hudba', 'Konzistence', 'Sightreadovatelnost', 'Originalita']" :title="$t('collabTools.examples')" />
                </div>
                <button @click="addRating" class="p-1 bg-black bg-opacity-40 rounded-md button">
                    <img src="@/images/addLevel.svg" alt="" class="w-7">
                </button>
            </div>
        </section>
        <section
            class="relative h-[30rem] overflow-y-auto bg-[url(@/images/fade.webp)] bg-repeat-x p-2 gap-4 flex flex-col">
            <div v-if="!reviewData.ratings.length"
                class="absolute top-1/2 left-1/2 text-center opacity-20 -translate-x-1/2 -translate-y-1/2">
                <img src="@/images/collabDudes.svg" alt="">
                <h2 class="w-max text-xl">Můžeš hodnotit víc vlastností levelu!</h2>
                <p>Jen základní se ale počítají do statistik.</p>
            </div>

            <RatingPicker v-for="rating in reviewData.ratings" :rating="rating" editable />
        </section>
    </main>
</template>