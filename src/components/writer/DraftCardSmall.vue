<script setup lang="ts">
import { prettyDate } from '@/Editor';
import type { ReviewDraft } from '@/interfaces';
import parseText from '../global/parseEditorFormatting';

defineProps<{
    draft: ReviewDraft
}>()

const emit = defineEmits<{
    (e: 'previewDraft'): void
}>()

</script>

<template>
    <button
        class="flex relative flex-col p-2 h-32 text-left rounded-md border group aspect-video border-lof-400"
    >
        <h4 class="text-xl font-bold leading-tight">{{ draft.name }}</h4>
        <p class="text-sm text-white text-opacity-40">{{ prettyDate((Date.now() - draft.saveDate) / 1000) }}</p>
        <hr class="opacity-20">
        <p :style="{mask: 'linear-gradient(white, #FFFFFF20)'}">
            <p class="text-sm font-bold">{{ draft.previewTitle }}</p>
            <p v-if="draft.previewParagraph.length" class="text-xs" v-html="parseText(draft.previewParagraph, true)"></p>
            <p v-else class="text-xs text-white text-opacity-40">{{ $t('reviews.draftNoPrev') }}</p>
        </p>
        <button class="absolute bottom-2 left-1/2 p-2 w-max bg-black bg-opacity-60 rounded-sm opacity-0 transition-opacity duration-75 -translate-x-1/2 button group-hover:opacity-100" @click.stop="emit('previewDraft')">
            <img src="@/images/view.svg" class="w-5" alt="">
        </button>
    </button>
</template>