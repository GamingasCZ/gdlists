<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{
  hue: number;
  saturation: number;
  lightness: number;
}>()

const emit = defineEmits(["colorsModified"]);
const colors = ref([props.hue, props.saturation, props.lightness]);
watch(props, () => colors.value = [props.hue, props.saturation, props.lightness])
</script>

<template>
  <section class="w-full">
    <div>
      <img src="@/images/rgb.webp" alt="" class="w-full h-6 rounded-md pointer-events-none" />
      <input
        type="range"
        class="w-full colorPickerSlider"
        min="0"
        max="360"
        step="1"
        v-model.number="colors[0]"
        @input="emit('colorsModified', colors)"
      />
    </div>

    <div>
      <img src="@/images/value.webp" alt="" class="w-full h-6 rounded-md pointer-events-none" />
      <input
        type="range"
        class="w-full colorPickerSlider"
        min="0"
        max="32"
        step="1"
        v-model.number="colors[2]"
        @input="emit('colorsModified', colors)"
      />
    </div>
  </section>
</template>
