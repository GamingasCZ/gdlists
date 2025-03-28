<script setup lang="ts">
import type { LevelTag } from "@/interfaces";
import { nextTick, ref } from "vue";
import Tooltip from "../ui/Tooltip.vue";
defineProps<{
  tag: LevelTag;
  white?: boolean
}>();

const base = import.meta.env.BASE_URL
const tagy = ref<HTMLDivElement>()
const linkTooltipShown = ref(false)

const openLinkTooltip = () => {
  linkTooltipShown.value = true
  nextTick(() => document.body.addEventListener("mouseup", () => linkTooltipShown.value = false, {once: true}))
}

</script>

<template>
  <div class="pr-2 text-xs rounded-full border-2 border-opacity-50 sm:text-sm" ref="tagy"
    :class="{'bg-black bg-opacity-40 border-black': !white, 'bg-white border-white bg-opacity-50': white}"
  >
    <img
      :src="`${base}/tags/${tag[0]}.svg`"
      class="inline mr-2 w-3 align-middle sm:w-6"
      alt=""
    />
    <a
      target="_blank"
      @click.prevent="openLinkTooltip"
      class="text-blue-300 underline"
      :href="tag[2]"
      v-if="tag[2]"
      >{{ [-1, ''].includes(tag[1]) ? $t(`editor.tags[${tag[0]}]`) : tag[1] }}</a
    >
    <span v-else>{{
      [-1, ''].includes(tag[1]) ? $t(`editor.tags[${tag[0]}]`) : tag[1]
    }}</span>
  </div>

  <Tooltip class="button" v-if="linkTooltipShown" :text="tag[2]" :button="tagy">
    <template #after>
      <a :href="tag[2]" @mouseup.stop="" target="_blank" class="p-1 mr-2 h-max"><img src="@/images/link.svg" class="w-5" alt=""></a>
    </template>
  </Tooltip>
</template>
