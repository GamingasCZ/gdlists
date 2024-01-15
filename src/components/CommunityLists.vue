<script setup lang="ts">
import { ref } from "vue";
import ListBrowser from "./global/ListBrowser.vue";
import router from "@/router";
import ListPreview from "./global/ListPreview.vue";

const props = defineProps<{
  query: string
  onlineType: "" | "user" | "hidden"
}>();

const browser = ref<"" | "user" | "hidden">(props.onlineType);
</script>

<template>
  <ListBrowser
    online-browser
    :component="ListPreview"
    :search="query"
    :online-type="browser"
    @switch-browser="browser = $event"
  />
</template>
