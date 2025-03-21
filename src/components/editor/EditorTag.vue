<script setup lang="ts">
import type { LevelTag } from "@/interfaces";
import { ref } from "vue";
import Dropdown from "../ui/Dropdown.vue";
const props = defineProps<{
  tag: LevelTag;
  isExample?: boolean
  selectable?: boolean
  settable?: boolean
  plus?: boolean
  gear?: boolean
}>();

const base = import.meta.env.BASE_URL

const tagSettingsOpen = ref(false)
const tagDiv = ref<HTMLDivElement>()

const openSettings = () => {
  if (props.settable)
    tagSettingsOpen.value = true
}

</script>

<template>
  <div ref="tagDiv" class="flex gap-1 items-center pr-2 text-xs bg-black bg-opacity-40 rounded-full border-2 border-black border-opacity-50 group min-w-4 sm:text-sm"
    :class="{'opacity-60 hover:opacity-100': isExample, 'button': selectable}"
  >
  <div class="inline relative align-middle">
    <img
      :src="`${base}/tags/${tag[0]}.svg`"
      class="w-3 sm:w-6"
      alt=""
    />
    <img
      v-if="gear"
      src="@/images/gear.svg"
      class="absolute top-1/2 left-1/2 p-1 w-6 bg-black bg-opacity-80 rounded-full opacity-0 transition-opacity -translate-x-1/2 -translate-y-1/2 group-hover:opacity-100"
      alt=""
    />
  </div>
    <a
      target="_blank"
      class="text-blue-300 underline"
      :href="tag[2]"
      v-if="tag[2]"
      >{{ [-1, ''].includes(tag[1]) ? $t(`editor.tags[${tag[0]}]`) : tag[1] }}</a
    >
    <span v-else>{{
      [-1, ''].includes(tag[1]) ? $t(`editor.tags[${tag[0]}]`) : tag[1]
    }}</span>

    <button v-if="plus" class="pl-2 ml-auto">
      <img src="@/images/plus.svg" class="w-3" alt="">
    </button>
  </div>

  <Dropdown v-if="tagSettingsOpen" @close="tagSettingsOpen = false" :button="tagDiv">
    <template #header>
      <input type="text" placeholder="Jméno">
    </template>
  </Dropdown>
</template>
