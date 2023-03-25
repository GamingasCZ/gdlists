<script setup lang="ts">
import { ref } from 'vue'
import type { ListPreview } from '../../interfaces'
import ListPreviewElement from '../global/ListPreview.vue'

const props = defineProps({
  headerName: String,
  extraText: String,
  extraIcon: String,
  emptyText: String
})

const getImage = () => new URL(`../../images/${props.extraIcon}.svg`, import.meta.url).toString()

const lists = ref<ListPreview[]>([
  {
    name: 'Gamingas seznam',
    creator: 'g4mingas',
    rating: 1,
    uploadDate: 12,
    views: Math.ceil(Math.random() * 30)
  }
])
</script>

<template>
  <section class="ml-4 mt-6">
    <div class="flex items-center gap-4 text-white">
      <img src="../../images/wave.svg" class="w-10 max-sm:w-5" alt="" />
      <span class="text-3xl font-bold">{{ headerName }}</span>
      <button
        v-if="extraText?.length! > 0"
        class="button ml-2 flex gap-2 rounded-full bg-lof-300 py-0.5 px-2"
      >
        <img :src="getImage()" alt="" class="w-5" />{{ extraText }}
      </button>
    </div>

    <div class="mt-2 max-sm:w-[95%] max-sm:text-xs sm:ml-14">
      <p class="text-yellow-200" v-if="!lists.length">- {{ emptyText }} -</p>
      <ListPreviewElement v-else v-for="list in lists" v-bind="list" />
    </div>
  </section>
</template>
