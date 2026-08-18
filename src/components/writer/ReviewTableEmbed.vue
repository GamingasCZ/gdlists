<script setup lang="ts">
import { inject, type Ref, ref, watch } from 'vue';
import ContainerHelp from './ContainerHelp.vue';
import { hasLocalStorage } from '@/siteSettings';
import { useRoute } from 'vue-router';
import { type cListTable } from './containers';
import LevelCardTableTable from '../global/LevelCardTableTable.vue';
import LevelCardTable from '../global/LevelCardTable.vue';
import { type ListFetchResponse } from '@/interfaces.ts';
import { modernizeList } from '@/Editor.ts';


const emit = defineEmits<{
    (e: 'openSettings'): void
    (e: 'clearButton'): void
}>()

const props = defineProps<{
    settings: cListTable
    index: number
    buttonState: [string, number]
    editable: boolean
    align: string
}>()

const postData = ref<ListFetchResponse | false | 2>(2)
watch(props, async () => {
    if (props.buttonState[1] != props.index) return

    switch (props.buttonState[0]) {
        case "pick":
            dialogs.lists = [true, props.index, 0, true]
            break;
    }
    emit("clearButton")
})

const route = useRoute()
const saveScrolling = () => {
    if (["writer", "editingReview"].includes(route.name ?? "")) return

    if (hasLocalStorage()) {
        localStorage.setItem("reviewScroll", document.getElementById("objectName")?.innerText) // save list name
    }
}

const favIDs = ref([])

const embedData = inject<Ref<any[] | -1>>("batchEmbeds")
const getList = async () => {
    if (props.settings.post === false) return
    if (!embedData?.value || embedData.value == -1) return
    if (!embedData.value?.[3]) return
    
    let list = embedData.value[3].filter(x => x.id == props.settings.post || x.hidden == props.settings.post)[0]
    if (!list)
        postData.value = false
    else {
        list.data = modernizeList(list)
        postData.value = list

        if (hasLocalStorage()) {
            favIDs.value = JSON.parse(localStorage.getItem("favoriteIDs")!);
            if (!favIDs.value)
                favIDs.value = []
        }
    }
}
watch(embedData, getList)
getList()

const dialogs = inject("openedDialogs")
const openCollab = inject("openCollab", (_,_2,_3) => {})
const openTags = inject("openTags", (_,_2) => {})
const mountedOnce = ref(false)
</script>

<template>

    <ContainerHelp unclickable v-if="embedData === -1" icon="listTable" :help-content="$t('reviews.embedded')">
        <span class="text-sm leading-none opacity-50">{{ $t('reviews.embeddedHelp') }}</span>
    </ContainerHelp>

    <ContainerHelp @vue:mounted="!mountedOnce && ($event.component?.exposed?.doFocus() || (mountedOnce = true))" @click="dialogs.lists = [true, index, 0, true]" v-else-if="editable && !settings.post" icon="listTable" :help-content="$t('reviews.listEmbedShowcase')">
    </ContainerHelp>

    <ContainerHelp unclickable v-else-if="settings.post && postData === 2" icon="view" :help-content="$t('other.loading')+'...'">
    </ContainerHelp>

    <ContainerHelp unclickable v-else-if="settings.post && !postData" icon="view" :help-content="$t('reviews.deletedPost')">
    </ContainerHelp>

    <LevelCardTableTable :active="true" v-else-if="postData !== 2" class="text-base group relative my-2">
        <LevelCardTable
            v-for="(level, ind) in postData.data.levels"
            :key="level.levelID"
            v-bind="level"
            :level-index="ind"
            :list-i-d="postData.data.id"
            :list-name="postData.name"
            :favorited="favIDs.includes(level.levelID)"
            @open-collab="openCollab(ind, level.color, postData.data.levels[ind])"
            @open-tags="openTags(ind, level)"
        />

        <!-- Post link -->
        <RouterLink v-if="!props.settings.hideLink && !editable" @mousedown="saveScrolling" :to="`/${postData.hidden != '0' ? postData.hidden : postData.id}`" class="absolute border-b-4 border-lof-200 bg-greenGradient py-1 px-2 shadow-drop left-0 group-hover:opacity-100 transition-opacity duration-75 opacity-0 rounded-md -top-8">
            <span class="opacity-40 mr-2">{{ $t('other.list') }}:</span> {{ postData.name }}
            <img src="@/images/link.svg" class="inline w-4 ml-1" alt="">
        </RouterLink>
    </LevelCardTableTable>
</template>