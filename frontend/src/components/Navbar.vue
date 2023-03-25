<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { ref } from 'vue'
import Logo from '../svgs/Logo.vue'
import SetingsMenu from './global/SetingsMenu.vue'

const settingsShown = ref<Boolean>(false)
const showSettings = () => (settingsShown.value = !settingsShown.value)
</script>

<template>
  <nav
    class="fixed z-30 box-border flex w-full items-center justify-between bg-greenGradient px-2 shadow-md shadow-black"
  >
    <RouterLink to="/"><Logo class="button h-10 w-10" /></RouterLink>
    <section class="flex items-center gap-5 text-xs font-black text-white md:text-xl">
      <RouterLink
        to="/editor"
        class="flex flex-col items-center gap-2 rounded-full py-1 md:flex-row md:bg-black md:bg-opacity-50 md:px-4"
        ><img src="../images/editorMobHeader.svg" alt="" class="w-6" />{{
          $t('navbar.editor')
        }}</RouterLink
      >
      <RouterLink
        to="/browse"
        class="flex flex-col items-center gap-2 rounded-full py-1 md:flex-row md:bg-black md:bg-opacity-50 md:px-4"
        ><img src="../images/browseMobHeader.svg" alt="" class="w-6" />{{
          $t('navbar.lists')
        }}</RouterLink
      >
      <RouterLink
        to="/saved"
        class="flex flex-col items-center gap-2 rounded-full py-1 md:flex-row md:bg-black md:bg-opacity-50 md:px-4"
        ><img src="../images/savedMobHeader.svg" alt="" class="w-6" />{{
          $t('navbar.saved')
        }}</RouterLink
      >
    </section>
    <img @click="showSettings()" src="../images/user.svg" alt="" class="button h-10 w-10 px-1" />
    <SetingsMenu v-if="settingsShown" />
  </nav>
</template>
