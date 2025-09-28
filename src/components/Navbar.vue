<script setup lang="ts">
import { RouterLink } from "vue-router";
import { nextTick, onMounted, provide, ref, watch } from "vue";
import Logo from "../svgs/Logo.vue";
import SetingsMenu from "./global/SetingsMenu.vue";
import { currentCutout, currentUID, isOnline, profileCutouts, currentUnread } from "@/Editor";
import { useI18n } from "vue-i18n";
import { hasLocalStorage, SETTINGS } from "@/siteSettings";
import router, { loadingProgress, timeLastRouteChange } from "@/router";
import ProfilePicture from "./global/ProfilePicture.vue";
import NotificationDropdown from "./global/NotificationDropdown.vue";

const props = defineProps<{
  isLoggedIn: boolean;
}>();

const settingsShown = ref(false);
const notifDropdownShown = ref(false);
const showSettings = (e: MouseEvent) => {
if (e.target.id == "settingsOpener") return
  settingsShown.value = true
  // closeNotifs2()
  document.body.addEventListener("click", closeSettings, { capture: true })
};
const showNotifs = () => {
  if (notifDropdownShown.value) return closeNotifs2()

  notifDropdownShown.value = true
  closeSettings2()
  document.body.addEventListener("click", closeNotifs, { capture: true })
};

const closeSettings2 = () => {
  settingsShown.value = false
  document.body.removeEventListener("click", closeSettings, { capture: true })
}

const closeNotifs2 = () => {
  let settingsMenu = document.querySelector("#notifMenu") as HTMLDivElement
  notifDropdownShown.value = false
  settingsMenu.removeEventListener("click", closeNotifs, { capture: true })
}

const closeSettings = (e: MouseEvent) => closeDialog(e, "#settingsMenu", closeSettings2)
const closeNotifs = (e: MouseEvent) => closeDialog(e, "#notifMenu", closeNotifs2)

const closeDialog = (m: MouseEvent, elementID: string, fun: any) => {
  if (m.x == 0) return // Clicking on settings menu content fricks up mouse pos
  let settingsMenu = document.querySelector(elementID) as HTMLDivElement
  let left = settingsMenu.offsetLeft!
  let top = settingsMenu.offsetTop!
  let width = settingsMenu.offsetWidth!
  let height = settingsMenu.offsetHeight!
  if (m.x < left || m.x > left + width || m.y < top || m.y > top + height) {
    fun()
  }
}


const loginInfo = ref<string[]>([]);

watch(props, () => {
  if (localStorage && props.isLoggedIn) {
    loginInfo.value = JSON.parse(localStorage.getItem("account_info")!);
  }
})

const scrollerWidth = ref(0)
const scrollerXOff = ref(0)
const scrollerInd = ref(0)

// Modify line size on content resize (lang change)
const locale = useI18n().locale
watch(locale, () => {
  nextTick(() => {
    let selectedLink = document.querySelectorAll(".websiteLink")?.[scrollerInd.value]
    if (!selectedLink) return
    
    scrollerXOff.value = selectedLink.offsetLeft
    scrollerWidth.value = selectedLink.clientWidth
    if (router.currentRoute.value.name == "home") scrollerHome()
  })
})

onMounted(() => {
  // Modify line size on content resize (lang change, mobile view)
  let ro = new ResizeObserver(() => {
    let selectedLink = document.querySelectorAll(".websiteLink")[scrollerInd.value]
    scrollerXOff.value = selectedLink.offsetLeft
    scrollerWidth.value = selectedLink.clientWidth
  });

  ro.observe(document.querySelectorAll(".websiteLink")[scrollerInd.value]);
  if (router.currentRoute.value.name == "home") scrollerHome()

})

const modScrollerWidth = (e: Event) => {
  let link = e.target as HTMLLinkElement
  if (link.nodeName == "IMG")
    link = (e.target as HTMLImageElement).parentElement as HTMLLinkElement

  scrollerInd.value = parseInt(link.dataset.ind!)
  scrollerWidth.value = link.clientWidth
  scrollerXOff.value = link.offsetLeft
  timeLastRouteChange.value = Date.now()
}

const scrollerHome = () => {
  scrollerInd.value = -1
}

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
  if (settingsShown.value) closeSettings2()
  if (notifDropdownShown.value) closeNotifs2()

  editorDropdownOpen.value = false
  prevScroll = window.scrollY
}
const modifyNavbarScroll = () => {
  if (SETTINGS.value.scrollNavbar)
    window.onscroll = hideNavbarOnScroll
  else
    window.onscroll = null

}

router.afterEach(() => navbarHidden.value = false)
modifyNavbarScroll()

const navbarHidden = ref(false)
watch(() => SETTINGS.value.scrollNavbar, modifyNavbarScroll)

</script>

