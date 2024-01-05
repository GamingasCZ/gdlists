<script setup lang="ts">
import { levelList } from '@/Editor';
import ColorPicker from '../global/ColorPicker.vue';
import chroma from 'chroma-js';
import { computed, nextTick, ref } from 'vue';
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
    if (searchingCreator.value) return
    
    nextTick(() => {
        let user = props.host ? levelList.value.levels[props.levelIndex].creator[0][0] : levelList.value.levels[props.levelIndex].creator[2][props.pos]
        searchingCreator.value = true
        let searchUsername = user.name
        axios.get(
            import.meta.env.VITE_API+"/rubLevelData.php",
            {params: {userDataFetch: '', username: searchUsername}}
        ).then(res => {
            let userData: userDataFetchResponse = res.data
            // User not found
            if (res.data == -1) {
                noResults.value = true
                setTimeout(() => noResults.value = false, 500);
                user.name = ""
                user.verified = 0
            }
            else {
                user.name = userData.username
                creatorName.value = userData.username
                
                user.color = chroma.rgb(...Object.values(colors[userData.color1])).hsl()
                user.color[2] *= 64
                user.socials = userData.socials
                user.verified = [
                    userData.iconID,
                    userData.color1,
                    userData.color2,
                    userData.glow
                ]
            }
            setTimeout(() => searchingCreator.value = false, 5000)
    })
    }).catch(() => setTimeout(() => searchingCreator.value = false, 5000))
}

const creatorName = ref(props.name)
const writeName = (e: Event) => {
    let val = (e.target as HTMLInputElement).value
    if (props.host) {
        if (typeof levelList.value.levels[props.levelIndex].creator == 'string') 
            levelList.value.levels[props.levelIndex].creator = val
        else
            levelList.value.levels[props.levelIndex].creator[0][0].name = val
    }
    else
        levelList.value.levels[props.levelIndex].creator[2][props.pos].name = val
    creatorName.value = val
}
const modifyPart = (e: Event, which: number) => {
    props.part[which] = Math.min(Math.max(0, parseInt((e.target as HTMLInputElement).value)), 100)
    nextTick(() => {
        if (props.part[1] < props.part[0]) {
            let x = props.part[0]
            props.part[0] = props.part[1]
            props.part[1] = x
        }
    })
}

</script>

<template>
    <section class="collabMember flex flex-col gap-2 items-center pl-2 min-h-[3.5rem] overflow-clip bg-black rounded-md odd:bg-opacity-40 even:bg-opacity-20" :class="{'!bg-opacity-0': host}">
        <main class="flex gap-2 items-center my-auto w-full" :class="{'justify-between': !host}">
            <div class="flex gap-1 items-center" :class="{'shake': noResults}">
                <img src="@/images/unknownCube.svg" class="w-10" alt="" v-if="!verified">
                <PlayerIcon v-else-if="typeof verified == 'object'" :icon="verified[0]" :col1="verified[1].toString()" :col2="verified[2].toString()" :glow="verified[3]" class="w-10 h-10" :quality="1"/>
                <div class="flex flex-col gap-1">
                    <input type="text" maxlength="15" class="px-1 w-[min(11rem,30vw)] bg-black bg-opacity-40 rounded-sm" :value="name" @change="writeName" @keypress.enter="getCreator" :placeholder="$t('collabTools.memberName')">
                    <section class="grid grid-cols-5 gap-1">
                        <button
                            class="rounded-sm button focus-visible:-translate-y-1" :style="{backgroundColor: socialMedia[site[0]].color}"
                            type="button"
                            v-for="(site, index) in (socials ?? [])"
                            @click="emit('addSocial', true, pos, index)"
                            @auxclick="emit('removeSocial', index)"
                        >
                            <img :src="socialMediaImages[socialMedia[site[0]].icon]" class="box-border p-0.5 mx-auto h-4" alt="">
                        </button>
                        <button class="bg-gray-600 rounded-sm button focus-visible:-translate-y-1" type="button" @click="emit('addSocial', false, pos)" v-if="(socials ?? []).length < 5">
                            <img src="../../images/plus.svg" class="box-border p-0.5 mx-auto h-4" alt="">
                        </button>
                    </section>
                </div>
                <button class="bg-black bg-opacity-40 rounded-md transition-opacity button disabled:opacity-50 focus:outline focus:outline-current" @click="getCreator" :disabled="searchingCreator">
                    <img src="@/images/searchOpaque.svg" class="box-border p-1 w-8" alt="">
                </button>
            </div>

            <section class="flex flex-col items-center" v-if="!host">
                <div class="relative">
                    <input class="p-1 w-12 text-xl text-center bg-black bg-opacity-40 rounded-md max-sm:text-xs" inputmode="numeric" type="number" style="appearance: textfield" min="0" max="100" @change="modifyPart($event, 0)" :value="part[0]">
                    <span class="absolute bottom-1.5 ml-1 opacity-30 pointer-events-none max-sm:text-xs">%</span>
                    <img src="@/images/arrow.svg" class="inline mr-2 mb-1 ml-7 h-6 opacity-60 button max-sm:h-3 max-sm:rotate-90" alt="">
                    <input class="p-1 w-12 text-xl text-center bg-black bg-opacity-40 rounded-md max-sm:text-xs" inputmode="numeric" type="number" style="appearance: textfield" min="0" max="100" @change="modifyPart($event, 1)" :value="part[1]">
                    <span class="absolute bottom-1.5 ml-1 opacity-30 pointer-events-none max-sm:text-xs">%</span>
                </div>
            </section>
            
            <section class="flex flex-col items-center max-sm:hidden" :class="{'ml-4': host}">
                <button class="relative p-1 w-40 rounded-md button shadow-drop roleSwitcher focus-visible:!outline focus-visible:!outline-current" :style="{backgroundColor: roleColor ?? '#000'}" @click="emit('changeRole', pos)">
                    {{ levelList.levels[levelIndex].creator?.[1]?.[role] || $t('collabTools.unnamedRole') }}
                    <img src="@/images/edit.svg" class="box-border inline absolute right-1 top-1/2 p-0.5 ml-auto w-4 bg-black bg-opacity-40 rounded-sm -translate-y-1/2" alt="">
                </button>
            </section>
    
            <div class="flex gap-2 items-center" v-if="!host">
                <button class="flex justify-center items-center w-10 h-10 rounded-md border-4 border-white border-solid button max-sm:hidden focus-visible:!outline focus-visible:!outline-current"
                    :style="{backgroundColor: chroma.hsl(color[0], color[1], color[2]/64).hex()}"
                    :class="{'!border-black': color[2] >= 32}"
                    @click="colorPickerOpen = !colorPickerOpen">
                    <img src="@/images/color.svg" class="w-6" alt="" :class="{'invert': color[2] >= 32}">
                </button>
                <div class="flex flex-col max-sm:hidden">
                    <button class="w-7 bg-yellow-600"><img class="box-border p-1 button" src="@/images/copy.svg" alt="" @click="emit('copyMember', pos)"></button>
                    <button class="w-7 bg-red-600"><img class="box-border p-1 button" src="@/images/trash.svg" alt="" @click="emit('removeMember', pos)"></button>
                </div>
            </div>
        </main>
        <Transition name="fade">
            <ColorPicker v-if="colorPickerOpen && !host" :hue="color[0]" :lightness="color[2]" :saturation="color[1]" @colors-modified="(levelList.levels[levelIndex].creator as CollabData)[2][pos].color = $event" />
        </Transition>
    </section>
</template>
