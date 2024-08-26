<script setup lang="ts">
import { RouterLink } from "vue-router";
import { nextTick, onMounted, provide, ref, watch } from "vue";
import Logo from "../svgs/Logo.vue";
import SetingsMenu from "./global/SetingsMenu.vue";
import { currentCutout, currentUID, isOnline, profileCutouts, resetList } from "@/Editor";
import { useI18n } from "vue-i18n";
import { hasLocalStorage, SETTINGS } from "@/siteSettings";
import router, { loadingProgress } from "@/router";
import ProfilePicture from "./global/ProfilePicture.vue";

const props = defineProps<{
  isLoggedIn: boolean;
}>();

const settingsShown = ref(false);
const showSettings = (e: MouseEvent) => {
  if (e.target.id == "settingsOpener") return
  settingsShown.value = true
  document.body.addEventListener("click", closeSettings, { capture: true })
};
const closeSettings = (m: MouseEvent) => {
  if (m.x == 0) return // Clicking on settings menu content fricks up mouse pos
  let settingsMenu = document.querySelector("#settingsMenu") as HTMLDivElement
  let left = settingsMenu.offsetLeft!
  let top = settingsMenu.offsetTop!
  let width = settingsMenu.offsetWidth!
  let height = settingsMenu.offsetHeight!
  if (m.x < left || m.x > left + width || m.y < top || m.y > top + height) {
    settingsShown.value = false
    settingsMenu.removeEventListener("click", closeSettings, { capture: true })
  }
}


const loginInfo = ref<string[]>([]);

watch(props, () => {
  if (localStorage && props.isLoggedIn) {
    loginInfo.value = JSON.parse(localStorage.getItem("account_info")!);
  }
})

const localStorg = ref(hasLocalStorage())
const editorDropdownOpen = ref(false)
const openEditorDropdown = () => {
  if (editorDropdownOpen.value) return
  editorDropdownOpen.value = true
  document.body.addEventListener("click", () => editorDropdownOpen.value = false, { once: true, capture: true },)
}

const hideUploadDropdown = () => setTimeout(() => editorDropdownOpen.value = false, 10)

// Here lies function "deployPeterGriffin", beloved by many
// Thank you for your service
// - Gamingas 14.8.2024

var prevScroll = window.scrollY
const hideNavbarOnScroll = () => {
  if (window.scrollY <= 32) return
  navbarHidden.value = window.scrollY > prevScroll
  if (settingsShown.value) {
    settingsShown.value = false
    settingsMenu.removeEventListener("click", closeSettings, { capture: true })
  }
  editorDropdownOpen.value = false
  prevScroll = window.scrollY
}
const modifyNavbarScroll = () => {
  if (SETTINGS.value.scrollNavbar)
    window.onscroll = hideNavbarOnScroll
  else
    window.onscroll = null

}
modifyNavbarScroll()

const navbarHidden = ref(false)
watch(() => SETTINGS.value.scrollNavbar, modifyNavbarScroll)

</script>

