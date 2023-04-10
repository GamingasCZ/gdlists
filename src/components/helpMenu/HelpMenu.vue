<script setup lang="ts">
import { qa } from "./helpmenuQuestions"
import HelpBubble from "./HelpBubble.vue"
import { ref } from "vue";

const filteredQuestions = ref<number[]>([-1])

const emit = defineEmits(['closePopup'])

const search = (e: Event) => {
  filteredQuestions.value = qa
    .filter(x => x.question.toLowerCase().includes((e.target as HTMLInputElement).value.toLowerCase()))
    .map(x => qa.indexOf(x))
}

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
      class="absolute max-h-[95vh] h-[40rem] top-1/2 left-1/2 w-[40rem] max-w-[95vw] cursor-pointer -translate-x-1/2 -translate-y-1/2 rounded-lg bg-greenGradient p-2 text-white shadow-lg shadow-black"
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
      <div class="flex flex-col mt-2">
        <input type="text" placeholder="Hledat v nápovědě..." class="p-1 px-2 w-full bg-white bg-opacity-10 rounded-full" @input="search">
        <div class="flex flex-col gap-2 p-2 mt-2 bg-white bg-opacity-10 rounded-md grow">
            <HelpBubble v-for="(question, index) in qa" v-bind="question" :filter-show="filteredQuestions == -1 || filteredQuestions.includes(index)"/>
        </div>
      </div>
    </section>
  </dialog>
</template>
