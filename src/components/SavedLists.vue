<script setup lang="ts">
import { provide, ref } from "vue";
import ListBrowser from "./global/ListBrowser.vue";
import SavedCollabVue from "./editor/SavedCollab.vue";
import FavoritePreview from "./global/FavoritePreview.vue";
import DialogVue from "./global/Dialog.vue";
import CollabViewer from "./editor/CollabViewer.vue";
import type { SavedCollab } from "@/interfaces";

const browser = ref<'' | 'collabs'>('')

const collabData = ref({
  levelName: "",
  levelColor: [0,0,0],
  collabData: null,
  index: 0,
  levelID: 0
})
const openCollabTools = (collab: SavedCollab) => {
  collabData.value.levelName = collab.collabName
  collabData.value.levelColor = "#ffffff"
  collabData.value.index = 0
  collabData.value.levelID = collab.levelID
  collabData.value.collabData = collab.data

}
provide("openCollabTools", openCollabTools)

</script>

<template>
  <DialogVue :open="collabData.collabData != null" @close-popup="collabData.collabData = null">
    <CollabViewer :editor="true" :translucent="false" v-bind="collabData" @close-popup="collabData.collabData = null" />
  </DialogVue>
  <section>
    <ListBrowser :component="browser == 'collabs' ? SavedCollabVue : FavoritePreview" :online-browser="false" :online-type="browser" @switch-browser="browser = $event" :browser-name="$t('other.savedLevels')" />
  </section>
</template>
