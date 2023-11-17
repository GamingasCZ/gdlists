<script setup lang="ts">
import type { CollabHumans } from '@/interfaces';
import chroma from 'chroma-js';
import { computed } from 'vue';


const props = defineProps<{
    roleName: string
    humans: CollabHumans[]
}>()

const humColor = (col: string | [number, number, number]) => {
    if (typeof col == 'string') return col
    else return chroma.hsl(...col).hex()
}

</script>

<template>
    <section class="p-2 bg-black bg-opacity-40 rounded-md">
        <h2 class="ml-6 text-xl font-bold">{{ roleName }}</h2>
        <div class="flex gap-2 items-center mt-1 w-full">
            <span class="text-xs">0%</span>
            <div class="flex h-6 overflow-clip bg-black bg-opacity-40 rounded-md grow">
                <div class="h-full" :style="{width: `${human.part[1] - human.part[0]}%`, background: humColor(human.color)}" v-for="human in humans"></div>
            </div>
            <span class="text-xs">100%</span>
        </div>
    </section>
</template>