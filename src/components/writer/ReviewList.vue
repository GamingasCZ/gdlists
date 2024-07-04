<script setup lang="ts">
import { inject, onMounted, ref, watch } from 'vue';
import ListPreview from '../global/ListPreview.vue';
import ContainerHelp from './ContainerHelp.vue';
import { hasLocalStorage } from '@/siteSettings';
import router from '@/router';
import { nextTick } from 'vue';
import { useRoute } from 'vue-router';


const emit = defineEmits<{
    (e: 'openSettings'): void
    (e: 'clearButton'): void
}>()

const props = defineProps<{
    settings: object
    index: number
    buttonState: [string, number]
    editable: boolean
}>()

watch(props, () => {
    if (props.buttonState[1] != props.index) return

    switch (props.buttonState[0]) {
        case "pick": props.settings.level = false; break;
    }
    emit("clearButton")
})

const saveScrolling = () => {
    if (["writer", "editingReview"].includes(useRoute().name)) return

    if (hasLocalStorage()) {
        let listName = document.getElementById("objectName")?.innerText // Ber z elementu
        let listID = router.currentRoute.value.fullPath
        let pos = {name: listName, id: listID, scrollY: document.documentElement.scrollTop}
        localStorage.setItem("reviewScroll", JSON.stringify(pos))
        nextTick(() => router.push("/" + props.settings.level.id))
        
    }
}

const dialogs = inject("openedDialogs")
</script>

<template>
    <ContainerHelp v-if="!settings.level" icon="showList" :help-content="$t('reviews.listShowcase')">
        <button @click="dialogs.lists = [true, index]" class="flex gap-2 items-center p-2 mx-auto bg-black bg-opacity-40 rounded-md button">
            <img src="@/images/view.svg" alt="" class="w-8">
            <span>{{ $t('reviews.pickList') }}</span>
        </button>
    </ContainerHelp>
    <figure v-else class="p-2 w-[60rem] max-w-full">
        <ListPreview @mousedown="saveScrolling" class="w-full" :disable-link="true" v-bind="settings.level" />
        <figcaption>{{ settings.description }}</figcaption>
    </figure>
</template>