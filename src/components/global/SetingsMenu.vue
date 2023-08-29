<script setup lang="ts">
import { ref, watch } from "vue";
import LoginButton from "./LoginButton.vue";
import cookier from "cookier";
import { SETTINGS } from "@/siteSettings";
import { setLanguage } from "@/locales";

defineProps<{
  isLoggedIn: boolean;
  username: string;
}>();

function logout() {
  cookier("access_token").remove();
  localStorage.removeItem("account_info");
  window.location.reload();
}

const screenWidth = ref(window.innerWidth)
</script>

<template>
  <div
    class="flex fixed right-2 top-16 flex-col gap-3 p-2 text-white rounded-md bg-greenGradient sm:top-12"
  >
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
    </section>

    <section
      class="flex flex-col gap-1 justify-center items-center py-2 w-36 bg-black bg-opacity-50 rounded-md"
    >
      {{ $t("settingsMenu.scrolling") }}
      <select name="paging" class="px-2 rounded-md bg-lof-300" v-model="SETTINGS.scrolling">
        <option :value="0">{{ $t("settingsMenu.infinite") }}</option>
        <option :value="1">{{ $t("settingsMenu.pages") }}</option>
      </select>
    </section>

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
      Kvalita ikonek
      <select name="lang" class="px-2 rounded-md bg-lof-300" v-model="SETTINGS.iconQuality">
        <option :value="-2">Negenerovat</option>
        <option :value="-1">Bez barev</option>
        <option :value="6">Nízká</option>
        <option :value="4">Výchozí</option>
        <option :value="2">Vysoká</option>
      </select>
    </section>
  </div>
</template>
