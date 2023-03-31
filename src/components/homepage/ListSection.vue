<script setup lang="ts">
import axios, { type AxiosResponse } from 'axios';
import { ref } from 'vue'
import type { ListPreview } from '../../interfaces'
import ListPreviewElement from '../global/ListPreview.vue'


const props = defineProps({
  headerName: {type: String, required: true},
  extraText: {type: String, required: true},
  extraIcon: {type: String, required: true},
  emptyText: {type: String, required: true}
})

const getImage = () => new URL(`../../images/${props.extraIcon}.svg`, import.meta.url).toString()

const lists = ref<ListPreview[]>()

axios.get("http://localhost:8000/php/getLists.php?homepage=1").then((response: AxiosResponse) => lists.value = (response.data[0] as ListPreview[]))
</script>

<template>
  <section class="mt-6 ml-4">
    <div class="flex gap-4 items-center text-white">
      <img src="../../images/wave.svg" class="w-10 max-sm:w-5" alt="" />
      <span class="text-3xl font-bold">{{ headerName }}</span>
      <button
        v-if="extraText?.length! > 0"
        class="flex gap-2 px-2 py-0.5 ml-2 rounded-full button bg-lof-300"
      >
        <img :src="getImage()" alt="" class="w-5" />{{ extraText }}
      </button>
    </div>

    <div class="mt-2 max-sm:w-[95%] max-sm:text-xs sm:ml-14 flex flex-col gap-3">
      <p class="text-yellow-200" v-if="!lists?.length">- {{ emptyText }} -</p>
      <ListPreviewElement v-else v-for="list in lists" v-bind="list"/>
    </div>
  </section>
</template>
