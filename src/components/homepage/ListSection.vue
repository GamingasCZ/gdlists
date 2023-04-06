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

const clearViewed = () => localStorage.setItem("recentlyViewed", "[]");
</script>

<template>
  <section class="mt-6 ml-4">
    <div class="flex items-center gap-4 text-white">
      <img src="../../images/wave.svg" class="w-10 max-sm:w-5" alt="" />
      <span class="text-3xl font-bold">{{ headerName }}</span>
      <button
        v-if="extraText?.length! > 0"
        class="button ml-2 flex gap-2 rounded-full bg-lof-300 px-2 py-0.5"
        @click="clearViewed()"
      >
        <img :src="getImage()" alt="" class="w-5" />{{ extraText }}
      </button>
    </div>

    <div
      class="mt-2 flex flex-col gap-3 max-sm:w-[95%] max-sm:text-xs sm:ml-14"
    >
      <p class="text-yellow-200" v-if="!lists?.length">- {{ emptyText }} -</p>
      <ListPreviewElement v-else v-for="list in lists" v-bind="list" />
    </div>
  </section>
</template>
