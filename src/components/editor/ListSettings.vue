<script setup lang="ts">
import { ref } from "vue";
import { levelList } from "../../Editor";
import Dropdown from "../ui/Dropdown.vue";

const modifyDiffGuesser = () => {
  levelList.value.diffGuesser[0] = levelList.value.diffGuesser[1] || levelList.value.diffGuesser[2] // Hide dropdown when both disabled
}

const diff = import.meta.env.BASE_URL + `/faces/4.webp`
const rate = import.meta.env.BASE_URL + `/faces/star.webp`

const diffGuessOpen = ref(false)
const diffGuessButton = ref()
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
        <button ref="diffGuessButton" @click="diffGuessOpen = true" class="relative p-1 mr-1.5 bg-black bg-opacity-0 rounded-md aspect-square button hover:bg-opacity-40">
          <img src="@/images/moveDown.svg" alt="" class="mx-auto w-4">
          <div v-if="levelList.diffGuesser?.[0]" class="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-lof-400"></div>
        </button>
      </div>
      <Dropdown v-if="diffGuessOpen" @close="diffGuessOpen = false" :options="[]" :button="diffGuessButton">
        <template #header>
          <div
            class="flex flex-col gap-2 p-1 w-48 text-white"
          >
            <div class="flex gap-2 items-center p-1 bg-black bg-opacity-40 rounded-md">
              <img
                :src="diff"
                alt=""
                class="w-7"
              />
              <label for="">{{ $t('editor.difficulties') }}</label>
              <input @change="$nextTick(() => modifyDiffGuesser())" v-model="levelList.diffGuesser[1]" class="ml-auto button" type="checkbox" name="diff" id="">
            </div>
            <div class="flex gap-2 items-center p-1 bg-black bg-opacity-40 rounded-md">
              <img
                :src="rate"
                alt=""
                class="w-7"
                />
                <label for="">{{ $t('editor.ratings') }}</label>
                <input @change="$nextTick(() => modifyDiffGuesser())" v-model="levelList.diffGuesser[2]" class="ml-auto button" type="checkbox" name="rate" id="">
            </div>
            <div class="flex gap-1 items-start p-1 text-xs text-white bg-white bg-opacity-10 rounded-sm">
              <img src="@/images/info.svg" class="inline mt-1 w-3 opacity-20" alt="">
              <div>{{ $t('editor.diffGuessHelp') }}</div>
				    </div>
          </div>
        </template>
      </Dropdown>

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
