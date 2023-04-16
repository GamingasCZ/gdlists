<script setup lang="ts">
import type { FavoritedLevel } from '@/interfaces';

defineProps<{
    data: FavoritedLevel
}>()

</script>
<template>
    <button :style="{backgroundColor: data.levelColor}" class="px-2 py-1 leading-4 text-left rounded-md button">
        <h3 class="font-bold">{{ data.levelName }}</h3>
        <h5 class="text-xs font-normal opacity-70">{{ data.creator }}</h5>
    </button>
</template>