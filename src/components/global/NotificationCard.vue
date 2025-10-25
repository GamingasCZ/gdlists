<script setup lang="ts">
import type { NotificationContent } from '@/interfaces';
import { computed, ref } from 'vue';
import ProfilePicture from './ProfilePicture.vue';
import { parseElapsed, prettyDate } from '@/Editor';
import { RouterLink } from 'vue-router';
import axios from 'axios';
import { i18n } from '@/locales';

const props = defineProps<NotificationContent & {postNames: any[], selected: boolean}>()
const types = ['comment', 'rating', 'other']
const types2 = ['list', 'review']

let postName = props.postNames.findIndex(p => p.id == props.objectID && types2[p.type] == props.postType)
const formText = computed(() => {
    let actionText = [i18n.global.t('other.liked'), i18n.global.t('other.commented')][+(props.type == 'comment')]
    let more = props.count > 1 ? `${i18n.global.t('other.andMore')} ` : ''
    return `<b>${props.from}</b> ${more}${actionText}`
})

const ratingsAllShown = ref(0)
const ratingsAllUsers = ref([])
const getRatingUsers = () => {
    axios.get(import.meta.env.VITE_API + "/notifications.php", {params: {ratings: 1, id: props.objectID, postType: +(props.postType == 'review') + 1, page: 0}}).then(res => {
        ratingsAllShown.value = 1+(+res.data[1])
        ratingsAllUsers.value.push(...res.data[0])
    })

}

const base = import.meta.env.BASE_URL
const date = computed(() => new Date(props.time))
const link = computed(() => `${props.postType == 'list' ? '' : '/review'}/${props.objectID}${props.otherID ? '?comment='+props.otherID : ''}`)
const icon = computed(() => `${base}/notifBadges/${['comment', 'like'][types.indexOf(props.type)]}.svg`)

</script>

<template>
    <div :class="{'border-2 border-lof-400': selected, 'border-l-4 border-lof-400 from-lof-300 to-transparent bg-gradient-to-r': unread, 'bg-black bg-opacity-40': !unread}" class="flex relative gap-2 p-1 rounded-md">
        <div class="flex flex-col gap-2">
            <div class="relative w-7 bg-black bg-opacity-40 rounded-md">
                <ProfilePicture :uid="from_user" :cutout="0" />
                <div v-if="props.count > 1" class="absolute -right-1 -bottom-1 p-0.5 py-0 w-max text-xs bg-red-600 rounded-md">+{{ props.count - 1 }}</div>
            </div>
            <div class="p-1 w-7 bg-black bg-opacity-40 rounded-md"><img :src="icon" alt=""></div>
        </div>
        <div class="flex flex-col">
            <div>
                <span class="inline pr-1 w-max" v-html="formText"></span>
                <b><RouterLink :to="link" class="inline hover:underline">{{ decodeURIComponent(props.postNames?.[postName]?.name ?? $t('other.removedPost')).replace("+", " ") }}</RouterLink></b>
            </div>
            
            <button v-if="props.count > 1 && props.type == 'rating'" @click="getRatingUsers">V</button>

            <section v-if="ratingsAllShown" class="flex flex-col gap-2 p-1">
                <div v-for="user in ratingsAllUsers" class="flex gap-2 items-center">
                    <ProfilePicture :uid="user.discord_id" :cutout="0" class="w-8" />
                    <span>{{ user.username }}</span>
                </div>
                <span v-if="ratingsAllShown == 1">i18n.t('other.showMore')</span>
            </section>

            <p v-if="props.comment" class="text-sm">
                <hr class="w-full opacity-20">
                {{ decodeURIComponent(props.comment) }}
            </p>
            <p :title="`${date.toLocaleDateString()} ${date.toLocaleTimeString()}`" class="absolute top-1 right-1 w-max text-xs leading-none text-white text-opacity-40 cursor-help grow">{{ parseElapsed((Date.now() - date)/1000) }}</p>
        </div>
    </div>
</template>