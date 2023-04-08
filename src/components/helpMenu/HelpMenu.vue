<script setup lang="ts">
import { qa } from "./helpmenuQuestions"
import HelpBubble from "./HelpBubble.vue"

const emit = defineEmits(['closePopup'])

</script>

<template>
  <dialog
    open
    @click="emit('closePopup')"
    tabindex="0"
    @keyup.esc="emit('closePopup')"
  >
    <section
      @click.stop=""
      class="absolute top-1/2 left-1/2 w-[40rem] max-w-[95vw] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-greenGradient p-2 text-white shadow-lg shadow-black"
    >
      <div class="relative">
        <h1 class="text-xl font-bold text-center">Nápověda</h1>
        <img
          src="@/images/close.svg"
          alt=""
          class="absolute top-0 right-0 w-6 button"
          @click="emit('closePopup')"
        />
      </div>
      <div class="mt-2">
        <input type="text" placeholder="Hledat v nápovědě..." class="p-1 px-2 w-full bg-white bg-opacity-10 rounded-full">
        <div class="p-1 bg-white bg-opacity-10 flex flex-col gap-1">
            <HelpBubble v-for="question in qa" v-bind="question" />
        </div>
      </div>
    </section>
  </dialog>
</template>
