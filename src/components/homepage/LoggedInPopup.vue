<script setup lang="ts">
import { inject } from 'vue';
import ProfilePicture from '../global/ProfilePicture.vue';

const emit = defineEmits(["closePopup"]);
const props = defineProps<{
  pfplink: string;
  username: string;
}>();

const openContactDialog = () => {
  document.querySelector("#contactButton").click()
}

const BASE_URL = import.meta.env.BASE_URL

</script>

<template>
<div
  class="flex flex-col text-left"
>
  <div class="flex gap-4 items-center m-2">
    <ProfilePicture class="w-12 rounded-full border-2 border-white border-solid" :uid="pfplink" />
    <h1 class="text-2xl text-yellow-200">
      <span>{{ $t('other.welcomeToGDL') }}</span> 
      <b>{{ username }}!</b>
      <img :src="`${BASE_URL}/emoji/11.webp`" class="inline ml-2 w-8" alt="">
    </h1>
  </div>

  <div class="bg-[url(@/images/fade.webp)] relative bg-repeat-x flex-col flex gap-2">
    <div class="flex gap-2 items-center p-3 px-2 mx-2 mt-2 bg-black bg-opacity-20 rounded-md">
      <img src="@/images/emoji.svg" class="w-6" alt="">
      <p>{{ $t('homepage.loginHelp1') }}</p>
    </div>
    <div class="flex gap-2 items-center p-3 px-2 mx-2 bg-black bg-opacity-10 rounded-md">
      <img src="@/images/exclaim.svg" class="w-6" alt="">
      <p>{{ $t('homepage.loginHelp2') }}</p>
    </div>
    <div class="flex z-10 gap-2 items-center p-3 px-2 mx-2 mb-2 bg-black bg-opacity-20 rounded-md">
      <img src="@/images/comment.svg" class="w-6" alt="">
      <p>{{ $t('homepage.loginHelp3') }} <button class="underline cursor-pointer" @click="openContactDialog">{{ $t('homepage.loginHelp4') }}</button>!</p>
    </div>

    <div class="absolute bottom-0 w-full h-12 bg-gradient-to-t from-black to-transparent opacity-20"></div>
  </div>

  <div class="grid gap-y-2 gap-x-4 items-center m-2 text-xl text-center sm:grid-cols-3">
    <RouterLink :to="Math.random() >= 0.5 ? '/make/list' : '/make/review'"><buttton class="flex gap-2 items-center p-2 bg-black bg-opacity-40 rounded-md sm:justify-center button"><img class="w-7" src="@/images/editorMobHeader.svg" alt="">{{ $t('homepage.startMaking') }}</buttton></RouterLink>
    <RouterLink to="/random"><buttton class="flex gap-2 items-center p-2 bg-black bg-opacity-40 rounded-md sm:justify-center button"><img class="w-7" src="@/images/dice.svg" alt="">{{ $t('homepage.startBrowsing') }}</buttton></RouterLink>
    <buttton @click="emit('closePopup')" class="flex gap-2 items-center p-2 bg-black bg-opacity-40 rounded-md sm:justify-center button"><img class="w-7" src="@/images/close.svg" alt="">{{ $t('other.close') }}</buttton>
  </div>
</div>
</template>
