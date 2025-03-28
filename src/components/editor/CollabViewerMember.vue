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
const allHumans = inject<CollabHumans[] | null>("collabHumanoids")
const emoji = ref("")
const getEmoji = () => {
    if (!props.human.verified?.[1]) // Human not verified (didn't use the search button in the editor)
        emoji.value = `${import.meta.env.BASE_URL}/emoji/${Math.floor(Math.random() * EMOJI_COUNT+1).toString().padStart(2,"0")}.webp`
}
getEmoji()

const openLink = (ind: number, path: string) => {
    switch (ind) {
        case 3:
            if (path.startsWith("/"))
                window.open(`https://discord.com${path}`, '_blank')
            break;
        case 4: // Custom site
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
<section class="p-1 bg-black bg-opacity-40 rounded-md min-w-[8rem] max-w-[12rem] grow transition-opacity" :class="{'opacity-50': hovering != null && hovering != human}" @mouseenter="hiddenRole || (hovering = human)" @mouseleave="hovering = null">
    <div class="flex relative gap-3 justify-center items-center">
        <PlayerIcon
            v-if="human.verified?.[1]"
            :icon="human.verified[0]" :col1="human.verified[1].toString()" :col2="human.verified[2].toString()" :glow="human.verified[3] | 0" :quality="1"
            class="z-10 w-10 h-10"
        />
        <img v-else :src="emoji" alt="" class="w-10 h-10">
        <div class="text-sm leading-tight text-center" v-if="human.part[0] >= 0">{{ human.part[0] }}-{{ human.part[1] }}%</div>
    </div>
    
    <div class="m-1 mt-3 text-center">
        <h5 class="w-max text-xs leading-none" :class="{'opacity-40': !hiddenRole, 'font-bold': hiddenRole}">{{ roleName }}</h5>
        <h2 class="w-max text-lg font-extrabold leading-none">{{ human.name }}</h2>
        <span class="flex gap-1 items-center w-max" v-if="!isDiscordServer && dcIndex != -1">
            <img class="w-4" src="@/images/socials/discord.svg" alt="">
            {{ human.socials[dcIndex][1] }}
        </span>
        <footer class="flex gap-1 mt-1">
            <button @click="openLink(site[0], site[1])" class="p-0.5 w-full max-w-[4rem] h-5 rounded-sm button" :style="{background: socialMedia[site[0]].color}" v-for="site in human.socials" :title="socialMedia[site[0]].name">
                <img :src="socialMediaImages[socialMedia[site[0]].icon]" class="mx-auto h-full" alt="">
            </button>
        </footer>
    </div>
</section>
</template>