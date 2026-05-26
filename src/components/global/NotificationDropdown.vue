<script setup lang="ts">
import { onMounted, ref } from 'vue';
import NotificationCard from './NotificationCard.vue';
import { RouterLink } from 'vue-router';
import NotifIcon from "../../images/notifs.svg?raw"
import { allNotifs, fetchNotifications, postNames, removeNotifs, unreadAmount } from './notifications';

const emit = defineEmits(['selected', 'close'])

onMounted(() => fetchNotifications(false))

</script>

<template>
    <section @click.stop="" class="absolute z-10 text-white sm:rounded-md sm:w-[30rem] sm:right-2 max-sm:inset-0 sm:top-12 shadow-drop bg-greenGradient">
        <header class="flex justify-between items-center p-2">
            <button :title="$t('other.refresh')" @click.stop="fetchNotifications(true)" class="p-1 bg-black bg-opacity-40 rounded-md bg-blend-saturation button"><img src="@/images/replay.svg" class="w-5" alt=""></button>
            <RouterLink to="/notifications">
                <h2 class="text-xl cursor-pointer hover:underline">{{ $t('navbar.notifs') }} <span v-show="unreadAmount > 0" class="px-1.5 text-lg bg-red-600 rounded-md">{{ unreadAmount }}</span></h2>
            </RouterLink>
            <div class="flex gap-2">
                <button @click.stop="removeNotifs()" :title="$t('editor.remove')" class="p-1 bg-black bg-opacity-40 rounded-md bg-blend-saturation button"><img src="@/images/trash.svg" class="w-5" alt=""></button>
                <button @click.stop="emit('close')" class="sm:hidden button"><img src="@/images/close.svg" class="w-7" alt=""></button>
            </div>
        </header>
        <main class="flex flex-col min-h-60 bg-repeat-x p-2 gap-2 bg-[url(@/images/fade.svg)] h-full max-h-[min(80svh,_40rem)] overflow-y-auto">
            <section v-if="!allNotifs.length" class="flex flex-col items-center my-auto text-center opacity-40 pointer-events-none">
                <div class="w-24 fill-transparent" v-html="NotifIcon"></div>
                <h2 class="mt-4 text-xl">{{ $t('other.noNotifs') }}</h2>
            </section>

            <!-- @mouseup="emit('selected')" -->
            <NotificationCard v-for="notif in allNotifs" v-bind="notif" :post-names="postNames" />
        </main>
    </section>
</template>