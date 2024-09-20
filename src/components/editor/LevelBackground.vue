<script setup lang="ts">
import type { LevelList } from '@/interfaces';
import RadioPicker from '../ui/RadioPicker.vue';
import { computed, inject } from 'vue';

const props = defineProps<{
  cardIndex: number
  levelArray: LevelList
}>();

const gallery = inject("openedDialogs")
const bg = computed(() => props.levelArray.levels[props.cardIndex].background)


const openGallery = () => {
  gallery.value.imagePicker[0] = true
  gallery.value.imagePicker[1] = -5
  gallery.value.imagePicker[2] = props.cardIndex
}


</script>

<template>
  <div class="flex relative justify-between items-center">
    <img class="absolute h-full" :src="bg?.image[0]" alt="">
    <button @click="openGallery" class="flex items-center p-2 bg-black bg-opacity-40 rounded-md button">
      <img src="@/images/image.svg" class="mr-3 w-6" alt="">
      {{ $t('reviews.pick') }}
    </button>
    <input type="range" v-model="bg.opacity" step="0.05" min="0" max="1">
    <div class="flex flex-col grow">
      <span class="text-center">{{ $t('settingsMenu.visual') }}</span>
      <RadioPicker
        :opt-icons="[1,2,3,4].map(x => `/cardThemeIcons/theme${x}.svg`)"
        :opt-names="['Prolnutí', 'Výřez', 'Splynutí', 'Obarvení']"
        :img-width="48"
        id="cardThemeIcons"
        v-model="bg.theme"
      />
    </div>
  </div>
</template>