<script setup lang="ts">
import { inject, onMounted, ref, watch } from 'vue';
import ListPreview from '../global/ListPreview.vue';


const emit = defineEmits<{
    (e: 'openSettings'): void
    (e: 'clearButton'): void
}>()

const props = defineProps<{
    settings: object
    index: number
    buttonState: string
}>()

watch(props, () => {
    switch (props.buttonState) {
        case "pick": props.settings.level = false; break;
    }
    emit("clearButton")
})

const dialogs = inject("openedDialogs")

const BASE_URL = import.meta.env.BASE_URL
</script>

<template>
    <div class="py-1 mx-auto max-w-full overflow-clip">
        <button v-if="!settings.level" @click="emit('openSettings')" class="flex w-[30rem] flex-col items-center p-2 text-xl text-center rounded-md bg-lof-200">
            <div>
                <img :src="`${BASE_URL}/formatting/showList.svg`" class="p-2 mx-auto w-24 opacity-10" alt="">
                <h2>Vyber seznam, který chceš zobrazit</h2>
                <button @click="dialogs.lists = [true, index]" class="flex gap-2 items-center p-2 mx-auto bg-black bg-opacity-40 rounded-md button">
                    <img src="@/images/browseMobHeader.svg" alt="" class="w-8">
                    <span>{{ $t('reviews.pickList') }}{{ buttonState }}</span>
                </button>
            </div>
        </button>
        <figure v-else>
            <ListPreview class="w-full" :disable-link="true" v-bind="settings.level" />
            <figcaption>{{ settings.description }}</figcaption>
        </figure>
    </div>
</template>