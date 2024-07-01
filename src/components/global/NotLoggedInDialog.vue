<script setup lang="ts">
import LoginButton from "./LoginButton.vue";

defineProps({
  mess: String,
});

let faces = ["04", "05", "07", "08", "15", "12", "10"];
let pick = Math.floor(Math.random() * faces.length);

const emojiPath = `${import.meta.env.BASE_URL}/emoji/${faces[pick]}.webp`

</script>

<template>
  <section
    class="m-auto h-max mt-10 flex w-[40rem] max-w-[95vw] flex-col items-center justify-around gap-4 rounded-lg bg-greenGradient px-8 py-3 text-white"
  >
    <div
      class="flex gap-2 items-center px-3 py-2 bg-black bg-opacity-50 rounded-lg"
    >
      <img :src="emojiPath" alt="" class="w-14" />
      <span class="italic font-black"
        >„{{ $t(`other.lockQuotes[${pick}]`) }}”</span
      >
    </div>
    <span>{{ mess }}</span>
    <LoginButton />
  </section>
</template>
