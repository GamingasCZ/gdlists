<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import ListBrowser from '../global/ListBrowser.vue';
import CommentBox from './CommentBox.vue';
import CommentPreview from './CommentPreview.vue';

const props = defineProps<{
    listID: number
    hiddenID: string
    isReview: boolean
    commAmount: number
    showing: boolean
    commentsDisabled: boolean
}>()

const emit = defineEmits<{
    (e: "updateCommentAmount", count: number): void
}>()

const amount = ref(props.commAmount)
const commentType = computed(() => props.isReview ? "review" : "list")
const showingOnce = ref(false)
const noNoCommsIfDisabledComments = computed(() => props.commAmount == 0 && props.commentsDisabled)
watch(props, () => { // only refresh comments once
    if (!showingOnce.value) showingOnce.value = true
})

</script>

<template>
    <main>
        <CommentBox :is-review="isReview" :list-i-d="listID.toString()" :hidden="hiddenID" v-if="!commentsDisabled"/>
        
        <!-- Comments disabled info -->
        <div class="flex gap-2 items-center p-1 mx-auto mt-4 w-max rounded-md bg-greenGradient" v-if="commentsDisabled">
            <img src="../../images/noComments.svg" class="w-12 opacity-60" alt="">
            <span>{{ $t('listViewer.commDisableHelp', [isReview ? $t('listViewer.thisReview') : $t('listViewer.thisList')]) }}</span>
        </div>

        <hr class="max-w-[95vw] w-[70rem] rounded-full bg-white bg-opacity-40 border-none h-0.5 mx-auto my-4 max-sm:hidden" :class="{'hidden': amount == 0 || commentsDisabled}">
        <ListBrowser
            v-if="showingOnce && !noNoCommsIfDisabledComments"
            v-memo="[showingOnce]"
            :component="CommentPreview"
            :online-browser="true"
            :hide-search="true"
            online-type="comments"
            class="p-2"
            :comment-i-d="{type: commentType, objectID: listID}"
            :refreshButton="!commentsDisabled"
            @refreshed-browser="amount = $event; emit('updateCommentAmount', $event)"
        />
    </main>
</template>