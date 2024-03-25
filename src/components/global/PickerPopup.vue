<script setup lang="ts">
import { onUpdated, reactive, ref, watch } from "vue";
import FavoriteBubble from "./FavoriteBubble.vue";
import LevelBubble from "./LevelBubble.vue";
import type { FavoritedLevel, Level } from "@/interfaces";

const emit = defineEmits(["selectOption"]);
const props = defineProps<{
  outerErrorText: string
  outerError: boolean
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
      <form action="." class="flex w-full" @submit.prevent="highlightFirstElement">
        <input
          type="text"
          :placeholder="$t('other.search')+'...'"
          class="px-2 py-1 mx-2 mt-1 bg-white bg-opacity-10 rounded-md grow"
          id="pickerInput"
          @input="
            filteredData = data.filter((x) =>
              x.levelName.toLowerCase().includes(($event.target as HTMLInputElement).value.toLowerCase())
            )
          "
        />
      </form>
      <main
        class="mt-2 flex-grow-[1] overflow-y-auto overflow-x-clip p-2 bg-[url(@/images/fade.webp)] bg-repeat-x h-[40rem]"
      >
        <div
          v-if="!data.length"
          class="flex flex-col gap-3 justify-center items-center h-full text-xl opacity-30"
        >
          <img src="@/images/savedMobHeader.svg" class="w-36" />
          <h2>{{ $t('other.noSavedLevels') }}</h2>
        </div>

        <div
          v-else-if="!filteredData.length"
          class="flex flex-col gap-3 justify-center items-center h-full text-xl opacity-30"
        >
          <img src="@/images/searchOpaque.svg" class="w-36" />
          <h2>{{ $t('other.noLevelsFound') }}</h2>
        </div>

        <div
          v-else-if="outerError"
          class="flex flex-col gap-3 justify-center items-center h-full text-xl opacity-30"
        >
          <img src="@/images/close.svg" class="w-36" />
          <h2>{{ outerErrorText }}</h2>
        </div>
        
        <div v-if="!outerError" class="flex flex-col gap-2">
          <component
            v-for="level in filteredData"
            @click="emit('selectOption', level)"
            :is="[FavoriteBubble, LevelBubble][bubbleType]"
            :data="level"
            class="pickerBubble"
          />
        </div>
      </main>
</template>
