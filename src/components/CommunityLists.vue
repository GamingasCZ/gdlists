<script setup lang="ts">
import { ref } from "vue";
import ListBrowser from "./global/ListBrowser.vue";
import { useRouter } from "vue-router";
import ListPreview from "./global/ListPreview.vue";
import ReviewPreview from "./global/ReviewPreview.vue";
import { useI18n } from "vue-i18n";
import { hasLocalStorage } from "@/siteSettings";
import LevelPreview from "./global/LevelPreview.vue";
import TemporaryList from "./global/TemporaryList.vue";
import { Teleport } from "vue";

document.title = `${useI18n().t('listViewer.communityLists')} | ${useI18n().t('other.websiteName')}`

const props = defineProps<{
  query: string
  onlineType: "" | "user" | "hidden" | "collabs"
  isLoggedIn: boolean
  browserType: any
}>();

type Content = 0 | 1 | 2
const CONTENTS = ['lists', 'reviews', 'levels']

const defaultContentType = () => {
  if (hasLocalStorage()) { 
    let lastTabSelected = sessionStorage.getItem("browserTab")
    if (lastTabSelected != null) return parseInt(lastTabSelected)
    else return CONTENTS.indexOf(useRouter().currentRoute.value.path.split("/")[2])
  } else return 0
}


const contentType = ref<Content>(defaultContentType())
const userLists = ref<"" | "user" | "hidden" | "collabs">(props.onlineType);
const modifyContentType = (to: Content) => {
  contentType.value = to
  if (hasLocalStorage()) {
    sessionStorage.setItem("browserTab", contentType.value.toString())
  }
}
</script>

<template>
  <section class="p-2">
    <nav class="flex mx-auto my-3 max-w-7xl text-xl font-bold text-white overflow-clip rounded-md bg-greenGradient">
      <RouterLink @click="modifyContentType(0)" to="/browse/lists" class="flex gap-2 px-4 hover:bg-opacity-10 hover:bg-black" :class="{'bg-black !bg-opacity-40': contentType == 0}">
        <img src="../images/browseMobHeader.svg" alt="" class="w-5" />
        <span class="my-2">{{ $t('help.Lists') }}</span>
      </RouterLink>
      <RouterLink @click="modifyContentType(1)" to="/browse/reviews" class="flex gap-2 px-4 hover:bg-opacity-10 hover:bg-black" :class="{'bg-black !bg-opacity-40': contentType == 1}">
        <img src="../images/reviews.svg" alt="" class="w-5" />
        <span class="my-2">{{ $t('reviews.review') }}</span>
      </RouterLink>
      <RouterLink @click="modifyContentType(2)" to="/browse/levels" class="flex gap-2 px-4 hover:bg-opacity-10 hover:bg-black" :class="{'bg-black !bg-opacity-40': contentType == 2}">
        <img src="../images/levelIcon.svg" alt="" class="w-5" />
        <span class="my-2">{{ $t('editor.levels') }}</span>
      </RouterLink>
    </nav>
  
    <ListBrowser
      online-browser
      :component="[ListPreview, ReviewPreview, LevelPreview][contentType]"
      :search="query"
      :online-type="userLists"
      :online-subtype="CONTENTS[contentType]"
      :is-logged-in="isLoggedIn"
      @switch-browser="userLists = $event"
    />
  </section>

  <Teleport to="body">
    <TemporaryList />
  </Teleport>
</template>
