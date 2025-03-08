<script setup lang="ts">
import LevelCard from "../editor/EditorCard.vue";
import { inject, onBeforeUnmount, ref, type Ref } from "vue";
import EditorCardHeader from "../editor/EditorCardHeader.vue";
import { addReviewLevel } from "@/Reviews";
import LevelImportPopup from "../editor/LevelImportPopup.vue";
import Dialog from "../global/Dialog.vue";
import type { FavoritedLevel, Level, LevelList, ReviewList } from "@/interfaces";
import PickerPopup from "../global/PickerPopup.vue";
import LevelBubble from "../global/LevelBubble.vue";
import axios from "axios";
import Dropdown from "../ui/Dropdown.vue";
import Plus from "@/svgs/Plus.vue";
import LevelRoulette from "./LevelRoulette.vue";

const props = defineProps<{
    subtext: string
    maxLevels: number
}>()

const emit = defineEmits<{
    (e: "togglePreview"): void
    (e: "closePopup"): void
}>()

const POST_DATA = inject<Ref<ReviewList & LevelList>>("postData")!
const addLevel = (levelData?: Level | FavoritedLevel) => {
    addReviewLevel(POST_DATA, levelData, props.maxLevels)

    openedCard.value = POST_DATA.value.levels.length - 1
}

const mainRolledOut = ref(true)
const openedCard = ref(0)
const updatingPosition = ref(-1)
const dialogs = inject("openedDialogs")

defineExpose({
    openedCard,
    addLevel
})

const hashLevels = () => {
    let hashes: number[] = []
    POST_DATA.value.levels.forEach(level => {
        hashes.push(Math.pow(JSON.stringify(level).split("").map(x => x.charCodeAt(0)).reduce((x, y) => x + y), 2) % 65535)
    })
    return hashes
}

