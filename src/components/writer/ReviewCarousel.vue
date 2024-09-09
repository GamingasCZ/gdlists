<script setup lang="ts">
import { inject } from 'vue';
import ContainerHelp from './ContainerHelp.vue';
import { watch } from 'vue';

const props = defineProps<{
    index: number
    buttonState: [string, number]
}>()

const emit = defineEmits<{
    (e: "openPicker"): void
    (e: "clearButton"): void
}>()

const dialogs = inject("openedDialogs")
watch(props, () => {
    if (props.buttonState[1] != props.index) return
    
    switch (props.buttonState[0]) {
        case "pick":
            dialogs.carouselPicker = [true, props.index]
            break;
        }
    emit("clearButton")
})

const openDialogs = inject("openedDialogs")
</script>

<template>
    <ContainerHelp @click="openDialogs.carouselPicker = [true, index]" icon="addCarousel" :help-content="$t('reviews.carouselHelp')" />
</template>