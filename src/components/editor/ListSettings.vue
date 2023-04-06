<script setup lang="ts">
import { levelList } from "../../Editor";
import { ref } from "vue";
</script>

<template>
  <section class="w-80">
    <h2 class="text-center text-xl font-bold">Nastavení</h2>
    <div class="flex flex-col gap-2 rounded-md bg-white bg-opacity-5 px-2 py-2">
      <div>
        <input type="checkbox" name="private" class="button" />
        <label for="private">Soukromý seznam</label>
      </div>
      <div>
        <input
          type="checkbox"
          v-model="levelList.diffGuesser[0]"
          name="diffGuessing"
          id="nice"
          class="button"
        />
        <label for="diffGuessing" id="diffGuess">Hádání obtížnstí</label>
      </div>
      <Transition name="fade">
        <div
          v-show="levelList.diffGuesser[0]"
          class="ml-8 box-border flex w-max items-center gap-2 rounded-md bg-black bg-opacity-25 px-3 py-2"
        >
          <span>Hádat: </span>
          <button @click="levelList.diffGuesser[1] = !levelList.diffGuesser[1]">
            <img
              src="../../images/faces/4.webp"
              alt=""
              class="button w-10 rounded-md bg-black bg-opacity-50 p-1"
              :class="{ disabled: !levelList.diffGuesser[1] }"
            />
          </button>
          <button @click="levelList.diffGuesser[2] = !levelList.diffGuesser[2]">
            <img
              src="../../images/faces/epic.webp"
              alt=""
              class="button w-10 rounded-md bg-black bg-opacity-50 p-1"
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
        <label for="translucency">Průsvitné karty</label>
      </div>
    </div>
  </section>
</template>
