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
        currentUnread.value = 0
    })
}
fetchNotifications()
const base = import.meta.env.BASE_URL

const selectedNotifs = ref([])

</script>

<template>
    <section class="text-white mx-auto max-w-[60rem] p-2">
        <header class="mb-4">
            <h1 class="text-3xl">{{ $t('navbar.notifs') }}</h1>
            <section class="grid grid-cols-3 grid-rows-2 grid-flow-col justify-items-center">
                <h4>Druh</h4>
                <div class="border-collapse">
                    <button :title="$t('editor.ratings')" class="p-1 rounded-l-md border border-lof-300"><img :src="`${base}/notifBadges/like.svg`" class="w-5" alt=""></button>
                    <button :title="$t('level.comments')" class="p-1 border border-lof-300"><img :src="`${base}/notifBadges/comment.svg`" class="w-5" alt=""></button>
                    <button :title="$t('other.other2')" class="p-1 rounded-r-md border border-lof-300"><img :src="`${base}/notifBadges/other.svg`" class="w-5" alt=""></button>
                </div>
                <h4>Druh</h4>
                <div class="border-collapse">
                    <button :title="$t('editor.ratings')" class="p-1 rounded-l-md border border-lof-300"><img :src="`${base}/notifBadges/like.svg`" class="w-5" alt=""></button>
                    <button :title="$t('level.comments')" class="p-1 border border-lof-300"><img :src="`${base}/notifBadges/comment.svg`" class="w-5" alt=""></button>
                    <button :title="$t('other.other2')" class="p-1 rounded-r-md border border-lof-300"><img :src="`${base}/notifBadges/like.svg`" class="w-5" alt=""></button>
                </div>
                <h4>Řazení</h4>
                <select class="bg-transparent border border-lof-300">
                    <option value="">{{ $t('other.newest') }}</option>
                    <option value="">Nejstarší nepřečtené</option>
                    <option value="">Nejstarší</option>
                </select>
            </section>
        </header>
        <main class="flex overflow-y-auto flex-col gap-2">
            <NotificationCard @click.stop="" v-for="notif in allNotifs" :selected="selectedNotifs.includes(notif.id)" v-bind="notif" :post-names="postNames" />
        </main>
    </section>
</template>