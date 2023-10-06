<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import type { CollabData } from "../../interfaces";
import PlayerIcon from "../global/PlayerIcon.vue";

const props = defineProps<{
  collab: CollabData;
}>();

const showGDIcons = ref<boolean>(false);
const preview = ref<HTMLDivElement>()
const scrollable = ref(false)
const showAll = ref(false)
onMounted(() => {
  scrollable.value = preview.value?.scrollHeight! > 112 // 28rem
})
window.addEventListener("resize", () => scrollable.value = preview.value?.scrollHeight! > 112)

const isOldCollab = typeof props.collab[3] == "undefined"
const collabHost = computed(() => {
  if (isOldCollab) return props.collab[0][0]
  else return props.collab[0][0].name
})
const collabRole = computed(() => {
  if (isOldCollab) return props.collab[0][2]  ?? "Host"
  else return props.collab[1][props.collab[0][0].role]
})
const collabIcon = () => {
  if (isOldCollab) return props.collab[0][1]
  else return props.collab[0][0].verified
}

</script>

<template>
  <section>
    <h2 class="mb-3 text-xl font-black text-center align-middle">
      {{ collabRole }}:
      <PlayerIcon v-if="collabIcon()" :icon="collabIcon()[0]" :col1="collabIcon()[1].toString()" :col2="collabIcon()[2].toString()" :glow="collabIcon()[3]" class="inline mx-3 w-10 h-10" :quality="1"/>
      {{ collabHost }}
    </h2>
    <div
      class="flex relative flex-wrap gap-3 gap-y-5 justify-center p-2 max-h-28 overflow-clip bg-black bg-opacity-40 rounded-lg transition-colors cursor-pointer hover:bg-opacity-60"
      @mouseover="showGDIcons = true"
      :class="{'!max-h-max': showAll, 'pb-8': showAll}"
      ref="preview"
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

      <!-- Show more -->
      <button class="absolute bottom-0 p-1 rounded-t-md bg-lof-200" v-if="scrollable" @click.stop="showAll = !showAll">
        <img src="@/images/descMore.svg" class="w-6" alt="" :class="{'rotate-180': showAll}">
      </button>
    </div>
  </section>
</template>
