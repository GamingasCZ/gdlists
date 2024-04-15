<script setup lang="ts">
import { makeColorFromString, parseElapsed } from "@/Editor";
import type { ListCreatorInfo, ListPreview } from "@/interfaces";
import chroma, { type Color } from "chroma-js";
import { computed, reactive, ref, watch } from "vue";
import { RouterLink } from "vue-router";

const props = defineProps<{
  rate_ratio: string;
  views: string;
  timestamp: string;
  name: string;
  tagline: string;
  id: string;
  index: number;
  uid: string;
  hidden: string;

  userArray: ListCreatorInfo[];
  disableLink?: boolean
}>();


const listColor = ref<Color>(makeColorFromString(props.name));

const emit = defineEmits(['unpinList', 'selectedLink'])

function getUsername() {
  let listCreator: string = "";
  props.userArray.forEach((user) => {
    if (props.uid == user.discord_id) listCreator = user.username;
  });
  return listCreator;
}

const getGradient = () =>
  `linear-gradient(90deg, ${listColor.value.darken(
    2
  )}, ${listColor.value.darken()}, ${listColor.value.brighten()})`;

const uploadDate = ref(new Date(props.timestamp));

const unpinList = () => {
  let pinned: ListPreview[] = JSON.parse(localStorage.getItem('pinnedLists')!)
  let i = 0
  let removedIndex = -1
  pinned.forEach((pin: ListPreview) => {
    if (pin.id == props.id) {
      pinned.splice(i, 1)
      removedIndex = i
    }
    i++
  })
  localStorage.setItem("pinnedLists", JSON.stringify(pinned))
  emit('unpinList', removedIndex)
}

const creatorName = getUsername()

</script>

<template>
  <component :is="disableLink ? 'button' : 'RouterLink'"
    :to="hidden != '0' ? hidden ?? `/${id.toString()}` : `/${id.toString()}`!"
    class="flex flex-col w-5/6 max-w-6xl cursor-pointer gap-3 relative rounded-md border-[0.2rem] border-solid bg-[length:150vw] bg-center px-2 py-0.5 text-white transition-[background-position] duration-200 hover:bg-left"
    :style="{
      backgroundImage: getGradient(),
      borderColor: listColor.darken(2).hex(),
    }" :class="{ '!border-dotted !border-white !border-opacity-40': hidden != '0' }"
    @click="emit('selectedLink', creatorName)">
    <section class="flex flex-col items-start">
      <h3 class="text-sm leading-none opacity-80">{{ tagline }}</h3>
      <h2 class="text-xl font-bold leading-tight">{{ name }}</h2>
      <p class="">
        <img src="" alt="">
        <span>{{ creatorName }}</span>
      </p>
    </section>
    <section class="flex gap-4 items-center">
      <img src="../../images/genericRate.svg" alt="" class="w-3.5" />{{
      rate_ratio
    }}
      <div v-if="timestamp" class="flex gap-1 text-xs hover:cursor-help"
        :title="`${uploadDate.toLocaleDateString()} ${uploadDate.toLocaleTimeString()}`">
        <img src="../../images/time.svg" alt="" class="w-4" />{{
      parseElapsed(Date.now() - (new Date(timestamp)))
    }}
      </div>
      <div v-if="views" class="text-sm">
        <img src="../../images/view.svg" alt="" class="inline mr-2 w-6" />
        <span>{{ views }} zhlédnutí</span>
      </div>
    </section>

  </component>
</template>
3
