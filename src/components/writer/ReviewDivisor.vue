<script setup lang="ts">
import Resizer from '../global/Resizer.vue';


const props = defineProps<{
    settings: object
    editable: boolean
}>()

</script>

<template>
    <Resizer :editable="editable" class="w-full" @resize="settings.sizeY = $event" :min-size="16" :max-size="250" gizmo-pos="vertical">
        <div :style="{ height: `${settings.sizeY}px` }" class="flex justify-center grow">
            <hr :style="{ opacity: settings.visible ? 0.5 : 0 }"
                class="px-4 m-auto w-full h-1 bg-white bg-none rounded-full">
        </div>
    </Resizer>
</template>