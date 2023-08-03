<script setup lang="ts">
import LoginButton from "./LoginButton.vue";
import { ref } from "vue";

defineProps({
  mess: String,
});

let faces = ["04", "05", "07", "08", "15", "12", "10"];
let pick = Math.floor(Math.random() * faces.length);

const emojiPath = ref("")
const getEmoji = async () => await import(`../../images/emoji/${faces[pick]}.webp`).then(res => emojiPath.value = res.default)
getEmoji()

</script>

<template>
  <section
    class="m-auto flex w-[40rem] max-w-[95vw] flex-col items-center justify-around gap-4 rounded-lg bg-greenGradient px-8 py-3 text-white"
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
