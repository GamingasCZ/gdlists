<script setup lang="ts">
import { defineAsyncComponent, ref, watch } from "vue";
import LoginButton from "./LoginButton.vue";
import cookier from "cookier";
import { SETTINGS } from "@/siteSettings";
import { setLanguage } from "@/locales";
import { dialog } from "../ui/sizes";
import LoadingBlock from "../global/LoadingBlock.vue"

defineProps<{
  isLoggedIn: boolean;
  username: string;
}>();

function logout() {
  cookier("access_token").remove();
  localStorage.removeItem("account_info");
  window.location.reload();
}

const galleryOpen = ref(false)

const Dialog = defineAsyncComponent({
  loader: () => import("@/components/global/Dialog.vue"),
  loadingComponent: LoadingBlock
})
const Gallery = defineAsyncComponent({
  loader: () => import("@/components/global/ImageBrowser.vue"),
  loadingComponent: LoadingBlock
})

const screenWidth = ref(window.innerWidth)
</script>

<template>
  
  <div
  class="flex fixed right-2 top-16 flex-col gap-2 p-2 text-white rounded-md bg-greenGradient sm:top-12"
  >
    <div v-if="galleryOpen" class="z-20">
      <Teleport to="body">
        <Dialog :open="galleryOpen" :title="$t('other.gallery')" :width="dialog.large" @close-popup="galleryOpen = false">
          <Gallery unselectable />
        </Dialog>
      </Teleport>
    </div>
    <LoginButton v-if="!isLoggedIn" class="w-full" />
    <section
      class="flex flex-col gap-1 justify-center items-center py-2 pt-7 w-36 bg-black bg-opacity-50 rounded-md"
      v-else
    >
      <h1 class="font-bold">{{ username }}</h1>
      <button
        class="px-2 py-1 bg-white bg-opacity-10 rounded-md button"
        @click="logout"
      >
        <img src="@/images/logout.svg" class="inline mr-2 w-5" alt="" />{{ $t('settingsMenu.logout') }}
      </button>
      <!-- <button
        class="px-2 py-1 bg-white bg-opacity-10 rounded-md button"
        @click="logout"
      >
        <img src="@/images/logout.svg" class="inline mr-2 w-5" alt="" />Zařízení
      </button> -->
    </section>

    <button
      class="px-2 py-1 text-left bg-black bg-opacity-40 rounded-md button"
      @click="galleryOpen = true"
      v-if="isLoggedIn"
    >
      <img src="@/images/image.svg" class="inline mr-3 w-5" alt="" />{{ $t('other.gallery') }}
    </button>

    <section
      class="flex flex-col gap-1 justify-center items-center py-2 w-36 bg-black bg-opacity-50 rounded-md"
    >
      {{ $t("settingsMenu.language") }}
      <select name="lang" class="px-2 rounded-md bg-lof-300" v-model="SETTINGS.language" @change="setLanguage(SETTINGS.language)">
        <option :value="0">{{ $t("settingsMenu.czech") }}</option>
        <option :value="1">{{ $t("settingsMenu.english") }}</option>
      </select>
    </section>

    <section
      class="flex flex-col gap-1 justify-center items-center py-2 w-36 bg-black bg-opacity-50 rounded-md"
    >
      {{ $t('settingsMenu.viewMode') }}
      <select name="viewMode" class="px-2 rounded-md bg-lof-300" v-model="SETTINGS.levelViewMode">
        <option :value="0">{{ $t('settingsMenu.classic') }}</option>
        <option :value="1">{{ $t('settingsMenu.compact') }}</option>
        <option :value="2">{{ $t('settingsMenu.table') }}</option>
      </select>
    </section>

    <section
      v-if="screenWidth > 900"
      class="flex flex-col gap-1 justify-center items-center py-2 w-36 bg-black bg-opacity-50 rounded-md"
    >
      {{ $t('settingsMenu.homepage') }}
      <select name="lang" class="px-2 rounded-md bg-lof-300" v-model="SETTINGS.homepageColumns">
        <option :value="1">{{ $t('settingsMenu.columns', 1) }}</option>
        <option :value="2" v-if="screenWidth > 900">{{ $t('settingsMenu.columns', 2) }}</option>
        <option :value="3" v-if="screenWidth > 1500">{{ $t('settingsMenu.columns', 3) }}</option>
      </select>
    </section>
    <section
      class="flex flex-col gap-1 justify-center items-center py-2 w-36 bg-black bg-opacity-50 rounded-md"
    >
      {{ $t('settingsMenu.autosave') }}
      <select name="lang" class="px-2 rounded-md bg-lof-300" v-model="SETTINGS.autosave">
        <option :value="0">{{ $t('settingsMenu.asOff') }}</option>
        <option :value="30">{{ $t('settingsMenu.everySec', [30]) }}</option>
        <option :value="60">{{ $t('settingsMenu.everySec', [60]) }}</option>
        <option :value="180">{{ $t('settingsMenu.everyMin', [3]) }}</option>
      </select>
    </section>
    <section
      class="flex flex-col gap-1 justify-center items-center py-2 w-36 bg-black bg-opacity-50 rounded-md"
    >
      {{ $t('settingsMenu.iconQuality') }}
      <select name="lang" class="px-2 rounded-md bg-lof-300" v-model="SETTINGS.iconQuality">
        <option :value="-2">{{ $t('settingsMenu.noGenerate') }}</option>
        <option :value="-1">{{ $t('settingsMenu.noColor') }}</option>
        <option :value="6">{{ $t('settingsMenu.qLow') }}</option>
        <option :value="4">{{ $t('settingsMenu.qMed') }}</option>
        <option :value="2">{{ $t('settingsMenu.qHigh') }}</option>
      </select>
    </section>
    <section
      class="flex flex-col gap-1 justify-center items-center py-2 w-36 text-center bg-black bg-opacity-50 rounded-md"
    >
      {{ $t('settingsMenu.clickClose') }}
      <input type="checkbox" class="button" v-model="SETTINGS.dialogClickClose">
    </section>
  </div>
</template>
