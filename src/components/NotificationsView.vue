<script setup lang="ts">
import NotificationCard from './global/NotificationCard.vue';
import { ref } from 'vue';
import { i18n } from '@/locales';
import NotifsIcon from "../images/notifs.svg?raw"
import { allNotifs, fetchNotifications, postNames, removeNotifs } from './global/notifications.js';

document.title = `${i18n.global.t('navbar.notifs')} | ${i18n.global.t('other.websiteName')}`

const changeFilters = () => {
    fetchNotifications(true, sorting.value, type.value)
}

const changeType = (to: number) => {
    if (type.value == to) {
        type.value = -1
        return changeFilters()
    }
    type.value = to
    changeFilters()
}

if (!allNotifs.value.length)
    fetchNotifications(true)

const sorting = ref(0)
const type = ref(-1)
const base = import.meta.env.BASE_URL

const selectedNotifs = ref([])

</script>

<template>
    <section class="text-white mx-auto max-w-[60rem] p-2">
        <header class="my-4">
            <div class="flex gap-2 items-center">
                <h1 class="text-3xl">{{ $t('navbar.notifs') }}</h1>
                <hr class="h-0.5 bg-white opacity-20 grow">
                <button @click="removeNotifs()" class="flex p-2 bg-black bg-opacity-40 rounded-md button">
                    <img src="@/images/trash.svg" class="mr-2 w-5" alt="">
                    {{ $t('homepage.clear') }}
                </button>
            </div>
            <section class="grid grid-cols-2 grid-rows-2 grid-flow-col justify-items-center">
                <h4>{{ $t('other.type') }}</h4>
                <div class="border-collapse">
                    <button @click="changeType(0)" :class="{'bg-lof-300': type == 0}" :title="$t('editor.ratings')" class="p-1 rounded-l-md border border-lof-300"><img :src="`${base}/notifBadges/like.svg`" class="w-5" alt=""></button>
                    <button @click="changeType(1)" :class="{'bg-lof-300': type == 1}" :title="$t('level.comments')" class="p-1 border border-lof-300"><img :src="`${base}/notifBadges/comment.svg`" class="w-5" alt=""></button>
                    <button @click="changeType(2)" :class="{'bg-lof-300': type == 2}" :title="$t('other.other2')" class="p-1 rounded-r-md border border-lof-300"><img :src="`${base}/notifBadges/other.svg`" class="w-5" alt=""></button>
                </div>
                <h4>{{ $t('other.sort') }}</h4>
                <select @change="changeFilters" v-model="sorting" class="bg-transparent border border-lof-300">
                    <option :value="0">{{ $t('other.newest') }}</option>
                    <option :value="1">{{ $t('other.oldest') }}</option>
                </select>
            </section>
        </header>
        <main class="flex overflow-y-auto flex-col gap-2">
            <div v-if="!allNotifs.length" class="flex flex-col items-center mx-auto opacity-20">
                <div v-html="NotifsIcon" class="w-32 stroke-white fill-transparent"></div>
                <h2 class="mt-4 text-xl">{{ $t('other.noNotifs') }}</h2>
            </div>
            <NotificationCard :key="notif.id" @click.stop="" v-for="notif in allNotifs" :selected="selectedNotifs.includes(notif.id)" v-bind="notif" :post-names="postNames" />
        </main>
    </section>
</template>