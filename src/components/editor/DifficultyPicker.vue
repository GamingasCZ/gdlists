<script setup lang="ts">
import { levelList } from '@/Editor';
import { ref } from 'vue';

defineProps<{
  level: number
}>();

const emit = defineEmits<{
  (e: "update", newData: [number, number]): void
}>()

const faces = ref<string[]>([])
const rates = ref<string[]>([])
async function getDifficulties() {
  for (let i = 0; i <= 11; i++) {
    faces.value.push(import.meta.env.BASE_URL + `/faces/${i}.webp`)
  }
  
  let ratings = ['error', 'star', 'featured', 'epic', 'legendary', 'mythic']
  for (const rating in ratings) {
    rates.value.push(import.meta.env.BASE_URL + `/faces/${ratings[rating]}.webp`)
  }
}
getDifficulties()

</script>

<template>
  <section class="flex justify-between max-sm:flex-col">
    <div
      class="box-border flex flex-grow-[1] mx-1 items-center gap-3 overflow-x-auto overflow-y-clip"
    >
      <button
        v-for="(diff, index) in faces"
        :key="index"
        type="button"
        class="p-1 w-12 h-12 bg-opacity-40 rounded-md button aspect-square"
        @click="levelList.levels[level].difficulty[0] = index; emit('update', levelList.levels[level].difficulty)"
        :class="{ 'bg-black': index == levelList.levels[level].difficulty[0] }"
      >
        <img :src="diff" />
      </button>
    </div>
    <div
      class="box-border grid-cols-3 gap-1 justify-center mt-2 rounded-md min-w-ma max-sm:flex sm:grid"
    >
      <button
        type="button"
        class="p-1 w-10 bg-black bg-opacity-40 rounded-md aspect-square"
        v-for="(rate, index) in rates"
        @click="levelList.levels[level].difficulty[1] = index; emit('update', levelList.levels[level].difficulty)"
      >
        <img
          class="w-full button"
          :src="rate"
          :class="{ disabled: index != levelList.levels[level].difficulty[1] }"
        />
      </button>
    </div>
  </section>
</template>
