<script setup lang="ts">
import { TAG_COUNT } from "../../Editor";
import type { LevelTag} from "../../interfaces";

const emit = defineEmits<{
    (e: 'closePopup'): void
    (e: 'addTag', tag: LevelTag): void
}>()
</script>

<template>
    <dialog open @click="emit('closePopup')" tabindex="0" @keyup.esc="emit('closePopup')">
        <section @click.stop="" class="max-w-[95vw] text-white shadow-lg shadow-black w-max absolute top-1/2 left-1/2 p-2 rounded-lg -translate-x-1/2 -translate-y-1/2 bg-greenGradient">
            <div class="relative">
                <h1 class="text-xl font-bold text-center">Štítky</h1>
                <img src="@/images/close.svg" alt="" class="absolute top-0 right-0 w-6 button" @click="emit('closePopup')">
            </div>
            <div class="grid overflow-x-hidden overflow-y-auto grid-cols-2 sm:grid-cols-3 max-h-[85vh] gap-1 p-2 bg-black bg-opacity-20 rounded-lg">
                <button @click="emit('addTag', [tag-1, '', ''])" v-for="tag in TAG_COUNT" type="button" class="flex gap-2 items-center p-1.5 text-sm bg-black bg-opacity-20 rounded-full button">
                    <img :src="'/src/images/badges/'+(tag-1)+'.svg'" alt="">{{ $t(`editor.tags[${tag-1}]`) }}
                </button>
            </div>
        </section>
    </dialog>
</template>