<script setup lang="ts">
import { levelList } from '@/Editor';
import ColorPicker from '../global/ColorPicker.vue';
import chroma from 'chroma-js';
import { ref } from 'vue';

const emit = defineEmits<{
    (e: 'changeRole', creatorPos: number): void
}>()

defineProps<{
    name: string;
    role: number;
    color: [number, number, number];
    part: [number, number];
    socials: {
        0: number;
        1: string;
    }[];
    verified: number | number[];
    pos: number;
    levelIndex: number;
    roleColor: string;
}>()

const colorPickerOpen = ref(false)

</script>

<template>
    <section class="flex flex-col gap-2 items-center pl-2 overflow-clip bg-black rounded-md odd:bg-opacity-40 even:bg-opacity-20">
        <main class="flex gap-2 items-center w-full">
            <div class="flex w-full">
                <div class="flex gap-2 items-center">
                    <img src="@/images/unknownCube.svg" class="w-10" alt="">
                    <div class="flex flex-col gap-1">
                        <input type="text" maxlength="15" class="px-1 w-44 bg-black bg-opacity-40 rounded-sm" v-model="levelList.levels[levelIndex].creator[2][pos].name" placeholder="Jméno člena">
                        <section class="flex gap-1">
                            <button class="w-8 bg-gray-600 rounded-sm button">
                                <img src="../../images/plus.svg" class="box-border p-0.5 mx-auto h-4" alt="">
                            </button>
                        </section>
                    </div>
                    <button class="bg-black bg-opacity-40 rounded-md">
                        <img src="@/images/searchOpaque.svg" class="box-border p-1 w-8" alt="">
                    </button>
                </div>
    
                <section class="flex flex-col items-center ml-[10%]">
                    <h3>Role</h3>
                    <button class="relative px-1 w-40 rounded-md button" :style="{backgroundColor: roleColor}" @click="emit('changeRole', pos)">
                        {{ levelList.levels[levelIndex].creator[1][role] || 'Bezejmenná' }}
                        <img src="@/images/edit.svg" class="box-border inline absolute right-0.5 top-1/2 p-0.5 ml-auto w-4 bg-black bg-opacity-40 rounded-md -translate-y-1/2" alt="">
                    </button>
                </section>
                <section class="flex flex-col items-center ml-[10%]">
                    <h3>Část</h3>
                    <div>
                        <input class="w-8 bg-black bg-opacity-40 rounded-md" type="text" :value="`${part[0]}%`">
                        <input class="w-8 bg-black bg-opacity-40 rounded-md" type="text" :value="`${part[1]}%`">
                    </div>
                </section>
            </div>
    
            <div class="flex gap-2 items-center ml-auto">
                <button class="flex justify-center items-center w-10 h-10 rounded-md border-4 border-white border-solid button"
                    :style="{backgroundColor: chroma.hsl(...color).hex()}"
                    @click="colorPickerOpen = !colorPickerOpen">
                    <img src="@/images/color.svg" class="w-6" alt="">
                </button>
                <div class="flex flex-col">
                    <button class="w-7 bg-yellow-500"><img class="box-border p-1" src="@/images/copy.svg" alt=""></button>
                    <button class="w-7 bg-red-600"><img class="box-border p-1" src="@/images/trash.svg" alt=""></button>
                </div>
            </div>
        </main>
        <Transition name="fade">
            <ColorPicker v-if="colorPickerOpen" :hue="color[0]" :lightness="color[2]" :saturation="color[1]" @colors-modified="levelList.levels[levelIndex].creator[2][pos].color = $event" />
        </Transition>
    </section>
</template>