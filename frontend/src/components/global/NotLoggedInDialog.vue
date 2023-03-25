<script setup lang="ts">
import LoginButton from './LoginButton.vue'
import { ref } from 'vue'

defineProps({
  mess: String
})

let faces = ref(['04', '05', '07', '08', '15', '12', '10'])
let pick = Math.floor(Math.random() * faces.value.length)
</script>

<template>
  <section
    class="m-auto flex w-[40rem] max-w-[95vw] translate-y-20 flex-col items-center justify-around gap-4 rounded-lg bg-greenGradient px-8 py-3 text-white"
  >
    <div class="flex items-center gap-2 rounded-lg bg-black bg-opacity-50 px-3 py-2">
      <img :src="`/src/images/emoji/${faces[pick]}.webp`" alt="" class="w-14" />
      <span class="font-black italic">„{{ $t(`other.lockQuotes[${pick}]`) }}”</span>
    </div>
    <span>{{ mess }}</span>
    <LoginButton />
  </section>
</template>
