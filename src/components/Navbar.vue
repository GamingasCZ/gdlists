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
    class="box-border flex fixed z-30 justify-between items-center px-2 w-full shadow-md bg-greenGradient shadow-black"
  >
    <RouterLink to="/"><Logo class="w-10 h-10 button" /></RouterLink>
    <section class="flex gap-5 items-center text-xs font-black text-white md:text-xl">
      <RouterLink
        to="/editor"
        class="flex flex-col gap-2 items-center py-1 rounded-full md:flex-row md:bg-black md:bg-opacity-50 md:px-4"
        ><img src="../images/editorMobHeader.svg" alt="" class="w-6" />{{
          $t('navbar.editor')
        }}</RouterLink
      >
      <RouterLink
        to="/browse"
        class="flex flex-col gap-2 items-center py-1 rounded-full md:flex-row md:bg-black md:bg-opacity-50 md:px-4"
        ><img src="../images/browseMobHeader.svg" alt="" class="w-6" />{{
          $t('navbar.lists')
        }}</RouterLink
      >
      <RouterLink
        to="/saved"
        class="flex flex-col gap-2 items-center py-1 rounded-full md:flex-row md:bg-black md:bg-opacity-50 md:px-4"
        ><img src="../images/savedMobHeader.svg" alt="" class="w-6" />{{
          $t('navbar.saved')
        }}</RouterLink
      >
    </section>
    <img @click="showSettings()" src="../images/user.svg" alt="" class="px-1 w-10 h-10 button" />
    <SetingsMenu v-if="settingsShown" />
  </nav>
</template>
