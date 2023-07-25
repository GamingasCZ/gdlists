<script setup lang="ts">
import { levelList } from "../../Editor";
import { ref } from "vue";

const collabShaking = ref(false)
const shakeCollab = () => {
  collabShaking.value = true
  setTimeout(() => {
    collabShaking.value = false
  }, 200);
}
</script>

<template>
  <section class="w-80 max-w-[90vw]">
    <h2 class="text-xl font-bold text-center">{{ $t('other.settings') }}</h2>
    <div class="flex flex-col gap-2 px-2 py-2 bg-white bg-opacity-5 rounded-md">
      <div>
        <input type="checkbox" name="private" class="button" />
        <label for="private">{{ $t('editor.privateList') }}</label>
      </div>
      <div :class="{'animate-[shake_0.2s_infinite]': collabShaking}" @mousedown="shakeCollab">
        <input
            type="checkbox"
            class="button"
          />
        <label for="diffGuessing" id="diffGuess">{{ $t('editor.levelGuessing') }}</label>
      </div>
      <Transition name="fade">
        <div
          v-show="levelList.diffGuesser[0]"
          class="box-border flex gap-2 items-center px-3 py-2 ml-8 w-max bg-black bg-opacity-25 rounded-md"
        >
          <span>{{ $t('editor.guess') }}: </span>
          <button @click="levelList.diffGuesser[1] = !levelList.diffGuesser[1]">
            <img
              src="/public/faces/4.webp"
              alt=""
              class="p-1 w-10 bg-black bg-opacity-50 rounded-md button"
              :class="{ disabled: !levelList.diffGuesser[1] }"
            />
          </button>
          <button @click="levelList.diffGuesser[2] = !levelList.diffGuesser[2]">
            <img
              src="/public/faces/epic.webp"
              alt=""
              class="p-1 w-10 bg-black bg-opacity-50 rounded-md button"
              :class="{ disabled: !levelList.diffGuesser[2] }"
            />
          </button>
        </div>
      </Transition>
      <div>
        <input
          v-model="levelList.translucent"
          type="checkbox"
          name="translucency"
          class="button"
        />
        <label for="translucency">{{ $t('editor.translucentCards') }}</label>
      </div>
    </div>
  </section>
</template>
