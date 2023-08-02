<script setup lang="ts">
import { ref, watch } from 'vue';
import ListBrowser from '../global/ListBrowser.vue';
import CommentBox from './CommentBox.vue';

const props = defineProps({
    listID: {type: String, required: true},
    commAmount: {type: Number, required: true},
    showing: {type: Boolean, required: true}
})

const amount = ref(props.commAmount)
const showingOnce = ref(false)
watch(props, () => { // only refresh comments once
    if (!showingOnce.value) showingOnce.value = true
})

</script>

<template>
    <main>
        <CommentBox :list-i-d="listID.toString()" />
        <hr class="max-w-[95vw] w-[70rem] rounded-full bg-white bg-opacity-40 border-none h-0.5 mx-auto my-4 max-sm:hidden" :class="{'hidden': amount == 0}">
        <ListBrowser v-if="showingOnce" :online-browser="true" :hide-search="true" online-type="comments" :comment-i-d="listID" :refreshButton="true" @refreshed-browser="amount = $event"/>
    </main>
</template>