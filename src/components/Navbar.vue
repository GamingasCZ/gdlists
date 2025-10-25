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
import { defineAsyncComponent } from "vue";
import LoadingBlock from "./global/LoadingBlock.vue";
import { dialog } from "./ui/sizes";
import Dialog from "./global/Dialog.vue";
import NavbarDropdown from "./ui/NavbarDropdown.vue";

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
const editorDropdownOpen = ref(0)
const openEditorDropdown = (e: MouseEvent, ind: number) => {
  if (editorDropdownOpen.value) return
  e.preventDefault()
  editorDropdownOpen.value = ind
  document.body.addEventListener("click", () => editorDropdownOpen.value = 0, { once: true, capture: true },)
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

const Sett = defineAsyncComponent({
  loader: () => import("@/components/global/SiteSettings.vue"),
  loadingComponent: LoadingBlock
})
const settingsOpen = ref(false)

</script>

<template>
  <Teleport to="body">
      <Dialog v-if="settingsOpen" :open="settingsOpen" :title="$t('other.settings')" :width="dialog.medium" @close-popup="settingsOpen = false">
        <Sett />
      </Dialog>
  </Teleport>

  <nav
    role="navigation"
    id="navbar"
    :class="{'-translate-y-14': navbarHidden}"
    class="box-border flex sticky top-0 backdrop-blur-md max-w-[100rem] mx-auto z-30 justify-between m-2 transition-transform overflow-x-clip">
    <section class="flex text-xs relative font-bold text-white md:text-xl min-h-[2.5rem]"
      :class="{ 'opacity-50 pointer-events-none': !isOnline }">
      
      <!-- Home link -->
      <RouterLink to="/" @click="scrollerHome" class="relative ml-2 websiteLink">
        <Logo class="w-10 h-10 button" />
      </RouterLink>
    

      <!-- Lists -->
      <RouterLink @click="openEditorDropdown($event, 1)" to="/browse/lists"
        class="flex relative flex-col gap-2 items-center px-4 group max-sm:pt-1 max-sm:gap-1 max-sm:pb-1 hover:bg-opacity-40 md:flex-row websiteLink"
        :class="{ 'md:!bg-opacity-60': scrollerInd == 1 }">
        <img src="../images/browseMobHeader.svg" :class="{'rotate-[45deg]': editorDropdownOpen}"
          alt="" class="w-4 transition-transform" />{{ $t('help.Lists') }}

        <NavbarDropdown v-if="editorDropdownOpen == 1" :is-review="false" />
      </RouterLink>

      <!-- Reviews -->
      <RouterLink to="/browse/reviews"
        class="flex flex-col gap-2 items-center px-4 max-sm:pt-1 max-sm:gap-1 max-sm:pb-1 hover:bg-opacity-40 md:flex-row websiteLink"
        :class="{ 'md:!bg-opacity-60': scrollerInd == 2 }">
        <img src="../images/reviews.svg" alt="" class="w-4" />{{ $t('reviews.review') }}
      </RouterLink>

      <!-- Levels -->
      <RouterLink to="/browse/levels"
        class="flex flex-col gap-2 items-center px-4 max-sm:pt-1 max-sm:gap-1 max-sm:pb-1 hover:bg-opacity-40 md:flex-row websiteLink"
        :class="{ 'md:!bg-opacity-60': scrollerInd == 3 }"><img src="../images/levelIcon.svg" alt="" class="w-4" />{{ $t('editor.levels') }}</RouterLink>
    </section>

    <section class="flex relative gap-7 items-center px-2 min-h-full bg-black bg-opacity-40">
      <!-- Notification button -->
      <button @click="showNotifs" v-if="isLoggedIn" class="button max-sm:hidden">
        <img src="../images/notifs.svg" alt=""
        class="w-5" />
        <div v-if="currentUnread > 0" class="absolute -right-1 -bottom-1 w-3 rounded-md border-2 border-black animate-ping bg-lof-400 aspect-square"></div>
        <div v-if="currentUnread > 0" class="absolute -right-1 -bottom-1 w-3 rounded-md border-2 border-black bg-lof-400 aspect-square"></div>
      </button>

      <button @click="settingsOpen = true" class="button max-sm:hidden">
        <img src="../images/gear.svg" alt=""
        class="w-5" />
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
    <div class="absolute top-0 left-0 w-full h-full transition-opacity duration-300 -z-30"
      :class="{ 'opacity-0': loadingProgress == 100 }">
      <div class="absolute h-full opacity-80 transition-all ease-out"
        :style="{
          backgroundImage: `linear-gradient(90deg, transparent, var(--brightGreen) 95%)`,
          backgroundPositionX: `${-loadingProgress}%`,
          width: `${loadingProgress}%`
        }"
        :class="{ 'duration-0': loadingProgress == 0, 'duration-200': loadingProgress == 100, 'duration-[10s]': loadingProgress == 99 }"
      ></div>
    </div>

    <!-- Notification Dropdown -->
    <Transition name="fadeSlide">
      <NotificationDropdown id="notifMenu" v-if="notifDropdownShown" @selected="showNotifs" @close="closeNotifs2()" />
    </Transition>
  </nav>
</template>

<style></style>
