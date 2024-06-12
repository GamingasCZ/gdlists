<script setup lang="ts">
const emit = defineEmits(["closePopup"]);
const props = defineProps<{
  pfplink: string;
  username: string;
}>();
</script>

<template>
<div
  class="flex flex-col text-left"
>
  <div class="flex gap-4 items-center m-2">
    <img
      :src="pfplink"
      class="w-12 rounded-full border-2 border-white border-solid"
      alt=""
    />
    <h1 class="text-2xl text-yellow-200">
      <span>{{ $t('other.welcomeToGDL') }}</span>
      <b>{{ username }}!</b>
      <img src="@/images/emoji/11.webp" class="inline ml-2 w-8" alt="">
    </h1>
  </div>

  <div class="bg-[url(@/images/fade.webp)] bg-repeat-x p-2">
    <div class="grid rounded-md p-1 items-center gap-2 text-sm bg-black bg-opacity-40 grid-cols-[max-content_1fr_max-content]">
      <img src="@/images/info.svg" class="w-6" alt="">
      <p>GD Seznamy jsou sociální síť, kde můžeš vytvářet a recenzovat Geometry Dash levely!<br>
      Máš-li nějaké otázky, mrkni se do nápovědy! 
      </p>
      <button class="p-1 bg-black bg-opacity-40 rounded-md">
        <img src="" alt="">
        <span>{{ $t('other.help') }}</span>
      </button>
    </div>
  </div>
</div>
</template>
