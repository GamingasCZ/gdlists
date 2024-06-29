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
  creator: string;
  id?: string;
  url?: string;
  index: number;
  diffGuesser: '0' | '1';
  uid: string;
  hidden: string;
  isPinned: boolean

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

const uploadDate = ref(new Date(parseInt(props.timestamp!)*1000));

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

const creatorName = computed(() => props.creator?.length ? props.creator : getUsername())

const postLink = props.url ? `/review/${props.url}` : `/${props.hidden == 0 ? props.id : props.hidden}`
</script>

<template>
  <component
    :is="disableLink ? 'button' : 'RouterLink'"
    :to="postLink"
    class="flex font-[poppins] w-5/6 max-w-6xl cursor-pointer items-center gap-3 relative rounded-md border-[0.2rem] border-solid bg-[length:150vw] bg-center px-2 py-0.5 text-white transition-[background-position] duration-200 hover:bg-left"
    :style="{
      backgroundImage: getGradient(),
      borderColor: listColor.darken(2).hex(),
    }"
    :class="{'!border-dotted !border-white !border-opacity-40': hidden != '0', 'border-dashed !border-black !border-opacity-70': props.url}"
    @click="emit('selectedLink', creatorName)"
  >
    <section v-if="rate_ratio" class="flex flex-col items-center text-xs">
      <img src="../../images/genericRate.svg" alt="" class="w-3.5" />{{
        rate_ratio
      }}
    </section>

    <section class="flex flex-col gap-1 items-center">
      <div v-if="views" class="flex gap-1 text-xs">
        <img src="../../images/view.svg" alt="" class="w-4" />{{ views }}
      </div>
      <div
        v-if="timestamp"
        class="flex gap-1 text-xs hover:cursor-help"
        :title="`${uploadDate.toLocaleDateString()} ${uploadDate.toLocaleTimeString()}`"
      >
        <img src="../../images/time.svg" alt="" class="w-4" />{{
          parseElapsed(Date.now() / 1000 - timestamp)
        }}
      </div>
    </section>

    <section class="flex flex-col items-start">
      <h1 class="text-lg font-bold">{{ name }}</h1>
      <p class="text-xs">- {{ creatorName }} -</p>
    </section>

    <button @click.stop.prevent="unpinList()" v-if="isPinned" class="box-border p-1 ml-auto w-10 bg-black bg-opacity-40 rounded-sm button">
      <img src="@/images/unpin.svg" alt="">
    </button>

    <img src="@/images/questionFarts.svg" class="absolute right-0 h-12 mix-blend-soft-light" v-if="diffGuesser == '1'" alt="">
  </component>
</template>
3
