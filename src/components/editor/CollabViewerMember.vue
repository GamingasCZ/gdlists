<script setup lang="ts">
import { EMOJI_COUNT } from '@/Editor';
import PlayerIcon from '../global/PlayerIcon.vue';
import { socialMedia, socialMediaImages } from './socialSites';
import { ref } from 'vue';


const props = defineProps<{
    icon: number[]
    roleName: string
    name: string
    socials: [number, string][]
    part: [number, number]
}>()

const emoji = ref("")
const getEmoji = async () => {
    if (!props.icon?.[1]) // Human not verified (didn't use the search button in the editor)
        emoji.value =  await import(`../../images/emoji/${Math.ceil(Math.random() * EMOJI_COUNT).toString().padStart(2,"0")}.webp`).then(res => res.default)
}
getEmoji()

</script>

<template>
<section class="p-1 bg-black bg-opacity-40 rounded-md min-w-[8rem] grow">
    <div class="flex gap-3 justify-center items-center">
        <PlayerIcon
            v-if="icon?.[1]"
            :icon="icon[0]" :col1="icon[1].toString()" :col2="icon[2].toString()" :glow="icon[3]" :quality="1"
            class="w-10 h-10"
        />
        <img v-else :src="emoji" alt="" class="w-10 h-10">
        <div class="text-sm leading-tight text-center" v-if="part[0] >= 0">{{ part[0] }}%<br>{{ part[1] }}%</div>
    </div>
    
    <div class="m-1 mt-3 text-center">
        <h5 class="w-max text-xs leading-none opacity-40">{{ roleName }}</h5>
        <h2 class="w-max text-lg font-extrabold leading-none">{{ name }}</h2>
        <footer class="flex gap-1 mt-1">
            <button class="p-0.5 w-7 h-5 rounded-sm button" :style="{background: socialMedia[site[0]].color}" v-for="site in socials" :title="socialMedia[site[0]].name">
                <img :src="socialMediaImages[socialMedia[site[0]].icon]" class="mx-auto h-full" alt="">
            </button>
        </footer>
    </div>
</section>
</template>