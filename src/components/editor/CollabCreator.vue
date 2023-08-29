<script setup lang="ts">
import { levelList } from '@/Editor';
import ColorPicker from '../global/ColorPicker.vue';
import chroma from 'chroma-js';
import { ref } from 'vue';
import { socialMediaImages } from './socialSites';
import { socialMedia } from './socialSites';
import type { CollabData, userDataFetchResponse } from '@/interfaces';
import axios from 'axios';
import PlayerIcon from '../global/PlayerIcon.vue';
import colors from "../../images/icons/colors.json"

const emit = defineEmits<{
    (e: 'changeRole', creatorPos: number): void,
    (e: 'removeMember', position: number): void,
    (e: 'copyMember', position: number): void,
    (e: 'addSocial', edit: boolean, creatorPos: number, editPos?: number): void
    (e: 'removeSocial', position: number): void,
}>()

const props = defineProps<{
    name: string;
    role: number;
    color: [number, number, number];
    part: [number, number];
    socials: {
        0: number;
        1: string;
    }[];
    verified: number | number[];
    pos: number;
    levelIndex: number;
    roleColor: string;
    host: boolean;
}>()

const colorPickerOpen = ref(false)

const searchingCreator = ref(false)
const noResults = ref(false)
function getCreator() {
    if (typeof levelList.value.levels[props.levelIndex].creator == 'string') return

    searchingCreator.value = true
    let searchUsername = levelList.value.levels[props.levelIndex].creator[2][props.pos].name
    axios.get(
        import.meta.env.VITE_API+"/rubLevelData.php",
        {params: {userDataFetch: '', username: searchUsername}}
    ).then(res => {
        let userData: userDataFetchResponse = res.data
        // User not found
        if (res.data == -1) {
            noResults.value = true
            setTimeout(() => noResults.value = false, 500);
            levelList.value.levels[props.levelIndex].creator[2][props.pos].name = ""
            levelList.value.levels[props.levelIndex].creator[2][props.pos].verified = 0
        }
        else {
            levelList.value.levels[props.levelIndex].creator[2][props.pos].name = userData.username
            levelList.value.levels[props.levelIndex].creator[2][props.pos].color = chroma.rgb(...Object.values(colors[userData.color1])).hsl()
            levelList.value.levels[props.levelIndex].creator[2][props.pos].socials = userData.socials
            levelList.value.levels[props.levelIndex].creator[2][props.pos].verified = [
                userData.iconID,
                userData.color1,
                userData.color2,
                userData.glow
            ]
        }
        setTimeout(() => searchingCreator.value = false, 5000)
    }).catch(() => setTimeout(() => searchingCreator.value = false, 5000))
}

</script>

<template>
    <section class="flex flex-col gap-2 items-center pl-2 min-h-[3.5rem] overflow-clip bg-black rounded-md odd:bg-opacity-40 even:bg-opacity-20">
        <main class="flex gap-2 justify-between items-center w-full">
            <div class="flex gap-1 items-center" :class="{'shake': noResults}">
                <img src="@/images/unknownCube.svg" class="w-10" alt="" v-if="verified == 0">
                <PlayerIcon v-else-if="typeof verified == 'object'" :icon="verified[0]" :col1="verified[1].toString()" :col2="verified[2].toString()" :glow="verified[3]" class="w-10 h-10" :quality="1"/>
                <div class="flex flex-col gap-1">
                    <input type="text" maxlength="15" class="px-1 w-44 bg-black bg-opacity-40 rounded-sm" v-model="(levelList.levels[levelIndex].creator as CollabData)[2][pos].name" placeholder="Jméno člena">
                    <section class="flex gap-1">
                        <button
                            class="w-8 rounded-sm button" :style="{backgroundColor: socialMedia[site[0]].color}"
                            v-for="(site, index) in socials"
                            @click="emit('addSocial', true, pos, index)"
                            @auxclick="emit('removeSocial', index)"
                        >
                            <img :src="socialMediaImages[socialMedia[site[0]].icon]" class="box-border p-0.5 mx-auto h-4" alt="">
                        </button>
                        <button class="w-8 bg-gray-600 rounded-sm button" @click="emit('addSocial', false, pos)" v-if="socials.length < 5">
                            <img src="../../images/plus.svg" class="box-border p-0.5 mx-auto h-4" alt="">
                        </button>
                    </section>
                </div>
                <button class="bg-black bg-opacity-40 rounded-md transition-opacity button disabled:opacity-50" :disabled="searchingCreator" @click="getCreator">
                    <img src="@/images/searchOpaque.svg" class="box-border p-1 w-8" alt="">
                </button>
            </div>

            <section class="flex flex-col items-center">
                <div>
                    <input class="p-1 w-12 text-xl bg-black bg-opacity-40 rounded-md" type="text" v-model="part[0]">%
                    <img src="@/images/arrow.svg" class="inline px-2 w-16 opacity-40" alt="">
                    <input class="p-1 w-12 text-xl bg-black bg-opacity-40 rounded-md" type="text" v-model="part[1]">%
                </div>
            </section>
            <section class="flex flex-col items-center">
                <button class="relative p-1 w-40 rounded-md button shadow-drop" :style="{backgroundColor: roleColor}" @click="emit('changeRole', pos)">
                    {{ levelList.levels[levelIndex].creator[1][role] || 'Bezejmenná' }}
                    <img src="@/images/edit.svg" class="box-border inline absolute right-1 top-1/2 p-0.5 ml-auto w-4 bg-black bg-opacity-40 rounded-sm -translate-y-1/2" alt="">
                </button>
            </section>
    
            <div class="flex gap-2 items-center">
                <button class="flex justify-center items-center w-10 h-10 rounded-md border-4 border-white border-solid button"
                    :style="{backgroundColor: chroma.hsl(...color).hex()}"
                    @click="colorPickerOpen = !colorPickerOpen">
                    <img src="@/images/color.svg" class="w-6" alt="">
                </button>
                <div class="flex flex-col">
                    <button class="w-7 bg-yellow-500"><img class="box-border p-1" src="@/images/copy.svg" alt="" @click="emit('copyMember', pos)"></button>
                    <button class="w-7 bg-red-600"><img class="box-border p-1" src="@/images/trash.svg" alt="" @click="emit('removeMember', pos)"></button>
                </div>
            </div>
        </main>
        <Transition name="fade">
            <ColorPicker v-if="colorPickerOpen" :hue="color[0]" :lightness="color[2]" :saturation="color[1]" @colors-modified="(levelList.levels[levelIndex].creator as CollabData)[2][pos].color = $event" />
        </Transition>
    </section>
</template>
