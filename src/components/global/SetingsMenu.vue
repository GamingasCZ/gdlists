<script setup lang="ts">
import { ref } from "vue";
import LoginButton from "./LoginButton.vue";
import cookier from "cookier";

defineProps<{
  isLoggedIn: boolean;
  username: string;
}>();

function logout() {
  cookier("access_token").remove();
  localStorage.removeItem("account_info");
  window.location.reload();
}
</script>

<template>
  <div
    class="fixed right-2 top-12 flex flex-col gap-3 rounded-md bg-greenGradient p-2 text-white"
  >
    <LoginButton v-if="!isLoggedIn" class="w-full" />
    <section
      class="flex w-36 flex-col items-center justify-center gap-1 rounded-md bg-black bg-opacity-50 py-2 pt-6"
      v-else
    >
      <h1 class="font-bold">{{ username }}</h1>
      <button
        class="button rounded-full bg-white bg-opacity-10 px-2 py-1"
        @click="logout"
      >
        <img src="@/images/logout.svg" class="mr-2 inline w-5" alt="" />Odhlásit
        se
      </button>
    </section>

    <section
      class="flex w-36 flex-col items-center justify-center gap-1 rounded-md bg-black bg-opacity-50 py-2"
    >
      {{ $t("settingsMenu.scrolling") }}
      <select name="paging" class="rounded-md bg-lof-300 px-2">
        <option>{{ $t("settingsMenu.infinite") }}</option>
        <option>{{ $t("settingsMenu.pages") }}</option>
      </select>
    </section>

    <section
      class="flex w-36 flex-col items-center justify-center gap-1 rounded-md bg-black bg-opacity-50 py-2"
    >
      {{ $t("settingsMenu.language") }}
      <select name="lang" class="rounded-md bg-lof-300 px-2">
        <option>{{ $t("settingsMenu.czech") }}</option>
        <option>{{ $t("settingsMenu.english") }}</option>
      </select>
    </section>
  </div>
</template>
