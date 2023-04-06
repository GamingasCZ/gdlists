<script setup lang="ts">
import Navbar from "./components/Navbar.vue";

if (localStorage) {
  localStorage.getItem("favoriteIDs") ??
    localStorage.setItem("favoriteIDs", "[]");
  localStorage.getItem("favorites") ?? localStorage.setItem("favorites", "[]");
  localStorage.getItem("recentlyViewed") ??
    localStorage.setItem("recentlyViewed", "[]");
}
</script>

<template>
  <Navbar />
  <RouterView />
</template>
