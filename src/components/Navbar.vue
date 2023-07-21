<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import { nextTick, onMounted, ref, watch } from "vue";
import Logo from "../svgs/Logo.vue";
import SetingsMenu from "./global/SetingsMenu.vue";
import { isOnline } from "@/Editor";

const props = defineProps<{
  isLoggedIn: boolean;
}>();

const settingsShown = ref<Boolean>(false);
const showSettings = () => (settingsShown.value = !settingsShown.value);

const loginInfo = ref<string[]>([]);

watch(props, () => {
    if (localStorage && props.isLoggedIn) {
      loginInfo.value = JSON.parse(localStorage.getItem("account_info")!);
    }
})

</script>

<template>
  <nav
    class="box-border flex sticky top-0 z-30 justify-between items-center px-2 w-full shadow-md overflow-x-clip bg-greenGradient shadow-black"
  >
    <RouterLink to="/"><Logo class="w-10 h-10 button" /></RouterLink>
    <section
      class="flex gap-5 items-center text-xs font-bold text-white md:text-xl"
      :class="{'opacity-50 pointer-events-none': !isOnline}"
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
    <img
      v-if="!isLoggedIn"
      @click="showSettings()"
      src="../images/user.svg"
      alt=""
      class="px-1 w-10 h-10 button"
    />
    <div v-else @click="showSettings()" class="box-border relative w-8 h-8 bg-black bg-opacity-40 rounded-full">
      <img
        alt=""
        :src="`https://cdn.discordapp.com/avatars/${loginInfo[1]}/${loginInfo[2]}.png`"
        :class="{'right-16': settingsShown, 'top-8': settingsShown, '!scale-[2]': settingsShown, '!border-orange-600': !isOnline}"
        class="absolute animate-ping top-0 right-0 z-10 w-8 h-8 rounded-full border-2 border-white border-solid !transition-[top,right,transform] duration-[20ms] button"
        id="profilePicture"
        v-if="!isOnline"
      />
      <img
        alt=""
        :src="`https://cdn.discordapp.com/avatars/${loginInfo[1]}/${loginInfo[2]}.png`"
        :class="{'right-16': settingsShown, 'top-8': settingsShown, '!scale-[2]': settingsShown, '!border-orange-600': !isOnline}"
        class="absolute top-0 right-0 z-10 w-8 h-8 rounded-full border-2 border-white border-solid !transition-[top,right,transform] duration-[20ms] button"
        id="profilePicture"
      />
    </div>
    <Transition name="fadeSlide">
      <SetingsMenu
        :username="loginInfo ? loginInfo[0] : ''"
        :is-logged-in="isLoggedIn"
        v-show="settingsShown"
        id="settingsMenu"
      />
    </Transition>
  </nav>
</template>