<template>
  <nav
    role="navigation"
    id="navbar"
    :class="{'-translate-y-14': navbarHidden}"
    class="box-border flex sticky top-0 z-30 justify-between w-full transition-transform shadow-drop overflow-x-clip bg-greenGradient">
    <!-- Home link -->
    <RouterLink to="/" @click="scrollerHome" data-ind="0" class="relative ml-2 websiteLink">
      <Logo class="w-10 h-10 button" />
    </RouterLink>

    <section class="flex text-xs relative font-bold text-white md:text-xl min-h-[2.5rem]"
      :class="{ 'opacity-50 pointer-events-none': !isOnline }">

      <!-- Button underline -->
      <hr v-if="scrollerInd != 0"
        class="absolute w-[1px] bg-white border-none h-1 z-10 bottom-0 origin-left transition-transform"
        :style="{ transform: `scaleX(${scrollerWidth}) scaleY(${scrollerInd == -1 ? 0 : 1}) translateX(${scrollerXOff / scrollerWidth}px)` }">

      <!-- Editor -->
      <button v-if="localStorg" @click="openEditorDropdown" data-ind="1"
        class="flex relative flex-col gap-2 items-center px-4 bg-black bg-opacity-20 transition-colors group max-sm:pt-1 max-sm:gap-1 max-sm:pb-1 hover:bg-opacity-40 md:flex-row websiteLink"
        :class="{ 'md:!bg-opacity-60': scrollerInd == 1 }">
        <img src="../images/editorMobHeader.svg" :class="{'rotate-[45deg]': editorDropdownOpen}"
          alt="" class="w-6 transition-transform" />{{ $t("navbar.editor") }}
        
        <Transition name="fadeSlide">
          <div class="flex absolute left-0 top-10 flex-col gap-1 p-1 w-full min-w-max text-lg max-sm:top-14 bg-greenGradient" v-if="editorDropdownOpen">
            <RouterLink @click="modScrollerWidth" to="/make/list"  class="flex items-center p-1 bg-black bg-opacity-40 rounded-md button" @mouseup="hideUploadDropdown">
              <img src="@/images/browseMobHeader.svg" class="w-10 scale-[0.6]" alt="">
              <span>{{ $t('other.list') }}</span>
            </RouterLink>
            <RouterLink @click="modScrollerWidth" to="/make/review" class="flex items-center p-1 bg-black bg-opacity-40 rounded-md button" @mouseup="hideUploadDropdown">
              <img src="@/images/reviews.svg" class="w-10 scale-[0.6]" alt="">
              <span>{{ $t('other.review') }}</span>
            </RouterLink>
          </div>
        </Transition>
      </button>

      <!-- Browse -->
      <RouterLink to="/browse/lists" @click="modScrollerWidth" data-ind="2"
        class="flex flex-col gap-2 items-center px-4 bg-black bg-opacity-20 transition-colors max-sm:pt-1 max-sm:gap-1 max-sm:pb-1 hover:bg-opacity-40 md:flex-row websiteLink"
        :class="{ 'md:!bg-opacity-60': scrollerInd == 2 }">
        <img src="../images/browse.svg" alt="" class="w-6" />{{ $t("navbar.lists") }}
      </RouterLink>

      <!-- Saved -->
      <RouterLink to="/saved" v-if="localStorg" @click="modScrollerWidth" data-ind="3"
        class="flex flex-col gap-2 items-center px-4 bg-black bg-opacity-20 transition-colors max-sm:pt-1 max-sm:gap-1 max-sm:pb-1 hover:bg-opacity-40 md:flex-row websiteLink"
        :class="{ 'md:!bg-opacity-60': scrollerInd == 3 }"><img src="../images/savedMobHeader.svg" alt="" class="w-6" />{{
      $t("navbar.saved")
    }}</RouterLink>
    </section>

    <section class="flex relative gap-6 items-center px-2 min-h-full bg-black bg-opacity-40">
      <!-- Notification button -->
      <button @click="showNotifs" v-if="isLoggedIn" class="pl-2 button max-sm:hidden">
        <img src="../images/notifs.svg" alt=""
        class="w-5" />
        <div v-if="currentUnread > 0" class="absolute -right-1 -bottom-1 w-3 rounded-md border-2 border-black animate-ping bg-lof-400 aspect-square"></div>
        <div v-if="currentUnread > 0" class="absolute -right-1 -bottom-1 w-3 rounded-md border-2 border-black bg-lof-400 aspect-square"></div>
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
          :class="{ 'right-16 top-8 !scale-[2]': settingsShown, '!border-orange-600': !isOnline }"
          class="absolute animate-ping top-0 z-10 w-9 h-9 shadow-drop motion-safe:!transition-[top,right,transform] duration-[20ms] button"
          id="profilePicture" v-if="!isOnline"
          />
          
        <ProfilePicture
          :uid="currentUID"
          :cutout="currentCutout"
          :class="{ 'right-16 top-8 !scale-[2]': settingsShown, '!border-orange-600': !isOnline }"
          class="absolute top-0 z-10 w-9 h-9 shadow-drop motion-safe:!transition-[top,right,transform] duration-[20ms] button"
          id="profilePicture"
        />
      </div>
      <div v-else></div>
    </section>

    <Transition name="fadeSlide">
      <SetingsMenu :username="loginInfo ? loginInfo[0] : ''" :is-logged-in="isLoggedIn" v-show="settingsShown"
        v-if="localStorg" @open-notifs="showNotifs()" />
    </Transition>

    <!-- Loading bar -->
    <div class="absolute left-0 -bottom-1 w-full h-1 opacity-100 transition-opacity bg-lof-200 -z-30"
      :class="{ '!opacity-0': loadingProgress == 100 }">
      <div class="absolute h-full bg-lof-400 transition-[width] w-0 ease-out"
        :class="{ 'duration-0': loadingProgress == 0, 'duration-200': loadingProgress == 100, 'duration-[10s]': loadingProgress == 99 }"
        :style="{ width: `${loadingProgress}%` }"></div>
    </div>

    <!-- Notification Dropdown -->
    <Transition name="fadeSlide">
      <NotificationDropdown id="notifMenu" v-if="notifDropdownShown" @selected="showNotifs" @close="closeNotifs2()" />
    </Transition>
  </nav>
</template>

<style></style>
