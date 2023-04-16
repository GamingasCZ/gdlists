<script setup lang="ts">
import { ref } from "vue";
import HelpMenu from "../helpMenu/HelpMenu.vue";

const helpMenuOpen = ref<boolean>(false);
</script>

<template>
  <HelpMenu v-if="helpMenuOpen" @close-popup="helpMenuOpen = false" />
  <section
    class="z-50 mt-36 flex h-24 w-full items-center justify-center bg-lof-200 text-white"
  >
    <div class="flex items-center">
      <img
        src="@/images/ggprof.webp"
        class="aspect-square w-14 rounded-full"
        alt=""
      />
      <div class="ml-3">
        <p class="text-xs font-thin leading-[8px] opacity-40">GD Lists by</p>
        <strong>GAMINGAS</strong>
        <p class="text-[0.6rem] leading-[8px] opacity-40">2021 - 2023</p>
      </div>
    </div>
    <div class="ml-20 flex gap-1.5 text-xs max-sm:flex-col sm:gap-4 sm:text-sm">
      <button
        class="rounded-md bg-black bg-opacity-40 p-1"
        @click="helpMenuOpen = true"
      >
        Nápověda
      </button>
      <a href="https://github.com/GamingasCZ/gdlists-vue-frontend/">
        <button class="rounded-md bg-black bg-opacity-40 p-1">
          Zdrojový kód
        </button>
      </a>
      <!-- <a href="https://github.com/GamingasCZ/gdlists-vue-frontend/issues/new?title=Bug:%20">
                <button class="p-1 bg-black bg-opacity-40 rounded-md">Nahlásit bug</button>
            </a> -->
    </div>
  </section>
</template>
