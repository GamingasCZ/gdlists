<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import { nextTick, ref, watch } from "vue";
import Logo from "../svgs/Logo.vue";
import SetingsMenu from "./global/SetingsMenu.vue";

defineProps<{
  isLoggedIn: boolean
}>()

const settingsShown = ref<Boolean>(false);
const showSettings = () => (settingsShown.value = !settingsShown.value);

const loginInfo = ref<string[]>()
if (localStorage) {
  loginInfo.value = JSON.parse(localStorage.getItem("account_info")!)
}

watch(settingsShown, () => {
  nextTick(() => {
    let pfp = (document.querySelector("#profilePicture") as HTMLImageElement)
    let settings = (document.querySelector("#settingsMenu") as HTMLDivElement)
    let settingsPos = [settings.offsetTop, settings.offsetLeft]
    
    let settingsWidth = settings.clientWidth
  
    if (settingsShown) {
      pfp.style.transform = 'scale(1)'
      pfp.style.top = `${settingsPos[0]}px`
      pfp.style.left = `${settingsPos[1]}px`
    }
    else {
      
      pfp.style.transform = ''
      pfp.style.top = ''
      pfp.style.left = ''
    }
  })
})

</script>

<template>
  <nav
    class="box-border flex fixed z-30 justify-between items-center px-2 w-full shadow-md bg-greenGradient shadow-black"
  >
    <RouterLink to="/"><Logo class="w-10 h-10 button" /></RouterLink>
    <section
      class="flex gap-5 items-center text-xs font-bold text-white md:text-xl"
    >
      <RouterLink
        to="/editor"
        class="flex flex-col gap-2 items-center py-1 rounded-full md:flex-row md:bg-black md:bg-opacity-50 md:px-4"
        ><img src="../images/editorMobHeader.svg" alt="" class="w-6" />{{
          $t("navbar.editor")
        }}</RouterLink
      >
      <RouterLink
        to="/browse"
        class="flex flex-col gap-2 items-center py-1 rounded-full md:flex-row md:bg-black md:bg-opacity-50 md:px-4"
        ><img src="../images/browseMobHeader.svg" alt="" class="w-6" />{{
          $t("navbar.lists")
        }}</RouterLink
      >
      <RouterLink
        to="/saved"
        class="flex flex-col gap-2 items-center py-1 rounded-full md:flex-row md:bg-black md:bg-opacity-50 md:px-4"
        ><img src="../images/savedMobHeader.svg" alt="" class="w-6" />{{
          $t("navbar.saved")
        }}</RouterLink
      >
    </section>
    <img v-if="!isLoggedIn"
      @click="showSettings()"
      src="../images/user.svg"
      alt=""
      class="px-1 w-10 h-10 button"
    />
    <div v-else class="box-border w-8 h-8">
      <img
        @click="showSettings()"
        alt=""
        :src="`https://cdn.discordapp.com/avatars/${loginInfo[1]}/${loginInfo[2]}.png`"
        class="absolute top-0 right-0 w-8 h-8 rounded-full border-2 border-white border-solid button"
        id="profilePicture"
      />
    </div>
    <SetingsMenu :username="loginInfo ? loginInfo[0] : '' " :is-logged-in="isLoggedIn" v-show="settingsShown" id="settingsMenu"/>
  </nav>
</template>
