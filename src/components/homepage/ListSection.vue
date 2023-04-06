<script setup lang="ts">
import axios, { type AxiosResponse } from "axios";
import { ref } from "vue";
import type { ListPreview } from "../../interfaces";
import ListPreviewElement from "../global/ListPreview.vue";

const props = defineProps({
  headerName: { type: String, required: true },
  extraText: { type: String, required: true },
  extraIcon: { type: String, required: true },
  emptyText: { type: String, required: true },
  contentType: { type: String },
});

const lists = ref<ListPreview[]>();

if (props.contentType?.startsWith("/")) {
  // link
  axios
    .get("http://localhost:8000/php" + props.contentType)
    .then(
      (response: AxiosResponse) =>
        (lists.value = response.data[0] as ListPreview[])
    );
} else if (props.contentType?.startsWith("@")) {
  lists.value = JSON.parse(localStorage.getItem(props.contentType.slice(1))!);
} else {
  lists.value = [];
}

const getImage = () =>
  new URL(`../../images/${props.extraIcon}.svg`, import.meta.url).toString();

const clearViewed = () => {
  localStorage.setItem("recentlyViewed", "[]");
  lists.value = []
}
</script>

<template>
  <section class="mt-6 ml-4">
    <div class="flex gap-4 items-center text-white">
      <img src="../../images/wave.svg" class="w-10 max-sm:w-8" alt="" />
      <span class="text-2xl font-medium sm:text-3xl">{{ headerName }}</span>
      <button
        v-if="extraText?.length! > 0"
        class="flex gap-2 px-2 py-0.5 ml-2 rounded-full button bg-lof-300"
        @click="clearViewed()"
      >
        <img :src="getImage()" alt="" class="w-5" />{{ extraText }}
      </button>
    </div>

    <div
      class="mt-2 flex flex-col gap-3 max-sm:w-[95%] max-sm:text-xs sm:ml-14"
    >
      <p class="text-yellow-200 max-sm:ml-12" v-if="!lists?.length">- {{ emptyText }} -</p>
      <ListPreviewElement v-else v-for="list in lists" v-bind="list" class="max-sm:w-full" />
    </div>
  </section>
</template>
