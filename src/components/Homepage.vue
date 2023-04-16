<script setup lang="ts">
import ListSection from "./homepage/ListSection.vue";
import LoginButton from "./global/LoginButton.vue";
import LoggedInPopup from "./homepage/LoggedInPopup.vue";
import cookier from "cookier";
import { onMounted, ref } from "vue";

document.title = "GD Seznamy";

defineProps({
  isLoggedIn: Boolean,
});

const returnedFromLogin = ref<boolean>(false);
const firstTimeUser = ref<boolean>(false);

const returnfromLoginPFP = ref<string>("");
const returnfromLoginName = ref<string>("");
let loginCookie = cookier("logindata").get();
if (loginCookie != null) {
  returnedFromLogin.value = true;

  loginCookie = JSON.parse(loginCookie);
  returnfromLoginName.value = loginCookie[0];

  // first-time user
  firstTimeUser.value = loginCookie[3];
  if (!firstTimeUser) {
    let loginToast = document.getElementById("loginToast");
    loginToast?.classList.remove("-translate-y-16");
    setTimeout(() => {
      loginToast?.classList.add("-translate-y-16");
      setTimeout(() => loginToast?.remove(), 500);
    }, 2500);
  }

  returnfromLoginPFP.value = `https://cdn.discordapp.com/avatars/${loginCookie[1]}/${loginCookie[2]}.png`;

  cookier("logindata").remove();
}
</script>

<template>
  <LoggedInPopup
    @close-popup="returnedFromLogin = false"
    v-if="firstTimeUser && returnedFromLogin"
    :username="returnfromLoginName"
    :pfplink="returnfromLoginPFP"
  />
  <div
    id="loginToast"
    v-if="!firstTimeUser"
    class="absolute top-16 left-1/2 -translate-x-1/2 -translate-y-16 rounded-md bg-black bg-opacity-80 p-2 px-6 text-xl text-white transition-transform duration-75"
  >
    Vítej zpět, <b>{{ returnfromLoginName }}</b
    >!
  </div>

  <header
    class="flex h-[256px] items-end justify-center bg-[url(../images/introGrad2.webp)] bg-center"
  >
    <form
      action="./browse"
      method="get"
      class="flex translate-y-1/2 items-center gap-2 text-white"
    >
      <input
        type="text"
        name="q"
        class="max-w-[70vw] rounded-md border-4 border-lof-300 bg-greenGradient py-2 px-1 outline-transparent placeholder:text-xl"
        :placeholder="$t('homepage.searchLists')"
      />
      <button type="submit">
        <img
          src="../images/searchOpaque.svg"
          alt=""
          class="button rounded-full bg-greenGradient p-2"
        />
      </button>
    </form>
  </header>
  <div class="flex justify-center gap-2 pt-8 text-base text-white">
    <RouterLink to="/editor">
      <button
        class="button flex items-center gap-4 rounded-md bg-lof-300 px-2 py-3"
      >
        <img src="../images/plus.svg" alt="" class="w-6" />{{
          $t("homepage.createList")
        }}
      </button>
    </RouterLink>
    <RouterLink to="/random">
      <button
        class="button flex items-center gap-4 rounded-md bg-lof-300 px-2 py-3 sm:mr-14"
      >
        <img src="../images/dice.svg" alt="" class="w-6" />{{
          $t("homepage.tryLuck")
        }}
      </button>
    </RouterLink>
  </div>

  <section class="flex justify-center">
    <div
      v-if="!isLoggedIn"
      class="mx-4 mt-6 flex max-w-4xl items-center justify-center gap-3 rounded-md bg-greenGradient px-2 py-1 text-white"
    >
      <img src="../images/info.svg" alt="" class="w-6" />
      <div>
        <p class="max-sm:text-xs">{{ $t("homepage.welcomeToGDL") }}</p>
        <p class="max-md:hidden">{{ $t("homepage.connectDiscord") }}</p>
      </div>
      <LoginButton class="ml-auto" />
    </div>
  </section>

  <ListSection
    :header-name="$t('homepage.newest')"
    :extra-text="$t('homepage.more')"
    extra-icon="more"
    :empty-text="$t('homepage.listsUnavailable')"
    extra-action="/browse"
    content-type="/getLists.php?homepage=1"
  />

  <ListSection
    :header-name="$t('homepage.pinned')"
    :empty-text="$t('homepage.noListsPinned')"
  />

  <ListSection
    v-if="isLoggedIn"
    :header-name="$t('homepage.uploaded')"
    :extra-text="$t('homepage.more')"
    extra-icon="more"
    :empty-text="$t('homepage.noListsUploaded')"
    extra-action="/browse"
    content-type="/getLists.php?homeUser"
  />

  <ListSection
    :header-name="$t('homepage.visited')"
    :extra-text="$t('homepage.clear')"
    extra-icon="trash"
    extra-action="@clear"
    :empty-text="$t('homepage.noListsVisited')"
    content-type="@recentlyViewed"
  />

  <ListSection
    :header-name="$t('homepage.savedMix')"
    :extra-text="$t('homepage.more')"
    extra-icon="more"
    :empty-text="$t('homepage.noLevelsSaved')"
    content-type="@favorites"
    extra-action="/saved"
    :randomize-content="true"
    :list-type="1"
  />

  <ListSection
    :header-name="$t('homepage.official')"
    :empty-text="$t('homepage.listsNonexistent')"
    content-type="oldLists"
  />
</template>
