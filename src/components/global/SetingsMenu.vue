<script setup lang="ts">
import { ref } from "vue";
import LoginButton from "./LoginButton.vue";

defineProps<{
  isLoggedIn: boolean
  username: string
}>()

</script>

<template>
  <div
    class="flex fixed right-2 top-12 flex-col gap-3 p-2 text-white rounded-md bg-greenGradient"
  >
    <LoginButton v-if="!isLoggedIn" class="w-full" />
    <section class="flex flex-col gap-1 justify-center items-center py-2 pt-10 w-36 bg-black bg-opacity-50 rounded-md" v-else>
      <h1 class="font-bold">{{ username }}</h1>
      <button class="px-2 py-1 bg-white bg-opacity-10 rounded-full button"><img src="@/images/logout.svg" class="inline mr-2 w-5" alt="">Odhlásit se</button>
    </section>

    <section
      class="flex flex-col gap-1 justify-center items-center py-2 w-36 bg-black bg-opacity-50 rounded-md"
    >
      {{ $t("settingsMenu.scrolling") }}
      <select name="paging" class="px-2 rounded-md bg-lof-300">
        <option>{{ $t("settingsMenu.infinite") }}</option>
        <option>{{ $t("settingsMenu.pages") }}</option>
      </select>
    </section>

    <section
      class="flex flex-col gap-1 justify-center items-center py-2 w-36 bg-black bg-opacity-50 rounded-md"
    >
      {{ $t("settingsMenu.language") }}
      <select name="lang" class="px-2 rounded-md bg-lof-300">
        <option>{{ $t("settingsMenu.czech") }}</option>
        <option>{{ $t("settingsMenu.english") }}</option>
      </select>
    </section>
  </div>
</template>
