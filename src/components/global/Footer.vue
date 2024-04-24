<script setup lang="ts">
import { ref } from "vue";
import HelpMenu from "../helpMenu/HelpMenu.vue";
import ContactDialog from "../global/ContactDialog.vue";
import Dialog from "./Dialog.vue";
import { dialog } from "../ui/sizes";

const helpMenuOpen = ref<boolean>(false);
const contactMenuOpen = ref<boolean>(false);
</script>

<template>
  <Dialog :open="helpMenuOpen" @close-popup="helpMenuOpen = false" :title="$t('other.help')">
    <HelpMenu />
  </Dialog>

  <Dialog :open="contactMenuOpen" @close-popup="contactMenuOpen = false" :title="$t('other.contact')" :width="dialog.small">
    <ContactDialog/>
  </Dialog>


  <section
    class="flex z-50 flex-col justify-center items-center mt-20 w-full h-24 text-white bg-lof-200 bg-[url(@/images/headerBG.webp)]"
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
        <p class="text-[0.6rem] opacity-40">2021 - 2024 </p>
      </div>
    </div>
    <div class="flex gap-1.5 text-xs max-sm:flex-col sm:gap-4 sm:text-sm">
      <button
        class="p-1 underline rounded-md opacity-80"
        @click="helpMenuOpen = true"
      >
        {{ $t('other.help') }}
      </button>
      <a target="_blank" href="https://github.com/GamingasCZ/gdlists">
        <button class="p-1 underline rounded-md opacity-80">
          {{ $t('other.sourceCod') }}
        </button>
      </a>
      <button class="p-1 underline rounded-md opacity-80" @click="contactMenuOpen = true">
        {{ $t('other.contact') }}
      </button>
    </div>
  </section>
</template>
