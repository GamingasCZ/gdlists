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
import LevelPreview from "../global/LevelPreview.vue"

const props = defineProps({
  headerName: { type: String, required: true },
  extraText: { type: String, required: false },
  extraIcon: { type: String, required: false },
  extraAction: { type: String, required: false },
  emptyText: { type: String, required: true },
  contentType: { type: String },
  listType: { type: Number, default: 0 },
  randomizeContent: { type: Boolean, default: false },
  maxItems: {type: Number, default: 4},
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
  <section v-if="lists?.length" class="mt-6">
    <div class="flex gap-4 justify-center items-center text-white">
      <!-- <img src="../../images/wave.svg" class="w-10 max-sm:w-8" alt="" /> -->
      <span class="mt-4 w-full text-3xl font-bold">{{ headerName }}</span>

      <!-- Link button -->

      <!-- <RouterLink
        v-if="extraText?.length! > 0 && extraAction?.startsWith('/')"
        :to="extraAction"
        class="flex gap-2 px-2 py-0.5 rounded-md button bg-lof-300 selectOutline"
        >
        <img :src="getImage()" alt="" class="w-5" />{{ extraText }}
      </RouterLink> -->

      <!-- Action button -->
      <!-- <button
        v-if="extraText?.length! > 0 && extraAction?.startsWith('@')"
        class="flex gap-2 px-2 py-0.5 rounded-md button bg-lof-300 selectOutline"
        @click="clearViewed()"
      >
        <img :src="getImage()" alt="" class="w-5" />{{ extraText }}
      </button> -->
    </div>

    <div
      class="grid overflow-x-auto grid-cols-4 gap-3 mt-2 max-w-8xl max-sm:text-xs"
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
        :is="[ReviewPreview, LevelPreview, ReviewPreview][listType]"
        @unpin-list="lists.splice($event, 1)"
      />
    </div>
  </section>
</template>
