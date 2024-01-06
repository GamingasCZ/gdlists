<script setup lang="ts">
import { EMOJI_COUNT } from '@/Editor';
import PlayerIcon from '../global/PlayerIcon.vue';
import { socialMedia, socialMediaImages } from './socialSites';
import { ref } from 'vue';
import type { CollabViewerRow } from '@/interfaces';


const props = defineProps<CollabViewerRow>()

const emoji = ref("")
const getEmoji = async () => {
    if (!props.icon?.[1]) // Human not verified (didn't use the search button in the editor)
        emoji.value =  await import(`../../images/emoji/${Math.ceil(Math.random() * EMOJI_COUNT).toString().padStart(2,"0")}.webp`).then(res => res.default)
}
getEmoji()

const openLink = (ind: number, path: string) => {
    switch (ind) {
        case 4:
            if (path.startsWith("/"))
                window.open(`https://discord.com${path}`, '_blank')
            else
                alert("Copied to clipboard")
            break;
        case 5: // Custom site
            window.open(path, '_blank'); break;
    
        default:
            window.open("https://" +  socialMedia[ind].baseUrl + path, '_blank');
    }
}

</script>

<template>
<section class="p-1 bg-black bg-opacity-40 rounded-md min-w-[8rem] w-full">
    <div class="grid grid-cols-3 gap-2 items-center">
        <div class="flex gap-2 items-center">
            <PlayerIcon
                v-if="icon?.[1]"
                :icon="icon[0]" :col1="icon[1].toString()" :col2="icon[2].toString()" :glow="icon[3]" :quality="1"
                class="w-10 h-10"
            />
            <img v-else :src="emoji" alt="" class="w-10 h-10">
            <div>
                <h5 class="w-max text-xs leading-none opacity-40">{{ roleName }}</h5>
                <h2 class="w-max text-lg font-extrabold leading-none">{{ name }}</h2>
            </div>
        </div>
        <div class="text-xl font-bold leading-tight text-center" v-if="part[0] >= 0">{{ part[0] }}% > {{ part[1] }}%</div>
        <div class="m-1 mt-3 text-center">
            <footer class="flex gap-1 mt-1">
                <button @click="openLink(site[0], site[1])" class="p-0.5 w-7 h-5 rounded-sm button" :style="{background: socialMedia[site[0]].color}" v-for="site in socials" :title="socialMedia[site[0]].name">
                    <img :src="socialMediaImages[socialMedia[site[0]].icon]" class="mx-auto h-full" alt="">
                </button>
            </footer>
        </div>
    </div>
    
</section>
</template>