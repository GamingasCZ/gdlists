<script setup lang="ts">
import Navbar from './components/Navbar.vue'

if (localStorage) {
  localStorage.setItem("favoriteIDs", "[]")
  localStorage.setItem("favorites", "[]")
}

</script>

<template>
  <Navbar />
  <RouterView />
</template>
