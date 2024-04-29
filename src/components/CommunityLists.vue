<script setup lang="ts">
import { ref } from "vue";
import ListBrowser from "./global/ListBrowser.vue";
import { useRouter } from "vue-router";
import ListPreview from "./global/ListPreview.vue";
import ReviewPreview from "./global/ReviewPreview.vue";
import { useI18n } from "vue-i18n";
import { hasLocalStorage } from "@/siteSettings";

document.title = `${useI18n().t('listViewer.communityLists')} | ${useI18n().t('other.websiteName')}`

const props = defineProps<{
  query: string
  onlineType: "" | "user" | "hidden" | "collabs"
  isLoggedIn: boolean
  browserType: any
}>();

type Content = 'lists' | 'reviews'

const defaultContentType = () => {
  if (hasLocalStorage()) { 
    let lastTabSelected = sessionStorage.getItem("browserTab")
    if (lastTabSelected != null) return lastTabSelected as Content
    else return useRouter().currentRoute.value.path.split("/")[2] as Content
  } else return 'lists'
}


const contentType = ref<Content>(defaultContentType())
const userLists = ref<"" | "user" | "hidden" | "collabs">(props.onlineType);
const modifyContentType = (to: Content) => {
  contentType.value = to
  if (hasLocalStorage()) {
    sessionStorage.setItem("browserTab", contentType.value)
  }
}
</script>

<template>
  <nav class="flex mx-auto mt-3 max-w-7xl text-xl font-bold text-white overflow-clip rounded-md bg-greenGradient">
    <RouterLink @click="modifyContentType('lists')" to="/browse/lists" class="flex gap-2 px-4 hover:bg-opacity-10 hover:bg-black" :class="{'bg-black !bg-opacity-40': contentType == 'lists'}">
      <img src="../images/browseMobHeader.svg" alt="" class="w-5" />
      <span class="my-2">{{ $t('help.Lists') }}</span>
    </RouterLink>
    <RouterLink @click="modifyContentType('reviews')" to="/browse/reviews" class="flex gap-2 px-4 hover:bg-opacity-10 hover:bg-black" :class="{'bg-black !bg-opacity-40': contentType == 'reviews'}">
      <img src="../images/reviews.svg" alt="" class="w-5" />
      <span class="my-2">{{ $t('reviews.review') }}</span>
    </RouterLink>
  </nav>

  <ListBrowser
    online-browser
    :component="contentType == 'lists' ? ListPreview : ReviewPreview"
    :search="query"
    :online-type="userLists"
    :online-subtype="contentType"
    :is-logged-in="isLoggedIn"
    @switch-browser="userLists = $event"
  />
</template>
