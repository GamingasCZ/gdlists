<script setup lang="ts">
import SectionDivider from '../ui/SectionDivider.vue';
import Option from '../ui/Option.vue';
import type { Writer } from '@/writers/Writer';
import { inject, type Ref } from 'vue';
import type { PostData } from '@/interfaces';

const emit = defineEmits<{ (e: "upload"): void }>()
defineProps<{
  uploading: boolean;
  writer: Writer
}>()

const postData = inject<Ref<PostData>>("postData")!

</script>

<template>
    <div v-if="uploading" class="flex justify-between items-center p-2 mx-2 mb-2 bg-black bg-opacity-40 rounded-md">
      <span class="text-xl">{{ $t('reviews.settingsOk') }}</span>
      <button @click="emit('upload')" class="flex gap-2 items-center px-2 py-1 rounded-md button bg-lof-400">
        <img src="@/images/upload.svg" alt="" class="w-7">
        <span class="text-xl font-bold text-black">{{ $t('editor.upload') }}</span>
      </button>
    </div>
    
    <div class="bg-[url(@/images/fade.svg)] bg-repeat-x flex flex-col gap-2 p-2 h-[40rem] overflow-y-scroll">
      <template v-for="setting in writer.settings">
        <Option v-if="typeof setting == 'object'" v-model="postData[setting.affects]" v-bind="setting" />
        <SectionDivider :text="setting" v-else />
      </template>
    </div>
</template>
