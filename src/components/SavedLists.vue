<script setup lang="ts">
import ListBrowser from "./global/ListBrowser.vue";
</script>

<template>
  <section>
    <ListBrowser :online-browser="false" :browser-name="$t('other.savedLevels')" />
  </section>
</template>
