<script lang="ts" setup>
import type { DataContainerAction, ReviewList } from '@/interfaces';
import CONTAINERS from './containers';
import { flexNames } from '@/Reviews';
import { inject, ref } from 'vue';
import DataContainer from './DataContainer.vue';

defineProps<{
    writerData: ReviewList
    editable: boolean
    containerLastAdded?: number
}>()

const emit = defineEmits<{
    (e: "callCommand", data: {command: DataContainerAction, data: any[] }): void
}>()

const selectedContainer = inject<any[]>("selectedContainer")
const selectedNestContainer = inject<any[]>("selectedNestContainer")
const buttonState = ref([0, 0])

</script>

<template>
    <DataContainer v-for="(container, index) in writerData.containers"
        ref="dataContainers"
        v-memo="[editable, containerLastAdded, selectedContainer, selectedNestContainer]"
        v-bind="CONTAINERS[container.type]"
        @remove-container="emit('callCommand', {command: 1, data: [index]})"
        @move-container="emit('callCommand', {command: 0, data: [index, $event]})"
        @has-focus="selectedContainer = [index, $event]; selectedNestContainer = [-1, -1, -1]"
        @settings-button="buttonState = [$event, selectedContainer[0]]"
        @add-paragraph="emit('callCommand', {command: 2, data: [index]})"
        @text-modified="container.data = $event"
        :type="container.type"
        :current-settings="container.settings"
        :class="[CONTAINERS[container.type].styling ?? '']"
        :style="{ textAlign: container.align }"
        :key="container.id"
        :focused="editable && selectedContainer[0] == index"
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
</template>