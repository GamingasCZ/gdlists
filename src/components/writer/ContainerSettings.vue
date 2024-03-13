<script setup lang="ts">
import { inject } from 'vue';
import type { ContainerSettings, Containers } from './containers';

const emit = defineEmits<{
    (e: "remove"): void
    (e: "move", by: number): void
    (e: "pressedButton", key: string): void
}>()

const containers = inject<Containers>("settingsTitles")

const props = defineProps<{
    settingsArr: ContainerSettings[]
    type: string
}>()
</script>

<template>
    <div class="flex absolute -top-1 -right-1 flex-col gap-3 p-2 rounded-md rounded-tr-none bg-greenGradient">
        <div v-for="(setting, key, index) in settingsArr" class="flex flex-col">
            <div class="flex flex-col">
                <div v-if="containers[type].settings[index].type == 0">
                    <label :for="key">{{ containers[type].settings[index].title }}</label><br>
                    <input :name="key" :value="settingsArr[key]" @change="settingsArr[key] = $event.target.value" class="px-2 py-0.5 bg-white bg-opacity-10 rounded-md" type="text">
                </div>
                <button v-if="containers[type].settings[index].type == 1" @click="emit('pressedButton', key)" class="p-2 mx-auto w-max text-lg bg-black bg-opacity-40 rounded-md focus-within:outline-current button">{{ containers[type].settings[index].title }}</button>
                <div v-if="containers[type].settings[index].type == 2" class="flex justify-between">
                    <label :for="key">{{ containers[type].settings[index].title }}</label>
                    <input :name="key" :value="settingsArr[key]" @change="settingsArr[key] = $event.target.value" class="px-2 py-0.5 bg-white bg-opacity-10 rounded-md" type="checkbox">
                </div>
            </div>

        </div>
        <div class="flex gap-1 justify-between mt-3">
            <button @click="emit('move', -1)" class="box-border p-1 w-9 bg-black bg-opacity-40 rounded-md hover:bg-opacity-60 aspect-square">
                <img src="@/images/moveUp.svg" class="mx-auto w-5 button" alt="">
            </button>
            <button @click="emit('move', 1)" class="box-border p-1 w-9 bg-black bg-opacity-40 rounded-md hover:bg-opacity-60 aspect-square">
                <img src="@/images/moveDown.svg" class="mx-auto w-5 button" alt="">
            </button>
            <button @click="emit('remove')" class="flex gap-1 items-center p-1 ml-6 text-xl font-bold text-black bg-red-400 rounded-md">
                <img src="@/images/del.svg" alt="" class="w-6">
                <span>{{ $t('editor.remove') }}</span>
            </button>
        </div>
    </div>
</template>