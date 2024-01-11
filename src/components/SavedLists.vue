<script setup lang="ts">
import { ref } from "vue";
import ListBrowser from "./global/ListBrowser.vue";

const browser = ref<'' | 'collabs'>('')
</script>

<template>
  <section>
    <ListBrowser :online-browser="false" :online-type="browser" @switch-browser="browser = $event" :browser-name="$t('other.savedLevels')" />
  </section>
</template>
