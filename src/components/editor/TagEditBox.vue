<script setup lang="ts">
import { levelList } from "@/Editor";
import LinkIcon from "@/svgs/LinkIcon.vue";
import { ref, reactive } from "vue";

const props = defineProps<{
  tagName: string | number;
  tagID: number;
  tagLink: string;
  cardIndex: number;
  tagIndex: number;
}>();

const editingLink = ref<boolean>(false);

const moveTagPos = (from: number, to: number) => {
  if (to < 0 || to >= levelList.value.levels[props.cardIndex!].tags.length)
    return;
  editingLink.value = false;

  let currentTag =
    levelList.value.levels[props.cardIndex!].tags[props.tagIndex!];
  levelList.value.levels[props.cardIndex!].tags.splice(from, 1);
  levelList.value.levels[props.cardIndex!].tags.splice(to, 0, currentTag);
};
</script>

<template>
  <div
    class="flex items-center gap-2 rounded-md bg-black bg-opacity-20 px-1 py-2"
  >
    <img
      src="@/images/showCommsL.svg"
      class="button w-4"
      alt=""
      @click="moveTagPos(tagIndex!, tagIndex! - 1)"
    />
    <div class="flex flex-col items-center gap-2">
      <div class="flex items-center">
        <LinkIcon
          class="button w-5"
          @click="editingLink = !editingLink"
          :editing="editingLink"
          :modified="!!tagLink?.length"
        />
        <img
          :src="'/src/images/badges/' + tagID + '.svg'"
          alt=""
          class="mx-3 w-8"
        />
        <img
          src="@/images/close.svg"
          alt=""
          class="button w-5"
          @click="levelList.levels[cardIndex!].tags.splice(tagIndex!, 1)"
        />
      </div>
      <input
        v-if="!editingLink"
        @input="
          levelList.levels[cardIndex!].tags[tagIndex!][1] = (
            $event.target as HTMLInputElement
          ).value
        "
        type="text"
        :value="tagName || $t('editor.tags[' + tagID + ']')"
        placeholder="Text štítku"
        class="w-28 rounded-full bg-black bg-opacity-20 px-1 text-center text-sm"
      />
      <input
        v-else
        type="text"
        @input="
          levelList.levels[cardIndex!].tags[tagIndex!][2] = (
            $event.target as HTMLInputElement
          ).value
        "
        :value="tagLink"
        placeholder="Odkaz štítku"
        class="w-28 rounded-full bg-black bg-opacity-20 px-1 text-center text-sm"
      />
    </div>
    <img
      src="@/images/showComms.svg"
      class="button w-4"
      alt=""
      @click="moveTagPos(tagIndex!, tagIndex! + 1)"
    />
  </div>
</template>