const { levelHashes, updateHashes } = inject("levelHashes")!
onBeforeUnmount(() => {
    updateHashes(hashLevels())
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
    if (to < 0 || to >= POST_DATA.value.levels.length) return

    let l = POST_DATA.value.levels[from]
    POST_DATA.value.levels.splice(from, 1, POST_DATA.value.levels[to])
    POST_DATA.value.levels[to] = l

    updatingPosition.value = -1
    openedCard.value = to
}

const levelDialogs = ref({
    import: false,
    saved: false
})

const getSavedLevels = () => {
    let saves: FavoritedLevel[] = JSON.parse(localStorage.getItem("favorites")!) ?? []
    return saves.filter(level => level.levelName.toLowerCase().includes(savedSearch.value.toLowerCase()))
}
const savedSearch = ref("")

const addRandomLevel = () => {
    if (POST_DATA.value.levels.length >= 10) return
    axios.get(import.meta.env.VITE_API + "/getLists.php?randomLevel").then(res => {
        if (res.data?.[0])
            addLevel(res.data[0])
    })
}

const moreLevOpts = ref<HTMLButtonElement>()
const moreLevOptOpen = ref(false)

const openMoreDialog = (opt: number) => {
    switch (opt) {
        case 0:
            dialogs.lists[0] = true
            dialogs.lists[2] = true
            break;
        case 1:
            rouletteActive.value = true
            break;
        case 2:
            levelDialogs.value.saved = true
            break;
        case 3:
            levelDialogs.value.import = true
            break;
    }
    moreLevOptOpen.value = false
}

const rouletteActive = ref(false)

</script>

<template>
    <Dialog :open="levelDialogs.import" @close-popup="levelDialogs.import = false" :title="$t('editor.importLevels')">
        <LevelImportPopup @close-popup="levelDialogs.import = false" @add-level="addLevel($event)" />
    </Dialog>

    <Dialog :open="levelDialogs.saved" @close-popup="levelDialogs.saved = false" :title="$t('editor.importLevels')">
        <PickerPopup v-model="savedSearch">
            <LevelBubble v-for="level in getSavedLevels()" :data="level" @pick="addLevel($event)" />
        </PickerPopup>
    </Dialog>

    <section class="mx-auto !text-base text-white rounded-md bg-lof-200 shadow-drop w-[58rem] max-w-full">
        <header class="flex p-2 text-white cursor-pointer">
            <img src="@/images/browseMobHeader.svg" class="mr-3 ml-2 w-8" alt="">
            <h2 class="text-2xl font-bold grow">{{ $t('editor.levels') }}</h2>
            <!-- <button class="button">
                <img src="@/images/dropdown.svg" :class="{'rotate-180': mainRolledOut}" class="w-6" alt="">
            </button> -->
            <button v-if="POST_DATA.levels.length" @click="mainRolledOut = !mainRolledOut; emit('togglePreview')" :class="{'!bg-lof-400': !mainRolledOut}" class="px-2 rounded-md button hover:bg-black hover:bg-opacity-40">
                <div class="flex gap-2 items-center" :class="{'invert': !mainRolledOut}">
                    <img src="@/images/view.svg" class="w-6" alt="">
                    <span class="">{{ $t('other.preview') }}</span>
                </div>
            </button>
        </header>

        <main v-show="mainRolledOut">
            <div class="flex overflow-y-auto relative flex-col gap-2 p-2">
                <div v-if="!POST_DATA.levels.length && !rouletteActive"
                    class="flex flex-col items-center w-full text-center opacity-40">
                    <h2 class="text-2xl max-sm:mt-8">{{ subtext }}</h2>
                    <section class="flex gap-3 px-2 mt-8 w-full sm:items-center max-sm:flex-col">
                        <button @click="openMoreDialog(0)" class="flex gap-3 items-center px-2 py-3 text-lg bg-opacity-40 rounded-lg sm:flex-col grow hover:bg-black">
                            <img src="@/images/searchOpaque.svg" class="w-10" alt="">
                            <p>{{ $t('reviews.browseLevels') }}</p>
                        </button>
                        <hr class="w-0.5 h-20 bg-white bg-opacity-20 border-none max-sm:hidden">
                        <button @click="rouletteActive = true" class="flex gap-3 items-center px-2 py-3 text-lg bg-opacity-40 rounded-lg sm:flex-col grow hover:bg-black">
                            <img src="@/images/dice.svg" class="w-10" alt="">
                            <p>{{ $t('reviews.surprise') }}</p>
                        </button>
                        <hr class="w-0.5 h-20 bg-white bg-opacity-20 border-none max-sm:hidden">
                        <button @click="openMoreDialog(3)" class="flex gap-3 items-center px-2 py-3 text-lg bg-opacity-40 rounded-lg sm:flex-col grow hover:bg-black">
                            <img src="@/images/filePreview.svg" class="w-10" alt="">
                            <p>{{ $t('reviews.impGD') }}</p>
                        </button>
                    </section>
                </div>
                <LevelRoulette v-if="rouletteActive" @use-level="addLevel" @exit="rouletteActive = false" />
        
                <div v-show="!rouletteActive" v-for="(level, index) in POST_DATA.levels">
                    <EditorCardHeader v-if="openedCard != index" :data="level" :updating-positions="updatingPosition"
                        :index="index" @update-opened-card="openedCard = index" @do-move="moveLevel" />
                    <LevelCard v-else @open-collab-tools="dialogs.collabs = true" @open-tag-popup="dialogs.tags = true"
                        @do-move="moveLevel" @move-controls="enableMoveControls" :updating-positions="updatingPosition"
                        :level-array="POST_DATA" :data="level" :index="index" />
                </div>
            </div>
            <div class="flex relative gap-2 justify-center items-center">
                <button @click="addLevel()" :disabled="POST_DATA.levels.length >= maxLevels"
                    class="flex gap-2 px-2 py-3 text-xl font-bold disabled:opacity-40 disabled:grayscale text-lof-400">
                    <Plus :style="{fill: 'var(--brightGreen)'}" class="w-7 h-7" />
                    {{ $t('reviews.addLevel') }}</button>
                <hr class="w-0.5 h-4 bg-white bg-opacity-20 border-none">
                <button @click="moreLevOptOpen = true" :disabled="POST_DATA.levels.length >= maxLevels" ref="moreLevOpts" class="p-2 button">
                    <img src="@/images/genericRate.svg" class="w-2 rotate-180 disabled:opacity-40" alt="">
                </button>
            </div>
            <Dropdown
                v-if="moreLevOptOpen"
                @close="moreLevOptOpen = false"
                @picked-option="openMoreDialog"
                :button="moreLevOpts"
                :options="[$t('other.searchLevels'), $t('other.randomLevel'), $t('navbar.saved'), $t('reviews.import')]"
            />
        </main>
    </section>
</template>
