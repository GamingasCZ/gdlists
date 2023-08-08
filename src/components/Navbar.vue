<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import { nextTick, onMounted, ref, watch } from "vue";
import Logo from "../svgs/Logo.vue";
import SetingsMenu from "./global/SetingsMenu.vue";
import { isOnline, resetList } from "@/Editor";
import { scale } from "chroma-js";
import { useI18n } from "vue-i18n";
import { hasLocalStorage } from "@/siteSettings";

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

const scrollerWidth = ref(0)
const scrollerXOff = ref(0)
const scrollerInd = ref(0)
const locale = useI18n().locale
watch(locale, () => {
  let firstLink = document.querySelector(".websiteLink") as HTMLLinkElement
  scrollerWidth.value = firstLink.clientWidth
})

const modScrollerWidth = (e: Event) => {
  let link = e.target as HTMLLinkElement
  if (link.nodeName == "IMG")
    link = (e.target as HTMLImageElement).parentElement as HTMLLinkElement
    
  scrollerInd.value = parseInt(link.dataset.ind!)
  scrollerWidth.value = link.clientWidth
  scrollerXOff.value = link.offsetLeft
}

const localStorg = ref(hasLocalStorage())

</script>

<template>
  <nav
    class="box-border flex sticky top-0 z-30 justify-between items-center px-2 w-full shadow-drop overflow-x-clip bg-greenGradient"
  >
    <RouterLink to="/"><Logo class="w-10 h-10 button"/></RouterLink>
    <section
      class="flex text-xs relative font-bold text-white md:text-xl min-h-[2.5rem]"
      :class="{'opacity-50 pointer-events-none': !isOnline}"
    >
      <hr class="absolute w-[1px] bg-white border-none h-1 bottom-0 origin-left transition-transform" :style="{transform: `scaleX(${scrollerWidth}) translateX(${scrollerXOff/scrollerWidth}px)`}">
      <RouterLink
        to="/editor"
        v-if="localStorg"
        @click="modScrollerWidth"
        data-ind="0"
        class="flex flex-col gap-2 items-center transition-colors md:flex-row md:bg-opacity-20 md:bg-black md:px-4 websiteLink"
        :class="{'md:!bg-opacity-40': scrollerInd == 0}"
        @mousedown="resetList"
        ><img src="../images/editorMobHeader.svg" alt="" class="w-6" />{{
          $t("navbar.editor")
        }}</RouterLink
      >
      <RouterLink
        to="/browse"
        @click="modScrollerWidth"
        data-ind="1"
        class="flex flex-col gap-2 items-center transition-colors md:flex-row md:bg-opacity-20 md:bg-black md:px-4 websiteLink"
        :class="{'md:!bg-opacity-40': scrollerInd == 1}"
        ><img src="../images/browseMobHeader.svg" alt="" class="w-6" />{{
          $t("navbar.lists")
        }}</RouterLink
      >
      <RouterLink
        to="/saved"
        v-if="localStorg"
        @click="modScrollerWidth"
        data-ind="2"
        class="flex flex-col gap-2 items-center transition-colors md:flex-row md:bg-opacity-20 md:bg-black md:px-4 websiteLink"
        :class="{'md:!bg-opacity-40': scrollerInd == 2}"
        ><img src="../images/savedMobHeader.svg" alt="" class="w-6" />{{
          $t("navbar.saved")
        }}</RouterLink
      >
    </section>
    <img
      v-if="!isLoggedIn && localStorg"
      @click="showSettings()"
      src="../images/user.svg"
      alt=""
      class="px-1 w-10 h-10 button"
    />
    <div v-else-if="localStorg" @click="showSettings()" class="box-border relative w-8 h-8 bg-black bg-opacity-40 rounded-full">
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
    <div v-else></div>

    <Transition name="fadeSlide">
      <SetingsMenu
        :username="loginInfo ? loginInfo[0] : ''"
        :is-logged-in="isLoggedIn"
        v-show="settingsShown"
        v-if="localStorg"
        id="settingsMenu"
      />
    </Transition>
  </nav>
</template>
