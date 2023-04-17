<script setup lang="ts">
defineProps({
  selectedFace: Number,
  selectedRate: Number,
});

const emit = defineEmits(["changeRate", "changeFace"]);

function getDiffImage(ind: string) {
  return new URL(`/public/faces/${ind}.webp`, import.meta.url).href;
}
</script>

<template>
  <section class="flex justify-between">
    <div
      class="box-border flex flex-grow-[1] items-center gap-3 overflow-x-auto"
    >
      <button
        v-for="diff in 12"
        :key="diff"
        type="button"
        class="p-1 w-12 h-12 bg-opacity-40 rounded-md button aspect-square"
        @click="emit('changeFace', diff - 1)"
        :class="{ 'bg-black': diff - 1 == selectedFace }"
      >
        <img :src="getDiffImage((diff - 1).toString())" />
      </button>
    </div>
    <div
      class="box-border grid grid-cols-2 gap-1 p-2 min-w-max bg-black bg-opacity-20 rounded-md"
    >
      <button
        type="button"
        class="p-1 w-10 bg-black bg-opacity-20 rounded-md aspect-square"
        v-for="(rate, index) in ['error', 'star', 'featured', 'epic']"
        @click="emit('changeRate', index)"
      >
        <img
          class="button"
          :src="getDiffImage(rate)"
          :class="{ disabled: index != selectedRate }"
        />
      </button>
    </div>
  </section>
</template>
