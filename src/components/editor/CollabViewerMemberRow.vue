<script setup lang="ts">
import { EMOJI_COUNT } from '@/Editor';
import PlayerIcon from '../global/PlayerIcon.vue';
import { socialMedia, socialMediaImages } from './socialSites';
import { computed, inject, ref, watch } from 'vue';
import type { CollabHumans, CollabViewerRow } from "@/interfaces";

interface extras {
    index: number;
    hiddenRole: boolean;
}

const props = defineProps<CollabViewerRow & extras>()

const hovering = inject<CollabHumans | null>("collabHovering")
const emoji = ref("")
const getEmoji = async () => {
    if (!props.human.verified?.[1]) // Human not verified (didn't use the search button in the editor)
        emoji.value =  await import(`../../images/emoji/${Math.floor(Math.random() * EMOJI_COUNT+1).toString().padStart(2,"0")}.webp`).then(res => res.default)
}
getEmoji()

const openLink = (ind: number, path: string) => {
    switch (ind) {
        case 4:
            if (path.startsWith("/"))
            break;
            window.open(`https://discord.com${path}`, '_blank')
        case 5: // Custom site
            window.open(path, '_blank'); break;
    
        default:
            window.open("https://" +  socialMedia[ind].baseUrl + path, '_blank');
    }
}

let dcIndex = props.human.socials.findIndex(x => x[0] == 3)
const isDiscordServer = computed(() => {
    if (dcIndex != -1) return props.human.socials[dcIndex][1].includes("discord.com")
    else return false
})


</script>

<template>
<section class="p-1 bg-black bg-opacity-40 rounded-md min-w-[8rem] w-full transition-opacity" :class="{'opacity-50': hovering != null && hovering != human}" @mouseenter="hiddenRole || (hovering = human)" @mouseleave="hovering = null">
    <div class="grid grid-cols-[0.5fr_0.75fr_0.5fr_1fr] gap-2 items-center">
        <div class="flex gap-2 items-center">
            <PlayerIcon
            v-if="human.verified?.[1]"
            :icon="human.verified[0]" :col1="human.verified[1].toString()" :col2="human.verified[2].toString()" :glow="human.verified[3] | 0" :quality="1"
            class="w-10 h-10"
        />
            <img v-else :src="emoji" alt="" class="w-10 h-10">
            <div>
                <h5 class="w-max text-xs leading-none" :class="{'opacity-40': !hiddenRole, 'font-bold': hiddenRole}">{{ roleName }}</h5>
                <h2 class="w-max text-lg font-extrabold leading-none">{{ human.name }}</h2>
            </div>
        </div>
        <div class="flex flex-col justify-center items-start">
            <span class="flex gap-1 items-center w-max" v-if="!isDiscordServer && dcIndex != -1">
                <img class="w-4" src="@/images/discord.svg" alt="">
                {{ human.socials[dcIndex][1] }}
            </span>
            <footer class="flex gap-1">
                <button @click="openLink(site[0], site[1])" class="p-0.5 w-10 h-5 rounded-sm button" :style="{background: socialMedia[site[0]].color}" v-for="site in human.socials" :title="socialMedia[site[0]].name">
                    <img :src="socialMediaImages[socialMedia[site[0]].icon]" class="mx-auto h-full" alt="">
                </button>
            </footer>
        </div>
        <div class="flex gap-2 items-center text-2xl font-normal leading-tight text-center" v-if="human.part[0] >= 0">
            <span>{{ human.part[0] }}</span>
            <img src="@/images/arrow.svg" class="h-3" alt="">
            <span>{{ human.part[1] }}%</span>
        </div>
    </div>
    
</section>
</template>