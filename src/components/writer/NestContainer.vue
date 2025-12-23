<script setup lang="ts">
import { type Ref, ref } from 'vue';
import { inject } from 'vue';
import DataContainer from './DataContainer.vue';
import { flexNames } from '@/Reviews';
import { computed } from 'vue';
import chroma from 'chroma-js';
import { watch } from 'vue';
import type { PostData } from '@/interfaces';
import type { cTwoColumns } from './containers';

const props = defineProps<{
    settings: cTwoColumns
    index: number
    subIndex: number
    editable: boolean
}>()

const emit = defineEmits<{
    (e: "remove"): void
    (e: "removeSubcontainer"): void
    (e: "addParagraph"): void
}>()

const selectedNestContainer = inject<number[]>("selectedNestContainer", [-1, -1, -1])!
const selectedRootContainer = inject<number[]>("selectedContainer", [-1, -1, -1])!
watch(selectedRootContainer, () => {
    if (selectedNestContainer.value[0] != props.index) selectedContainer.value = [-1, null]
})
const selectedContainer = ref([-1, null])

const moveContainer = (i: number, by: number) => {
    let data = props.settings.components[props.subIndex][i]
    props.settings.components[props.subIndex].splice(i, 1)
    props.settings.components[props.subIndex].splice(i+by, 0, data)
}

const buttonState = ref([0,0])
const CONTAINERS = inject("settingsTitles")!

const postData = inject<Ref<PostData>>("postData")!
const borderColor = computed(() => {
    if (props.editable)
        return chroma.css(chroma.hsl([postData.value.pageBGcolor[0]+90, 0.94, 0.68]))
    else
        return "#000"
})

const selectNestContainer = (e: Event) => {
    if (!props.editable) return
    selectedNestContainer.value = [props.index, props.subIndex, selectedContainer.value[0]];
    selectedRootContainer.value = [props.index, -1]
}

const subcomponents = computed(() => props.settings.components[props.subIndex].filter(x => x === Object(x)))
const removeInnerContainer = inject<(ind: number) => void>("removeContainer")!

</script>

<template>
    <article
        @click.stop="selectNestContainer"
        @focusin="selectNestContainer"
        
        :style="{outlineColor: borderColor, justifyContent: ['start', 'center', 'end'][settings.components[subIndex][settings.components[subIndex].findIndex(x => typeof x == 'number')]], maxWidth: settings.components[subIndex].includes(true) ? 'max-content' : 'unset'}"
        :tabindex="(editable && subcomponents.length > 0) ? -1 : 0  "
        class="p-0.5 flex flex-col outline outline-1 transition-colors duration-75 min-w-10 grow min-h-8 basis-[min-content]"
        :class="{'!outline-2': selectedNestContainer[0] == index && selectedNestContainer[1] == subIndex, '!outline-none': !editable}"
    >
        <DataContainer
            v-for="(container, ind) in subcomponents"
            v-bind="CONTAINERS[container.type]"
            @has-focus="selectedRootContainer = [index]; selectedContainer = [ind, $event]; selectedNestContainer = [index, subIndex, ind]"
            @remove-container="removeInnerContainer(index);"
            @move-container="moveContainer(ind, $event)"
            @settings-button="buttonState = [$event, ind]"
            @text-modified="container.data = $event"
            @add-paragraph="emit('addParagraph')"
            :type="container.type"
            :current-settings="container.settings"
            :class="[CONTAINERS[container.type].styling ?? '']"
            :style="{textAlign: container.align}"
            :key="container.id"
            :editable="editable"
            :text="container.data"
            :index="index"
            :nest-index="[ind, subIndex]"
            :focused="selectedNestContainer[1] == subIndex && ind == selectedContainer[0] && editable"
        >
            <component
                v-for="elements in CONTAINERS[container.type].additionalComponents"
                :is="elements"
                v-bind="CONTAINERS[container.type].componentProps ?? {}"
                @clear-button="buttonState[0] = ''"
                :button-state="buttonState"
                :settings="container.settings"
                :index="ind"
                :id="container.id"
                :editable="editable"
                :nest-index="[index, subIndex, ind]"
            />
        </DataContainer>
    </article>
</template>
