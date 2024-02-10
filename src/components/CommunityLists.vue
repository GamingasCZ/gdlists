<script setup lang="ts">
import { ref } from "vue";
import ListBrowser from "./global/ListBrowser.vue";
import router from "@/router";
import { useRouter } from "vue-router";
import ListPreview from "./global/ListPreview.vue";


const props = defineProps<{
  query: string
  onlineType: "" | "user" | "hidden"
  isLoggedIn: boolean
  browserType: any
}>();

const contentType = ref(useRouter().currentRoute.value.path.split("/")[2])
const userLists = ref<"" | "user" | "hidden">(props.onlineType);
</script>

<template>
  <nav class="flex mx-auto mt-3 max-w-7xl text-xl font-bold text-white overflow-clip rounded-md bg-greenGradient">
    <RouterLink to="/browse/lists" class="flex gap-2 px-4 hover:bg-opacity-10 hover:bg-black" :class="{'bg-black !bg-opacity-40': $route.params.type == 'lists'}">
      <img src="../images/browseMobHeader.svg" alt="" class="w-5" />
      <span class="my-2">Seznamy</span>
    </RouterLink>
    <RouterLink to="/browse/reviews" class="flex gap-2 px-4 hover:bg-opacity-10 hover:bg-black" :class="{'bg-black !bg-opacity-40': $route.params.type == 'reviews'}">
      <img src="../images/reviews.svg" alt="" class="w-5" />
      <span class="my-2">Recenze</span>
    </RouterLink>
  </nav>

  <ListBrowser
    online-browser
    :component="ListPreview"
    :search="query"
    :online-type="userLists"
    :online-subtype="contentType"
    :is-logged-in="isLoggedIn"
    @switch-browser="userLists = $event"
  />
</template>
