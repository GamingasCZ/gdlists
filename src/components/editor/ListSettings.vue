<script setup lang="ts">
import { levelList } from "../../Editor";

const modifyDiffGuesser = (ind: number) => {
  levelList.value.diffGuesser[ind] = !levelList.value.diffGuesser[ind]
  levelList.value.diffGuesser[0] = levelList.value.diffGuesser[1] || levelList.value.diffGuesser[2] // Hide dropdown when both disabled
  if (!levelList.value.diffGuesser[0]) {
    setTimeout(() => {
      levelList.value.diffGuesser[1] = true
      levelList.value.diffGuesser[2] = true
    }, 50)
  }
}

const diff = import.meta.env.BASE_URL + `/faces/4.webp`
const rate = import.meta.env.BASE_URL + `/faces/star.webp`


</script>

<template>
  <section class="w-full max-w-[40rem]">
    <h2 class="text-2xl text-center">{{ $t('other.settings') }}</h2>
    <div class="grid grid-cols-1 gap-2 px-2 py-2 bg-opacity-5 rounded-md sm:grid-cols-2">
      <div class="flex justify-between py-2 pl-4 bg-black bg-opacity-20 rounded-md">
        <label class="text-xl" for="private">{{ $t('editor.privateList') }}</label>
        <input type="checkbox" name="private" class="button" />
      </div>
      <div class="flex justify-between py-2 pl-4 bg-black bg-opacity-20 rounded-md">
        <label class="text-xl" for="diffGuessing" id="diffGuess">{{ $t('editor.levelGuessing') }}</label>
        <input
            type="checkbox"
            class="button"
            v-model="levelList.diffGuesser[0]"
          />
      </div>
      <Transition name="fade">
        <div
          v-show="levelList.diffGuesser[0]"
          class="box-border flex gap-2 items-center px-3 py-2 ml-8 w-max bg-black bg-opacity-25 rounded-md"
        >
          <span>{{ $t('editor.guess') }}: </span>
          <button @click="modifyDiffGuesser(1)">
            <img
              :src="diff"
              alt=""
              class="p-1 w-10 bg-black bg-opacity-50 rounded-md button"
              :class="{ disabled: !levelList.diffGuesser[1] }"
            />
          </button>
          <button @click="modifyDiffGuesser(2)">
            <img
              :src="rate"
              alt=""
              class="p-1 w-10 bg-black bg-opacity-50 rounded-md button"
              :class="{ disabled: !levelList.diffGuesser[2] }"
            />
          </button>
        </div>
      </Transition>
      <div class="flex justify-between py-2 pl-4 bg-black bg-opacity-20 rounded-md">
        <label class="text-xl" for="translucency">{{ $t('editor.translucentCards') }}</label>
        <input
          v-model="levelList.translucent"
          type="checkbox"
          name="translucency"
          class="button"
        />
      </div>
      <div class="flex justify-between py-2 pl-4 bg-black bg-opacity-20 rounded-md">
        <label class="text-xl" for="translucency">{{ $t('other.disableComments') }}</label>
        <input
          v-model="levelList.disComments"
          type="checkbox"
          name="translucency"
          class="button"
        />
      </div>
    </div>
  </section>
</template>
