<script setup lang="ts">
import { ref } from "vue";
import ListBrowser from "./global/ListBrowser.vue";

defineProps({ query: String });

const browser = ref<"" | "user" | "hidden">("");
</script>

<template>
  <ListBrowser
    online-browser
    :search="query"
    :online-type="browser"
    @switch-browser="browser = $event"
  />
</template>
