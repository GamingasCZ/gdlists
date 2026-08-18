<script setup lang="ts">
import { inject, type Ref, ref, watch } from 'vue';
import ContainerHelp from './ContainerHelp.vue';
import { hasLocalStorage } from '@/siteSettings';
import { useRoute } from 'vue-router';
import ReviewPreview from '../global/ReviewPreview.vue';
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

const postData = ref<ListFetchResponse>()
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

const embedData = inject<Ref<any[] | -1>>("batchEmbeds")
const pp = ref()
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
    }
}
watch(embedData, getList)
getList()

const dialogs = inject("openedDialogs")
const mountedOnce = ref(false)
</script>

<template>

    <ContainerHelp unclickable v-if="embedData === -1" icon="listTable" :help-content="$t('reviews.embedded')">
        <span class="text-sm leading-none opacity-50">{{ $t('reviews.embeddedHelp') }}</span>
    </ContainerHelp>

    <ContainerHelp @vue:mounted="!mountedOnce && ($event.component?.exposed?.doFocus() || (mountedOnce = true))" @click="dialogs.lists = [true, index, 0, true]" v-else-if="settings.post === false && !postData" icon="listTable" :help-content="$t('reviews.listEmbedShowcase')">
    </ContainerHelp>

    <ContainerHelp unclickable v-else-if="settings.post && !postData" icon="view" :help-content="$t('reviews.deletedPost')">
    </ContainerHelp>

    <LevelCardTableTable :active="true" v-else-if="postData" class="text-base my-2">
        <LevelCardTable
            v-for="(level, ind) in postData.data.levels"
            v-bind="level"
            :level-index="ind"
            :list-i-d="postData.data.id"
            :list-name="postData.name"
        />
    </LevelCardTableTable>

    <!-- <component
        v-else-if="postData"
        :is="ReviewPreview"
        @mousedown="saveScrolling"
        :key="postData?.[0]?.id"
        class="m-2"
        v-bind="postData[0]"
        :post="pp"
        is-list
        :disable-link="editable"
        :user-array="postData[1]"
        :review-details="postData[2]"
        hide-remove
        is-embed
    /> -->
</template>