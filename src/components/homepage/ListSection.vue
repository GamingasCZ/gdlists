<script setup lang="ts">
import axios, { type AxiosResponse } from "axios";
import { ref, watch } from "vue";
import type {
  FavoritedLevel,
  ListCreatorInfo,
  ListPreview,
  ReviewDetailsResponse,
} from "../../interfaces";
import FavoritePreview from "../global/FavoritePreview.vue";
import ListPreviewElement from "../global/ListPreview.vue";
import cookier from "cookier";
import { oldLists } from "./officialLists";
import { hasLocalStorage } from "@/siteSettings";
import ReviewPreview from "../global/ReviewPreview.vue";

const props = defineProps({
  headerName: { type: String, required: true },
  extraText: { type: String, required: false },
  extraIcon: { type: String, required: false },
  extraAction: { type: String, required: false },
  emptyText: { type: String, required: true },
  contentType: { type: String },
  listType: { type: Number, default: 0 },
  randomizeContent: { type: Boolean, default: false },
  maxItems: {type: Number, default: 3},
  forceContent: {type: Array}
});

const users = ref<ListCreatorInfo[]>();
const lists = ref<ListPreview[] | FavoritedLevel[]>();
const reviewDetails = ref<ReviewDetailsResponse>();

const refreshContent = () => {
  if (props.contentType?.startsWith("@")) {
    if (!hasLocalStorage()) lists.value = []
    else {
      let data: any[] = JSON.parse(
        localStorage.getItem(props.contentType.slice(1))!
      );
      if (props?.randomizeContent)
        data = data.sort(() => (Math.random() > 0.5 ? 1 : -1));

      lists.value = data.slice(0, props.maxItems);
    }
  } else if (props.contentType == "oldLists") {
    lists.value = oldLists;
  } else if (props.forceContent) {
    lists.value = props.forceContent[0]
    users.value = props.forceContent[1]
    if (props.listType == 2)
      reviewDetails.value = props.forceContent?.[4]
  } else {
    lists.value = [];
  }
}

watch(props, refreshContent)
refreshContent()

const getImage = () =>
  new URL(`../../images/${props.extraIcon}.svg`, import.meta.url).toString();

const clearViewed = () => {
  localStorage.setItem("recentlyViewed", "[]");
  lists.value = [];
};
</script>

<template>
  <section class="mt-6 ml-4">
    <div class="flex gap-4 items-center text-white">
      <img src="../../images/wave.svg" class="w-10 max-sm:w-8" alt="" />
      <span class="text-2xl font-medium sm:text-3xl">{{ headerName }}</span>

      <!-- Link button -->

      <RouterLink
        v-if="extraText?.length! > 0 && extraAction?.startsWith('/')"
        :to="extraAction"
        class="flex gap-2 px-2 py-0.5 rounded-md button bg-lof-300 selectOutline"
        >
        <img :src="getImage()" alt="" class="w-5" />{{ extraText }}
      </RouterLink>

      <!-- Action button -->
      <button
        v-if="extraText?.length! > 0 && extraAction?.startsWith('@')"
        class="flex gap-2 px-2 py-0.5 rounded-md button bg-lof-300 selectOutline"
        @click="clearViewed()"
      >
        <img :src="getImage()" alt="" class="w-5" />{{ extraText }}
      </button>
    </div>

    <div
      class="mt-2 flex flex-col gap-3 max-sm:w-[95%] max-sm:text-xs sm:ml-14"
      :class="{'!flex-row max-w-7xl flex-wrap': listType == 2}"
    >
      <p class="text-yellow-200 max-sm:ml-12" v-if="!lists?.length">
        - {{ emptyText }} -
      </p>
      <component
        v-else
        v-for="level in lists"
        v-bind="level"
        :user-array="users"
        :hide-remove="true"
        :review-details="reviewDetails"
        :is="[ListPreviewElement, FavoritePreview, ReviewPreview][listType]"
        @unpin-list="lists.splice($event, 1)"
      />
    </div>
  </section>
</template>
