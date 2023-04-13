<script setup lang="ts">
import axios, { type AxiosResponse } from "axios";
import Footer from "./components/global/Footer.vue";
import Navbar from "./components/Navbar.vue";
import { onMounted, ref } from "vue";

if (localStorage) {
  localStorage.getItem("favoriteIDs") ??
    localStorage.setItem("favoriteIDs", "[]");
  localStorage.getItem("favorites") ?? localStorage.setItem("favorites", "[]");
  localStorage.getItem("pinnedLists") ?? localStorage.setItem("pinnedLists", "[]");
  localStorage.getItem("recentlyViewed") ??
    localStorage.setItem("recentlyViewed", "[]");
}

const loggedIn = ref<boolean>(false)
onMounted(() => {
  axios.get(import.meta.env.VITE_API + "/php/accounts.php?check").then((res: AxiosResponse) => {
    loggedIn.value = res.data == 1
  })
})

</script>

<template>
  <Navbar />
  <RouterView :is-logged-in="loggedIn" class="min-h-[90vh]" />
  <Footer />
</template>
