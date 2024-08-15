<script setup lang="ts">
import type { LevelTag } from "@/interfaces";
import { inject } from "vue";
import Tag from "./Tag.vue";

const emit = defineEmits(["closePopup"]);
const props = defineProps<{
    video: string;
    levelID: string;
    tags: LevelTag[]
}>();

const copyID = inject("idCopyTimestamp")
</script>

<template>
    <div>
        <div class="flex gap-1.5 justify-center sm:hidden">
            <a class="button" v-if="video" :href="`https://youtu.be/${video}`"><img class="w-12"
                    src="@/images/modYT.svg" alt="" /></a>
            <a class="button" v-if="levelID" :href="`https://gdbrowser.com/${levelID}`" target="_blank"><img
                    class="w-12" src="@/images/modGDB.svg" alt="" /></a>
            <button class="button" v-if="levelID?.match(/^\d+$/)" @click="copyID(levelID)">
                <img class="w-12" src="@/images/modID.svg" alt="" />
            </button>
        </div>
    </div>

    <div class="bg-[url(@/images/fade.webp)] bg-repeat-x p-2 h-96 overflow-auto flex flex-col gap-1 mt-2">
        <Tag v-for="tag in tags" :tag="tag" />
        <div class="flex flex-col mt-24 w-full text-center opacity-40" v-if="tags && tags.length == 0">
            <img src="@/images/close.svg" class="box-border p-4 mx-auto w-28" alt="">
            <span class="text-xl">{{ $t('listViewer.noTags') }}</span>
        </div>
    </div>
</template>
