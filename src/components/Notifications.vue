<script setup lang="ts">
import axios from 'axios';
import NotificationCard from './global/NotificationCard.vue';
import { notificationCache } from './global/profiles';
import { ref } from 'vue';
import { i18n } from '@/locales';

document.title = `${i18n.global.t('navbar.notifs')} | ${i18n.global.t('other.websiteName')}`

const allNotifs = ref<NotificationContent[]>([])
const postNames = ref<NotificationContent[]>([])
function fetchNotifications(force = false) {
    if (!force && notificationCache.value) {
        allNotifs.value = notificationCache.value[0]
        postNames.value = notificationCache.value[1]
    }

    axios.get(import.meta.env.VITE_API + "/notifications.php", {params: {all: 1}}).then(res => {
        allNotifs.value = res.data[0]
        postNames.value = res.data[1]
        notificationCache.value = res.data
    })
}
fetchNotifications()

</script>

<template>
    <section class="text-white mx-auto max-w-[60rem] p-2">
        <header class="mb-4">
            <h1 class="text-3xl">{{ $t('navbar.notifs') }}</h1>
        </header>
        <main class="flex flex-col gap-2">
            <NotificationCard v-for="notif in allNotifs" v-bind="notif" :post-names="postNames" />
        </main>
    </section>
</template>