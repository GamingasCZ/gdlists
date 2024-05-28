<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue';
import ContainerHelp from './ContainerHelp.vue';
import { computed } from 'vue';
import { inject } from 'vue';
import { watch } from 'vue';
import Resizer from '../global/Resizer.vue';


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

const image = ref<HTMLImageElement>()
const imageScale = ref(0)
const imageLoading = ref(-2)

onMounted(() => {
    image.value?.addEventListener("loadstart", () => imageLoading.value = 1)
    image.value?.addEventListener("load", () => {
        imageLoading.value = 0;

        // Default - image width, overriden by epic dasher set width :)
        imageScale.value = props.settings.width || Math.min(image.value?.width, document.body.clientWidth * 0.4)

    })
    image.value?.addEventListener("error", () => {
        if (imageLoading.value != -2 && props.editable) imageLoading.value = -1
        else if (!props.editable && props.settings.alt.length) imageLoading.value = 0
    })
})

const text = computed(() => {
    switch (imageLoading.value) {
        case -2: return 0;
        case 1: return 1;
        case -1: return 2;
    }  
})

watch(props, () => {
    switch (props.buttonState) {
        case "pick":
            dialogs.imagePicker = [true, props.index]
            break;
    }
    emit("clearButton")
})

const dialogs = inject("openedDialogs")

</script>

<template>
    <ContainerHelp v-show="imageLoading != 0" v-if="editable" icon="showImage" :help-content="['', $t('other.loading'), $t('reviews.imgError')][text]" >
        <button @click="dialogs.imagePicker = [true, index]" class="flex gap-2 items-center p-2 mx-auto bg-black bg-opacity-40 rounded-md button">
            <img src="@/images/browseMobHeader.svg" alt="" class="w-8">
            <span>{{ $t('reviews.pickImage') }}</span>
        </button>
    </ContainerHelp>

    <figure v-show="imageLoading == 0">
        <div class="flex relative group min-h-[48px] max-w-[min(720px,85vw)]" :style="{width: `${imageScale}px`}">
            <Resizer :min-size="104" :max-size="720" gizmo-pos="corner" :editable="editable" @resize="imageScale = $event; settings.width = $event">
                <img
                    ref="image"
                    class="w-full text-xl text-white rounded-md border-transparent pointer-events-none min-w-24"
                    :src="settings.url"
                    :alt="settings.alt"
                    :title="settings.alt"
                >
            </Resizer>
        </div>
        <figcaption class="text-inherit">{{ settings.description }}</figcaption>
    </figure>

</template>