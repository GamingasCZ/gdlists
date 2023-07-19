<script setup lang="ts">
import { ref } from 'vue';
import ListBrowser from '../global/ListBrowser.vue';
import CommentBox from './CommentBox.vue';

const props = defineProps({
    listID: {type: String, required: true},
    commAmount: {type: Number, required: true}
})

const amount = ref(props.commAmount)

</script>

<template>
    <main>
        <CommentBox :list-i-d="listID.toString()" />
        <hr class="max-w-[95vw] w-[70rem] rounded-full bg-white bg-opacity-40 border-none h-1 mx-auto mt-6 mb-6 max-sm:hidden" :class="{'hidden': amount == 0}">
        <ListBrowser :online-browser="true" :hide-search="true" online-type="comments" :comment-i-d="listID" :refreshButton="true" @refreshed-browser="amount = $event"/>
    </main>
</template>