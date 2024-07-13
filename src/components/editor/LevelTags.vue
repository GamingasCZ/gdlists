<script setup lang="ts">
import type { LevelList, ReviewList } from "@/interfaces";
import TagEditBox from "./TagEditBox.vue";

const emit = defineEmits(["openPopup"]);
defineProps<{
  cardIndex: number
  levelArray: LevelList | ReviewList
}>();
</script>

<template>
  <section class="box-border flex justify-between items-center">
    <div class="mr-2 flex min-h-[5rem] items-center gap-2 overflow-x-auto">
      <span v-show="!levelArray.levels[cardIndex!].tags.length" class=""
        >{{ $t('editor.clickAdd3') }}
        <img
          src="@/images/plus.svg"
          class="box-border inline p-2 mx-2 w-10 bg-black bg-opacity-40 rounded-md"
        />
        {{ $t('editor.clickAddTags') }}</span
      >
      <TagEditBox
        v-for="(tag, index) in levelArray.levels[cardIndex!].tags"
        :tag-name="tag[1]!"
        :tag-i-d="tag[0]"
        :tag-link="tag[2]"
        :level-array="levelArray"
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
