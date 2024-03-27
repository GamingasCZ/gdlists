<script setup lang="ts">
import { ref } from 'vue';
import { inject } from 'vue';
import DataContainer from './DataContainer.vue';

const props = defineProps<{
    settings: {components: any[]}
    index: number
    subIndex: number
}>()

const selectedNestContainer = inject<number[]>("selectedNestContainer")!

const selectedContainer = ref([-1, null])

const moveContainer = (i: number, by: number) => {
    let data = props.settings.components[props.subIndex][i]
    props.settings.components[props.subIndex].splice(i, 1)
    props.settings.components[props.subIndex].splice(i+by, 0, data)
}

const buttonState = ref('')
const CONTAINERS = inject("settingsTitles")

</script>

<template>
    <section @click="selectedNestContainer = [index, subIndex]" @focusout="selectedNestContainer = [-1, -1]" class="p-0.5 w-full border border-blue-400 border-opacity-30 transition-colors duration-75 min-h-8" :class="{'border-2 !border-opacity-100': selectedNestContainer[0] == index && selectedNestContainer[1] == subIndex}">
        <DataContainer
            v-for="(container, ind) in settings.components[subIndex]"
            v-bind="CONTAINERS[container.type]"
            @has-focus="selectedContainer = [ind, $event]"
            @remove-container="settings.components[subIndex].splice(ind, 1)"
            @move-container="moveContainer(ind, $event)"
            @text-modified="container.data = $event"
            @settings-button="buttonState = $event"
            :type="container.type"
            :current-settings="container.settings"
            :class="[CONTAINERS[container.type].styling ?? '']"
            :style="{textAlign: container.align}"
            :key="container.id"
        >
            <div class="flex col-span-2 w-full">
                <component
                    v-for="elements in CONTAINERS[container.type].additionalComponents"
                    class="grow"
                    :is="elements"
                    v-bind="CONTAINERS[container.type].componentProps ?? {}"
                    @clear-button="buttonState = ''"
                    :button-state="buttonState"
                    :settings="container.settings"
                    :index="index"
                />
            </div>
        </DataContainer>
    </section>
</template>