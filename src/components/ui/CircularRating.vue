<script setup lang="ts">
import type { Color } from 'chroma-js';
import { ref } from 'vue';
import { computed } from 'vue';


const props = defineProps<{
    min: number
    max: number
    value: number
    color: string
    name: string
}>()

const rateGradient = computed(() => `conic-gradient(${props.color} ${parseInt(props.value/props.max*100)}%, black ${parseInt(props.value/props.max*100)}%)`)
const hovering = ref(false)

</script>

<template>
    <div @mouseenter="hovering = true" @mouseleave="hovering = false" :aria-valuenow="value" :aria-valuemin="min" :aria-valuemax="max" class="relative w-12 rounded-full aspect-square">
        <div class="absolute inset-0 bg-black bg-opacity-60 rounded-full"></div>
        <div :style="{background: rateGradient}" class="w-full h-full rounded-full circularCutout"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Transition name="fade">
                <p v-if="hovering" class="isolate absolute top-0 left-1/2 p-1 leading-3 bg-black bg-opacity-60 rounded-sm -translate-x-1/2">{{ name }}</p>
                <p v-else class="absolute top-1 left-1/2 leading-3 -translate-x-1/2">{{ name.slice(0, 2) }}</p>
            </Transition>
            <p v-if="value != -1" class="mt-3 text-lg font-bold">
                <span>{{ value }}</span>
                <span class="text-xs text-white text-opacity-40">/10</span>
            </p>
            <p v-else class="mt-3 text-lg font-bold text-red-500">
                <span>!</span>
            </p>
        </div>
    </div>
</template>

<style>

.circularCutout {
    mask-image: radial-gradient(transparent 50%, black 52%);
}

</style>