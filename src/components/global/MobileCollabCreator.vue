<script setup lang="ts">
import ColorPicker from '../global/ColorPicker.vue';
import chroma from 'chroma-js';
import { nextTick, ref } from 'vue';
import { socialMediaImages } from '../editor/socialSites';
import { socialMedia } from '../editor/socialSites';
import type { CollabData, CollabHumans, userDataFetchResponse } from '@/interfaces';
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

interface Extras {
    pos: number;
    levelIndex: number;
    roleColor: string;
    host: boolean;
    collabArray: CollabData
}

const props = defineProps<CollabHumans & Extras>()

const colorPickerOpen = ref(false)

const searchingCreator = ref(false)
const noResults = ref(false)
function getCreator(e: SubmitEvent) {
    if (typeof props.collabArray == 'string') return
    if (searchingCreator.value) return
    
    let user = props.host ? props.collabArray[0][0] : props.collabArray[2][props.pos]
    searchingCreator.value = true
    let searchUsername = (e.target as HTMLFormElement)?.elements?.[0]?.value!
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
            
            user.color = chroma.rgb(...Object.values(colors[userData.color1])).hex()
            user.socials = userData.socials
            user.verified = [
                userData.iconID,
                userData.color1,
                userData.color2,
                userData.glow
            ];
            (document.querySelector("#addCollabMember") as HTMLButtonElement).focus()
        }
        setTimeout(() => searchingCreator.value = false, 5000)
    })
}

const writeName = (e: Event) => {
    setTimeout(() => {
        let val = (e.target as HTMLInputElement).value
        if (props.host) {
            if (typeof props.collabArray == 'string') 
                props.collabArray = val
            else
                props.collabArray[0][0].name = val
        }
        else
            props.collabArray[2][props.pos].name = val
    }, 50);
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
            <form @submit.native.prevent="getCreator" class="flex gap-1 items-center" :class="{'shake': noResults}">
                <img src="@/images/unknownCube.svg" class="w-10" alt="" v-if="!verified">
                <PlayerIcon v-else-if="typeof verified == 'object'" :icon="verified[0]" :col1="verified[1].toString()" :col2="verified[2].toString()" :glow="verified[3]" class="w-10 h-10" :quality="1"/>
                <div class="flex flex-col gap-1">
                    <input type="text" maxlength="15" class="px-1 w-[min(11rem,30vw)] bg-black bg-opacity-40 rounded-sm" :value="name" @change="writeName" :placeholder="$t('collabTools.memberName')">
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
                        <button :title="$t('collabTools.addSocialTitle')" class="bg-gray-600 rounded-sm button focus-visible:-translate-y-1" type="button" @click="emit('addSocial', false, pos)" v-if="(socials ?? []).length < 5">
                            <img src="../../images/plus.svg" class="box-border p-0.5 mx-auto h-4" alt="">
                        </button>
                    </section>
                </div>
                <button :title="$t('collabTools.findTItle')" class="bg-black bg-opacity-40 rounded-md transition-opacity button disabled:opacity-50 focus:outline focus:outline-current" type="submit" :disabled="searchingCreator">
                    <img src="@/images/searchOpaque.svg" class="box-border p-1 w-8" alt="">
                </button>
            </form>

            <section class="flex flex-col items-center" v-if="!host">
                <div class="relative">
                    <input class="p-1 w-12 text-xl text-center bg-black bg-opacity-40 rounded-md max-sm:text-xs" inputmode="numeric" type="number" style="appearance: textfield" min="0" max="100" @change="modifyPart($event, 0)" :value="part[0]">
                    <img src="@/images/arrow.svg" class="inline mx-2 mb-1 h-3 opacity-60 button max-sm:h-3 max-sm:rotate-90" alt="">
                    <input class="p-1 w-12 text-xl text-center bg-black bg-opacity-40 rounded-md max-sm:text-xs" inputmode="numeric" type="number" style="appearance: textfield" min="0" max="100" @change="modifyPart($event, 1)" :value="part[1]">
                    <span class="absolute bottom-1.5 ml-1 opacity-60 pointer-events-none max-sm:text-xs">%</span>
                </div>
            </section>
            
            <section class="flex flex-col items-center max-sm:hidden" :class="{'ml-4': host}">
                <button :title="$t('collabTools.changeRoleTitle')" class="relative p-1 w-40 rounded-md button shadow-drop roleSwitcher focus-visible:!outline focus-visible:!outline-current" :style="{backgroundColor: roleColor ?? '#000'}" @click="emit('changeRole', pos)">
                    {{ collabArray?.[1]?.[role] || $t('collabTools.unnamedRole') }}
                    <img src="@/images/edit.svg" class="box-border inline absolute right-1 top-1/2 p-0.5 ml-auto w-4 bg-black bg-opacity-40 rounded-sm -translate-y-1/2" alt="">
                </button>
            </section>
    
            <div class="flex gap-2 items-center" v-if="!host">
                <button class="flex justify-center items-center w-10 h-10 rounded-md border-4 border-white border-solid button max-sm:hidden focus-visible:!outline focus-visible:!outline-current"
                    :style="{backgroundColor: color}"
                    @click="colorPickerOpen = !colorPickerOpen">
                    <img src="@/images/color.svg" class="w-6" alt="" :class="{'invert': color[2] >= 32}">
                </button>
                <div class="flex flex-col max-sm:hidden">
                    <button :title="$t('collabTools.copyMemberTItle')" class="w-7 bg-yellow-600"><img class="box-border p-1 button" src="@/images/copy.svg" alt="" @click="emit('copyMember', pos)"></button>
                    <button :title="$t('collabTools.removeMemberTitle')" class="w-7 bg-red-600"><img class="box-border p-1 button" src="@/images/trash.svg" alt="" @click="emit('removeMember', pos)"></button>
                </div>
            </div>
        </main>
        <Transition name="fade">
            <ColorPicker v-if="colorPickerOpen && !host" :hex="color" @colors-modified="collabArray[2][pos].color = $event" />
        </Transition>
    </section>
</template>
