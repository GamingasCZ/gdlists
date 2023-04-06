<script setup lang="ts">
import { ref } from "vue";
import type { CollabData } from "../../interfaces";

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
    <h2 class="mb-3 text-center align-middle text-xl font-black">
      {{ collab[0][2] ?? "Host" }}:
      <img
        v-if="collab[0][1][0]"
        :src="`https://gdbrowser.com/icon/freedom69?icon=${collab[0][1][0]}`"
        class="mx-3 inline w-10"
      />{{ collab[0][0] }}
    </h2>
    <div
      class="button flex flex-wrap justify-center gap-3 gap-y-5 rounded-lg bg-black bg-opacity-40 p-2"
      @mouseover="showGDIcons = true"
    >
      <div v-for="person in collab[2]">
        <span
          v-show="person.verified"
          class="mr-2 inline-block h-8 w-8 rounded-md bg-contain align-middle"
          :style="{
            backgroundColor: getIconPlaceholder(person),
            backgroundImage: getIcon(person),
          }"
        ></span>
        <span
          class="transition-colors duration-200"
          :style="{ color: showGDIcons ? person.color : 'white' }"
          >{{ person.name }}</span
        >
      </div>
    </div>
  </section>
</template>
