<script setup lang="ts">
import { levelList } from "../../Editor";
import TagEditBox from "./TagEditBox.vue";

const emit = defineEmits(["openPopup"])
defineProps({
    cardIndex: Number
})
</script>

<template>
    <section class="box-border flex justify-between items-center">
        <div class="flex min-h-[5rem] items-center gap-2 overflow-x-auto mr-2">
            <span v-show="!levelList.levels[cardIndex!].tags.length" class="">Klikni na <img src="@/images/plus.svg" class="inline p-1 w-10 bg-black bg-opacity-40 rounded-md"> k přidání štítků!</span>
            <TagEditBox v-for="(tag, index) in levelList.levels[cardIndex!].tags" :tag-name="tag.tagName!" :tag-i-d="tag.tagID" :tag-link="tag.tagLink" :card-index="cardIndex" :tag-index="index"/>
        </div>
        <img src="@/images/plus.svg" alt="" @click="emit('openPopup')" class="p-1 w-10 bg-black bg-opacity-40 rounded-md button aspect-square">
    </section>
</template>