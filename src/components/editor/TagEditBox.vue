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

const tagPath = ref("")
const getTag = async () => tagPath.value = await import(`../../images/badges/${props.tagID}.svg`).then(res => res.default)
getTag()

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
          :src="tagPath"
          alt=""
          class="mx-3 w-8"
        />
        <img
          src="@/images/close.svg"
          alt=""
          class="w-5 button"
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
        maxlength="50"
        :value="tagName || $t('editor.tags[' + tagID + ']')"
        :placeholder="$t('editor.tagText')"
        class="px-1 w-28 text-sm text-center bg-black bg-opacity-20 rounded-full"
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
