<script setup lang="ts">
import { inject, onMounted, ref, watch } from 'vue';
import ListPreview from '../global/ListPreview.vue';
import ContainerHelp from './ContainerHelp.vue';
import { hasLocalStorage } from '@/siteSettings';
import router from '@/router';
import { nextTick } from 'vue';


const emit = defineEmits<{
    (e: 'openSettings'): void
    (e: 'clearButton'): void
}>()

const props = defineProps<{
    settings: object
    index: number
    buttonState: string
    editable: boolean
}>()

watch(props, () => {
    switch (props.buttonState) {
        case "pick": props.settings.level = false; break;
    }
    emit("clearButton")
})

const saveScrolling = () => {
    if (hasLocalStorage()) {
        let listName = document.getElementById("objectName")?.innerText // Ber z elementu
        let listID = router.currentRoute.value.fullPath
        let pos = {name: listName, id: listID, scrollY: document.documentElement.scrollTop}
        sessionStorage.setItem("reviewScroll", JSON.stringify(pos))
        nextTick(() => router.push("/" + props.settings.level.id))
        
    }
}

const dialogs = inject("openedDialogs")
</script>

<template>
    <ContainerHelp v-if="!settings.level" icon="showList" :help-content="'Vyber seznam, který chceš zobrazit'">
        <button @click="dialogs.lists = [true, index]" class="flex gap-2 items-center p-2 mx-auto bg-black bg-opacity-40 rounded-md button">
            <img src="@/images/browseMobHeader.svg" alt="" class="w-8">
            <span>{{ $t('reviews.pickList') }}</span>
        </button>
    </ContainerHelp>
    <figure v-else @click="saveScrolling" class="p-2 w-[60rem] max-w-full">
        <ListPreview class="w-full" :disable-link="true" v-bind="settings.level" />
        <figcaption>{{ settings.description }}</figcaption>
    </figure>
</template>