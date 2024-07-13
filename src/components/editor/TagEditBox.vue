<script setup lang="ts">
import type { LevelList, ReviewList } from "@/interfaces";
import LinkIcon from "@/svgs/LinkIcon.vue";
import { ref } from "vue";

const props = defineProps<{
  tagName: string | number;
  tagID: number;
  tagLink: string;
  cardIndex: number;
  tagIndex: number;
  levelArray: ReviewList | LevelList
}>();

const editingLink = ref<boolean>(false);

const moveTagPos = (from: number, to: number) => {
  if (to < 0 || to >= props.levelArray.value.levels[props.cardIndex!].tags.length)
    return;
  editingLink.value = false;

  let currentTag =
    props.levelArray.value.levels[props.cardIndex!].tags[props.tagIndex!];
  props.levelArray.value.levels[props.cardIndex!].tags.splice(from, 1);
  props.levelArray.value.levels[props.cardIndex!].tags.splice(to, 0, currentTag);
};

const BASE_URL = import.meta.env.BASE_URL

</script>

<template>
  <div
    class="flex gap-2 items-center px-1 py-2 min-w-max bg-black bg-opacity-20 rounded-md"
  >
    <img
      src="@/images/showCommsL.svg"
      class="w-4 button"
      alt=""
      @click="moveTagPos(tagIndex!, tagIndex! - 1)"
    />
    <div class="flex flex-col gap-2 items-center">
      <div class="flex items-center">
        <LinkIcon
          class="w-5 button"
          @click="editingLink = !editingLink"
          :editing="editingLink"
          :modified="!!tagLink?.length"
        />
        <img
          :src="`${BASE_URL}/tags/${props.tagID}.svg`"
          alt=""
          class="mx-3 w-8"
        />
        <img
          src="@/images/close.svg"
          alt=""
          class="w-5 button"
          @click="levelArray.levels[cardIndex!].tags.splice(tagIndex!, 1)"
        />
      </div>
      <input
        v-if="!editingLink"
        @input="
          levelArray.levels[cardIndex!].tags[tagIndex!][1] = (
            $event.target as HTMLInputElement
          ).value
        "
        type="text"
        maxlength="50"
        :value="tagName || $t('editor.tags[' + tagID + ']')"
        :placeholder="$t('editor.tagText')"
        class="px-1 w-28 text-sm text-center bg-black bg-opacity-20 rounded-full"
      />
      <input
        v-else
        type="text"
        @input="
          levelArray.levels[cardIndex!].tags[tagIndex!][2] = (
            $event.target as HTMLInputElement
          ).value
        "
        :value="tagLink"
        maxlength="100"
        :placeholder="$t('editor.tagLink')"
        class="px-1 w-28 text-sm text-center bg-black bg-opacity-20 rounded-full"
      />
    </div>
    <img
      src="@/images/showComms.svg"
      class="w-4 button"
      alt=""
      @click="moveTagPos(tagIndex!, tagIndex! + 1)"
    />
  </div>
</template>
