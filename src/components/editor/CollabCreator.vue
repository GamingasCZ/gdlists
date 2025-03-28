<script setup lang="ts">
import ColorPicker from '../global/ColorPicker.vue';
import chroma from 'chroma-js';
import { computed, nextTick, ref } from 'vue';
import { socialMediaImages } from './socialSites';
import { socialMedia } from './socialSites';
import type { CollabData, userDataFetchResponse } from '@/interfaces';
import axios from 'axios';
import PlayerIcon from '../global/PlayerIcon.vue';
import colors from "../../images/icons/colors.json"
import Dropdown from '../ui/Dropdown.vue';
import { i18n } from "@/locales";

const emit = defineEmits<{
    (e: 'changeRole', roleNum: number): void,
    (e: 'removeMember', position: number): void,
    (e: 'copyMember', position: number): void,
    (e: 'addSocial', edit: boolean, creatorPos: number, editPos?: number): void
    (e: 'removeSocial', position: number): void,
    (e: 'removeRole', position: number): void,
    (e: 'addRole', preset: number): void,
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
    roleColors: string[];
    host: boolean;
    collabArray: CollabData
}>()

const colorPickerOpen = ref(false)

const rolePresets = [
  [i18n.global.t('collabTools.verifier'), true],
  [i18n.global.t('collabTools.layout'), false],
  [i18n.global.t('collabTools.deco'), false],
  [i18n.global.t('collabTools.testing'), true],
  [i18n.global.t('collabTools.optimization'), true]
]

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

const roleButton = ref<HTMLButtonElement>()
const roleDropdownOpen = ref(false)
const optsShown = ref(-1)
const editingRoleName = ref(-1)

const editRoleName = (pos: number) => {
    editingRoleName.value = pos
    roleDropdownOpen.value = -1
    nextTick(() => roleInput.value[pos]?.focus())
}

const addRole = (preset: [string, boolean] | -1) => {
    emit('addRole', preset == -1 ? undefined : preset)
    if (preset == -1)
        editRoleName(props.roleColors.length-1)
}

const openRoleDropdown = (pos: number) => {
    if (optsShown.value == pos)
        optsShown.value = -1
    else
        optsShown.value = pos
}

const containsPresets = computed(() => rolePresets.filter(x => !props.collabArray[1].includes(x[0])))
const presetDropdownShown = ref(false)

const propagateInput = (e: MouseEvent, editingName: boolean) => {
    if (!editingName)
        e.stopPropagation()
}

const finishEditName = (pos: number) => {
    editingRoleName.value = -1
    emit('changeRole', pos)
    optsShown.value = -1
}

const roleInput = ref<HTMLInputElement[]>()

</script>

