<script setup lang="ts">
import { ref } from "vue";
import HelpMenu from "../helpMenu/HelpMenu.vue";
import Dialog from "./Dialog.vue";

const helpMenuOpen = ref<boolean>(false);
</script>

<template>
  <Dialog :open="helpMenuOpen" @close-popup="helpMenuOpen = false">
    <HelpMenu @close-popup="helpMenuOpen = false" />
  </Dialog>
  <section
    class="flex z-50 justify-center items-center mt-20 w-full h-24 text-white bg-lof-200 bg-[url(@/images/headerBG.webp)]"
  >
    <div class="flex items-center">
      <img
        src="@/images/ggprof.webp"
        class="w-14 rounded-full pointer-events-none aspect-square"
        alt=""
      />
      <div class="ml-3">
        <p class="text-xs font-thin leading-[8px] opacity-40">{{ $t('other.gdListsBy') }}</p>
        <strong>GAMINGAS</strong>
        <p class="text-[0.6rem] leading-[8px] opacity-40">2021 - 2024 </p>
      </div>
    </div>
    <div class="flex gap-1.5 ml-20 text-xs max-sm:flex-col sm:gap-4 sm:text-sm">
      <button
        class="p-1 bg-black bg-opacity-40 rounded-md"
        @click="helpMenuOpen = true"
      >
        {{ $t('other.help') }}
      </button>
      <a href="https://github.com/GamingasCZ/gdlists-vue-frontend/">
        <button class="p-1 bg-black bg-opacity-40 rounded-md">
          {{ $t('other.sourceCod') }}
        </button>
      </a>
      <!-- <a href="https://github.com/GamingasCZ/gdlists-vue-frontend/issues/new?title=Bug:%20">
                <button class="p-1 bg-black bg-opacity-40 rounded-md">Nahlásit bug</button>
            </a> -->
    </div>
  </section>
</template>
