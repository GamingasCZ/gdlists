<script setup lang="ts">
import { computed, inject, onMounted, ref, watch } from 'vue';
import ListPreview from '../global/ListPreview.vue';
import ContainerHelp from './ContainerHelp.vue';
import { hasLocalStorage } from '@/siteSettings';
import router from '@/router';
import { nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ReviewPreview from '../global/ReviewPreview.vue';
import axios from 'axios';
import LevelCard from '../global/LevelCard.vue';
import { newCardBG } from '@/Editor';


const emit = defineEmits<{
    (e: 'openSettings'): void
    (e: 'clearButton'): void
}>()

const props = defineProps<{
    settings: object
    index: number
    buttonState: [string, number]
    editable: boolean
    align: string
}>()

const postData = ref()
const types = ["lists", "reviews", "levels"]
let lastID = -1
watch(props, async () => {
    if (props.buttonState[1] != props.index) return

    switch (props.buttonState[0]) {
        case "pick":
            props.settings.post = false;
            postData.value = undefined
            break;
    }
    emit("clearButton")
})

const route = useRoute()
const saveScrolling = () => {
    if (["writer", "editingReview"].includes(route.name ?? "")) return
    if (props.settings.postType == 2) return // no levels redirect

    if (hasLocalStorage()) {
        localStorage.setItem("reviewScroll", document.getElementById("objectName")?.innerText) // save list name
        if (props.settings.postType == 0)
            nextTick(() => router.push("/" + postData.value[0].id))
        else
            nextTick(() => router.push("/review/" + postData.value[0].url))
    }
}

const levels = inject("batchEmbeds")
const getList = async () => {
    if (props.settings.post === false) return
    if (levels.value == -1) return
    
    let post;
    if (props.settings.postType == 2) {
        post = levels.value[props.settings.postType][0].filter(x => x.levelID == props.settings.post)[0]
    }
    else
        post = levels.value[props.settings.postType][0].filter(x => x.id == props.settings.post)[0]
    postData.value = [post, levels.value?.[props.settings.postType]?.[1], levels.value?.[props.settings.postType]?.[4]]
}
watch(levels, getList)

const dialogs = inject("openedDialogs")
</script>

<template>
    <ContainerHelp v-if="levels === -1" icon="showList" :help-content="$t('reviews.embedded')">
        <span class="text-sm leading-none opacity-50">{{ $t('reviews.embeddedHelp') }}</span>
    </ContainerHelp>

    <ContainerHelp @click="dialogs.lists = [true, index, 0]" v-else-if="settings.post === false && !postData" icon="showList" :help-content="$t('reviews.listShowcase')">
    </ContainerHelp>

    <ContainerHelp v-else-if="settings.post && postData?.[0] === undefined && typeof postData?.[1] == 'object'" icon="view" :help-content="$t('reviews.deletedPost')">
    </ContainerHelp>

    <component v-else-if="postData" class="m-2" :key="postData?.[0]?.id" :is="[ListPreview, ReviewPreview, LevelCard][settings.postType]" @mousedown="saveScrolling" :disable-link="editable" v-bind="postData[0]" :user-array="postData[1]" :review-details="postData[2]" hide-remove is-embed />
</template>