<script setup lang="ts">
import { inject, nextTick, onMounted, ref } from 'vue';
import ContainerHelp from './ContainerHelp.vue';
import { watch } from 'vue';
import ReviewImage from './ReviewImage.vue';
import ReviewVideo from './ReviewVideo.vue';
import Resizer from '../global/Resizer.vue';
import { flexNames } from '@/Reviews';
import containers, { type ContainerNames, type cAddCarousel } from './containers';
import { HoverFileAction, type ReviewContainer, type ImageStorage } from '@/interfaces';
import { summonNotification, uploadImages } from '../imageUpload';
import { i18n } from '@/locales';
import { currentUID } from '@/Editor';

const props = defineProps<{
    index: number
    buttonState: [string, number]
    settings: cAddCarousel
    editable: boolean
    align: string
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

watch(() => props.settings.crop, () => {
    props.settings.components.forEach(m => {
        m.settings.crop = props.settings.crop
    })
})

watch(() => props.settings.components, () => {
    if (props.editable && props.settings.components.length)
        enableFileDrag()
}, {deep: true})

const modHeight = (newHeight: number) => {
    props.settings.height = newHeight
    props.settings.components.forEach(m => {
        m.settings.height = newHeight
    })
}

var fileDragEnabled = false
const enableFileDrag = () => {
    if (props.editable) {
        if (!carousel.value?.parentElement || fileDragEnabled) return

        carousel.value?.parentElement.addEventListener("dragover", e => {
            e.preventDefault()
            e.stopPropagation()
            fileDragover.value = true
        })
        carousel.value?.parentElement.addEventListener("dragleave", e => {
            fileDragover.value = false
        })
        carousel.value?.parentElement.addEventListener("drop", e => {
            e.stopPropagation()
            e.preventDefault()
            doUpload(e, e.layerX > e.target.clientWidth/2)
            fileDragover.value = false
        })
        fileDragEnabled = true
    }
}

onMounted(() => {
    enableFileDrag()
})

const openDialogs = inject("openedDialogs")
const addContainer = inject<(key: ContainerNames, addTo: any, returnOnly: boolean, above: boolean) => ReviewContainer>("addContainer")

const carousel = ref<HTMLDivElement>()
const end = ref(1)
const scrollCarousel = (speed: number, event: WheelEvent) => {
    if (speed == 0) {
        carousel.value?.scrollBy({left: event.deltaX+event.deltaY})
        event.preventDefault()
    }

    let start = carousel.value?.scrollLeft!
    let to = carousel.value.offsetWidth! * speed
    let scrollEnd = carousel.value?.scrollWidth!
    
    // show/hide scroll buttons
    if (start + to <= 0)
        end.value = start + to <= 75 ? 1 : 0
    else {
        end.value = start + to >= scrollEnd/2 ? 2 : 0
    }

    carousel.value?.scrollBy({left: to, behavior: 'smooth'})
}

const buttonsShown = ref(false)
const onResize = new ResizeObserver(() => {
    buttonsShown.value = carousel.value?.scrollWidth > carousel.value?.parentElement.offsetWidth
})
const hovering = ref(false)
const size = containers.addCarousel.settings[1].valueRange
const mountedOnce = ref(false)

const fileDragover = ref(false)
const cHelp = ref<HTMLButtonElement & {hoverAction: () => HoverFileAction}>()

var currentlyUploading = false
const containerFileAction = (e: HoverFileAction, files: DragEvent) => {
    if (currentlyUploading) return
    switch (e) {
        case HoverFileAction.DragLeave:
            fileDragover.value = false; break;
        case HoverFileAction.DragOver:
            fileDragover.value = true; break;
        case HoverFileAction.Drop:
            doUpload(files, true)
            break;
    }
}

function doUpload(files: DragEvent, toEnd: boolean) {
    summonNotification(i18n.global.t('reviews.uploadingMedia')+"...", "", "loading")
    fileDragover.value = false
    if (files?.dataTransfer?.items.length) {
        currentlyUploading = true
        uploadImages(files.dataTransfer.files, false).then((images: ImageStorage | string) => {
            currentlyUploading = false
            if (typeof images != 'string' && images?.newImage) {
                images.newImage?.forEach(x => {
                    let image = addContainer('showImage', false, true, false)
                    image.settings.url = `${import.meta.env.VITE_USERCONTENT}/userContent/${currentUID.value}/${x}.webp`
                    image.settings.height = props.settings.height
                    if (toEnd) {
                        props.settings.components.push(image)
                        nextTick(() =>
                            carousel.value?.scrollTo({left:9999, behavior:'smooth'})
                        )
                    }
                    else {
                        props.settings.components.splice(0, 0, image)
                        nextTick(() =>
                            carousel.value?.scrollTo({left:0, behavior:'smooth'})
                        )
                    }
                })
            }
        }).catch(() => currentlyUploading = false)
    }
}

</script>

<template>
    <ContainerHelp
        v-if="!settings.components.length"
        ref="cHelp"
        @vue:mounted="cHelp?.hoverAction(); !mountedOnce && ($event.component?.exposed?.doFocus() || (mountedOnce = true))"
        @file-action="containerFileAction"
        @click.stop="openDialogs.carouselPicker = [true, index]"
        :icon="fileDragover ? 'dropfile' : 'addCarousel'"
        :help-content="fileDragover ? $t('reviews.dragUpload') : $t('reviews.carouselHelp')"
    />

    <section
        v-else
        @mouseenter="hovering = true"
        @mouseleave="hovering = false"
        @vue:mounted="onResize.observe(carousel!)"
        ref="carousel"
        class="overflow-x-auto carousel group overflow-y-clip"
        :class="{'pb-1.5': editable}"
    >
        <Transition name="fade">
            <button v-show="hovering && buttonsShown && end != 1" @click="scrollCarousel(-0.75, $event)" class="flex absolute left-2 top-1/2 z-20 justify-center items-center w-10 rounded-full -translate-y-1/2 button bg-lof-400 aspect-square">
                <img src="@/images/showCommsL.svg" class="w-3 invert -translate-x-0.5" alt="">
            </button>
        </Transition>


        <div v-if="editable" class="absolute inset-0 z-10 w-full">
            <Resizer @resize="modHeight" :style="{height: '100%', width: '100%'}" :curr-height="settings.height" gizmo-pos="slider" :min-size="size[0]" :max-size="size[1]" :editable="editable"></Resizer>
        </div>

        <section class="flex gap-2 items-center" :style="{'justify-content': flexNames[align]}" :class="{'flex-wrap': settings.overflow, 'w-max': !settings.overflow}">
            <component
            v-for="medium in settings.components"
            :is="[ReviewImage, ReviewVideo][+(medium.type == 'addVideo')]"
            v-bind="medium"
            :editable="false"
            />
        </section>
        <Transition name="fade">
            <button v-show="hovering && buttonsShown && end != 2" @click="scrollCarousel(0.75, $event)" class="flex absolute right-2 top-1/2 z-10 justify-center items-center w-10 rounded-full -translate-y-1/2 button bg-lof-400 aspect-square">
                <img src="@/images/showComms.svg" class="w-3 invert translate-x-0.5" alt="">
            </button>
        </Transition>

    </section>

    <!-- Dragging add image -->
    <Transition name="fade">
        <div v-if="editable && fileDragover && settings.components.length" class="flex absolute inset-0 z-20 gap-3 p-3 w-full text-center pointer-events-none">
            <div :class="{'flex-col': settings.height > 64}" class="flex gap-4 justify-center items-center w-full h-full bg-black bg-opacity-80 active:bg-amber-400 grow">
                <img src="@/images/plus.svg" class="w-10" alt="">
                <span>{{ $t('reviews.toBeginn') }}</span>
            </div>
            <div :class="{'flex-col': settings.height > 64}" class="flex gap-4 justify-center items-center w-full bg-black bg-opacity-80 grow">
                <img src="@/images/plus.svg" class="w-10" alt="">
                <span>{{ $t('reviews.toEnd') }}</span>
            </div>
        </div>
    </Transition>

</template>

<style>
.carousel::-webkit-scrollbar {
  @apply hidden;
}

.carousel {
    scrollbar-width: none;
}
</style>
