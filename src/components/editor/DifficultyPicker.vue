<script setup lang="ts">
import { ref } from 'vue';

defineProps({
  selectedFace: Number,
  selectedRate: Number,
});

const emit = defineEmits(["changeRate", "changeFace"]);

const faces = ref<string[]>([])
const rates = ref<string[]>([])
async function getDifficulties() {
  for (let i = 0; i <= 11; i++) {
    faces.value.push(await import(`../../images/faces/${i}.webp`).then(res => res.default))
  }
  
  ['error', 'star', 'featured', 'epic'].forEach(async rating => {
    rates.value.push(await import(`../../images/faces/${rating}.webp`).then(res => res.default))
  });
}
getDifficulties()
</script>

<template>
  <section class="flex justify-between">
    <div
      class="box-border flex flex-grow-[1] mx-1 items-center gap-3 overflow-x-auto"
    >
      <button
        v-for="(diff, index) in faces"
        :key="index"
        type="button"
        class="p-1 w-12 h-12 bg-opacity-40 rounded-md button aspect-square"
        @click="emit('changeFace', index)"
        :class="{ 'bg-black': index == selectedFace }"
      >
        <img :src="diff" />
      </button>
    </div>
    <div
      class="box-border grid grid-cols-2 gap-1 min-w-max rounded-md"
    >
      <button
        type="button"
        class="p-1 w-10 bg-black bg-opacity-40 rounded-md aspect-square"
        v-for="(rate, index) in rates"
        @click="emit('changeRate', index)"
      >
        <img
          class="button"
          :src="rate"
          :class="{ disabled: index != selectedRate }"
        />
      </button>
    </div>
  </section>
</template>
