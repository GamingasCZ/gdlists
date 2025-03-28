<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue';
import ContainerHelp from './ContainerHelp.vue';
import { computed } from 'vue';
import { inject } from 'vue';
import { watch } from 'vue';
import Resizer from '../global/Resizer.vue';
import { WriterGallery } from '@/interfaces';
import containers, { type cShowImage } from './containers';


const emit = defineEmits<{
    (e: 'openSettings'): void
    (e: 'clearButton'): void
}>()

const props = defineProps<{
    settings: cShowImage
    index: number
    buttonState: [string, number]
    editable: boolean
    id: number
}>()

const image = ref<HTMLImageElement>()
const imageLoading = ref(-2)

onMounted(() => {
    image.value?.addEventListener("loadstart", () => imageLoading.value = 1)
    image.value?.addEventListener("load", () => {
        imageLoading.value = 0;

        // Default - image width, overriden by epic dasher set width :)
        props.settings.width = props.settings.width || Math.min(image.value?.width, document.body.clientWidth * 0.4)

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
    if (!props?.buttonState) return
    if (props.buttonState[1] != props.index) return
    
    switch (props.buttonState[0]) {
        case "pick":
            dialogs.imagePicker = [WriterGallery.ImageContainer, props.index]
            break;
        }
    emit("clearButton")
})

const dialogs = inject("openedDialogs")
const linkHost = computed(() => {
    let link: string
    try {
        link = new URL(props.settings.link)
        return link.host
    } catch (e) {
        props.settings.link = ""
        return ""
    }
})

const noClickWhenEditing = (e: Event) => {
    if (props.editable) e.preventDefault()
}

const preview = inject<(arg0: number) => void>("imagePreviewFullscreen", null)
const fullscreenImage = () => {
    if (props.editable || preview == null) return

    preview(props.id)
}

const size = containers.showImage.settings[1].valueRange

</script>

<template>
    <ContainerHelp @click.stop="dialogs.imagePicker = [WriterGallery.ImageContainer, index]" v-show="imageLoading != 0" v-if="editable" icon="showImage" :help-content="['', $t('other.loading'), $t('reviews.imgError')][text]" >
        <span>{{ $t('reviews.pickImage') }}</span>
    </ContainerHelp>

    <figure v-show="imageLoading == 0" @click="fullscreenImage" class="max-w-full">
        <div class="flex relative group min-h-[48px] my-1 max-w-fit" :style="{width: settings?.height ? 'auto' : `${settings.width}px`}">
            <Resizer :min-size="size[0]" :max-size="size[1]" gizmo-pos="corner" :editable="editable" @resize="settings.width = $event; settings.width = $event">
                <img
                    ref="image"
                    class="text-xl text-white rounded-md border-transparent pointer-events-none min-w-8"
                    :class="{'min-w-max': settings?.height, 'aspect-video object-cover': settings?.crop}"
                    :style="{height: settings?.height ? `${settings.height}px` : ''}"
                    :src="settings.url"
                    :alt="settings.alt"
                    :title="settings.alt"
                >
            </Resizer>
            <a target="_blank" @click="noClickWhenEditing" :href="settings.link" v-if="settings.link" class="flex absolute top-2 right-2 gap-2 items-center px-2 w-max text-black bg-white bg-opacity-80 rounded-full opacity-0 backdrop-blur-sm transition-opacity duration-75 group-hover:opacity-100">
                <img src="@/images/link.svg" class="w-4 invert" alt="">
                {{ linkHost }}
            </a>
        </div>
        <figcaption class="text-[90%] text-inherit">{{ settings.description }}</figcaption>
    </figure>

</template>