<script setup lang="ts">
import { onUpdated, reactive, ref, watch } from "vue";
import FavoriteBubble from "./FavoriteBubble.vue";
import LevelBubble from "./LevelBubble.vue";
import chroma from "chroma-js";
import type { FavoritedLevel, Level } from "@/interfaces";

const emit = defineEmits(["closePopup", "selectOption"]);
const props = defineProps<{
  browserName: string;
  pickerData: Level[] | FavoritedLevel[] | string;
  pickerDataType: "favoriteLevel" | "level";
}>();

const bubbleType = ref<number>(
  ["favoriteLevel", "level"].indexOf(props.pickerDataType)
);
const filteredData = ref<Level[] | FavoritedLevel[]>([]);
const data = ref<Level[] | FavoritedLevel[]>([]);
if (typeof props.pickerData == "string") {
  if (props.pickerData.startsWith("@")) {
    data.value = JSON.parse(localStorage.getItem(props.pickerData.slice(1))!);
  }
} else {
  data.value = props.pickerData ?? [];
}

watch(props, () => {
  if (typeof props.pickerData == 'object') {
    data.value = props.pickerData
    filteredData.value = props.pickerData
  }
})

const highlightFirstElement = () => {
  document.querySelector(".pickerBubble")!.focus()
}

filteredData.value = data.value;

onUpdated(() => {
  document.getElementById("pickerInput")?.focus()
})

</script>

<template>
  <Transition name="fade">
    <dialog
      open
      @click="emit('closePopup')"
      tabindex="0"
      @keyup.esc="emit('closePopup')"
    >
      <Transition name="slide">
        <section
          @click.stop=""
          class="absolute top-1/2 left-1/2 flex h-[40rem] max-h-[95svh] w-[35rem] max-w-[95vw] -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg bg-greenGradient p-2 text-white shadow-lg shadow-black"
        >
          <div class="relative">
            <h1 class="text-xl font-bold text-center">{{ browserName }}</h1>
            <img
              src="@/images/close.svg"
              alt=""
              class="absolute top-0 right-0 w-6 button"
              @click="emit('closePopup')"
            />
          </div>
          <form action="." @submit.prevent="highlightFirstElement">
            <input
              type="text"
              placeholder="Hledat..."
              class="p-1 px-2 mt-1 w-full bg-white bg-opacity-10 rounded-full"
              id="pickerInput"
              @input="
                filteredData = data.filter((x) =>
                  x.levelName.toLowerCase().includes(($event.target as HTMLInputElement).value.toLowerCase())
                )
              "
            />
          </form>
          <main
            class="mt-2 flex flex-grow-[1] flex-col gap-1 overflow-y-auto rounded-lg bg-white bg-opacity-10 p-1"
          >
            <div
              v-if="!data.length"
              class="flex flex-col gap-3 justify-center items-center h-full text-xl opacity-30"
            >
              <img src="@/images/savedMobHeader.svg" class="w-36" />
              <h2>Neuložil jsi zatím žádné levely!</h2>
            </div>
            <div
              v-else-if="!filteredData.length"
              class="flex flex-col gap-3 justify-center items-center h-full text-xl opacity-30"
            >
              <img src="@/images/searchOpaque.svg" class="w-36" />
              <h2>Nebyly nalezeny žádné levely!</h2>
            </div>
            <component
              v-for="level in filteredData"
              @click="emit('selectOption', level)"
              :is="[FavoriteBubble, LevelBubble][bubbleType]"
              :data="level"
              class="pickerBubble"
            />
          </main>
        </section>
      </Transition>
    </dialog>
  </Transition>
</template>
