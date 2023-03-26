<script setup lang="ts">
import { TAG_COUNT } from "../../Editor";
import type { LevelTag} from "../../interfaces";

const emit = defineEmits<{
    (e: 'closePopup'): void
    (e: 'addTag', tag: LevelTag): void
}>()
</script>

<template>
    <dialog class="fixed top-0 left-0 z-50 w-full h-full text-white bg-black bg-opacity-80 backdrop-saturate-0" open>
        <section class="max-w-[95vw] shadow-lg shadow-black w-max absolute top-1/2 left-1/2 p-2 rounded-lg -translate-x-1/2 -translate-y-1/2 bg-greenGradient">
            <div class="relative">
                <h1 class="text-xl font-bold text-center">Štítky</h1>
                <img src="@/images/close.svg" alt="" class="absolute top-0 right-0 w-6 button" @click="emit('closePopup')">
            </div>
            <div class="grid overflow-x-hidden overflow-y-auto grid-cols-2 sm:grid-cols-3 max-h-[85vh] gap-1 p-2 bg-black bg-opacity-20 rounded-lg">
                <button @click="emit('addTag', {tagID: tag-1, tagLink: '', tagName: ''})" v-for="tag in TAG_COUNT" :key="tag" type="button" class="flex gap-2 items-center p-1.5 text-sm bg-black bg-opacity-20 rounded-full button">
                    <img :src="'/src/images/badges/'+(tag-1)+'.svg'" alt="">{{ $t(`editor.tags[${tag-1}]`) }}
                </button>
            </div>
        </section>
    </dialog>
</template>