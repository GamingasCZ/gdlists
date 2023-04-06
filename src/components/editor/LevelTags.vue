<script setup lang="ts">
import { levelList } from "../../Editor";
import TagEditBox from "./TagEditBox.vue";

const emit = defineEmits(["openPopup"]);
defineProps({
  cardIndex: Number,
});
</script>

<template>
  <section class="box-border flex items-center justify-between">
    <div class="mr-2 flex min-h-[5rem] items-center gap-2 overflow-x-auto">
      <span v-show="!levelList.levels[cardIndex!].tags.length" class=""
        >Klikni na
        <img
          src="@/images/plus.svg"
          class="inline w-10 rounded-md bg-black bg-opacity-40 p-1"
        />
        k přidání štítků!</span
      >
      <TagEditBox
        v-for="(tag, index) in levelList.levels[cardIndex!].tags"
        :tag-name="tag[1]!"
        :tag-i-d="tag[0]"
        :tag-link="tag[2]"
        :card-index="cardIndex"
        :tag-index="index"
      />
    </div>
    <img
      src="@/images/plus.svg"
      alt=""
      @click="emit('openPopup')"
      class="button aspect-square w-10 rounded-md bg-black bg-opacity-40 p-1"
    />
  </section>
</template>
