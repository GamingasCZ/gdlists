<script setup lang="ts">
import Notification from './Notification.vue';
import { Stack } from '../imageUpload';


</script>

<template>
    <section class="flex fixed right-0 bottom-10 z-50 flex-col gap-2">
        <Notification v-for="(notif, key) in Stack" :key="notif.title+notif.text" v-bind="notif" :stack-index="key" />
    </section>
</template>