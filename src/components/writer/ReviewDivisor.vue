<script setup lang="ts">
import { computed, inject } from 'vue';
import Resizer from '../global/Resizer.vue';
import containers, { type cDivisor } from './containers';
import type { Ref } from 'vue';
import type { PostData } from '@/interfaces';
import chroma from 'chroma-js';


const props = defineProps<{
    settings: cDivisor
    editable: boolean
}>()

const size = containers.divisor.settings[1].valueRange
const base = import.meta.env.BASE_URL
const postData = inject<Ref<PostData>>("postData")

const bg = computed(() => `url(${base}/divThemes/${props.settings?.style ?? 0}.svg)`)
const color = computed(() => {
    switch (+props?.settings?.color) {
        case 0: return postData?.value?.whitePage ? '#00000080' : '#FFFFFF50'
        case 1: return postData?.value?.whitePage ? '#000000' : '#FFFFFF'
        case 2: return 'var(--brightGreen)'
        case 3:
            let to = chroma((postData?.value.pageBGcolor as number[])[0], 0.53, 0.63, 'hsl').set('hsl.h', '+90')
            return `linear-gradient(90deg, var(--brightGreen), ${to})`
        default: return postData?.value?.whitePage ? '#00000080' : '#FFFFFF50'
    }
})

</script>

<template>
    <div class="w-full group">
        <Resizer :editable="editable" class="min-w-full" @resize="settings.sizeY = $event" :min-size="size[0]" :max-size="size[1]" gizmo-pos="vertical">
            <hr
                :style="{
                    margin: `${Math.floor(settings.sizeY/2)}px 0`,
                    opacity: settings.visible ? 1 : 0,
                }"
                class="relative h-3 border-none bong"
            >
        </Resizer>
    </div>
</template>

<style>

.bong::after {
    @apply absolute inset-0 content-[''];
    background: v-bind(color);
    mask-image: v-bind(bg);
    mask-repeat: round;
    mask-size: contain;
}

</style>