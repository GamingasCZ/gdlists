<script setup lang="ts">
import { ref, watch } from "vue";
import type {
  FavoritedLevel,
  ListCreatorInfo,
  ListPreview,
  ReviewDetailsResponse,
} from "../../interfaces";
import { oldLists } from "./officialLists";
import { hasLocalStorage } from "@/siteSettings";
import ReviewPreview from "../global/ReviewPreview.vue";
import List from "../global/ListPreview.vue";
import FavoritePreview from "../global/FavoritePreview.vue";

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

const clearViewed = () => {
  localStorage.setItem("recentlyViewed", "[]");
  lists.value = [];
};
</script>

<template>
  <section v-if="lists?.length" class="flex flex-col mt-6 w-full max-w-7xl">
    <component :is="extraAction ? (extraAction?.startsWith('@') ? 'button' : 'RouterLink') : 'div'" :to="extraAction" @click="extraAction?.startsWith('@') ? clearViewed() : null" class="flex gap-4 justify-between items-center px-1 py-2 my-2 w-full text-left text-white rounded-md" :class="{'hover:bg-white hover:bg-opacity-10': extraAction}">
      <img src="../../images/wave.svg" class="w-8" alt="" />
      <span class="w-full text-3xl font-bold">{{ headerName }}</span>
      <component v-if="extraAction">
        <img v-if="extraAction?.startsWith('@')" src="@/images/del.svg" class="w-7 invert" alt="">
        <img v-else src="@/images/arrow.svg" class="w-4" alt="">
      </component>
    </component>

    <div
      class="flex overflow-auto grid-cols-3 gap-3 max-w-full"
    >
      <p class="text-yellow-200" v-if="!lists?.length">
        - {{ emptyText }} -
      </p>
      <component
        v-else
        v-for="level in lists"
        v-bind="level"
        :is-list="listType == 0"
        :user-array="users"
        :hide-remove="true"
        :review-details="reviewDetails"
        :is="[ReviewPreview, FavoritePreview, ReviewPreview, List][listType]"
        @unpin-list="lists.splice($event, 1)"
      />
    </div>
  </section>
</template>
