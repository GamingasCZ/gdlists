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
import List from "@/svgs/List.vue";
import LevelIcon from "@/svgs/LevelIcon.vue";
import Review from "@/svgs/Review.vue";

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

enum NAV_SEL {
  Home,
  Lists,
  Reviews,
  Levels,
  None
}
const scrollerInd = ref(NAV_SEL.Home)

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

router.afterEach(newP => {
  navbarHidden.value = false
  switch (newP.name) {
    case 'home':
      scrollerInd.value = NAV_SEL.Home; break;

    case 'listViewer':
    case 'editor':
    case 'editing':
      scrollerInd.value = NAV_SEL.Lists; break;

    case 'reviewViewer':
    case 'editingReview':
    case 'writer':
      scrollerInd.value = NAV_SEL.Reviews; break;

    case 'browser':
      if (newP.path.includes("reviews"))
        scrollerInd.value = NAV_SEL.Reviews
      else if (newP.path.includes("lists"))
        scrollerInd.value = NAV_SEL.Lists
      else if (newP.path.includes("levels"))
        scrollerInd.value = NAV_SEL.Levels
      break;
      
    default:
      scrollerInd.value = NAV_SEL.None; break;
      break;
  }
})
modifyNavbarScroll()

const navbarHidden = ref(false)
watch(() => SETTINGS.value.scrollNavbar, modifyNavbarScroll)

const Sett = defineAsyncComponent({
  loader: () => import("@/components/global/SiteSettings.vue"),
  loadingComponent: LoadingBlock
})
const settingsOpen = ref(false)

const open = (to: string) => {
  editorDropdownOpen.value = 0
  if (SETTINGS.value.navDClick)
    router.push(`/make/${to.slice(0, to.length-1)}`)
  else
    router.push(`/browse/${to}`)
}

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
    class="box-border flex sticky top-0 max-w-[100rem] mx-auto z-30 justify-between m-2 transition-transform overflow-x-clip">
    <section class="flex backdrop-blur-md text-xs relative font-bold text-white md:text-xl min-h-[2.5rem]"
      :class="{ 'opacity-50 pointer-events-none': !isOnline }">
      
      <!-- Home link -->
      <RouterLink to="/" class="relative ml-2 websiteLink">
        <Logo class="w-10 h-10 button"
          :class="{'stroke-lof-400 fill-lof-200': scrollerInd == NAV_SEL.Home, 'fill-lof-300 brightness-125 stroke-lof-200': scrollerInd != NAV_SEL.Home}"
        />
      </RouterLink>
    

      <!-- Lists -->
       <button @click.stop="openEditorDropdown($event, 1)" @dblclick="open('lists')" class="flex relative flex-col gap-2 items-center px-4 max-sm:pt-1 max-sm:gap-1 max-sm:pb-1 hover:bg-opacity-40 md:flex-row websiteLink"
        :class="{'fill-lof-400 text-lof-400': scrollerInd == NAV_SEL.Lists, 'fill-white': scrollerInd != NAV_SEL.Lists}"
       >
          <List class="w-4 h-4" />{{ $t('help.Lists') }}
   
          <NavbarDropdown @close="editorDropdownOpen = 0" v-if="editorDropdownOpen == 1" :is-review="false" />
       </button>

      <!-- Reviews -->
      <button @click.stop="openEditorDropdown($event, 2)" @dblclick="open('reviews')" class="flex relative flex-col gap-2 items-center px-4 max-sm:pt-1 max-sm:gap-1 max-sm:pb-1 hover:bg-opacity-40 md:flex-row websiteLink"
        :class="{'fill-lof-400 text-lof-400': scrollerInd == NAV_SEL.Reviews, 'fill-white': scrollerInd != NAV_SEL.Reviews}"
      >
          <Review class="w-4 h-4" />{{ $t('reviews.review') }}
   
          <NavbarDropdown @close="editorDropdownOpen = 0" v-if="editorDropdownOpen == 2" :is-review="true" />
      </button>

      <!-- Levels -->
      <RouterLink to="/browse/levels" :class="{'fill-lof-400 stroke-lof-400 text-lof-400': scrollerInd == NAV_SEL.Levels, 'fill-white stroke-white': scrollerInd != NAV_SEL.Levels}"
        class="flex flex-col gap-2 items-center px-4 max-sm:pt-1 max-sm:gap-1 max-sm:pb-1 hover:bg-opacity-40 md:flex-row websiteLink"
      ><LevelIcon class="w-4 h-4" />{{ $t('editor.levels') }}</RouterLink>
    </section>

    <section class="flex relative gap-7 items-center px-2 min-h-full bg-opacity-40 backdrop-blur-md">
      <!-- Notification button -->
      <button @click="showNotifs" v-if="isLoggedIn" class="button max-sm:hidden">
        <img src="../images/notifs.svg" alt=""
        class="w-5" />
        <div v-if="currentUnread > 0" class="absolute -right-1 -bottom-1 w-4 rounded-full border-2 border-black motion-safe:animate-ping bg-lof-400 aspect-square"></div>
        <div v-if="currentUnread > 0" class="absolute -right-1 -bottom-1 w-4 rounded-full border-2 border-black bg-lof-400 aspect-square"></div>
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
          class="absolute right-0 button top-0 z-20 w-9 h-9 shadow-drop motion-safe:transition-all duration-[10ms]"
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