<template>
    <section class="flex flex-col gap-2 items-center pl-2 overflow-clip bg-black rounded-md collabMember min-h-max odd:bg-opacity-40 even:bg-opacity-20" :class="{'!bg-opacity-0': host}">
        <main class="flex flex-wrap gap-2 items-center my-auto w-full" :class="{'justify-between': !host}">
            <form @submit.native.prevent="getCreator" class="flex gap-1 items-center" :class="{'shake': noResults}">
                <img src="@/images/unknownCube.svg" class="w-10" alt="" v-if="!verified">
                <PlayerIcon v-else-if="typeof verified == 'object'" :icon="verified[0]" :col1="verified[1].toString()" :col2="verified[2].toString()" :glow="verified[3]" class="w-10 h-10" :quality="1"/>
                <div class="flex flex-col gap-1">
                    <input type="text" maxlength="15" class="px-1 w-[min(11rem,30vw)] max-sm:py-1 bg-black bg-opacity-40 rounded-sm" :value="name" @change="writeName" :placeholder="$t('collabTools.memberName')">
                    <section class="grid grid-cols-6 gap-1">
                        <button
                            class="rounded-sm button focus-visible:-translate-y-1" :style="{backgroundColor: socialMedia[site[0]].color}"
                            type="button"
                            v-for="(site, index) in (socials ?? [])"
                            @click="emit('addSocial', true, pos, index)"
                            @auxclick="emit('removeSocial', index)"
                        >
                            <img :src="socialMediaImages[socialMedia[site[0]].icon]" class="box-border p-0.5 mx-auto h-4" alt="">
                        </button>
                        <button :title="$t('collabTools.addSocialTitle')" class="bg-gray-600 rounded-sm button focus-visible:-translate-y-1" type="button" @click="emit('addSocial', false, pos)" v-if="(socials ?? []).length < 6">
                            <img src="../../images/plus.svg" class="box-border p-0.5 mx-auto h-4" alt="">
                        </button>
                    </section>
                </div>
                <button :title="$t('collabTools.findTItle')" class="bg-black bg-opacity-40 rounded-md transition-opacity button disabled:opacity-50 focus:outline focus:outline-current" type="submit" :disabled="searchingCreator">
                    <img src="@/images/searchOpaque.svg" class="box-border p-1 w-8" alt="">
                </button>
            </form>

            <section class="flex flex-col items-center" v-if="!host">
                <div class="relative max-sm:mr-1">
                    <input class="p-1 w-12 text-xl text-center bg-black bg-opacity-40 rounded-md max-sm:w-8 max-sm:text-xs" inputmode="numeric" type="number" style="appearance: textfield" min="0" max="100" @change="modifyPart($event, 0)" :value="part[0]">
                    <img src="@/images/arrow.svg" class="inline mx-2 mb-1 h-3 opacity-60 button max-sm:h-3" alt="">
                    <input class="p-1 w-12 text-xl text-center bg-black bg-opacity-40 rounded-md max-sm:w-8 max-sm:text-xs" inputmode="numeric" type="number" style="appearance: textfield" min="0" max="100" @change="modifyPart($event, 1)" :value="part[1]">
                    <span class="absolute bottom-1.5 ml-1 opacity-60 pointer-events-none max-sm:text-xs">%</span>
                </div>
            </section>
            
            <section class="flex flex-col items-center" :class="{'ml-4': host}">
                <button :title="$t('collabTools.changeRoleTitle')" ref="roleButton" class="relative p-1 max-sm:pr-8 w-40 rounded-md button shadow-drop roleSwitcher focus-visible:!outline focus-visible:!outline-current" :style="{backgroundColor: roleColors?.[role] ?? '#000'}" @click="roleDropdownOpen = true">
                    {{ collabArray?.[1]?.[role] || $t('collabTools.unnamedRole') }}
                    <img src="@/images/edit.svg" class="box-border inline absolute right-1 top-1/2 p-0.5 ml-auto w-4 bg-black bg-opacity-40 rounded-sm -translate-y-1/2" alt="">
                </button>
            </section>
    
            <div class="flex gap-2 items-center" v-if="!host">
                <button class="flex justify-center items-center w-10 h-10 rounded-md border-4 border-white border-solid button focus-visible:!outline focus-visible:!outline-current"
                    :style="{backgroundColor: color}"
                    @click="colorPickerOpen = !colorPickerOpen">
                    <img src="@/images/color.svg" class="w-6" alt="" :class="{'invert': color[2] >= 32}">
                </button>
                <div class="flex flex-col">
                    <button :title="$t('collabTools.copyMemberTItle')" class="w-7 bg-yellow-600"><img class="box-border p-1 button" src="@/images/copy.svg" alt="" @click="emit('copyMember', pos)"></button>
                    <button :title="$t('collabTools.removeMemberTitle')" class="w-7 bg-red-600"><img class="box-border p-1 button" src="@/images/trash.svg" alt="" @click="emit('removeMember', pos)"></button>
                </div>
            </div>
        </main>
        <Transition name="fade">
            <ColorPicker v-if="colorPickerOpen && !host" :hex="color" @colors-modified="collabArray[2][pos].color = $event" />
        </Transition>

        <Dropdown v-if="roleDropdownOpen" @close="roleDropdownOpen = false" :button="roleButton">
            <template #header>
                <h2 class="mt-1 text-xl font-bold text-center text-white">{{ $t('collabTools.modifyRoles') }}</h2>
            </template>
            <template #footer>
                <div class="flex overflow-y-auto flex-col gap-2 p-1 max-h-96">
                    <!-- Role bubble -->
                    <button v-for="(role, ind) in collabArray[1]"
                        @click="emit('changeRole', ind); roleDropdownOpen = false"
                        class="flex flex-col p-1 text-white rounded-md transition-colors items-middle shadow-drop focus-visible:!outline focus-visible:!outline-current"
                        
                        :style="{ backgroundColor: roleColors[ind] }"
                    >
                        <form @submit.prevent="" class="flex">
                            <input type="text" ref="roleInput"
                                @click="propagateInput($event, editingRoleName == ind)"
                                :disabled="editingRoleName != ind"
                                :class="{'pointer-events-none': editingRoleName != ind}"
                                class="p-1 bg-transparent rounded-md cursor-pointer outline-none focus-within:cursor-auto focus-within:bg-black focus-within:bg-opacity-40"
                                v-model="collabArray[1][ind]"
                                :placeholder="$t('collabTools.roleName')"
                            >
                            
                            <button v-if="editingRoleName == ind" type="submit" @click.stop="finishEditName(ind)" class="p-1 rounded-md hover:bg-black hover:bg-opacity-40 aspect-square button">
                                <img src="@/images/checkThick.svg" class="w-4" alt="">
                            </button>
                            <button v-else-if="editingRoleName == -1" @click.stop="openRoleDropdown(ind)" class="p-2 rounded-md hover:bg-black hover:bg-opacity-40 button">
                                <img src="@/images/genericRate.svg" class="w-2 rotate-180" alt="">
                            </button>
                        </form>
                        <div v-if="optsShown == ind && editingRoleName == -1" class="flex mt-2">
                            <button v-if="collabArray[1].length > 1" @click.stop="emit('removeRole', ind); optsShown = -1" :title="$t('editor.remove')" class="p-1 bg-black bg-opacity-40 rounded-md button"><img src="@/images/trash.svg" class="inline w-5" alt=""></button>
                            <button :title="$t('collabTools.hideTitle')" class="p-1 ml-1 bg-black bg-opacity-40 rounded-md button" @click.stop="collabArray[4][pos] = !collabArray?.[4]?.[pos]"><img src="@/images/view.svg" class="w-5" :class="{ 'opacity-20': collabArray?.[4]?.[pos] }" alt=""></button>
                            <button @click.stop="editRoleName(ind)" class="p-1 ml-auto bg-black bg-opacity-40 rounded-md button"><img src="@/images/edit.svg" class="inline mr-2 w-5" alt="">{{ $t('level.edit') }}</button>
                        </div>
                    </button>
                </div>

                <div class="p-1 m-1 mt-4 text-white bg-black bg-opacity-40 rounded-md min-w-48">
                    <button @click="addRole(-1)" class="flex gap-1 items-center w-full">
                        <img src="@/images/plus.svg" class="mr-1 w-4" alt="">
                        <span>{{ $t('collabTools.addRole') }}</span>
                        <hr v-if="containsPresets.length" class="ml-auto w-0.5 h-4 bg-white border-none opacity-40">
                        <button @click.stop="presetDropdownShown = !presetDropdownShown" v-if="containsPresets.length">
                            <img src="@/images/genericRate.svg" :class="{'rotate-180': !presetDropdownShown}" class="m-2 w-2 button" alt="">
                        </button>
                    </button>

                    <div v-if="presetDropdownShown" class="flex flex-col items-start">
                        <button @click="addRole(preset); optsShown = -1" class="ml-6 opacity-40 hover:opacity-100" v-for="preset in containsPresets">
                            <img src="@/images/plus.svg" class="inline mr-2 w-2" alt="">
                            {{ preset[0] }}
                        </button>
                    </div>
                </div>
            </template>
        </Dropdown>
    </section>
</template>
