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
    let route = CONTENTS.indexOf(useRouter().currentRoute.value.path.split("/")[2])
    if (lastTab[0] != null) return lastTab[0]
    else return route == -1 ? 0 : route
  } else return 0
}


const contentType = ref<Content>(defaultContentType())
const userLists = ref<"" | "user" | "hidden" | "collabs">(lastTab[1] ?? props.onlineType);
const modifyContentType = (to: Content) => {
  contentType.value = to
  userLists.value = ''
  if (hasLocalStorage()) {
    modLastTab([contentType.value, userLists.value])
  }
}

const switchUserLists = (user: string) => {
  userLists.value = user
  modLastTab([contentType.value, userLists.value])
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
      <!-- <RouterLink @click="modifyContentType(3)" to="/browse/saved" class="flex gap-2 px-4 hover:bg-opacity-10 hover:bg-black" :class="{'bg-black !bg-opacity-40': contentType == 3}">
        <img src="../images/savedMobHeader.svg" alt="" class="w-5" />
        <span class="my-2">{{ $t('navbar.saved') }}</span>
      </RouterLink> -->
    </nav>
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
