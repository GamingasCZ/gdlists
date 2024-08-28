<script setup lang="ts">
import type { NotificationContent } from '@/interfaces';
import { computed, ref } from 'vue';
import ProfilePicture from './ProfilePicture.vue';
import { prettyDate } from '@/Editor';
import { RouterLink } from 'vue-router';

const props = defineProps<NotificationContent & {postNames: any[]}>()
const types = ['comment', 'rating', 'other']
const types2 = ['list', 'review']

const formText = computed(() => {
    let postIndex = (props.postType == 'review') | 0
    let postName = props.postNames.findIndex(p => p.id == props.objectID && types2[p.type] == props.postType)
    let actionText = ['olajkoval', 'okomentoval'][(props.type == 'comment') | 0]
    let postType = ['seznam', 'recenzi'][postIndex]
    return `<b>${props.from}</b> ${actionText} ${postType} <b>${decodeURIComponent(props.postNames[postName].name).replace("+", " ")}</b>`
})

const base = import.meta.env.BASE_URL
const date = computed(() => new Date(props.time))
const link = computed(() => `${props.postType == 'list' ? '' : '/review'}/${props.objectID}${props.otherID ? '?comment='+props.otherID : ''}`)
const icon = computed(() => `${base}/notifBadges/${['comment', 'like'][types.indexOf(props.type)]}.svg`)

</script>

<template>
    <RouterLink :to="link">
        <div class="flex gap-2 p-1 bg-black bg-opacity-40 rounded-md">
            <div class="flex flex-col gap-2">
                <div class="w-7 bg-black bg-opacity-40 rounded-md"><ProfilePicture :uid="to_user" :cutout="0" /> </div>
                <div class="p-1 w-7 bg-black bg-opacity-40 rounded-md"><img :src="icon" alt=""></div>
            </div>
            <div class="flex flex-col">
                <p class="grow" v-html="formText"></p>
                <p :title="`${date.toLocaleDateString()} ${date.toLocaleTimeString()}`" class="text-sm leading-none text-white text-opacity-40 cursor-help grow">{{ prettyDate((Date.now() - date)/1000) }}</p>
            </div>
        </div>
    </RouterLink>
</template>