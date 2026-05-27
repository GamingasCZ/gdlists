<script setup lang="ts">
import { ref } from "vue";
import ListBrowser from "./global/ListBrowser.vue";
import { onBeforeRouteUpdate, useRoute, useRouter } from "vue-router";
import ReviewPreview from "./global/ReviewPreview.vue";
import { useI18n } from "vue-i18n";
import { hasLocalStorage } from "@/siteSettings";
import LevelPreview from "./global/LevelPreview.vue";
import TemporaryList from "./global/TemporaryList.vue";
import { Teleport } from "vue";
import { lastTab, modLastTab, selectedLevels } from "@/Editor";
import SavedCollab from "./editor/SavedCollab.vue";

document.title = `${useI18n().t('listViewer.communityLists')} | ${useI18n().t('other.websiteName')}`

const props = defineProps<{
  query: string
  onlineType: "" | "user" | "hidden" | "collabs"
  isLoggedIn: boolean
  browserType: any
}>();

type Content = 0 | 1 | 2 | 3
const CONTENTS = ['lists', 'reviews', 'levels', 'saved']

const defaultContentType = () => {
  if (hasLocalStorage()) { 
    let route = CONTENTS.indexOf(useRoute().path.split("/")[2])
    if (lastTab[0] != null) return lastTab[0]
    else return route == -1 ? 0 : route
  } else return 0
}


const contentType = ref<Content>(defaultContentType())
type TypeUserLists = ("" | "user" | "hidden" | "collabs") 
const userLists = ref<TypeUserLists>(lastTab[1] ?? props.onlineType);
const modifyContentType = (to: Content, type: TypeUserLists = '') => {
  contentType.value = to
  userLists.value = type
  if (hasLocalStorage()) {
    modLastTab([contentType.value, userLists.value])
  }
}

const switchUserLists = (user: string) => {
  userLists.value = user
  modLastTab([contentType.value, userLists.value])
}

onBeforeRouteUpdate(route => {
  let path = route.path.split("/")?.[2] || 'lists'
  let query = route.query?.type ?? ""
  modifyContentType(CONTENTS.indexOf(path), query)
})

</script>

<template>
  <section class="p-2 mt-2">
    <ListBrowser
      :online-browser="contentType != 3"
      :component="[ReviewPreview, ReviewPreview, LevelPreview, userLists == 'collabs' ? SavedCollab : LevelPreview][contentType]"
      :search="query"
      :online-type="userLists"
      :online-subtype="CONTENTS[contentType]"
      :is-logged-in="isLoggedIn"
      :display-in-rows="contentType == 3 && userLists == 'collabs'"
      @switch-browser="switchUserLists"
    />
  </section>

  <Teleport to="body">
    <Transition name="fadeSlide">
      <TemporaryList v-if="selectedLevels.length" />
    </Transition>
  </Teleport>
</template>
