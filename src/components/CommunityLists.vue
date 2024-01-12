<script setup lang="ts">
import { ref } from "vue";
import ListBrowser from "./global/ListBrowser.vue";
import router from "@/router";
import { useRouter } from "vue-router";

const props = defineProps<{
  query: string
  onlineType: "" | "user" | "hidden"
  isLoggedIn: boolean
  browserType: any
}>();

const userLists = ref<"" | "user" | "hidden">(props.onlineType);
</script>

<template>
  <nav class="flex mx-auto mt-3 max-w-7xl text-xl font-bold text-white overflow-clip rounded-md bg-greenGradient">
    <RouterLink to="/browse/lists" class="flex gap-2 px-4 py-1 hover:bg-opacity-10 hover:bg-black" :class="{'bg-black !bg-opacity-40': $route.params.type == 'lists'}">
      <img src="../images/browseMobHeader.svg" alt="" class="w-6" />
      <span class="my-2">Seznamy</span>
    </RouterLink>
    <RouterLink to="/browse/reviews" class="flex gap-2 px-4 py-1 hover:bg-opacity-10 hover:bg-black" :class="{'bg-black !bg-opacity-40': $route.params.type == 'reviews'}">
      <img src="../images/reviews.svg" alt="" class="w-6" />
      <span class="my-2">Recenze</span>
    </RouterLink>
  </nav>

  <ListBrowser
    online-browser
    :search="query"
    :online-type="userLists"
    :is-logged-in="isLoggedIn"
    @switch-browser="userLists = $event"
  />
</template>
