<script setup lang="ts">
import { provide, ref } from "vue";
import ListBrowser from "./global/ListBrowser.vue";
import SavedCollabVue from "./editor/SavedCollab.vue";
import LevelPreview from "./global/LevelPreview.vue";
import DialogVue from "./global/Dialog.vue";
import TemporaryList from "./global/TemporaryList.vue";
import CollabViewer from "./editor/CollabViewer.vue";
import type { SavedCollab } from "@/interfaces";
import { selectedLevels } from "@/Editor";
import { dialog } from "./ui/sizes";

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

const customColor = ref("")

</script>

<template>
  <DialogVue :title="collabData.levelName" :custom-color="customColor" :width="dialog.xl" :open="collabData.collabData != null" @close-popup="collabData.collabData = null">
    <CollabViewer @custom-color="customColor = $event" :editor="true" :translucent="false" v-bind="collabData" />
  </DialogVue>
  <section class="mx-2 mt-3">
    <ListBrowser :component="browser == 'collabs' ? SavedCollabVue : LevelPreview" :online-browser="false" :online-type="browser" @switch-browser="browser = $event" :browser-name="$t('other.savedLevels')" />
  </section>

  <Teleport to="body">
    <Transition name="fadeSlide">
      <TemporaryList v-if="selectedLevels.length" />
    </Transition>
  </Teleport>
</template>
