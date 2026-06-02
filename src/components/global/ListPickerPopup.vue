<script setup lang="ts">
import { inject, ref } from "vue";
import type { Ref } from "vue";
import TabBar from "../ui/TabBar.vue";
import axios from "axios";
import ListPreview from "./ListPreview.vue";
import type { Level, selectedList } from "@/interfaces";
import ReviewPreview from "./ReviewPreview.vue";
import FavoritePreview from "./FavoritePreview.vue";
import ListBrowser from "./ListBrowser.vue";
import LevelPreview from "./LevelPreview.vue";
import { lastPostPickerTab, modLastPPTab } from "@/Editor";

const props = defineProps<{
    data: any[]
    onlyPickLevels: boolean
}>()

const emit = defineEmits<{
    (e: 'closePopup'): void
    (e: 'addLevel', data: Level | Level[]): void
}>();

const query = ref("")
const state = ref(0) // -3 - Loading, -2 - Error, -1 - No results, 0 - Nothing, 1 - Has lists
const tab = ref(lastPostPickerTab[0])

const switchTab = (newTab: number) => {
    tab.value = newTab
    state.value = 0
    query.value = ""
    listingLevels.value = false
    modLastPPTab([newTab, contentType.value])
}

const contentType = ref(lastPostPickerTab[1])
const listingLevels = ref<boolean | 2>(false)
const levelsFetched = ref([])

const addToInjected = inject<() => void>("addToInjected")!
const selNest = inject<Ref<[number, number, number]>>("selectedNestContainer")!
const selCont = inject<Ref<[number, HTMLDivElement | null]>>("selectedContainer")!
const pickList = (data: selectedList) => {
    if (props.onlyPickLevels && (tab.value == 2 || listingLevels.value)) {
        emit('addLevel', data)
        return emit('closePopup')
    }

    if (data[0].option == 0) {
        if (props.data[selCont.value[0]].type == "twoColumns") {
            props.data[selCont.value[0]].settings.components[selNest.value[1]][selNest.value[2]].settings.post = data[0].postID
            props.data[selCont.value[0]].settings.components[selNest.value[1]][selNest.value[2]].settings.postType = data[0].postType
        }
        else {
            props.data[selCont.value[0]].settings.post = data[0].postID
            props.data[selCont.value[0]].settings.postType = data[0].postType
        }
        
        addToInjected()
        emit('closePopup')
    }
    else {
        axios.get(import.meta.env.VITE_API + "/getLists.php", {params: {levelsIn: data[0].postID, fromReviews: data[0].postType}}).then(res => {
            if (res.data == 3) {
                listingLevels.value = 2
            }
            else {
                listingLevels.value = decodeURIComponent(data[1]).replace("+", ' ')
                levelsFetched.value = res.data[0]
            }
        })
    }
}

let adjustID = -1
const adjustQuery = (newText: string) => {
    if (adjustID != -1) clearTimeout(adjustID)
    adjustID = setTimeout(() => {
        query.value = newText
    }, 150);
}

const levSelected = ref<number[]>([])
const selectLevel = (ind: number) => {
    let i = levSelected.value.indexOf(ind)
    if (i > -1)
        levSelected.value.splice(i, 1)
    else
        levSelected.value.push(ind)
}

const closeLevels = () => {
    listingLevels.value = false
    levSelected.value = []
}

</script>

<template>
    <div class="flex gap-2 items-center mx-2">
        <input autofocus type="text" @input="adjustQuery($event.target.value)" :placeholder="$t('other.search')" class="px-2 py-1 my-3 bg-black bg-opacity-40 rounded-md grow">
        <select v-show="tab != 2" v-model="contentType" @change="modLastPPTab([tab, contentType])">
            <option :value="0">{{ $t('other.all') }}</option>
            <option :value="1">{{ $t('other.mine') }}</option>
            <option :value="2">{{ $t('other.private') }}</option>
        </select>

    </div>

    <TabBar @switched-tab="switchTab" :default-tab="tab" :tab-names="[$t('help.Lists'), $t('reviews.review'), $t('editor.levels')]" />

    <div
        tabindex="-1"
        class="bg-[url(@/images/fade.svg)] bg-repeat-x h-[40rem] relative p-2 pt-0 overflow-y-auto flex flex-col gap-2">    
        <div v-show="!listingLevels">
            <ListBrowser
                online-browser
                :component="[ReviewPreview, ReviewPreview, LevelPreview][tab]"
                :search="query"
                :online-type="['', 'user', 'hidden'][contentType]"
                :online-subtype="['lists', 'reviews', 'levels'][tab]"
                hide-search hide-tabs is-logged-in :picking="1 + (+onlyPickLevels)"
                @switch-browser="contentType = $event"
                @selected-post-option="pickList"
            />
        </div>
        <div v-show="listingLevels" class="relative mt-2 h-full">
            <div class="flex gap-2 items-center" v-show="listingLevels != 2">
                <button @click="closeLevels()" class="flex gap-2 p-1 bg-black bg-opacity-40 rounded-md button">
                    <img src="@/images/showCommsL.svg" class="w-2" alt="">{{ $t('other.back') }}
                </button>
                <span class="opacity-40">{{ listingLevels }}</span>
            </div>
            
            <div class="flex absolute top-1/2 left-1/2 flex-col gap-3 text-xl text-center -translate-x-1/2 -translate-y-1/2" v-if="listingLevels == 2">
                <img src="@/images/listEmpty.svg" class="w-80 opacity-20" alt="">
                <h2 class="opacity-20">{{ $t('reviews.noLevelsShow') }}</h2>
                <button @click="closeLevels()" class="flex gap-2 p-2 mx-auto w-max text-2xl bg-black bg-opacity-40 rounded-md button"><img src="@/images/showCommsL.svg" class="w-3" alt="">{{ $t('other.back') }}</button>
            </div>
            <div class="grid gap-2 py-2 sm:grid-cols-2" v-else>
                <LevelPreview
                    v-for="(level, ind) in levelsFetched"
                    :class="{'outline outline-4 outline-lof-400': levSelected.includes(ind)}"
                    @click.left.exact.ctrl.stop="selectLevel(ind)"
                    class="w-full"
                    :disable-link="2"
                    @clicked-option="pickList(onlyPickLevels ? level : [$event, ''])"
                    v-bind="level"
                    disable-fave
                />
            </div>

        </div>
        <Transition name="fade">
            <section v-if="levSelected.length" class="flex sticky -bottom-2 -left-2 z-10 justify-between items-center p-2 w-full rounded-md bg-lof-300">
                <button @click="levSelected = []" class="rounded-md button">
                    <img src="@/images/close.svg" class="inline mr-2 w-5" alt="">
                    {{ $t('other.cancel') }}
                </button>
                <span class="text-2xl">{{ $t('reviews.levSelected', levSelected.length) }}</span>
                <button @click="pickList(onlyPickLevels ? levSelected.map(x => levelsFetched[x]) : [$event, ''])" class="px-2 py-1 bg-black bg-opacity-40 rounded-md button">
                    <img src="@/images/checkThick.svg" class="inline mr-2 w-5" alt="">
                    {{ $t('other.pick') }}
                </button>
            </section>
        </Transition>
    </div>
</template>
