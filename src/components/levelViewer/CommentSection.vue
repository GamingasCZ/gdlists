<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import ListBrowser from '../global/ListBrowser.vue';
import CommentBox from './CommentBox.vue';
import CommentPreview from './CommentPreview.vue';
import { isOnline } from '@/Editor';

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

const browser = ref<HTMLDivElement>()

const amount = ref(props.commAmount)
const commentType = computed(() => props.isReview ? "review" : "list")
const showingOnce = ref(false)
const noNoCommsIfDisabledComments = computed(() => props.commAmount == 0 && props.commentsDisabled)
watch(props, () => { // only refresh comments once
    if (!showingOnce.value) showingOnce.value = true
})

</script>

<template>
    <main class="mt-10">
        <CommentBox :is-review="isReview" :list-i-d="listID.toString()" :hidden="hiddenID" v-if="!commentsDisabled"/>
        
        <!-- Comments disabled info -->
        <div class="flex gap-2 items-center p-1 mx-auto mt-4 w-max rounded-md bg-greenGradient" v-if="commentsDisabled">
            <img src="../../images/noComments.svg" class="w-12 opacity-60" alt="">
            <span>{{ $t('listViewer.commDisableHelp', [isReview ? $t('listViewer.thisReview') : $t('listViewer.thisList')]) }}</span>
        </div>

        <section class="flex mx-auto mt-8 mb-3 items-center gap-4 max-w-[95vw] w-[58rem]" :class="{'hidden': amount == 0 || commentsDisabled}">
            <h2 class="text-3xl font-bold">{{ $t('level.comments') }}</h2>
            <hr class="h-0.5 bg-white bg-opacity-10 border-none grow">
            <button id="listRefreshButton" @click="browser?.doRefresh()" class="box-border text-lg rounded-md button">
                <img src="@/images/replay.svg" class="inline p-1 mr-3 w-8" alt="">{{ $t('other.refresh') }}
            </button>
        </section>
        
        <ListBrowser
            v-if="showingOnce && !noNoCommsIfDisabledComments"
            ref="browser"
            v-memo="[showingOnce]"
            :component="CommentPreview"
            :display-in-rows="true"
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