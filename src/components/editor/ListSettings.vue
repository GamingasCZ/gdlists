<script setup lang="ts">
import { levelList } from '../../Editor'
import { ref } from 'vue'

const changeTranslucency = (e: Event) =>
  (levelList.value.translucent = (e.currentTarget as HTMLInputElement).checked)
const changeDiffGuesser = (e: Event, index: number) => {
  levelList.value.diffGuesser[index] = (e.currentTarget as HTMLInputElement).checked

  if (index == 0) diffGuesserEnabled.value = levelList.value.diffGuesser[0]
}

const diffGuesserEnabled = ref<Boolean>(levelList.value.diffGuesser[0])
</script>

<template>
  <section class="w-80">
    <h2 class="text-center text-xl font-bold">Nastavení</h2>
    <div class="flex flex-col gap-2 rounded-md bg-white bg-opacity-5 px-2 py-2">
      <div>
        <input
          type="checkbox"
          name="private"
          class="button mr-2 h-6 w-6 border-none align-middle"
        />
        <label for="private">Soukromý seznam</label>
      </div>
      <div>
        <input
          type="checkbox"
          @input="changeDiffGuesser($event, 0)"
          name="diffGuessing"
          id="nice"
          class="button mr-2 h-6 w-6 border-none align-middle"
        />
        <label for="diffGuessing" id="diffGuess">Hádání obtížnstí</label>
      </div>
      <Transition name="fade">
        <div
          v-show="diffGuesserEnabled"
          class="ml-8 box-border flex w-max items-center gap-2 rounded-md bg-black bg-opacity-25 py-2 px-3"
        >
          <span>Hádat: </span>
          <img
            src="../../images/faces/4.webp"
            alt=""
            class="button w-10 rounded-md bg-black bg-opacity-50 p-1"
          />
          <img
            src="../../images/faces/epic.webp"
            alt=""
            class="button w-10 rounded-md bg-black bg-opacity-50 p-1"
          />
        </div>
      </Transition>
      <div>
        <input
          @input="changeTranslucency"
          type="checkbox"
          name="translucency"
          class="button mr-2 h-6 w-6 border-none align-middle"
        />
        <label for="translucency">Průsvitné karty</label>
      </div>
    </div>
  </section>
</template>
