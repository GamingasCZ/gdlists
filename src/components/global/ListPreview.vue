<script setup lang="ts">
import { makeColorFromString, parseElapsed } from "@/Editor";
import type { ListCreatorInfo, ListPreview, selectedList } from "@/interfaces";
import { SETTINGS } from "@/siteSettings";
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
  disableLink?: boolean | 2
  unrolledOptions: boolean
}>();

const listColor = ref<Color>(makeColorFromString(props.name));

const emit = defineEmits<{
  (e: 'unpinList', index: number): void
  (e: 'selectedLink', creator: string): void
  (e: 'clickedOption', data: selectedList): void
  (e: 'selected'): void
}>()

function getUsername() {
  let listCreator: string = "";
  if (!props.userArray) return ""

  props.userArray.forEach((user) => {
    if (props.uid == user.discord_id) listCreator = user.username;
  });
  return listCreator;
}

const getGradient = () => {
  if (SETTINGS.value.disableColors) {
    return getComputedStyle(document.documentElement).getPropertyValue("--secondaryColor")
  }
  
  return `linear-gradient(90deg, ${listColor.value.darken(
    2
  )}, ${listColor.value.darken()}, ${listColor.value.brighten()})`;
}

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
const clickList = (opt: number) => {
  if (props.disableLink == 2 || typeof opt == 'number') emit('clickedOption', {option: opt, postID: props.hidden != '0' ? props.hidden : props.id, postType: 0})
  else if (props.disableLink == 1) emit('selected')
  else emit('selectedLink', creatorName.value)
}

</script>

<template>
  <component
    :is="disableLink ? 'button' : 'RouterLink'"
    :to="postLink"
    class="flex flex-col font-[poppins] w-full max-w-6xl min-w-64 cursor-pointer relative rounded-md border-[0.2rem] border-solid bg-[length:150vw] bg-center px-2 py-0.5 text-white transition-[background-position] duration-200 hover:bg-left"
    :style="{
      background: getGradient(),
      borderColor: listColor.darken(2).hex(),
    }"
    :class="{'!border-dotted !border-white !border-opacity-40': hidden != '0', 'border-dashed !border-black !border-opacity-70': props.url}"
    @click="clickList"
  >
  <div class="flex gap-3 items-center">
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
      <p class="text-xs !text-white">- {{ creatorName }} -</p>
    </section>
  
    <button @click.stop.prevent="unpinList()" v-if="isPinned" class="box-border p-1 ml-auto w-10 bg-black bg-opacity-40 rounded-sm button">
      <img src="@/images/unpin.svg" alt="">
    </button>
  
      <img src="@/images/questionFarts.svg" class="absolute right-0 h-12 mix-blend-soft-light" v-if="diffGuesser == '1'" alt="">
  </div>
  <div v-if="unrolledOptions" class="flex gap-2 justify-evenly my-2">
    <button @click.stop="clickList(0)" class="p-1 w-full bg-black bg-opacity-60 rounded-md max-w-60 hover:bg-opacity-80">
      <img src="@/images/browseMobHeader.svg" class="inline mr-2 w-5" alt="">{{ $t('other.pickList') }}</button>
    <button @click.stop="clickList(1)" class="p-1 w-full bg-black bg-opacity-60 rounded-md max-w-60 hover:bg-opacity-80">
      <img src="@/images/searchOpaque.svg" class="inline mr-2 w-5" alt="">{{ $t('other.pickLevels') }}</button>
  </div>
  </component>
</template>
