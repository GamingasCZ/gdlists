<script setup lang="ts">
import { fixHEX } from "@/Editor";
import type { Level } from "@/interfaces";
import chroma from "chroma-js";
import { ref } from "vue";

const props = defineProps<{
  data: Level;
}>();

const color = ref(typeof props.data.color == 'string' ? fixHEX(props.data.color) : chroma.hsl(...props.data.color).hex() )

const isCollab = ref<boolean>(typeof props.data.creator != "string");
</script>
<template>
  <button
    :style="{ backgroundColor: color }"
    class="px-2 py-1 leading-4 text-left rounded-md button focus-visible:!outline"
  >
    <h3 class="font-bold">
      <img
        v-if="isCollab"
        src="@/images/collab.svg"
        class="inline mr-1 w-4"
        alt=""
      />{{ data.levelName }}
    </h3>
    <h5 class="text-xs font-normal opacity-70">
      {{ !isCollab ? data.creator : data.creator[0][0] }}
    </h5>
  </button>
</template>
