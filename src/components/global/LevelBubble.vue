<script setup lang="ts">
import type { Level } from "@/interfaces";
import chroma from "chroma-js";
import { ref } from "vue";

const props = defineProps<{
  data: Level;
}>();

const isCollab = ref<boolean>(typeof props.data.creator != "string");
</script>
<template>
  <button
    :style="{ backgroundColor: chroma(data.color).hex() }"
    class="button rounded-md px-2 py-1 text-left leading-4"
  >
    <h3 class="font-bold">
      <img
        v-if="isCollab"
        src="@/images/collab.svg"
        class="mr-1 inline w-4"
        alt=""
      />{{ data.levelName }}
    </h3>
    <h5 class="text-xs font-normal opacity-70">
      {{ !isCollab ? data.creator : data.creator[0][0] }}
    </h5>
  </button>
</template>
