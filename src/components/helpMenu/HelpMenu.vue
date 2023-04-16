<script setup lang="ts">
import { qa } from "./helpmenuQuestions";
import HelpBubble from "./HelpBubble.vue";
import { ref } from "vue";

const filteredQuestions = ref<number[]>([-1]);

const emit = defineEmits(["closePopup"]);

const search = (e: Event) => {
  filteredQuestions.value = qa
    .filter((x) =>
      x.question
        .toLowerCase()
        .includes((e.target as HTMLInputElement).value.toLowerCase())
    )
    .map((x) => qa.indexOf(x));
};
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
      class="absolute top-1/2 left-1/2 h-[40rem] max-h-[95svh] w-[40rem] max-w-[95vw] -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-lg bg-greenGradient p-2 text-white shadow-lg shadow-black"
    >
      <div class="relative">
        <h1 class="text-center text-xl font-bold">Nápověda</h1>
        <img
          src="@/images/close.svg"
          alt=""
          class="button absolute top-0 right-0 w-6"
          @click="emit('closePopup')"
        />
      </div>
      <div class="mt-2 flex flex-col">
        <input
          type="text"
          placeholder="Hledat v nápovědě..."
          class="w-full rounded-full bg-white bg-opacity-10 p-1 px-2"
          @input="search"
        />
        <div
          class="mt-2 flex grow flex-col gap-2 overflow-y-auto rounded-md bg-white bg-opacity-10 p-2"
        >
          <HelpBubble
            v-for="(question, index) in qa"
            v-bind="question"
            :filter-show="
              filteredQuestions == -1 || filteredQuestions.includes(index)
            "
          />
        </div>
      </div>
    </section>
  </dialog>
</template>
