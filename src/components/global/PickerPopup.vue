<script setup lang="ts">
import { reactive, ref } from "vue";
import FavoriteBubble from "./FavoriteBubble.vue";
import LevelBubble from "./LevelBubble.vue";
import chroma from "chroma-js";

const emit = defineEmits(["closePopup", "selectOption"]);
const props = defineProps<{
  browserName: string;
  pickerData: Object[] | string;
  pickerDataType: "favoriteLevel" | "level";
}>();

const bubbleType = ref<number>(
  ["favoriteLevel", "level"].indexOf(props.pickerDataType)
);
const filteredData = ref<Object[]>([]);
const data = ref<Object[]>([]);
if (typeof props.pickerData == "string") {
  if (props.pickerData.startsWith("@")) {
    data.value = JSON.parse(localStorage.getItem(props.pickerData.slice(1))!);
  }
} else {
  data.value = props.pickerData;
}

filteredData.value = data.value;
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
      class="absolute top-1/2 left-1/2 flex h-[40rem] max-h-[95vh] w-[35rem] max-w-[95vw] -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg bg-greenGradient p-2 text-white shadow-lg shadow-black"
    >
      <div class="relative">
        <h1 class="text-center text-xl font-bold">{{ browserName }}</h1>
        <img
          src="@/images/close.svg"
          alt=""
          class="button absolute top-0 right-0 w-6"
          @click="emit('closePopup')"
        />
      </div>
      <input
        type="text"
        placeholder="Hledat..."
        class="mt-1 w-full rounded-full bg-white bg-opacity-10 p-1 px-2"
        @input="
          filteredData = data.filter((x) =>
            x.levelName.includes(($event.target as HTMLInputElement).value)
          )
        "
      />
      <main
        class="mt-2 flex flex-grow-[1] flex-col gap-1 overflow-y-auto rounded-lg bg-white bg-opacity-10 p-1"
      >
        <div
          v-if="!data.length"
          class="flex h-full flex-col items-center justify-center gap-3 text-xl opacity-30"
        >
          <img src="@/images/savedMobHeader.svg" class="w-36" />
          <h2>Neuložil jsi zatím žádné levely!</h2>
        </div>
        <div
          v-else-if="!filteredData.length"
          class="flex h-full flex-col items-center justify-center gap-3 text-xl opacity-30"
        >
          <img src="@/images/searchOpaque.svg" class="w-36" />
          <h2>Nebyly nalezeny žádné levely!</h2>
        </div>
        <component
          v-for="level in filteredData"
          @click="emit('selectOption', level)"
          :is="[FavoriteBubble, LevelBubble][bubbleType]"
          :data="level"
        />
      </main>
    </section>
  </dialog>
</template>
