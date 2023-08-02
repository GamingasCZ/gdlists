<script setup lang="ts">
import { levelList } from "../../Editor";
import TagEditBox from "./TagEditBox.vue";

const emit = defineEmits(["openPopup"]);
defineProps({
  cardIndex: Number,
});
</script>

<template>
  <section class="box-border flex justify-between items-center">
    <div class="mr-2 flex min-h-[5rem] items-center gap-2 overflow-x-auto">
      <span v-show="!levelList.levels[cardIndex!].tags.length" class=""
        >{{ $t('editor.clickAdd3') }}
        <img
          src="@/images/plus.svg"
          class="box-border inline p-2 mx-2 w-10 bg-black bg-opacity-40 rounded-md"
        />
        {{ $t('editor.clickAddTags') }}</span
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
      class="box-border p-2 w-10 bg-black bg-opacity-40 rounded-md button aspect-square"
    />
  </section>
</template>
