<script lang="ts" setup>
import type { DataContainerAction, PostData } from '@/interfaces';
import CONTAINERS from './containers';
import { flexNames, pickFont } from '@/Reviews';
import { computed, inject, ref, onUnmounted, onMounted } from 'vue';
import DataContainer from './DataContainer.vue';
import { SETTINGS } from '@/siteSettings';
import chroma from 'chroma-js';

const props = defineProps<{
    writerData: PostData
    editable: boolean
    containerLastAdded?: number
    zenMode: boolean
}>()

const emit = defineEmits<{
    (e: "callCommand", data: {command: DataContainerAction, data: any[] }): void
}>()

const selectedContainer = inject<any[]>("selectedContainer", [-1, 0])
const selectedNestContainer = inject<any[]>("selectedNestContainer", [-1, 0, 0])
const buttonState = ref([0, 0])

const translucentBG = computed(() => {
    if (props.writerData.transparentPage == 1)
        return 'transparent'
    
    if (props.writerData.transparentPage == 2 && !SETTINGS.value.disableTL) {
        // return chroma.hsv(props.writerData?.pageBGcolor?.[0] ?? 0, 0, 0, 0.3).css()
        if (props.writerData.whitePage)
            return chroma.hsv(props.writerData?.pageBGcolor?.[0] ?? 0, 0.1, 1, 0.7).css()
        else
            return chroma.hsv(props.writerData?.pageBGcolor?.[0] ?? 0, 0.4, 0.2, 0.3).css()
    }
    else
        return ''
})

const fontColor = computed(() => {
    if (props.writerData.whitePage) {
        if (props.writerData?.fontTint)
            return chroma.hsv(props.writerData?.pageBGcolor?.[0] ?? 0, 0.6, 0.2).css()
        else
            return 'black'
    }
    else {
        if (props.writerData?.fontTint)
            return chroma.hsv(props.writerData?.pageBGcolor?.[0] ?? 0, 0.2, 0.9).css()
        else
            return 'white'
    }
})

const writer = ref<HTMLDivElement>()
let mStarted = [-1, -1]
const unfocusContainer = (_: MouseEvent) => {
    if (!props.editable) return
    
    let rect = writer.value?.getBoundingClientRect()
    if (!rect) return
    if (mStarted[0] < rect.x || mStarted[1] < rect.y || mStarted[0] > rect.x + rect?.width || mStarted[1] > rect.y + rect?.height) {
        selectedContainer.value = [-1, null]
        selectedNestContainer.value = [-1, -1, -1]
    }
}

const setMouseStart = (e: MouseEvent) => mStarted = [e.x, e.y]

onMounted(() => {
    document.body.addEventListener("mousedown", setMouseStart)
    document.body.addEventListener("click", unfocusContainer)
})
onUnmounted(() => {
    document.body.removeEventListener("mousedown", setMouseStart)
    document.body.removeEventListener("click", unfocusContainer)
})

</script>

<template>
<section
    ref="writer"
    :style="{
        fontFamily: pickFont(writerData.font),
        backgroundColor: `${translucentBG} !important`,
        color: fontColor
    }"
    id="reviewText"
    :data-white-page="writerData.whitePage"
    class="p-2 mx-auto rounded-md max-w-[90rem] w-full"
    :class="{
        'readabilityMode': writerData.readerMode,
        'bg-transparent my-16 border-none shadow-none': zenMode,
        'shadow-drop bg-lof-200 shadow-black': writerData.transparentPage == 0 || SETTINGS.disableTL,
        'shadow-drop backdrop-blur-md backdrop-brightness-[0.3]': writerData.transparentPage == 2 && !SETTINGS.disableTL,
        '!backdrop-brightness-[0.7]': writerData.whitePage && writerData.transparentPage == 2 && !SETTINGS.disableTL
        }"
    >
    
        <slot name="header" />

        <DataContainer v-for="(container, index) in writerData.containers"
            ref="dataContainers"
            v-memo="[editable, containerLastAdded, selectedContainer, selectedNestContainer]"
            v-bind="CONTAINERS[container.type]"
            @remove-container="emit('callCommand', {command: 1, data: [index]})"
            @move-container="emit('callCommand', {command: 0, data: [index, $event]})"
            @has-focus="selectedContainer[0] = index; selectedNestContainer = [-1, -1, -1]"
            @settings-button="buttonState = [$event, selectedContainer[0]]"
            @add-paragraph="emit('callCommand', {command: 2, data: [index]})"
            @text-modified="container.data = $event"
            :type="container.type"
            :current-settings="container.settings"
            :class="[CONTAINERS[container.type].styling ?? '']"
            :style="{ textAlign: container.align }"
            :key="container.id"
            :focused="editable && selectedContainer[0] == index"
            :index="index"
            :editable="editable"
            :text="container.data"
        >
            <div class="flex flex-wrap w-full" :style="{ justifyContent: flexNames[container.align] }">
                <component
                    v-for="(elements, subIndex) in
                        (CONTAINERS[container.type].additionalComponents ?? [])
                         .concat(Array(container.extraComponents)
                         .fill(CONTAINERS[container.type].additionalComponents?.[0] ?? []))"
                    :is="elements"
                    :key="container.id"
                    v-bind="CONTAINERS[container.type].componentProps ?? {}"
                    @clear-button="buttonState[0] = ''"
                    @remove-subcontainer="container.extraComponents -= 1"
                    @remove="emit('callCommand', {command: 1, data: [index]})"
                    :button-state="buttonState"
                    :settings="container.settings"
                    :index="index"
                    :sub-index="subIndex"
                    :editable="editable"
                    :align="container.align"
                />
            </div>
        </DataContainer>

        <slot name="footer" />
    </section>
</template>