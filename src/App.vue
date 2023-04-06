<script setup lang="ts">
import Footer from "./components/global/Footer.vue";
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
  <RouterView class="min-h-[90vh]" />
  <Footer />
</template>
