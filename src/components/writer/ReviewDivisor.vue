<script setup lang="ts">

const props = defineProps<{
    settings: object
}>()

</script>

<template>
    <div :style="{margin: `${settings.size}px 0`}">
        <hr :style="{opacity: settings.visible ? 0.5 : 0}" class="px-4 my-auto w-full h-1 bg-white bg-none rounded-full">
    </div>
</template>