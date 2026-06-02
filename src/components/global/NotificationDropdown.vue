<script setup lang="ts">
import { ref, type Ref } from 'vue';
import { RouterLink } from 'vue-router';
import { allNotifs, currentUnread, removeNotifs } from './notifications';
import NotificationsView from '../NotificationsView.vue';

const emit = defineEmits(['selected', 'close'])

const notifView = ref<HTMLDivElement & {refreshing: Ref<boolean>, loadingState: number, refreshNotifs: () => void}>()
</script>

<template>
    <section @click.stop="" class="absolute z-10 text-white sm:rounded-md sm:w-[30rem] max-sm:left-0 max-sm:right-0 sm:right-2 top-12 shadow-drop bg-greenGradient">
        <header class="flex justify-between items-center p-2">
            <button :disabled="notifView?.refreshing && notifView?.loadingState != 1" :title="$t('other.refresh')" @click.stop="notifView?.refreshNotifs()" class="p-1 bg-black bg-opacity-40 rounded-md bg-blend-saturation disabled:opacity-40 button"><img src="@/images/replay.svg" class="w-5" alt=""></button>
            <RouterLink to="/notifications" @click="emit('close')">
                <span class="text-xl cursor-pointer hover:underline">{{ $t('navbar.notifs') }}</span>
            </RouterLink>
            <div class="flex gap-2">
                <button @click.stop="removeNotifs()" :disabled="notifView?.refreshing || !allNotifs.length" :title="$t('editor.remove')" class="p-1 bg-black bg-opacity-40 rounded-md bg-blend-saturation disabled:opacity-40 button"><img src="@/images/trash.svg" class="w-5" alt=""></button>
                <button @click.stop="emit('close')" class="sm:hidden button"><img src="@/images/close.svg" class="w-7" alt=""></button>
            </div>
        </header>
        <NotificationsView
            no-header
            ref="notifView"
            class="bg-[url(@/images/fade.svg)] bg-repeat-x"
        />
    </section>
</template>