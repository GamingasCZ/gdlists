<script setup lang="ts">
import { ref } from "vue";
import ContactDialog from "../global/ContactDialog.vue";
import Dialog from "./Dialog.vue";
import { dialog } from "../ui/sizes";

const contactMenuOpen = ref<boolean>(false);
const currentCommit = import.meta.env.VITE_LASTCOMMIT

const scrollTop = () => window.scrollTo({top: 0, behavior: "smooth"})

</script>

<template>
  <Dialog :open="contactMenuOpen" @close-popup="contactMenuOpen = false" :title="$t('other.contact')" :width="dialog.small">
    <ContactDialog/>
  </Dialog>


  <footer
    id="footer"
    class="flex relative flex-col justify-center items-center mt-20 w-full h-24 text-white bg-lof-200 bg-[url(@/images/headerBG.webp)]"
  >
    <div class="flex items-center">
      <img
        src="@/images/ggprof.webp"
        class="w-10 rounded-full pointer-events-none aspect-square"
        alt=""
      />
      <div class="ml-3">
        <span class="mr-1 text-xs leading-tight align-middle opacity-40">GD Lists by</span>
        <strong>GamingasCZ</strong>
        <p class="text-[0.6rem] opacity-40">2021 - 2026 • commit {{ currentCommit }}</p>
      </div>
    </div>
    <div class="flex gap-4 text-sm">
      <a target="_blank" href="https://github.com/GamingasCZ/gdlists">
        <button class="p-1 underline rounded-md opacity-80">
          {{ $t('other.sourceCod') }}
        </button>
      </a>
      <button id="contactButton" class="p-1 underline rounded-md opacity-80" @click="contactMenuOpen = true">
        {{ $t('other.contact') }}
      </button>
    </div>

    <button :title="$t('other.toTop')" @click="scrollTop">
      <img src="@/images/back.svg" class="absolute right-8 top-1/2 p-2 w-12 rounded-md mix-blend-soft-light rotate-90 -translate-y-1/2 hover:bg-white hover:bg-opacity-20" alt="">
    </button>
  </footer>
</template>
