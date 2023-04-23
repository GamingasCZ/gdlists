<script setup lang="ts">
import ListBrowser from '../global/ListBrowser.vue';
import CommentBox from './CommentBox.vue';

defineProps({
    listID: {type: String, required: true}
})

</script>

<template>
    <main>
        <CommentBox />
        <ListBrowser :browser-name="'Komentáře'" :online-browser="true" :hide-search="true" online-type="comments" :comment-i-d="listID"/>
    </main>
</template>