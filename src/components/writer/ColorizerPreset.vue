<script setup lang="ts">
import type { Stop } from '@/interfaces';
import chroma from 'chroma-js';
import Dropdown from '../ui/Dropdown.vue';
import { ref } from 'vue';

const emit = defineEmits<{
    (e: "edit"): void
    (e: "preview"): void
    (e: "optPicked", ind: number): void
}>()

const props = defineProps<{
    gradient: Stop[]
    name: string
    selected: boolean
    showEdit?: boolean
    showExtra?: boolean
    showPrev?: boolean
}>()

const gradientCSS = `linear-gradient(180deg, ${props.gradient.map(x => chroma.hsv(...x.color).hex()+` ${x.position*100}%`).join(",")})`
const moreButton = ref<HTMLButtonElement>()
const moreOpened = ref(false)

</script>

<template>
<button class="flex flex-col gap-2">
    <div class="relative w-28 h-36 rounded-md border-2 border-black ring-4 group" :class="{'ring-lof-300': !selected, 'ring-lof-400': selected}" :style="{background: gradientCSS}">
        <button @click.stop="emit('edit')" v-if="showEdit" class="absolute right-1 bottom-1 p-1 bg-black bg-opacity-60 rounded-md opacity-0 transition-opacity duration-75 group-hover:opacity-100 button">
            <img src="@/images/edit.svg" class="w-4" alt="">
        </button>

        <button @click.stop="emit('preview')" v-if="showPrev" class="absolute left-1 bottom-1 p-1 bg-black bg-opacity-60 rounded-md opacity-0 transition-opacity duration-75 group-hover:opacity-100 button">
            <img src="@/images/view.svg" class="w-4" alt="">
        </button>

        <button @click.stop="moreOpened = true" ref="moreButton" v-if="showExtra" :style="{opacity: moreOpened ? 1 : undefined}" class="absolute top-1 right-1 p-1 bg-black bg-opacity-60 rounded-md opacity-0 transition-opacity duration-75 group-hover:opacity-100 button">
            <img src="@/images/more.svg" class="w-4" alt="">
        </button>
        <Dropdown @picked-option="emit('optPicked', $event)" v-if="moreOpened" no-teleport @close="moreOpened = false" :button="moreButton" :options="[$t('other.export'), $t('other.duplicate'), $t('editor.remove')]" />
    </div>
    <span class="">{{ name || $t('other.unnamesd') }}</span>
</button>
</template>