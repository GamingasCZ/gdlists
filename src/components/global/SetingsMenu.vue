<script setup lang="ts">
import { defineAsyncComponent, ref, watch } from "vue";
import LoginButton from "./LoginButton.vue";
import cookier from "cookier";
import { SETTINGS } from "@/siteSettings";
import { setLanguage } from "@/locales";
import { dialog } from "../ui/sizes";
import LoadingBlock from "../global/LoadingBlock.vue"
import axios from "axios";

defineProps<{
  isLoggedIn: boolean;
  username: string;
}>();

let loggingOut = false
function logout() {
  if (!loggingOut) {
    loggingOut = true
    axios.delete(import.meta.env.VITE_API + "/accounts.php", {params: {current: 1}}).then(() => {
      window.location.reload();
      cookier("access_token").remove();
      localStorage.removeItem("account_info");
    })
  }
}

const dialogs = ref({
  settings: false,
  gallery: false,
  avatar: false,
  help: false,
  themes: false
})

const Dialog = defineAsyncComponent({
  loader: () => import("@/components/global/Dialog.vue"),
  loadingComponent: LoadingBlock
})
const Gallery = defineAsyncComponent({
  loader: () => import("@/components/global/ImageBrowser.vue"),
  loadingComponent: LoadingBlock
})

const Sett = defineAsyncComponent({
  loader: () => import("@/components/global/SiteSettings.vue"),
  loadingComponent: LoadingBlock
})

const AvatarEditor = defineAsyncComponent({
  loader: () => import("@/components/global/ProfiePicturePicker.vue"),
  loadingComponent: LoadingBlock
})

// const Sessions = defineAsyncComponent({
//   loader: () => import("@/components/global/SessionDialog.vue"),
//   loadingComponent: LoadingBlock
// })

const Themes = defineAsyncComponent({
  loader: () => import("@/components/global/ThemePicker.vue"),
  loadingComponent: LoadingBlock
})

const Help = defineAsyncComponent({
  loader: () => import("@/components/helpMenu/HelpMenu.vue"),
  loadingComponent: LoadingBlock
})

const screenWidth = ref(window.innerWidth)
const sessionsDialog = ref<HTMLDivElement>()
</script>

<template>
  
  <div
  class="flex fixed right-2 top-16 flex-col gap-2 p-2 text-white rounded-md bg-greenGradient sm:top-12"
  >
    <Teleport to="body">
      <div v-if="dialogs.settings" class="z-30">
        <Dialog :open="dialogs.settings" :title="$t('other.settings')" :width="dialog.medium" @close-popup="dialogs.settings = false">
          <Sett />
        </Dialog>
      </div>
  
      <!-- <div v-if="dialogs.sessions" class="z-30">
        <Dialog :open="dialogs.sessions" :title="$t('settingsMenu.devices')" :action="sessionsDialog?.logoutAll" :side-button-text="$t('settingsMenu.logoutAll')" :width="dialog.medium" @close-popup="dialogs.sessions = false">
          <template #icon><img src="@/images/logout.svg" class="w-4"></template>
          <Sessions ref="sessionsDialog"/>
        </Dialog>
      </div> -->
      
      <div v-if="dialogs.help" class="z-30">
        <Dialog :open="dialogs.help" @close-popup="dialogs.help = false" :title="$t('other.help')">
          <Help />
        </Dialog>
      </div>

      <div v-if="dialogs.avatar" class="z-30">
        <Dialog :open="dialogs.avatar" @close-popup="dialogs.avatar = false" :width="dialog.large" :title="$t('settingsMenu.pfp')">
          <AvatarEditor @open-gallery="dialogs.gallery = true" @close-popup="dialogs.avatar = false" />
        </Dialog>
      </div>

      <div v-if="dialogs.gallery" class="z-30">
        <Dialog :open="dialogs.gallery" :title="$t('other.gallery')" :width="dialog.large" @close-popup="dialogs.gallery = false">
          <Gallery unselectable />
        </Dialog>
      </div>

      <Transition name="fadeSlide">
        <Teleport to="body">
          <div v-if="dialogs.themes" class="z-30">
              <Themes @close="dialogs.themes = false" />
          </div>
        </Teleport>
        </Transition>
    </Teleport>


    <LoginButton v-if="!isLoggedIn" class="w-full" />
    <section
      class="flex flex-col gap-2 justify-center items-center py-2 w-36 bg-black bg-opacity-50 rounded-md max-sm:pt-6 sm:pt-9"
      v-else
    >
      <h1 class="font-bold">{{ username }}</h1>
      <button
        class="px-2 py-1 bg-white bg-opacity-10 rounded-md button"
        @click="dialogs.avatar = true"
      >
        <img src="@/images/edit.svg" class="inline mr-2 w-5" alt="" />{{ $t('level.edit') }}
      </button>
      <button
        class="px-2 py-1 bg-white bg-opacity-10 rounded-md button"
        @click="logout"
      >
        <img src="@/images/logout.svg" class="inline mr-2 w-5" alt="" />{{ $t('settingsMenu.logout') }}
      </button>
    </section>

    <section
      class="flex flex-col gap-1 py-2 w-36 bg-black bg-opacity-50 rounded-md"
    >
      <span class="text-center">{{ $t("settingsMenu.language") }}</span>
      <div class="flex gap-1 items-center ml-2">
        <span class="text-xl translate-y-0.5">{{ ["&#x1F1E8;&#x1F1FF;", "&#x1f1fa;&#x1f1f8;"][SETTINGS.language] }}</span>
        <select name="lang" class="pr-2 pl-0 ml-2 text-sm bg-transparent border-b-white rounded-none !border-b-2 border-0" v-model="SETTINGS.language" @change="setLanguage(SETTINGS.language)">
          <option :value="0">{{ $t("settingsMenu.czech") }}</option>
          <option :value="1">{{ $t("settingsMenu.english") }}</option>
        </select>
      </div>
    </section>

    <button
      class="px-2 py-1 text-left bg-black bg-opacity-40 rounded-md button"
      @click="dialogs.settings = true"
    >
      <img src="@/images/gear.svg" class="inline mr-3 w-5" alt="" />{{ $t('other.settings') }}
    </button>
    <button
      class="px-2 py-1 text-left bg-black bg-opacity-40 rounded-md button"
      @click="dialogs.gallery = true"
      v-if="isLoggedIn"
    >
      <img src="@/images/image.svg" class="inline mr-3 w-5" alt="" />{{ $t('other.gallery') }}
    </button>
    <button
      class="px-2 py-1 text-left bg-black bg-opacity-40 rounded-md button"
      @click="dialogs.themes = true"
    >
      <img src="@/images/color.svg" class="inline mr-3 w-5" alt="" />{{ $t('other.themes') }}
    </button>
    <button
      class="px-2 py-1 text-left bg-black bg-opacity-40 rounded-md button"
      @click="dialogs.help = true"
    >
      <img src="@/images/info.svg" class="inline mr-3 w-5" alt="" />{{ $t('other.help') }}
    </button>
  </div>
</template>
