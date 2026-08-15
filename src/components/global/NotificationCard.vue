<script setup lang="ts">
import type { NotificationContent, OtherNotifData } from '@/interfaces';
import { computed, ref } from 'vue';
import ProfilePicture from './ProfilePicture.vue';
import { parseElapsed, prettyDate } from '@/Editor';
import { RouterLink } from 'vue-router';
import axios from 'axios';
import { i18n, langIndex } from '@/locales';
import striptags from 'striptags';
import parseText from './parseEditorFormatting.ts';

const props = defineProps<NotificationContent & {postNames: any[], selected: boolean}>()
const types = ['comment', 'rating', 'other', 'watch']
const types2 = ['list', 'review']

const otherData = computed<OtherNotifData | null>(() => {
    if (props.type == 'other') {
        let text: OtherNotifData = JSON.parse(props.comment)
        text.content[langIndex.value] = parseText(text.content[langIndex.value])
        return text
    }
    else return null
})

let postName = props.postNames.findIndex(p => p.id == props.objectID && types2[p.type] == props.postType)
const formText = computed(() => {
    let actionText = [i18n.global.t('other.commented'), i18n.global.t('other.liked'), '', ''][types.indexOf(props.type)]
    let more = (props.type == 'rating' && props.comment > 1) ? `${i18n.global.t('other.andMore')} ` : ''
    if (props.type == 'other')
        return `<span class="text-2xl">${otherData.value?.title[langIndex.value]}<span>`
    else if (props.type == 'watch')
        return `${actionText}`
    else
        return `<b>${props.from}</b> ${more}${actionText}`
})
const formTextAfter = computed(() => {
    let actionText = ['', '', '', ' byl aktualizován'][types.indexOf(props.type)]
    return `${actionText}`
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
const link = computed(() => {
    if (props.type == 'watch')
        return `${props.postType == 'list' ? '' : '/review'}/${props.objectID}`
    switch (props.postType) {
        case 'list':
            return `/${props.objectID}${props.otherID ? '?comment='+props.otherID : ''}`        
        case 'review':
            return `/review/${props.objectID}${props.otherID ? '?comment='+props.otherID : ''}`        
    
        default:
            break;
    }
})
const icon = computed(() => `${base}/notifBadges/${['comment', 'like', 'other', 'follow'][types.indexOf(props.type)]}.svg`)

const parsedComment = ref((() => {
    if (!props.comment) return

    let sanitized = striptags(String(props.comment));
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
            <div class="relative w-7 h-7 bg-opacity-40 rounded-md">
                <ProfilePicture :uid="from_user" :cutout="0" />
                <div v-if="type == 'rating' && props.comment > 1" class="absolute -right-1 -bottom-1 p-0.5 py-0 w-max text-xs bg-red-600 rounded-md">+{{ props.comment - 1 }}</div>
            </div>
            <div class="p-1 w-7 h-7 bg-black bg-opacity-40 rounded-md"><img :src="icon" alt=""></div>
        </div>
        <div class="flex flex-col w-full">
            <div>
                <span class="inline pr-1 w-max" v-html="formText"></span>
                <b v-if="postType != 'other'"><RouterLink :to="link" class="inline hover:underline">
                    <img v-if="postType == 'list'" src="@/images/browseMobHeader.svg" class="inline mr-1 mb-0.5 w-3" :class="{'ml-2': props.type != 'watch'}" alt="">
                    <img v-else src="@/images/reviews.svg" class="inline mr-1 mb-0.5 w-3" :class="{'ml-2': props.type != 'watch'}" alt="">
                    <span>{{ decodeURIComponent(props.postNames?.[postName]?.name ?? $t('other.removedPost')).replace("+", " ") }}</span>
                </RouterLink></b>
                <span class="inline pr-1 w-max" v-html="formTextAfter"></span>
            </div>
            
            <button v-if="props.comment > 1 && props.type == 'rating'" class="flex gap-2 p-2 opacity-40 hover:opacity-100" @click="toggleDropdown">
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

            <div v-if="type != 'rating' && props.comment" class="text-sm">
                <hr class="w-full opacity-20">
                <p v-if="type == 'other'" class="overflow-auto max-h-36 regularParsing" v-html="otherData?.content[langIndex]"></p>
                <p v-else class="overflow-auto max-h-36" v-html="parsedComment"></p>
            </div>

            <div v-if="type == 'other'" class="flex gap-2 mt-2">
                <component
                    v-for="but in otherData?.buttons"
                    :is="but[2].includes('https') ? 'a' : 'RouterLink'"
                    :to="but[2]"
                    :href="but[2]"
                    :target="but[2].includes('https') ? '_blank' : ''"
                >
                    <button class="flex flex-wrap gap-2 px-2 text-xl bg-opacity-20 rounded-md button bg-lof-200">
                        <img v-if="but[2].includes('https')" class="w-5" src="@/images/link.svg" alt="">
                        <img v-else class="w-5" src="@/images/browseMobHeader.svg" alt="">
                        {{ but[langIndex] }}
                    </button>
                </component>
            </div>
            <p :title="`${date.toLocaleDateString()} ${date.toLocaleTimeString()}`" class="absolute top-1 right-1 w-max text-xs leading-none text-white text-opacity-40 cursor-help grow">{{ parseElapsed((Date.now() - date)/1000) }}</p>
        </div>
    </div>
</template>