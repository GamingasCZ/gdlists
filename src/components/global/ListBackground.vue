<script setup lang="ts">
import type { ListBackground } from '@/interfaces';
import { SETTINGS } from '@/siteSettings';

const props = defineProps<{
    imageData: ListBackground;
    listColor: [number, number, number];
    local?: boolean
}>()

const positionListBackground = () => ["left", "center", "right"][props.imageData?.[3]];
</script>

<template>
    <section v-if="imageData[0] && [0, 2].includes(SETTINGS.disableAllBGs)" :class="{'fixed left-0 top-0 w-screen h-screen': !local}" class="bg-cover -z-50" :style="{backgroundPositionY: `${imageData[1]}%`, backgroundPositionX: positionListBackground(), height: `${imageData[2]}%`, backgroundImage: `url(${imageData[0]})`}">
        <div v-if="imageData[4]" class="w-full h-full" :style="{backgroundImage: `linear-gradient(transparent, var(--siteBackground))`}"></div>

    </section>
</template>