<template>
  <nav
    role="navigation"
    id="navbar"
    :class="{'-translate-y-14': navbarHidden}"
    class="box-border flex sticky top-0 z-30 justify-between items-center p-1 w-full transition-transform shadow-drop overflow-x-clip bg-greenGradient">

            <!-- Editor -->
            <button v-if="localStorg" @click="openEditorDropdown" data-ind="1"
        class="flex relative gap-2 items-center p-2 py-1 rounded-md transition-colors bg-lof-400 group">
        <img src="../images/editorMobHeader.svg" :class="{'rotate-[45deg]': editorDropdownOpen}"
          alt="" class="w-6 invert transition-transform" />{{ $t("navbar.editor") }}
        
        <Transition name="fadeSlide">
          <div class="flex absolute left-0 top-10 flex-col gap-1 p-1 w-full min-w-max text-lg max-sm:top-14 bg-greenGradient" v-if="editorDropdownOpen">
            <RouterLink to="/make/list"  class="flex items-center p-1 bg-black bg-opacity-40 rounded-md button" @mouseup="hideUploadDropdown">
              <img src="@/images/browseMobHeader.svg" class="w-10 scale-[0.6]" alt="">
              <span>{{ $t('other.list') }}</span>
            </RouterLink>
            <RouterLink to="/make/review" class="flex items-center p-1 bg-black bg-opacity-40 rounded-md button" @mouseup="hideUploadDropdown">
              <img src="@/images/reviews.svg" class="w-10 scale-[0.6]" alt="">
              <span>{{ $t('other.review') }}</span>
            </RouterLink>
          </div>
        </Transition>
      </button>

    <form action="./browse/lists" method="get" class="flex relative gap-2 items-center text-white rounded-md bg-lof-100">
      <div class="relative">
        <input type="text" name="q"
          class="p-1 pr-10 w-full bg-transparent outline-transparent"
          :placeholder="$t('homepage.searchLists')" />
      </div>
      <button type="submit" class="p-1 w-6 rounded-full max-sm:hidden button">
        <img src="../images/searchOpaque.svg" alt="" />
      </button>
    </form>

    <section class="flex gap-6 items-center">
      <button class="relative button">
        <img @click="showSettings" src="../images/notifs.svg" alt=""
        class="w-5" />
        <div class="absolute top-0 -right-2 w-3 rounded-md border-2 border-black bg-lof-400 aspect-square"></div>
      </button>
  
      <!-- Logged out -->
      <img v-if="isLoggedIn == false && localStorg" @click="showSettings" src="../images/user.svg" alt=""
        class="px-1 w-10 h-10 button" />
  
      <!-- Loading response from accounts.php -->
      <img v-else-if="isLoggedIn == null && localStorg" src="../images/loading.webp" alt=""
        class="mr-1 w-6 animate-spin aspect-square" />
      
      <!-- Logged in, settings -->
      <div v-else-if="localStorg" @click="showSettings" id="settingsOpener" class="box-border relative w-9 h-9">
        <div class="absolute inset-0 z-10 bg-black bg-opacity-40" :style="{clipPath: profileCutouts[currentCutout]}"></div>
        
        <ProfilePicture
          :uid="currentUID"
          :cutout="currentCutout"
          :class="{ 'right-16': settingsShown, 'top-8': settingsShown, '!scale-[2]': settingsShown, '!border-orange-600': !isOnline }"
          class="absolute animate-ping top-0 right-0 z-10 w-9 h-9 shadow-drop motion-safe:!transition-[top,right,transform] duration-[20ms] button"
          id="profilePicture" v-if="!isOnline"
          />
          
          <ProfilePicture
          :uid="currentUID"
          :cutout="currentCutout"
          :class="{ 'right-16 top-8 !scale-[2]': settingsShown, '!border-orange-600': !isOnline }"
          class="absolute top-0 right-0 z-10 w-9 h-9 shadow-drop motion-safe:!transition-[top,right,transform] duration-[20ms] button"
          id="profilePicture"
        />
      </div>
      <div v-else></div>
    </section>

    <Transition name="fadeSlide">
      <SetingsMenu :username="loginInfo ? loginInfo[0] : ''" :is-logged-in="isLoggedIn" v-show="settingsShown"
        v-if="localStorg" id="settingsMenu" />
    </Transition>

    <!-- Loading bar -->
    <div class="absolute left-0 -bottom-1 w-full h-1 opacity-100 transition-opacity bg-lof-200 -z-30"
      :class="{ '!opacity-0': loadingProgress == 100 }">
      <div class="absolute h-full bg-lof-400 transition-[width] w-0 ease-out"
        :class="{ 'duration-0': loadingProgress == 0, 'duration-200': loadingProgress == 100, 'duration-[10s]': loadingProgress == 99 }"
        :style="{ width: `${loadingProgress}%` }"></div>
    </div>
  </nav>
</template>

<style></style>
