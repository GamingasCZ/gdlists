<script setup lang="ts">
import type { CollabHumans } from '@/interfaces';
import chroma from 'chroma-js';
import { computed, inject, ref, watch } from 'vue';
import PlayerIcon from '../global/PlayerIcon.vue';


const props = defineProps<{
    roleName: string
    humans: CollabHumans[]
    allRoles: string[]
}>()

const humColor = (col: string | [number, number, number]) => {
    if (typeof col == 'string') return col
    else return chroma.hsl(...col).hex()
}

const hovering = inject<CollabHumans | null>("collabHovering")!

let roles = props.humans.filter(h => h.role == props.allRoles.indexOf(props.roleName))

</script>

<template>
    <section class="p-2 bg-black bg-opacity-40 rounded-md">
        <div class="flex justify-between items-center mr-10 ml-6 text-xl font-bold">
            <h2>{{ roleName }}</h2>
            <div v-if="hovering != null && allRoles[hovering.role] == roleName" class="flex gap-2 items-center">
                <PlayerIcon
                    v-if="hovering.verified[1]"
                    :icon="hovering.verified[0]" :col1="hovering.verified[1].toString()" :col2="hovering.verified[2].toString()" :glow="hovering.verified[3]" :quality="1.5"
                    class="w-6 h-6"
                />
                <h2>{{ hovering.name }}</h2>
            </div>
        </div>
        <div class="flex gap-2 items-center mt-1 w-full">
            <span class="text-xs">0%</span>
            <div class="flex relative h-6 overflow-clip bg-black bg-opacity-40 rounded-md grow">
                <div @mouseenter="hovering = human" @mouseleave="hovering = null" class="absolute h-full transition-opacity" :class="{'opacity-30': hovering != null && human != hovering}" :style="{width: `${human.part[1] - human.part[0]}%`, background: humColor(human.color), left: `${human.part[0]}%`}" v-for="(human, ind) in roles"></div>
            </div>
            <span class="text-xs">100%</span>
        </div>
    </section>
</template>