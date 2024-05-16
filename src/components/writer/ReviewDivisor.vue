<script setup lang="ts">
import Resizer from '../global/Resizer.vue';


const props = defineProps<{
    settings: object
}>()

</script>

<template>
    <div :style="{height: `${settings.sizeY}px`}" class="flex justify-center grow">
        <Resizer class="w-full">
            <hr :style="{opacity: settings.visible ? 0.5 : 0}" class="px-4 m-auto w-full h-1 bg-white bg-none rounded-full">
        </Resizer>
    </div>
</template>