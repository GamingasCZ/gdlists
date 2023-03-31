<script setup lang="ts">
import { ref } from "vue";
import ListBrowser from "./global/ListBrowser.vue";

const searchQuery = ref<string>("")
let get = new URLSearchParams(window.location.search)
if (get.has("q")) searchQuery.value = get.get("q")!


</script>

<template>
    <ListBrowser :search="searchQuery" />
</template>