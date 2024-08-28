<script setup lang="ts">
import axios from 'axios';
import { onMounted, ref } from 'vue';
import NotificationCard from './NotificationCard.vue';
import type { NotificationContent } from '@/interfaces';
import { notificationCache } from './profiles';
import { RouterLink } from 'vue-router';

const unreadAmount = ref(0)
let lastFetch = -1

const emit = defineEmits(['selected'])

const allNotifs = ref<NotificationContent[]>([])
const postNames = ref<NotificationContent[]>([])
function fetchNotifications(force = false) {
    if (!force && notificationCache.value) {
        allNotifs.value = notificationCache.value[0]
        postNames.value = notificationCache.value[1]
    }

    axios.get(import.meta.env.VITE_API + "/notifications.php", {params: {all: 1}}).then(res => {
        if (res == null) unreadAmount.value = 0
        allNotifs.value = res.data[0]
        postNames.value = res.data[1]
        notificationCache.value = res.data
    })
}

function removeNotifs() {
    axios.delete(import.meta.env.VITE_API + "/notifications.php", {params: {all: 1}}).then(res => {
        allNotifs.value = []
    })
}

onMounted(fetchNotifications)

</script>

<template>
    <section class="fixed right-2 top-12 w-96 text-white rounded-md shadow-drop bg-greenGradient">
        <header class="flex justify-between items-center p-2">
            <button @click="fetchNotifications(true)" class="p-1 bg-black bg-opacity-40 rounded-md bg-blend-saturation"><img src="@/images/replay.svg" class="w-5" alt=""></button>
            <RouterLink to="/notifications">
                <h2 class="text-xl cursor-pointer hover:underline">{{ $t('navbar.notifs') }} <span v-show="unreadAmount > 0" class="px-1.5 text-lg bg-red-600 rounded-md">{{ unreadAmount }}</span></h2>
            </RouterLink>
            <button @click="removeNotifs" class="p-1 bg-black bg-opacity-40 rounded-md bg-blend-saturation"><img src="@/images/trash.svg" class="w-5" alt=""></button>
        </header>
        <main class="flex flex-col min-h-32 bg-repeat-x p-2 gap-2 bg-[url(@/images/fade.webp)]">
            <NotificationCard @mouseup="emit('selected')" v-for="notif in allNotifs" v-bind="notif" :post-names="postNames" />
        </main>
    </section>
</template>