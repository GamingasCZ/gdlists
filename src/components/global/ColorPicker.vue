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

<style scoped>
.colorPickerSlider {
  appearance: none;
  background: none;
  transform: translateY(-0.2rem);
  height: 2rem;
}
.colorPickerSlider::-moz-range-track {
  appearance: none;
  background: rgba(0, 0, 0, 0.43);
  border: none;
  outline: none;
  height: 0.3rem;
  border-radius: 0.25rem;
}
.colorPickerSlider::-moz-range-thumb {
  cursor: pointer;
  appearance: none;
  border: none;
  background: url("@/images/picker.svg");
  width: 1.1rem;
  height: 1.5rem;
  background-size: cover;
  transform: none;
  transition: transform 0.05s ease-in-out;
}

.colorPickerSlider::-moz-range-thumb:active { transform: scale(1.2) translateY(-0.2rem); }

.colorPickerSlider::-webkit-slider-runnable-track {
  appearance: none;
  background: rgba(0, 0, 0, 0.43);
  border: none;
  outline: none;
  height: 0.3rem;
  border-radius: 0.25rem;
}
.colorPickerSlider::-webkit-slider-thumb {
  cursor: pointer;
  appearance: none;
  border: none;
  background: url("@/images/picker.svg");
  width: 1.25rem;
  height: 1.8rem;
  background-size: cover;
  transform: translateY(-0.8rem);
  transition: transform 0.05s ease-in-out;
}

.colorPickerSlider::-webkit-slider-thumb:active { transform: scale(1.1) translateY(-1rem); }

</style>