<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import ContainerHelp from './ContainerHelp.vue';
import { watch } from 'vue';
import ReviewImage from './ReviewImage.vue';
import ReviewVideo from './ReviewVideo.vue';
import Resizer from '../global/Resizer.vue';

const props = defineProps<{
    index: number
    buttonState: [string, number]
    settings: object
    editable: boolean
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

const modHeight = (newHeight: number) => {
    props.settings.height = newHeight
    props.settings.components.forEach(m => {
        m.settings.height = newHeight
    })
}

const openDialogs = inject("openedDialogs")

const carousel = ref<HTMLDivElement>()
const scrollCarousel = (speed: number) => {
    carousel.value?.scrollBy({left: carousel.value.offsetWidth*speed, behavior: 'smooth'})
}

const buttonsShown = ref(false)
const onResize = new ResizeObserver(() => {
    buttonsShown.value = carousel.value?.scrollWidth > carousel.value?.parentElement.offsetWidth
})

</script>

<template>
    <ContainerHelp v-if="!settings.components.length" @click="openDialogs.carouselPicker = [true, index]" icon="addCarousel" :help-content="$t('reviews.carouselHelp')" />
    <section @vue:mounted="onResize.observe(carousel!)" @wheel="scrollCarousel($event.deltaX/200)" ref="carousel" class="overflow-x-hidden overflow-y-clip" :class="{'pb-1.5': editable, 'px-12': buttonsShown}" v-else>
        <button v-show="buttonsShown" @click="scrollCarousel(-1)" class="flex absolute left-2 top-1/2 z-10 justify-center w-10 rounded-full -translate-y-1/2 button bg-lof-400 aspect-square">
            <img src="@/images/showCommsL.svg" class="w-3 invert -translate-x-0.5" alt="">
        </button>


        <div class="absolute inset-0">
            <Resizer @resize="modHeight" :style="{height: '100%'}" gizmo-pos="vertical" :min-size="48" :max-size="256" :editable="editable && !settings.overflow"></Resizer>
        </div>

        <section class="flex items-center" :class="{'flex-wrap': settings.overflow}">
            <component
            v-for="medium in settings.components"
            :is="[ReviewImage, ReviewVideo][+(medium.type == 'addVideo')]"
            v-bind="medium"
            :editable="false"
            />
        </section>
        <button v-show="buttonsShown" @click="scrollCarousel(1)" class="flex absolute right-2 top-1/2 z-10 justify-center w-10 rounded-full -translate-y-1/2 button bg-lof-400 aspect-square">
            <img src="@/images/showComms.svg" class="w-3 invert translate-x-0.5" alt="">
        </button>
    </section>
</template>