<script setup lang="ts">
import { ref } from "vue";

const emit = defineEmits(["closePopup"]);
const props = defineProps<{
  shareText: string;
}>();

let text = `Mrkni se na můj Geodeš seznam - ${props.shareText}`;
const links = ref<string[]>([
  `https://www.reddit.com/submit?url=${encodeURIComponent(text)}`,
  `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
]);
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
      class="absolute top-1/2 left-1/2 flex max-h-[95vh] w-[25rem] max-w-[95vw] -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg bg-greenGradient p-2 text-white shadow-lg shadow-black"
    >
      <div class="relative">
        <h1 class="text-center text-xl font-bold">Sdílet</h1>
        <img
          src="@/images/close.svg"
          alt=""
          class="button absolute top-0 right-0 w-6"
          @click="emit('closePopup')"
        />
      </div>

      <h4 class="ml-2 font-bold leading-3">Odkaz:</h4>
      <input
        readonly
        @mouseover="($event.target as HTMLInputElement).select()"
        type="text"
        :value="shareText"
        class="mt-1 w-full rounded-full bg-white bg-opacity-10 p-1 px-2 outline-none"
      />

      <h4 class="mt-5 ml-2 font-bold leading-3">Sdílet na:</h4>
      <div class="mt-2 grid grid-cols-2 gap-2">
        <a :href="links[0]">
          <button
            class="button w-full rounded-full bg-white bg-opacity-10 px-2 py-1 text-left leading-3"
          >
            <img
              class="mr-2 inline w-6"
              src="@/images/redditIcon.svg"
              alt=""
            />Reddit
          </button>
        </a>
        <a :href="links[1]">
          <button
            class="button w-full rounded-full bg-white bg-opacity-10 px-2 py-1 text-left leading-3"
          >
            <img
              class="mr-2 inline w-6"
              src="@/images/twitterIcon.svg"
              alt=""
            />Twitter
          </button>
        </a>
      </div>
    </section>
  </dialog>
</template>
