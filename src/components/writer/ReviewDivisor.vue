<script setup lang="ts">
import Resizer from '../global/Resizer.vue';


const props = defineProps<{
    settings: object
    editable: boolean
}>()

</script>

<template>
    <div class="w-full group">
        <Resizer :editable="editable" class="min-w-full" @resize="settings.sizeY = $event" :min-size="16" :max-size="250" gizmo-pos="vertical">
            <hr :style="{ margin: `${Math.floor(settings.sizeY/2)}px 0`, opacity: settings.visible ? 0.5 : 0 }"
                class="px-4 m-auto w-full h-1 bg-transparent rounded-full backdrop-invert">
        </Resizer>
    </div>
</template>