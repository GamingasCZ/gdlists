<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import ContainerHelp from './ContainerHelp.vue';
import { watch } from 'vue';
import ReviewImage from './ReviewImage.vue';
import ReviewVideo from './ReviewVideo.vue';
import Resizer from '../global/Resizer.vue';
import { flexNames } from '@/Reviews';
import containers, { type cAddCarousel } from './containers';

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

const modHeight = (newHeight: number) => {
    props.settings.height = newHeight
    props.settings.components.forEach(m => {
        m.settings.height = newHeight
    })
}

const openDialogs = inject("openedDialogs")

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

</script>

<template>
    <ContainerHelp v-if="!settings.components.length" @click.stop="openDialogs.carouselPicker = [true, index]" icon="addCarousel" :help-content="$t('reviews.carouselHelp')" />
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
            <Resizer @resize="modHeight" :style="{height: '100%', width: '100%'}" gizmo-pos="vertical" :min-size="size[0]" :max-size="size[1]" :editable="editable"></Resizer>
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
</template>

<style>
.carousel::-webkit-scrollbar {
  @apply hidden;
}

.carousel {
    scrollbar-width: none;
}
</style>
