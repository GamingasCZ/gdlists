<script setup lang="ts">
import { ref } from "vue";

const emit = defineEmits(["colorsModified"]);
const color = ref<[number, number]>([180, 16]);

const giveValue = (
  modifyingValue: "hueChange" | "valChange",
  setValue: number
) => {
  color.value[modifyingValue == "valChange" ? 1 : 0] = setValue;

  emit("colorsModified", color.value);
};
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
        :value="color[0]"
        @input="
          giveValue(
            'hueChange',
            parseInt(($event.target as HTMLInputElement).value)
          )
        "
      />
    </div>

    <div>
      <img src="@/images/value.webp" alt="" class="w-full h-6 rounded-md pointer-events-none" />
      <input
        type="range"
        class="w-full colorPickerSlider"
        min="0"
        max="32"
        :value="color[1]"
        @input="
          giveValue(
            'valChange',
            parseInt(($event.target as HTMLInputElement).value)
          )
        "
      />
    </div>
  </section>
</template>
