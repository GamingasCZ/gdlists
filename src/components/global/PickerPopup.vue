<script setup lang="ts">
import type { FavoritedLevel } from '@/interfaces';
import { ref } from 'vue';


const emit = defineEmits(['closePopup', 'selectOption'])
const props = defineProps<{
    browserName: string
}>()

const data = ref<FavoritedLevel[]>(JSON.parse(localStorage.getItem('favorites')!))
const filteredData = ref<FavoritedLevel[]>([])
filteredData.value = data.value

</script>

<template>
  <dialog
    open
    @click="emit('closePopup')"
    tabindex="0"
    @keyup.esc="emit('closePopup')"
  >
  <section
      @click.stop=""
      class="absolute top-1/2 left-1/2 w-[35rem] max-w-[95vw] h-[40rem] max-h-[95vh] flex flex-col -translate-x-1/2 -translate-y-1/2 rounded-lg bg-greenGradient p-2 text-white shadow-lg shadow-black"
    >
      <div class="relative">
        <h1 class="text-xl font-bold text-center">{{ browserName }}</h1>
        <img
          src="@/images/close.svg"
          alt=""
          class="absolute top-0 right-0 w-6 button"
          @click="emit('closePopup')"
        />
      </div>
    <input type="text" placeholder="Hledat..." class="p-1 px-2 mt-1 w-full bg-white bg-opacity-10 rounded-full" @input="filteredData = data.filter(x => x.levelName.includes(($event.target as HTMLInputElement).value))">
    <main class="flex overflow-y-auto flex-col gap-1 p-1 mt-2 flex-grow-[1] bg-white bg-opacity-10 rounded-lg">
          <div v-if="!data.length" class="flex flex-col gap-3 justify-center items-center h-full text-xl opacity-30">
            <img src="@/images/savedMobHeader.svg" class="w-36">
            <h2>Neuložil jsi zatím žádné levely!</h2>
          </div>
          <div v-else-if="!filteredData.length" class="flex flex-col gap-3 justify-center items-center h-full text-xl opacity-30">
            <img src="@/images/searchOpaque.svg" class="w-36">
            <h2>Nebyly nalezeny žádné levely!</h2>
          </div>
        <button v-for="level in filteredData" :style="{backgroundColor: level.levelColor}" class="px-2 py-1 leading-4 text-left rounded-md button" @click="emit('selectOption', level)">
            <h3 class="font-bold">{{ level.levelName }}</h3>
            <h5 class="text-xs font-normal opacity-70">{{ level.creator }}</h5>
        </button>
    </main>
    </section>
  </dialog>
</template>
