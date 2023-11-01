<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import ListBrowser from '../global/ListBrowser.vue';
import CommentBox from './CommentBox.vue';

const props = defineProps({
    listID: {type: String, required: true},
    commAmount: {type: Number, required: true},
    showing: {type: Boolean, required: true},
    commentsDisabled: {type: Boolean, default: false}
})

const amount = ref(props.commAmount)
const showingOnce = ref(false)
const noNoCommsIfDisabledComments = computed(() => props.commAmount == 0 && props.commentsDisabled)
watch(props, () => { // only refresh comments once
    if (!showingOnce.value) showingOnce.value = true
})

</script>

<template>
    <main>
        <CommentBox :list-i-d="listID.toString()" v-if="!commentsDisabled"/>
        
        <!-- Comments disabled info -->
        <div class="flex gap-2 items-center p-1 mx-auto mt-4 w-max rounded-md bg-greenGradient" v-if="commentsDisabled">
            <img src="../../images/noComments.svg" class="w-12 opacity-60" alt="">
            <span>{{ $t('listViewer.commDisableHelp') }}</span>
        </div>

        <hr class="max-w-[95vw] w-[70rem] rounded-full bg-white bg-opacity-40 border-none h-0.5 mx-auto my-4 max-sm:hidden" :class="{'hidden': amount == 0}">
        <ListBrowser v-if="showingOnce && !noNoCommsIfDisabledComments" :online-browser="true" :hide-search="true" online-type="comments" :comment-i-d="listID" :refreshButton="true" @refreshed-browser="amount = $event"/>
    </main>
</template>