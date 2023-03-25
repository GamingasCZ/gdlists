<script setup lang="ts">

const emit = defineEmits(["hueChange", "valChange"])

</script>

<template>
    <section class="w-full">
        <div>
            <img src="@/images/rgb.webp" alt="" class="w-full h-6 rounded-md">
            <input type="range" class="colorPickerSlider w-full" min="0" max="360" @input="emit('hueChange', ($event.target as HTMLInputElement).value)">
        </div>

        <div>
            <img src="@/images/value.webp" alt="" class="w-full h-6 rounded-md">
            <input type="range" class="colorPickerSlider w-full" min="0" max="32" @input="emit('valChange', ($event.target as HTMLInputElement).value)">
        </div>
    </section>
</template>