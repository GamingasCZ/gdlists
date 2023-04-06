<script setup lang="ts">
import { ref } from "vue";
import ListBrowser from "./global/ListBrowser.vue";

defineProps({ query: String });
</script>

<template>
  <ListBrowser online-browser :search="query" />
</template>
