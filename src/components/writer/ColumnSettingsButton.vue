<script setup lang="ts">
import { inject, ref, watch } from 'vue';
import type{ Ref } from 'vue';
import ColumnEdit from './ColumnEdit.vue';
import Dropdown from '../ui/Dropdown.vue';
import ColumnCreator from './ColumnCreator.vue';

defineProps<{
    disabled: boolean
}>()

const emit = defineEmits<{
    (e: "modifyTitle", ind: number): void
}>()

const columnOptionsShown = ref(false)
const selectedNest = inject<Ref<number[]>>("selectedNestContainer")!
watch(selectedNest, () => {
    if (selectedNest.value[0] == -1)
        emit('modifyTitle', 0)
    else
        emit('modifyTitle', 1)
})
const columnButton = ref<HTMLButtonElement>()

const clickAction = () => {
    columnOptionsShown.value = true
}

defineExpose({
    clickAction
})

</script>

<template>
    <Dropdown
        v-if="columnOptionsShown && selectedNest[0] != -1"
        :button="columnButton"
        @close="columnOptionsShown = false"
    >
        <template #header>
            <ColumnEdit @close="columnOptionsShown = false" />
        </template>
    </Dropdown>
    <Dropdown
        v-else-if="columnOptionsShown && selectedNest[0] == -1"
        :button="columnButton"
        @close="columnOptionsShown = false"
    >
        <template #header>
            <ColumnCreator @close="columnOptionsShown = false" />
        </template>
    </Dropdown>

    <button
        @mousedown.prevent=""
        class="p-1 disabled:opacity-40"
        id="columnCreatorButton"
        @click="clickAction"
        ref="columnButton"
        :disabled="disabled"
    >
        <img v-if="selectedNest[0] != -1" src="@/images/gear.svg" class="w-6 pointer-events-none min-w-6">
        <img v-else src="@/images/twoColumns.svg" class="w-6 pointer-events-none min-w-6">
    </button>
</template>