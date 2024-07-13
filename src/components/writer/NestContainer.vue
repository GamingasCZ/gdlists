<script setup lang="ts">
import { ref } from 'vue';
import { inject } from 'vue';
import DataContainer from './DataContainer.vue';
import { flexNames, reviewData } from '@/Reviews';
import { computed } from 'vue';
import chroma from 'chroma-js';
import { watch } from 'vue';

const props = defineProps<{
    settings: {components: any[]}
    index: number
    subIndex: number
    editable: boolean
}>()

const emit = defineEmits<{
    (e: "remove"): void
    (e: "removeSubcontainer"): void
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

const removeNestContainer = () => {
    if (!props.editable) return
    // Don't try to remove non-empty containers
    if (props.settings.components[props.subIndex].length > 0) return

    switch (props.settings.components.length) {
        case 2: 
            if (!props.settings.components[1].length && !props.settings.components[0].length) emit("remove")
            break; // Leave columns
        default:
            props.settings.components.splice(props.subIndex, 1)
            emit('removeSubcontainer')
            break;
    }
}

const borderColor = computed(() => chroma.css(chroma.hsl([reviewData.value.pageBGcolor[0]+90, 0.94, 0.68])))

const selectNestContainer = (e: Event) => {
    if (!props.editable) return
    selectedNestContainer.value = [props.index, props.subIndex, selectedContainer.value[0]];
    selectedRootContainer.value = [props.index, -1]
}

</script>

<template>
    <article
        @click.stop="selectNestContainer"
        :style="{borderColor: borderColor, maxWidth: settings.components[subIndex].includes(true) ? 'max-content' : 'unset'}"
        class="p-0.5 border border-opacity-30 transition-colors duration-75 min-w-10 grow min-h-8"
        :class="{'border-2 !border-opacity-100': selectedNestContainer[0] == index && selectedNestContainer[1] == subIndex, '!border-none': !editable}"
    >
        <DataContainer
            v-for="(container, ind) in settings.components[subIndex].filter(x => x !== true)"
            v-bind="CONTAINERS[container.type]"
            @has-focus="selectedRootContainer = [index, null]; selectedContainer = [ind, $event]; selectedNestContainer = [index, subIndex, ind]"
            @remove-container="settings.components[subIndex].splice(ind, 1); removeNestContainer()"
            @move-container="moveContainer(ind, $event)"
            @settings-button="buttonState = [$event, ind]"
            v-model="container.data"
            :type="container.type"
            :current-settings="container.settings"
            :class="[CONTAINERS[container.type].styling ?? '']"
            :style="{textAlign: container.align}"
            :key="container.id"
            :editable="editable"
            :text="container.data"
            :focused="selectedNestContainer[1] == subIndex && ind == selectedContainer[0]"
        >
            <div class="flex w-full" :style="{justifyContent: flexNames[container.align]}">
                <component
                    v-for="elements in CONTAINERS[container.type].additionalComponents"
                    :is="elements"
                    v-bind="CONTAINERS[container.type].componentProps ?? {}"
                    @clear-button="buttonState[0] = ''"
                    :button-state="buttonState"
                    :settings="container.settings"
                    :index="ind"
                    :editable="editable"
                />
            </div>
        </DataContainer>
    </article>
</template>