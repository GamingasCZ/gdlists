<script setup lang="ts">
import { prettyDate } from '@/Editor';
import type { ReviewDraft } from '@/interfaces';
import { DraftAction } from '@/interfaces';
import { ref } from 'vue';

const props = defineProps<{
    draft: ReviewDraft
    key: string
    inUse: number
    isOpen: boolean
    hide: boolean
    editingName: boolean
}>()

const emit = defineEmits<{
    (e: 'editedName', newName: string): void
    (e: 'startNameEdit'): void
    (e: 'open'): void
    (e: 'action', a: DraftAction): void
}>()

const justSaved = ref(false)

</script>

<template>
    <div @click="emit('open')" v-if="!hide" class="w-full bg-black bg-opacity-40 rounded-md transition-transform" :class="{'hover:translate-x-1 active:translate-x-2': !isOpen, 'border-l-4 border-lof-400 ': inUse}">
        <div class="flex flex-col justify-between p-2">
            <div class="">
                <input v-if="editingName" type="text" maxlength="40" :value="draft.name" @click.stop="" @change="emit('editedName', $event.target.value!)" class="px-2 bg-transparent bg-white bg-opacity-0 border-b-2 focus-within:outline-none focus-within:bg-opacity-10" autocomplete="off" @mouseover="$event.target.focus()" :placeholder="$t('reviews.reviewName')">
                <h2 v-else @click.stop="emit('startNameEdit')" class="flex gap-2 items-center w-max text-xl leading-tight group">{{ draft.name }} <img src="@/images/edit.svg" class="w-2 opacity-0 transition-opacity group-hover:opacity-100"></h2>

                <ul class="flex gap-2 text-sm list-disc list-inside text-white text-opacity-40">
                    <p :title="`${$t('reviews.created')}: ${prettyDate((Date.now() - draft.createDate)/1000)}`">{{ $t('reviews.saved') }}: {{ prettyDate((Date.now() - draft.saveDate)/1000) }}</p>
                    <li>{{ $t('other.word\s', draft.wordCount) }}</li>
                </ul>
            </div>
            <hr class="my-2 opacity-20">
            <div>
                <h2 v-if="!draft.previewTitle && !draft.previewParagraph" class="opacity-20">{{ $t('reviews.draftNoPrev') }}</h2>
                <h2>{{ draft.previewTitle }}</h2>
                <p class="text-xs text-transparent bg-clip-text bg-gradient-to-b from-white to-transparent">{{ draft.previewParagraph }}</p>
            </div>
            <div v-if="inUse" class="grid grid-cols-2 gap-2 p-1">
                <button :disabled="justSaved" @click.stop="emit('action', DraftAction.Save); justSaved = true" class="flex gap-2 p-1 bg-black bg-opacity-40 rounded-md disabled:opacity-20"><img class="w-6" src="@/images/symbolicSave.svg">{{ $t('other.save') }}</button>
                <button @click.stop="emit('action', DraftAction.Clone)" class="flex gap-2 p-1 bg-black bg-opacity-40 rounded-md"><img class="w-6" src="@/images/copy.svg">{{ $t('other.duplicate') }}</button>
            </div>
            <div v-else-if="isOpen" class="grid grid-cols-3 gap-2 p-1">
                <button @click.stop="emit('action', DraftAction.Remove)" class="flex gap-2 p-1 bg-black bg-opacity-40 rounded-md"><img class="w-6" src="@/images/trash.svg">{{ $t('editor.remove') }}</button>
                <button @click.stop="emit('action', DraftAction.Preview)" class="flex gap-2 p-1 bg-black bg-opacity-40 rounded-md"><img class="w-6" src="@/images/filePreview.svg">{{ $t('other.preview') }}</button>
                <button @click.stop="emit('action', DraftAction.Load)" class="flex gap-2 p-1 bg-black bg-opacity-40 rounded-md disabled:opacity-20"><img class="w-6" src="@/images/checkThick.svg">{{ inUse == key ? $t('other.inUse') : $t('other.use') }}</button>
            </div>
        </div>
    </div>
</template>