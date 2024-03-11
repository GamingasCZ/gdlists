<script setup lang="ts">
import type { ContainerSettings } from './containers';
import containers from './containers';

const emit = defineEmits<{
    (e: "remove"): void
}>()

defineProps<{
    settings: ContainerSettings[]
}>()

</script>

<template>
    <div class="absolute -top-1 -right-1 p-2 rounded-md rounded-tr-none bg-greenGradient">
        <div v-for="(setting, index) in settings" class="flex flex-col gap-4">
            <div class="flex flex-col">
                <label for="">{{ containers.showImage.settings[index].title }}</label>
                <input v-if="setting.type == 0" v-model="settings" class="px-2 py-0.5 bg-white bg-opacity-10 rounded-md" type="text">
            </div>

        </div>
        <div class="flex gap-1 justify-between mt-3">
            <button class="box-border p-1 w-9 bg-black bg-opacity-40 rounded-md hover:bg-opacity-60 aspect-square">
                <img src="@/images/moveUp.svg" class="mx-auto w-5 button" alt="">
            </button>
            <button class="box-border p-1 w-9 bg-black bg-opacity-40 rounded-md hover:bg-opacity-60 aspect-square">
                <img src="@/images/moveDown.svg" class="mx-auto w-5 button" alt="">
            </button>
            <button @click="emit('remove')" class="flex gap-1 items-center p-1 ml-6 text-xl font-bold text-black bg-red-400 rounded-md">
                <img src="@/images/del.svg" alt="" class="w-6">
                <span>{{ $t('editor.remove') }}</span>
            </button>
        </div>
    </div>
</template>