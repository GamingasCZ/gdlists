<script setup lang="ts">
import { SETTINGS } from "@/siteSettings";
import chroma from "chroma-js";
import { onMounted, ref, watch } from "vue";

const props = defineProps<{
  hue?: number;
  saturation?: number;
  lightness?: number;
  hex?: string;
}>()

const emit = defineEmits(["colorsModified"]);
const colors = ref([props.hue ?? 0, props.saturation ?? 1, props.lightness ?? 0]);
const colorsHex = ref(props.hex ?? chroma.hsl(props.hue, props.saturation, props.lightness).hex())

const modColors = (ind: number, val: number) => {
  colors.value[ind] = val
  colorsHex.value = chroma.hsl(colors.value[0], colors.value[1], colors.value[2]/64).hex()
  emit('colorsModified', props.hex ? colorsHex.value : colors.value)
}

onMounted(() => {
  if (!props.hex) {
    colors.value = [props.hue, props.saturation, props.lightness]
    colorsHex.value = chroma.hsl(props.hue, props.saturation, props.lightness).hex()
  }
  else {
    colors.value = chroma(props.hex).hsl()
    colors.value[2] *= 64
    colorsHex.value = props.hex
  }
}
)
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
        :value="colors[0]"
        @input="modColors(0, parseInt($event.target?.value))"
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
        :value="colors[2]"
        @input="modColors(2, parseInt($event.target?.value))"
      />
    </div>
    <div class="flex gap-2" v-if="SETTINGS.disableColors">
      <div :style="{background: colorsHex}" class="w-10 h-10 rounded-full"></div>
      <div>
        <h2 class="text-xl leading-none">{{ $t('other.colorPreview') }}</h2>
        <span class="text-sm opacity-40">{{ $t('other.nocolorHelp') }}</span>
      </div>
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