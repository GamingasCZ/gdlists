<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import { nextTick, ref, watch } from "vue";
import Logo from "../svgs/Logo.vue";
import SetingsMenu from "./global/SetingsMenu.vue";

defineProps<{
  isLoggedIn: boolean;
}>();

const settingsShown = ref<Boolean>(false);
const showSettings = () => (settingsShown.value = !settingsShown.value);

const loginInfo = ref<string[]>();
if (localStorage) {
  loginInfo.value = JSON.parse(localStorage.getItem("account_info")!);
}

watch(settingsShown, () => {
  nextTick(() => {
    let pfp = document.querySelector("#profilePicture") as HTMLImageElement;
    let settings = document.querySelector("#settingsMenu") as HTMLDivElement;
    let settingsPos = [settings.offsetTop, settings.offsetLeft];

    let settingsWidth = settings.clientWidth;

    if (settingsShown) {
      pfp.style.transform = "scale(2)";
      pfp.style.top = `calc(${settingsPos[0]}px - 1rem)`;
      pfp.style.left = `calc(${settingsPos[1] + settingsWidth / 2}px - 1rem)`;
    } else {
      pfp.style.transform = "";
      pfp.style.top = "0";
      pfp.style.left = "0";
    }
  });
});
</script>

<template>
  <nav
    class="sticky top-0 z-30 box-border flex w-full items-center justify-between bg-greenGradient px-2 shadow-md shadow-black"
  >
    <RouterLink to="/"><Logo class="button h-10 w-10" /></RouterLink>
    <section
      class="flex items-center gap-5 text-xs font-bold text-white md:text-xl"
    >
      <RouterLink
        to="/editor"
        class="flex flex-col items-center gap-2 rounded-full py-1 md:flex-row md:bg-black md:bg-opacity-50 md:px-4"
        ><img src="../images/editorMobHeader.svg" alt="" class="w-6" />{{
          $t("navbar.editor")
        }}</RouterLink
      >
      <RouterLink
        to="/browse"
        class="flex flex-col items-center gap-2 rounded-full py-1 md:flex-row md:bg-black md:bg-opacity-50 md:px-4"
        ><img src="../images/browseMobHeader.svg" alt="" class="w-6" />{{
          $t("navbar.lists")
        }}</RouterLink
      >
      <RouterLink
        to="/saved"
        class="flex flex-col items-center gap-2 rounded-full py-1 md:flex-row md:bg-black md:bg-opacity-50 md:px-4"
        ><img src="../images/savedMobHeader.svg" alt="" class="w-6" />{{
          $t("navbar.saved")
        }}</RouterLink
      >
    </section>
    <img
      v-if="!isLoggedIn"
      @click="showSettings()"
      src="../images/user.svg"
      alt=""
      class="button h-10 w-10 px-1"
    />
    <div v-else class="box-border h-8 w-8">
      <img
        @click="showSettings()"
        alt=""
        :src="`https://cdn.discordapp.com/avatars/${loginInfo[1]}/${loginInfo[2]}.png`"
        class="button absolute top-0 right-0 z-10 h-8 w-8 rounded-full border-2 border-solid border-white"
        id="profilePicture"
      />
    </div>
    <SetingsMenu
      :username="loginInfo ? loginInfo[0] : ''"
      :is-logged-in="isLoggedIn"
      v-show="settingsShown"
      id="settingsMenu"
    />
  </nav>
</template>
