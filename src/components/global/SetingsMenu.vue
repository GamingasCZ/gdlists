<script setup lang="ts">
import { ref, watch } from "vue";
import LoginButton from "./LoginButton.vue";
import cookier from "cookier";
import { SETTINGS } from "@/siteSettings";

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
        class="px-2 py-1 bg-white bg-opacity-10 rounded-full button"
        @click="logout"
      >
        <img src="@/images/logout.svg" class="inline mr-2 w-5" alt="" />Odhlásit
        se
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
      <select name="lang" class="px-2 rounded-md bg-lof-300" v-model="SETTINGS.language">
        <option :value="0">{{ $t("settingsMenu.czech") }}</option>
        <option :value="1">{{ $t("settingsMenu.english") }}</option>
      </select>
    </section>

    <section
      v-if="screenWidth > 900"
      class="flex flex-col gap-1 justify-center items-center py-2 w-36 bg-black bg-opacity-50 rounded-md"
    >
      Domovská stránka
      <select name="lang" class="px-2 rounded-md bg-lof-300" v-model="SETTINGS.homepageColumns">
        <option :value="1">1 sloupec</option>
        <option :value="2" v-if="screenWidth > 900">2 sloupce</option>
        <option :value="3" v-if="screenWidth > 1500">3 sloupce</option>
      </select>
    </section>
    <section
      class="flex flex-col gap-1 justify-center items-center py-2 w-36 bg-black bg-opacity-50 rounded-md"
    >
      Autosave v editoru
      <select name="lang" class="px-2 rounded-md bg-lof-300" v-model="SETTINGS.autosave">
        <option :value="0">Vypnutý</option>
        <option :value="30">Každých 30s</option>
        <option :value="60">Každých 60s</option>
        <option :value="180">Každé 3min</option>
      </select>
    </section>
  </div>
</template>
