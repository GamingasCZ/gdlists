<script setup lang="ts">
import { ref } from "vue";
import type { CollabData } from "../../interfaces";
import PlayerIcon from "../global/PlayerIcon.vue";

const props = defineProps<{
  collab: CollabData;
}>();

const showGDIcons = ref<boolean>(false);
const getIcon = (person: any) =>
  showGDIcons.value && typeof person.verified != "number"
    ? `url('https://gdbrowser.com/icon/freedom69?icon=${person.verified[0]}')`
    : "none";
const getIconPlaceholder = (person: any) =>
  !showGDIcons.value && typeof person.verified != "number"
    ? person.color
    : "transparent";
</script>

<template>
  <section>
    <h2 class="mb-3 text-xl font-black text-center align-middle">
      {{ collab[0][2] ?? "Host" }}:
      <img
        v-if="collab[0][1][0]"
        :src="`https://gdbrowser.com/icon/freedom69?icon=${collab[0][1][0]}`"
        class="inline mx-3 w-10"
      />{{ collab[0][0] }}
    </h2>
    <div
      class="flex flex-wrap gap-3 gap-y-5 justify-center p-2 bg-black bg-opacity-40 rounded-lg button"
      @mouseover="showGDIcons = true"
    >
      <div v-for="person in collab[2]">
        <PlayerIcon
          :icon="person.verified[0]" :col1="person.verified[1]" :col2="person.verified[2]" :glow="person.verified[3]" :quality="1"
          class="inline-block mr-2 w-8 h-8 align-middle"
          v-if="person.verified != 0"
        />
        <span
          class="transition-colors duration-200"
          :style="{ color: showGDIcons ? person.color : 'white' }"
          >{{ person.name }}</span
        >
      </div>
    </div>
  </section>
</template>
