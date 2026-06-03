<script setup lang="ts">
import type { NotificationContent } from '@/interfaces';
import { computed, ref } from 'vue';
import ProfilePicture from './ProfilePicture.vue';
import { parseElapsed, prettyDate } from '@/Editor';
import { RouterLink } from 'vue-router';
import axios from 'axios';
import { i18n } from '@/locales';
import striptags from 'striptags';

const props = defineProps<NotificationContent & {postNames: any[], selected: boolean}>()
const types = ['comment', 'rating', 'other']
const types2 = ['list', 'review']

let postName = props.postNames.findIndex(p => p.id == props.objectID && types2[p.type] == props.postType)
const formText = computed(() => {
    let actionText = [i18n.global.t('other.liked'), i18n.global.t('other.commented')][+(props.type == 'comment')]
    let more = props.count > 1 ? `${i18n.global.t('other.andMore')} ` : ''
    return `<b>${props.from}</b> ${more}${actionText}`
})

const ratingsDropdownOpen = ref(false)
const ratingsAllShown = ref(0)
interface userRating {
    username: string
    discord_id: string
    time: string
}
const ratingsAllUsers = ref<userRating[]>([])
var currentPage = 0
const toggleDropdown = () => {
    ratingsDropdownOpen.value = !ratingsDropdownOpen.value
    if (!ratingsDropdownOpen.value) {
        return
    }
    if (ratingsAllUsers.value.length) return

    getRatingUsers()
}
const getRatingUsers = () => {
    axios.get(import.meta.env.VITE_API + "/notifications.php", {params: {ratings: 1, id: props.objectID, postType: +(props.postType == 'review') + 1, page: currentPage}}).then(res => {
        ratingsAllShown.value = 1+(+res.data[1])
        ratingsAllUsers.value.push(...res.data[0])
    })
    
    currentPage++
}

const base = import.meta.env.BASE_URL
const date = computed(() => new Date(props.time))
const link = computed(() => `${props.postType == 'list' ? '' : '/review'}/${props.objectID}${props.otherID ? '?comment='+props.otherID : ''}`)
const icon = computed(() => `${base}/notifBadges/${['comment', 'like'][types.indexOf(props.type)]}.svg`)

const parsedComment = ref((() => {
    if (!props.comment) return

    let sanitized = striptags(props.comment);
    let emojis = sanitized.match(/&(\d{2})/g) // Match any emojis and spaces
    let isEmojisOnly = (emojis ?? []).join("") == sanitized
    if (emojis != null) {
        emojis.forEach(async emoji => {
            let emojiLink = `${import.meta.env.BASE_URL}/emoji/${emoji.slice(1)}.webp`
            sanitized = sanitized.replaceAll(emoji, `<img class="inline ${isEmojisOnly ? 'w-10' : 'w-6'} pointer-events-none" src="${emojiLink}" alt="">`)
        });
    }
    sanitized = sanitized.replace(/\n/g, "<br>")

    return sanitized
})())

</script>

<template>
    <div :class="{'border-2 border-lof-400': selected, 'border-l-4 border-lof-400 from-lof-300 to-transparent bg-gradient-to-r': unread, 'bg-black bg-opacity-40': !unread}" class="flex relative gap-2 p-1 rounded-md">
        <div class="flex flex-col gap-2">
            <div class="relative w-7 bg-opacity-40 rounded-md">
                <ProfilePicture :uid="from_user" :cutout="0" />
                <div v-if="props.count > 1" class="absolute -right-1 -bottom-1 p-0.5 py-0 w-max text-xs bg-red-600 rounded-md">+{{ props.count - 1 }}</div>
            </div>
            <div class="p-1 w-7 bg-black bg-opacity-40 rounded-md"><img :src="icon" alt=""></div>
        </div>
        <div class="flex flex-col w-full">
            <div>
                <span class="inline pr-1 w-max" v-html="formText"></span>
                <b><RouterLink :to="link" class="inline hover:underline">
                    <img v-if="postType == 'list'" src="@/images/browseMobHeader.svg" class="inline mr-1 mb-0.5 ml-2 w-3" alt="">
                    <img v-else src="@/images/reviews.svg" class="inline mr-1 mb-0.5 ml-2 w-3" alt="">
                    <span>{{ decodeURIComponent(props.postNames?.[postName]?.name ?? $t('other.removedPost')).replace("+", " ") }}</span>
                </RouterLink></b>
            </div>
            
            <button v-if="props.count > 1 && props.type == 'rating'" class="flex gap-2 p-2 opacity-40 hover:opacity-100" @click="toggleDropdown">
                <img src="@/images/genericRate.svg" class="w-3" :class="{'rotate-180': !ratingsDropdownOpen}" alt="">
                <span>{{ ratingsDropdownOpen ? $t('other.hide') : $t('other.showMore') }}</span>
            </button>

            <section v-if="ratingsDropdownOpen" class="flex flex-col gap-2 p-1">
                <div v-for="user in ratingsAllUsers" class="flex gap-2 items-center">
                    <ProfilePicture :uid="user.discord_id" :cutout="0" class="w-8" />
                    <span>{{ user.username }}</span>
                    <span class="ml-2 text-xs text-white text-opacity-40">{{ parseElapsed((new Date() - new Date(user.time))/1000) }}</span>
                </div>
                <button @click="getRatingUsers" class="text-sm text-left opacity-40 hover:opacity-100" v-if="ratingsAllShown == 1">{{ $t('other.showMore') }}</button>
            </section>

            <div v-if="props.comment" class="text-sm">
                <hr class="w-full opacity-20">
                <p class="overflow-auto max-h-36" v-html="parsedComment"></p>
            </div>
            <p :title="`${date.toLocaleDateString()} ${date.toLocaleTimeString()}`" class="absolute top-1 right-1 w-max text-xs leading-none text-white text-opacity-40 cursor-help grow">{{ parseElapsed((Date.now() - date)/1000) }}</p>
        </div>
    </div>
</template>