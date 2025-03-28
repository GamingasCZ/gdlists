<script setup lang="ts">
import axios from 'axios';
import { onMounted, ref } from 'vue';
import NotificationCard from './NotificationCard.vue';
import type { NotificationContent } from '@/interfaces';
import { currentUnread, notificationCache } from './profiles';
import { RouterLink } from 'vue-router';

const unreadAmount = ref(0)
let lastFetch = -1

const emit = defineEmits(['selected', 'close'])

const allNotifs = ref<NotificationContent[]>([])
const postNames = ref<NotificationContent[]>([])
function fetchNotifications(force = false) {
    if (!force && notificationCache.value[0].length) {
        allNotifs.value = notificationCache.value[0]
        postNames.value = notificationCache.value[1]
        return
    }

    axios.get(import.meta.env.VITE_API + "/notifications.php", {params: {all: 1}}).then(res => {
        if (res == null) unreadAmount.value = 0
        allNotifs.value = res.data[0]
        postNames.value = res.data[1]
        notificationCache.value = res.data
        currentUnread.value = 0
    })
}

function removeNotifs() {
    axios.delete(import.meta.env.VITE_API + "/notifications.php", {params: {all: 1}}).then(res => {
        allNotifs.value = []
    })
}

onMounted(() => fetchNotifications(false))

</script>

<template>
    <section class="fixed z-10 text-white sm:rounded-md sm:w-96 sm:right-2 max-sm:inset-0 sm:top-12 shadow-drop bg-greenGradient">
        <header class="flex justify-between items-center p-2">
            <button @click="fetchNotifications(true)" class="p-1 bg-black bg-opacity-40 rounded-md bg-blend-saturation button"><img src="@/images/replay.svg" class="w-5" alt=""></button>
            <RouterLink to="/notifications">
                <h2 class="text-xl cursor-pointer hover:underline">{{ $t('navbar.notifs') }} <span v-show="unreadAmount > 0" class="px-1.5 text-lg bg-red-600 rounded-md">{{ unreadAmount }}</span></h2>
            </RouterLink>
            <div class="flex gap-2">
                <button @click="removeNotifs" class="p-1 bg-black bg-opacity-40 rounded-md bg-blend-saturation button"><img src="@/images/trash.svg" class="w-5" alt=""></button>
                <button @click="emit('close')" class="sm:hidden button"><img src="@/images/close.svg" class="w-7" alt=""></button>
            </div>
        </header>
        <main class="flex flex-col min-h-60 bg-repeat-x p-2 gap-2 bg-[url(@/images/fade.webp)] max-h-[min(80svh,_40rem)] overflow-y-auto">
            <section v-if="!allNotifs" class="flex flex-col items-center my-auto text-center opacity-20 pointer-events-none">
                <img src="@/images/notifs.svg" class="w-24" alt="">
                <h2 class="mt-4 text-xl">Nic nového zatím nepřišlo!</h2>
            </section>

            <NotificationCard @mouseup="emit('selected')" v-for="notif in allNotifs" v-bind="notif" :post-names="postNames" />
        </main>
    </section>
</template>