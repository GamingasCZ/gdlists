<script setup lang="ts">
import { onMounted, ref } from "vue";
import ListBrowser from "./global/ListBrowser.vue";
import { onBeforeRouteUpdate, useRoute } from "vue-router";
import ReviewPreview from "./global/ReviewPreview.vue";
import { useI18n } from "vue-i18n";
import LevelPreview from "./global/LevelPreview.vue";
import TemporaryList from "./global/TemporaryList.vue";
import { Teleport } from "vue";
import { selectedLevels } from "@/Editor";

document.title = `${useI18n().t('listViewer.communityLists')} | ${useI18n().t('other.websiteName')}`

const props = defineProps<{
  query: string
  isLoggedIn: boolean
}>();

const contentType = ref(0)
const userLists = ref('')
const CONTENTS = ['lists', 'reviews', 'levels']

const applyRoute = route => {
  if (route.path.includes('lists'))
    contentType.value = 0
  else if (route.path.includes('reviews'))
    contentType.value = 1
  else if (route.path.includes('levels'))
    contentType.value = 2

  switch (route.query?.type) {
    case 'user':
      userLists.value = 'user'
      break;
    case 'hidden':
      userLists.value = 'hidden'
      break;
    default:
      userLists.value = ''
  }
}

onBeforeRouteUpdate(applyRoute)
applyRoute(useRoute())

</script>

<template>
  <section class="p-2 mt-2">
    <ListBrowser
      :online-browser="true"
      :component="[ReviewPreview, ReviewPreview, LevelPreview][contentType]"
      :search="query"
      :online-type="userLists"
      :online-subtype="CONTENTS[contentType]"
      :is-logged-in="isLoggedIn"
    />
  </section>

  <Teleport to="body">
    <Transition name="fadeSlide">
      <TemporaryList v-if="selectedLevels.length" />
    </Transition>
  </Teleport>
</template>
