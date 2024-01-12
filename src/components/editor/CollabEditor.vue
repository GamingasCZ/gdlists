<script setup lang="ts">
import { levelList, creatorToCollab, makeColor } from '@/Editor';
import chroma from 'chroma-js';
import { computed, nextTick, onMounted, onUnmounted, onUpdated, reactive, ref, watch } from 'vue';
import type { CollabData, CollabHumans, SavedCollab } from '@/interfaces'
import CollabCreator from './CollabCreator.vue';
import SavedCollabVue from './SavedCollab.vue';
import { SETTINGS, hasLocalStorage } from '@/siteSettings';
import { socialMedia, socialMediaImages, checkAndRemoveDomain } from './socialSites';
import { useI18n } from 'vue-i18n';
import { i18n } from '@/locales';

const props = defineProps({
    index: {type: Number, required: true},
    clipboard: {type: Object}
})

const emit = defineEmits<{
  (e: "closePopup"): void;
  (e: "sendClipboard", memberClipboard: [number, string, CollabHumans]): void;
}>();

var collab = ref(levelList.value.levels[props.index!].creator)
var levelColor = levelList.value.levels?.[props.index]?.color

const hyperfunnyNames = [
  useI18n().t('collabTools.funny1'),
  useI18n().t('collabTools.funny2'),
  useI18n().t('collabTools.funny3'),
  useI18n().t('collabTools.funny4'),
  useI18n().t('collabTools.funny5')
]
const editorName = ref(hyperfunnyNames[0])
const makeFunyEditorName = () => {
  if (typeof collab.value == "string") return

  if (collab.value[2].length < 10) editorName.value = hyperfunnyNames[0]
  else if (collab.value[2].length < 25) editorName.value = hyperfunnyNames[1]
  else if (collab.value[2].length < 50) editorName.value = hyperfunnyNames[2]
  else if (collab.value[2].length < 75) editorName.value = hyperfunnyNames[3]
  else if (collab.value[2].length >= 100) editorName.value = hyperfunnyNames[4]
}

const colorLeft = ref(chroma.hsl(levelColor?.[0], 0.906, 0.167).hex())
const colorRight = ref(chroma.hsl(levelColor?.[0], 0.231, 0.102).hex())
const colorSex = ref(chroma.hsl(90+levelColor?.[0] % 360, 0.9, 0.25).hex())
const colorSex2 = ref(chroma.hsl(270+levelColor?.[0] % 360, 0.6, 0.1).hex())

const makeRoleColors = () => {
  if (typeof collab.value == "string") return

  roleColors.value = chroma.scale([colorSex.value, colorSex2.value]).mode('oklch').colors(Math.max(2, collab.value[1].length))
}

const MAX_LASTUSED = 15
const lastUsedRoles = ref<string[]>()
const pinnedLastUsedRoles = ref<string[]>()
if (hasLocalStorage()) {
  lastUsedRoles.value = JSON.parse(localStorage.getItem("lastUsedRoles")!) ?? []
  pinnedLastUsedRoles.value = JSON.parse(localStorage.getItem("pinnedLastUsedRoles")!) ?? []
}
const allLastUsedRoles = ref([...pinnedLastUsedRoles.value ?? [], ...lastUsedRoles.value ?? []])

watch(props, () => {
    colorLeft.value = chroma.hsl(levelColor?.[0], 0.906, 0.167).hex()
    colorRight.value = chroma.hsl(levelColor?.[0], 0.231, 0.102).hex()
})

/*
=======
Roles
=======
*/

const rolePresets = ref([useI18n().t('collabTools.verifier'), useI18n().t('collabTools.layout'), useI18n().t('collabTools.deco'), useI18n().t('collabTools.testing'), useI18n().t('collabTools.optimization')])
const roleColors = ref<string[]>([])
const roleSidebarOpen = ref(false)

function createCollab() {
  addRole("Host")
  roleSidebarOpen.value = true
}

function addRole(preset: string = "") {
  if (typeof collab.value == 'string') {
    collab.value = creatorToCollab(collab.value)
    levelList.value.levels[props.index!].creator = collab.value
  }
  if (!collab.value[1].includes(preset)) {
    collab.value?.[1].push(preset)
    makeRoleColors()
  }
}

var lastPickedRole = -1
function pickRole(creatorPos: number, rolePos: number) {
  if (typeof collab.value == "string") return

  lastPickedRole = rolePos
  collab.value[creatorPos == 999 ? 0 : 2][creatorPos == 999 ? 0 : creatorPos].role = rolePos
  pickingRole.value = -1
  nextTick(() => (document.querySelectorAll(`.roleSwitcher`)[creatorPos == 999 ? 0 : creatorPos+1] as HTMLButtonElement).focus())
}

function pinRole(roleName: string) {
  if (pinnedLastUsedRoles.value?.includes(roleName)) { // Remove pinned
    pinnedLastUsedRoles.value?.splice(pinnedLastUsedRoles.value.indexOf(roleName), 1)
    lastUsedRoles.value?.push(roleName)
  }
  else { // Add pinned
    pinnedLastUsedRoles.value?.push(roleName)
    lastUsedRoles.value?.splice(lastUsedRoles.value.indexOf(roleName), 1)
  }

  allLastUsedRoles.value = [...pinnedLastUsedRoles.value ?? [], ...lastUsedRoles.value ?? []]
}

function removeLastUsedRole(roleName: string) {
  if (pinnedLastUsedRoles.value?.includes(roleName))
    pinnedLastUsedRoles.value.splice(pinnedLastUsedRoles.value.indexOf(roleName), 1)
  else
    lastUsedRoles.value?.splice(lastUsedRoles.value.indexOf(roleName), 1)

  allLastUsedRoles.value = [...pinnedLastUsedRoles.value ?? [], ...lastUsedRoles.value ?? []]
}

function changeRole(levelIndex: number) {
  pickingRole.value = levelIndex;
  nextTick(() => (document.querySelector(".roleBubble") as HTMLButtonElement).focus())
}

function openSidebar(which:number) {
  if (pickingRole.value > -1) return
  if (which == 0) {
    roleSidebarOpen.value = !roleSidebarOpen.value
    savedSidebarOpen.value = false
  }
  else {
    savedSidebarOpen.value = !savedSidebarOpen.value
    roleSidebarOpen.value = false
  }
}

/*
=======
Members
=======
*/

const openSortDropdown = () => {
  sortDropdownOpen.value = true
  document.body.addEventListener("click", () => sortDropdownOpen.value = false, {once: true, capture: true},)
}

function sortCollab(type: 0 | 1 | 2) {
  if (typeof collab.value == 'string') return
  switch (type) {
    case 0: // By part
      collab.value[2] = collab.value[2].sort((a,b) => a.part[0] - b.part[0])
      break;
    case 1: // By name
      collab.value[2] = collab.value[2].sort((a,b) => a.name.localeCompare(b.name))
      break;
    case 2: // By role
      collab.value[2] = collab.value[2].sort((a,b) => a.role - b.role)
      break;
  }
}

function addMember(params?: CollabHumans) {
  pickingRole.value = -1;
  if (typeof collab.value == 'string') return
  
  let lastMemberPart = collab.value[2][collab.value[2].length-1]?.part ?? [0,0]
  collab.value[2].push({
    name: params?.name ?? "",
    socials: params?.socials ?? [],
    color: makeColor(params?.color, true),
    part: params?.part ?? [lastMemberPart[1], Math.min(100, lastMemberPart[1]+5)],
    role: params?.role ?? (lastPickedRole == -1 ? 0 : lastPickedRole),
    verified: params?.verified ?? 0
  })
  makeFunyEditorName()
  nextTick(() => document.querySelector(".collabMember:last-child input").focus())
}

function removeMember(position: number) {
  pickingRole.value = -1
  collab.value[2].splice(position, 1)
  socialPicker.open = false
  makeFunyEditorName()
}

function copyMember(position: number) {
  if (typeof collab.value == "string") return

  clipboardContent.value = [
    collab.value[2][position].role, // Role index
    collab.value[1][collab.value[2][position].role], // Role name

    collab.value[2][position] // human data >:)
  ]
  emit('sendClipboard', clipboardContent.value)
}

function pasteMember() {
  if (!clipboardContent.value) return

  if (typeof collab == 'string') collab.value = creatorToCollab(collab.value) // turn into collab

  // Add role if missing
  let newRoleIndex = clipboardContent.value[0]
  if (collab.value[1]?.[clipboardContent.value[0]] != clipboardContent.value[1]) {
    addRole(clipboardContent.value[1])
    newRoleIndex = collab.value[1].length - 1
  }

  if (typeof collab.value == "string") return

  addMember(clipboardContent.value[2])
  collab.value[2][collab.value[2].length-1].role = newRoleIndex
}

const noMembers = computed(() =>
  typeof collab.value == 'string' || (collab.value?.[2] == undefined || !collab.value?.[2].length)
)
const noRoles = computed(() => 
  typeof collab.value == 'string' || (collab.value?.[1] == undefined || !collab.value?.[1].length))

const localStrg = hasLocalStorage()
const pickingRole = ref(-1)
const clipboardContent = ref<[number, string, CollabHumans]>(props.clipboard)
const sortDropdownOpen = ref(false)
const presetDropdownOpen = ref(false)

/*
=======
Social media
=======
*/

const socialPicker = reactive({
  open: false,
  editing: -1,
  dropdownOpen: false,
  creatorIndex: 0,
  socialIndex: 0,
  usedSocials: <number[]>[]
})
const socialPickerURL = ref("")

const openSocialDropdown = () => {
  if (typeof collab.value == "string") return

  socialPicker.dropdownOpen = true
  document.body.addEventListener("click", () => socialPicker.dropdownOpen = false, {once: true, capture: true},)
}
const openPresetsDropdown = () => {
  if (typeof collab.value == "string") return

  presetDropdownOpen.value = true
  document.body.addEventListener("click", () => presetDropdownOpen.value = false, {once: true, capture: true},)
}
const modifyPickerURL = (e: Event) => {
  if ([3, 4].includes(socialPicker.socialIndex)) // do not shorten discord and custom link
    socialPickerURL.value = (e.target as HTMLInputElement).value
  else
    socialPickerURL.value = checkAndRemoveDomain((e.target as HTMLInputElement).value)
}

function addSocial(editing: boolean, creatorIndex: number, editPos?: number) {
  if (typeof collab.value == "string") return
  if (collab.value[2].length >= 100) return
  
  // -1 = host
  let member;
  let arrayIndex = creatorIndex == 999 ? 0 : creatorIndex
  if (creatorIndex == 999) member = collab.value[0]
  else member = collab.value[2]

  socialPicker.open = true
  socialPicker.creatorIndex = creatorIndex
  socialPickerURL.value = ""
  socialPicker.editing = -1

  let usedSocials: number[] = []
  member[arrayIndex].socials.forEach(web => usedSocials.push(web[0]))
  socialPicker.usedSocials = usedSocials
  
  if (editing) {
    socialPicker.socialIndex = member[arrayIndex].socials[editPos!][0]
    socialPickerURL.value = checkAndRemoveDomain(member[arrayIndex].socials[editPos!][1])
    socialPicker.editing = editPos!
  }
  else {
    socialPicker.socialIndex = 0

    // Pick next unused social media site
    for (let i = 0; i < socialMedia.length; i++) {
      if (!usedSocials.includes(i)) {
        socialPicker.socialIndex = i
        break
      }
    }
  }
  socialPicker.dropdownOpen = false;
  setTimeout(() => {
    (document.querySelector("#socInputBox") as HTMLInputElement).focus()
  }, 50);
}
function confirmSocial() {
  if (typeof collab.value == "string") return

  // -1 = host
  let member;
  let arrayIndex = socialPicker.creatorIndex == 999 ? 0 : socialPicker.creatorIndex
  if (socialPicker.creatorIndex == 999) member = collab.value[0]
  else member = collab.value[2]

  if (socialPicker.editing > -1)
    member[arrayIndex].socials[socialPicker.editing] = [socialPicker.socialIndex, socialPickerURL.value]
  else
    member[arrayIndex].socials.push([socialPicker.socialIndex, socialPickerURL.value])
    
  socialPicker.editing = -1
  socialPicker.open = false
  socialPickerURL.value = ""
  socialPicker.dropdownOpen = false
}
const removeSocial = (creatorIndex: number, socialIndex: number) => {
  if (creatorIndex == -1)
    (collab.value as CollabData)[0][0].socials.splice(socialIndex, 1);
  else
    (collab.value as CollabData)[2][creatorIndex].socials.splice(socialIndex, 1);
  socialPicker.open = false;
}

/*
=======
Saved collabs
=======
*/

const currentlyUsedSaved = ref(-1)
const savedSidebarOpen = ref(false)
const savedCollabs = ref<SavedCollab[]>()
if (localStrg) {
  savedCollabs.value = JSON.parse(localStorage.getItem("savedCollabs")!) ?? []
}

function saveAllCollabs() {
  if (!localStrg) return
  localStorage.setItem("savedCollabs", JSON.stringify(savedCollabs.value))
  let ids = []
  savedCollabs.value?.forEach(collab => ids.push(collab.levelID))
  localStorage.setItem("savedCollabIDs", JSON.stringify(ids))
}

function saveCollab() {
  if (!localStrg) return
  if (typeof collab.value == "string") return

  let updating = currentlyUsedSaved.value != -1

  let saveData: SavedCollab = {
    collabName:
      updating ? 
        savedCollabs.value![currentlyUsedSaved.value].collabName :
        levelList.value.levels[props.index].levelName || i18n.global.t('collabTools.unnamedCollab'),
    collabHost: collab.value[0][0].name,
    levelID: parseInt(levelList.value.levels[props.index].levelID || "-1"),
    collabID: collab.value[3],
    data: collab.value,
    memberCount: collab.value[2].length,
    timestamp: Date.now()
  }

  if (!updating) {
    currentlyUsedSaved.value = savedCollabs.value?.length!
    savedCollabs.value?.push(saveData)
  }
  else
    savedCollabs.value![currentlyUsedSaved.value] = saveData
  saveAllCollabs()
}

function removeCollab(ind: number) {
  savedCollabs.value?.splice(ind, 1)
  saveAllCollabs()
}

function loadCollab(saveData: SavedCollab, collabIndex: number) {
  levelList.value.levels[props.index].creator = saveData.data
  if (saveData.levelID != "-1")
    levelList.value.levels[props.index].levelID = saveData.levelID.toString()
  collab.value = saveData.data
  currentlyUsedSaved.value = collabIndex
  makeRoleColors()
}

onMounted(() => {
  makeRoleColors()
  if (!localStrg) return

  let saveIDs = JSON.parse(localStorage.getItem("savedCollabIDs")!) ?? [];
  hasSavedCollab.value = saveIDs.indexOf(parseInt(levelList.value.levels[props.index].levelID))

  let getCurrCollabID = savedCollabs.value?.filter(saved => saved.collabID == collab.value[3])
  currentlyUsedSaved.value = savedCollabs.value?.indexOf(getCurrCollabID?.[0] ?? <any>[])!
})

const hasSavedCollab = ref(-2)
onUnmounted(() => {
  if (!localStrg) return
  if (typeof collab.value == "string") return

  // Save used roles
  lastUsedRoles.value?.push(...collab.value[1])
  lastUsedRoles.value = lastUsedRoles.value?.filter(lastUsedRole => !pinnedLastUsedRoles.value?.includes(lastUsedRole))

  lastUsedRoles.value = [...new Set(lastUsedRoles.value?.splice(-MAX_LASTUSED))]

  localStorage.setItem("lastUsedRoles", JSON.stringify(lastUsedRoles.value))
  localStorage.setItem("pinnedLastUsedRoles", JSON.stringify(pinnedLastUsedRoles.value))
})

</script>

<template>
  <dialog
    open
    @click="SETTINGS.dialogClickClose ? emit('closePopup') : ''"
    tabindex="0"
    @keyup.esc="emit('closePopup')"
    class="flex gap-2 justify-center items-center"
  >
    <section
      @click.stop=""
      :style="{background: `linear-gradient(9deg, ${colorRight}, ${colorLeft})`}"
      class=" w-[60rem] max-h-[95svh] max-w-[95vw] rounded-lg pt-2 grid grid-rows-[repeat(3,max-content)] text-white shadow-lg shadow-black h-[40rem]"
      :class="{'max-lg:hidden': roleSidebarOpen || savedSidebarOpen}"
    >
      <div class="flex relative justify-between items-center py-1 mx-2 -translate-y-0.5">
        <div></div>
        <h1 class="text-xl font-bold text-center">{{ editorName }}</h1>
        <img
          src="@/images/close.svg"
          alt=""
          class="w-6 button"
          @click="emit('closePopup')"
        />
      </div>

      <section class="flex items-center mr-2" v-if="(typeof collab != 'string')">
        <CollabCreator
            class="ml-1 grow"
            v-bind="collab[0][0]"
            :pos="999"
            :level-index="index"
            :role-color="roleColors?.[collab[0][0].role]"
            :host="true"
            v-if="(typeof collab != 'string')"
            @change-role="pickingRole = $event"
            @remove-member="removeMember"
            @copy-member="copyMember"
            @add-social="addSocial"
            @remove-social="removeSocial(0, $event)"
        />
        <div v-else class="flex ml-1 grow"></div>

        <button v-if="(typeof collab != 'string')" class="p-1.5 mr-2 bg-black bg-opacity-40 rounded-md button focus-visible:!outline focus-visible:!outline-current" @click="openSidebar(0)" :class="{'!bg-opacity-80': roleSidebarOpen}">
          <img src="../../images/editorMobHeader.svg" alt="" class="box-border inline p-0.5 w-6">
          <span class="ml-2 max-sm:hidden">{{ $t('collabTools.modifyRoles') }}</span>
        </button>
        <button v-if="(typeof collab != 'string')" class="p-1.5 bg-black bg-opacity-40 rounded-md button focus-visible:!outline focus-visible:!outline-current" @click="openSidebar(1)" :class="{'!bg-opacity-80': savedSidebarOpen}">
          <img src="../../images/savedMobHeader.svg" alt="" class="box-border inline p-0.5 w-6">
          <span class="ml-2 max-sm:hidden">{{ $t('navbar.saved') }}</span>
        </button>
      </section>

        <header class="flex relative justify-between items-center bg-[url(@/images/headerBG.webp)] bg-center p-2">
            <h2 class="text-2xl font-black">{{ $t('collabTools.members') }}</h2>
            <div class="sm:hidden"></div>
            <div class="flex items-center">
                <button
                  class="box-border p-1.5 mr-2 w-10 h-10 bg-black bg-opacity-40 rounded-md button"
                  :class="{'disabled': !clipboardContent || !collab?.[2] || collab[2].length >= 100}"
                  :disabled="!clipboardContent || !collab?.[2] || collab[2].length >= 100"
                  @click="pasteMember"
                >
                    <img src="@/images/paste.svg" alt="">
                </button>
                <div class="relative">
                  <button
                    class="box-border z-10 p-1.5 mr-2 w-10 h-10 bg-black bg-opacity-40 rounded-md button focus-visible:!outline focus-visible:!outline-current"
                    v-if="(typeof collab != 'string')"
                    @click="openSortDropdown()"
                  >
                      <img src="@/images/sort.svg" alt="">
                    </button>
                  <Transition name="fade">
                    <div v-if="sortDropdownOpen" class="flex absolute -bottom-40 -left-1/2 z-10 flex-col gap-1 p-1 w-40 text-center bg-black bg-opacity-90 rounded-md backdrop-blur-sm -translate-x-10">
                      <img src="@/images/popupArr.svg" class="absolute -top-5 left-1/2 w-5 opacity-90 -translate-x-1.5" alt="">
                      <h2 class="font-bold">{{ $t('collabTools.sortBy') }}</h2>
                      <button v-for="(sort, index) in [$t('collabTools.sortPart'), $t('collabTools.sortName'), $t('collabTools.sortRole')]" @click="sortCollab(index)" class="block p-1 w-full text-white bg-white bg-opacity-10 rounded-md button focus-visible:!outline focus-visible:!outline-current">{{ sort }}</button>
                    </div>
                  </Transition>
                </div>
                <button class="box-border p-1.5 w-10 h-10 bg-black bg-opacity-40 rounded-md button focus-visible:!outline focus-visible:!outline-current" v-if="(typeof collab != 'string')"
                  @click="addMember()"
                  id="addCollabMember"
                  :disabled="typeof collab != 'string' && (noRoles || collab[2].length >= 100)"
                  :class="{'disabled': typeof collab != 'string' && (noRoles || collab[2].length >= 100)}"
                >
                    <img src="@/images/addLevel.svg" alt="">
                </button>
            </div>
            
            <!-- Socials input box -->
            <Transition name="fade">
              <form
                class="flex absolute bottom-0 left-1/2 z-30 -translate-x-1/2 gap-1 justify-center items-center w-[99%] h-[90%] bg-white bg-opacity-10 rounded-md backdrop-blur-sm shadow-drop"
                v-if="socialPicker.open"
                @submit.prevent="confirmSocial"  
              >
                  <div class="box-border flex relative items-center p-1 w-[30rem] max-w-[70vw] bg-black bg-opacity-40 rounded-md">
                    <button type="button" @click="openSocialDropdown" class="pr-1 align-middle bg-white bg-opacity-10 rounded-md button">
                      <img :src="socialMediaImages[socialMedia[socialPicker.socialIndex].icon]" class="absolute left-2 top-1/2 mx-auto w-4 opacity-40 -translate-y-1/2" alt="">
                      <label for="socInputBox" class="ml-7 text-xs opacity-40 pointer-events-none max-sm:hidden">{{ socialMedia[socialPicker.socialIndex].baseUrl }}</label>
                    </button>
                    <input maxlength="150" :value="socialPickerURL" @input="modifyPickerURL" @paste="modifyPickerURL" type="text" id="socInputBox" class="box-border px-1 ml-1 w-full bg-transparent rounded-sm outline-none focus-visible:bg-opacity-5 focus-visible:bg-white" :placeholder="socialMedia[socialPicker.socialIndex].name">
                    
                    <!-- Link buttons -->
                    <div class="flex absolute -left-2 -bottom-11 gap-2 p-2 rounded-md bg-[#020202] z-30" v-if="socialPicker.dropdownOpen">
                      <img src="@/images/popupArr.svg" class="absolute -top-4 left-5 w-4 pointer-events-none" alt="">
                      <button
                        type="button"
                        class="flex justify-center items-center w-10 h-5 rounded-sm button" 
                        :style="{backgroundColor: website.color}"
                        v-for="website in socialMedia.filter(web => !socialPicker.usedSocials.includes(web.index))"
                        @click="socialPicker.socialIndex = website.index"
                      >
                        <img class="w-4 pointer-events-none" :src="socialMediaImages[website.icon]">
                      </button>
                    </div>
                    
                  </div>
                  
  
                <button type="submit" :disabled="socialPickerURL.length < 5" class="p-1 bg-black bg-opacity-40 rounded-md button disabled:opacity-50"><img src="@/images/checkThick.svg" class="w-6" alt=""></button>
                <button v-if="socialPicker.editing == -1" type="button" class="p-1 bg-black bg-opacity-40 rounded-md button" @click="socialPicker.open = false"><img src="@/images/close.svg" class="w-6" alt=""></button>
                <button v-else type="button" class="p-1 bg-black bg-opacity-40 rounded-md button" @click="removeSocial(socialPicker.creatorIndex, socialPicker.socialIndex)"><img src="@/images/trash.svg" class="w-6" alt=""></button>
  
              </form>
            </Transition>
            
        </header>

        <main class="bg-[url(@/images/fade.webp)] overflow-y-auto flex flex-col bg-repeat-x p-1 gap-1">
            
            <!-- No roles help -->
            <div v-if="noMembers" class="flex flex-col gap-3 items-center my-auto mt-24 text-center">
              <img src="../../images/collabDudes.svg" class="w-[min(20rem,70vw)] opacity-20" alt="">
              <h1 v-if="noRoles" class="text-2xl opacity-60 max-sm:text-lg">{{ $t('collabTools.addRoleToAddMember') }}</h1>
              <h1 v-else class="text-2xl opacity-60 max-sm:text-lg">
                {{ $t('collabTools.addSomeMembers') }}
                <h3 class="flex gap-2 justify-center items-center text-sm">{{ $t('collabTools.addMember') }} <img class="p-0.5 w-6 bg-black bg-opacity-40" src="@/images/addLevel.svg"></h3>
              </h1>
              <div class="flex gap-2">
                <button class="p-1 bg-black bg-opacity-40 rounded-md button" @click="createCollab" v-if="noRoles" autofocus="true">
                  <img src="../../images/plus.svg" alt="" class="box-border inline p-0.5 mr-2 w-8">
                  {{ $t('collabTools.addRoles') }}
                </button>
                <button class="p-1 bg-black bg-opacity-40 rounded-md button" @click="savedSidebarOpen = !savedSidebarOpen" v-if="noRoles">
                  <img src="../../images/savedMobHeader.svg" alt="" class="box-border inline p-0.5 mr-2 w-8">
                  {{ $t('navbar.saved') }}
                </button>
              </div>

              <!-- Load existing saved -->
              <div v-if="hasSavedCollab > -1">
                <hr class="w-96 h-1 bg-white rounded-full border-none opacity-80">
                <h1 class="mt-2 text-xl text-center opacity-60">{{ $t('collabTools.collabExists') }}</h1>
                <button class="flex items-center p-1 mx-auto mt-2 bg-black bg-opacity-40 rounded-md button" @click="loadCollab(savedCollabs?.[hasSavedCollab]!, hasSavedCollab)">
                  <img src="@/images/checkThick.svg" class="mr-4 w-8" alt="">
                  <span class="mr-1">{{ $t('other.use') }}</span>
                  <strong><i>{{ savedCollabs?.[hasSavedCollab].collabName }}</i></strong>
                </button>
              </div>
            </div>

            <!-- Collab humans -->
            <div class="flex flex-col gap-1" v-if="(typeof collab != 'string')">
              <CollabCreator
                v-for="(member, pos) in (collab as CollabData)[2]"
                :key="member.name"
                v-bind="member"
                :pos="pos"
                :level-index="index"
                :role-color="roleColors[member.role]"
                :host="false"
                @change-role="changeRole"
                @remove-member="removeMember"
                @copy-member="copyMember"
                @add-social="addSocial"
                @remove-social="removeSocial(pos, $event)"
              />
            </div>
        </main>

    </section>

    <aside
      @click.stop=""
      :style="{background: `linear-gradient(9deg, ${colorRight}, ${colorLeft})`}"
      class=" w-[20rem] max-h-[95svh] max-w-[95vw] rounded-lg text-white shadow-lg shadow-black"
      v-show="roleSidebarOpen || pickingRole > -1"
      v-if="(typeof collab != 'string')"
    >

      <!-- Role header -->
      <header class="relative mx-2 bg-[url(@/images/headerBG.webp)] py-2 flex justify-between h-12 items-center">
        <button @click="roleSidebarOpen = false" class="button">
          <img
            src="@/images/hideSidebar.svg"
            alt=""
            class="w-6"
          />
        </button>
        <h1 class="text-xl font-black text-center">{{ $t('collabTools.roles') }}</h1>
        <div class="flex gap-1">
          <button class="bg-black bg-opacity-40 rounded-md button disabled:opacity-40" :disabled="rolePresets.filter(x => !collab[1].includes(x)).length == 0" @click="openPresetsDropdown()">
            <img
              src="@/images/moveDown.svg"
              alt=""
              class="box-border p-2 w-8"
            />
          </button>
        </div>
      </header>
      <main class="bg-[url(@/images/fade.webp)] bg-repeat-x flex flex-col gap-2 p-2 relative overflow-y-auto overflow-x-clip" :class="{'h-[21.75rem]': pickingRole == -1, 'h-[37rem]': pickingRole > -1}">
        
        <!-- Presets and role help -->
        <Transition name="fade">
          <article v-if="presetDropdownOpen" class="flex absolute right-2 top-6 z-40 flex-col gap-1 justify-center items-center p-1 w-40 bg-black bg-opacity-90 rounded-md backdrop-blur-sm">
            <img src="@/images/popupArr.svg" class="absolute right-1.5 -top-5 w-5 opacity-90" alt="">
            <p class="text-lg font-bold">{{ $t('collabTools.examples') }}</p>
            <button
              v-for="preset in rolePresets.filter(x => !collab[1].includes(x))"
              @click="addRole(preset)"
              class="w-full text-white bg-white bg-opacity-10 rounded-md button"
            >
              {{ preset }}
            </button>
          </article>
        </Transition>

        <!-- Role bubble -->
        <button @click="pickRole(pickingRole, pos)" v-for="(role, pos) in collab[1]" class="flex p-1 h-9 text-white rounded-md transition-colors roleBubble items-middle shadow-drop focus-visible:!outline focus-visible:!outline-current" :style="{backgroundColor: roleColors[pos]}" :class="{'button': pickingRole > -1}">
          <input :disabled="pickingRole > -1" :class="{'pointer-events-none': pickingRole > -1}" type="text" v-model="levelList.levels[index].creator[1][pos]" :placeholder="$t('collabTools.roleName')" class="px-1 mr-2 h-full bg-transparent rounded-sm border-opacity-40 border-solid transition-colors outline-none focus:bg-opacity-40 border-b-black focus:bg-black grow">
          <div class="flex gap-1">
            <button :disabled="pickingRole > -1 || collab[1].length == 1" class="box-border p-1 w-7 bg-black bg-opacity-40 rounded-sm disabled:opacity-40 button" @click="(collab as CollabData)[1].splice(pos, 1); makeRoleColors()"><img src="@/images/trash.svg" alt=""></button>
          </div>
        </button>

        <!-- Add button-->
        <button class="flex gap-2 justify-center items-center bg-black bg-opacity-40 rounded-md opacity-70 button" v-if="pickingRole == -1" @click="addRole()">
          <img
            src="@/images/plus.svg"
            alt=""
            class="box-border p-1 w-8"
          />{{ $t('collabTools.addRole') }}
        </button>
      </main>

      <section v-if="localStrg && pickingRole == -1">
        <!-- Recently used header -->
        <header class="flex justify-between items-center bg-[url(@/images/headerBG.webp)] bg-top p-1">
          <h2 class="w-full text-xl font-black text-center max-sm:hidden">{{ $t('collabTools.recentlyUsed') }}</h2>
        </header>
  
        <!-- Recently used content -->
        <main class="h-52 overflow-x-clip bg-[url(@/images/fade.webp)] bg-repeat-x overflow-y-auto flex flex-col gap-2 py-2">
  
          <!-- History empty help -->
          <article class="flex flex-col gap-4 justify-center items-center h-full opacity-20" v-if="!allLastUsedRoles.length">
            <img src="@/images/time.svg" class="w-28" alt="">
            <h2 class="w-52 text-lg leading-tight text-center">{{ $t('collabTools.recentRolesHere') }}</h2>
          </article>

          <!-- Last used roles buttons -->
          <button 
            class="flex gap-1 items-center px-1 py-0.5 mx-1 text-left rounded-md shadow-drop"
            :style="{backgroundColor: colorLeft}"
            @click="addRole(role)"
            v-for="role in allLastUsedRoles
          ">
            <span class="ml-1 w-full">{{ role }}</span>
            <button class="bg-black bg-opacity-40 rounded-sm button" @click.stop="pinRole(role)"><img src="@/images/pin.svg" alt="" class="box-border p-1 w-7" :class="{'opacity-30': !pinnedLastUsedRoles?.includes(role)}"></button>
            <button class="bg-black bg-opacity-40 rounded-sm button" @click.stop="removeLastUsedRole(role)"><img src="@/images/trash.svg" alt="" class="box-border p-1 w-7"></button>
          </button>
  
        </main>
      </section>
    </aside>
    <aside
      @click.stop=""
      :style="{background: `linear-gradient(9deg, ${colorRight}, ${colorLeft})`}"
      class=" w-[20rem] max-h-[95svh] max-w-[95vw] rounded-lg text-white shadow-lg shadow-black"
      v-show="savedSidebarOpen"
    >

      <!-- Saved collabs header -->
      <header class="relative mx-2 bg-[url(@/images/headerBG.webp)] py-2 flex justify-between h-12 items-center">
        <button @click="savedSidebarOpen = false" class="button">
          <img
            src="@/images/hideSidebar.svg"
            alt=""
            class="w-6"
          />
        </button>
        <h1 class="text-xl font-black text-center">{{ $t('navbar.saved') }}</h1>
        <div></div>
      </header>
      <main class="bg-[url(@/images/fade.webp)] bg-repeat-x flex flex-col gap-2 p-2 w-full overflow-y-auto overflow-x-clip h-[37rem]">
        <button v-if="localStrg" class="py-2 m-1 bg-black bg-opacity-40 rounded-md button disabled:opacity-40" :disabled="(typeof collab == 'string')" @click="saveCollab()">
          <img src="@/images/symbolicSave.svg" class="inline mr-3 w-6" alt="">
          {{ $t('collabTools.saveCollab') }}
        </button>

        <article v-if="!savedCollabs?.length" class="flex flex-col gap-3 justify-center items-center px-6 w-full h-full text-xl text-center opacity-20">
          <img src="@/images/savedMobHeader.svg" class="w-28" alt="">
          {{ $t('collabTools.savedHelp') }}
        </article>

        <!-- Currently editing -->
        <div v-if="currentlyUsedSaved != -1" class="mb-4">
          <header class="flex gap-3 items-center mt-3 mb-1 opacity-80">
            <hr class="w-4 h-1 bg-white border-none">
            <h2 class="text-xl">{{ $t('collabTools.beingEdited') }}</h2>
            <hr class="h-1 bg-white border-none grow">
          </header>
          <SavedCollabVue :save="savedCollabs[currentlyUsedSaved]" :coll-index="currentlyUsedSaved" :in-use="true" @do-save="saveAllCollabs" @load-collab="loadCollab" @remove-collab="removeCollab" />
        </div>

        <!-- Same ID -->
        <!-- <div v-if="currentlyUsedSaved != -1">
          <header class="flex gap-3 items-center mb-1 opacity-80">
            <button @click="savedWithSameIDCollapsed = !savedWithSameIDCollapsed"><img src="@/images/showComms.svg" class="p-0.5 w-4 bg-white bg-opacity-20 rounded-full aspect-square" :class="{'rotate-90': !savedWithSameIDCollapsed}"></button>
            <h2 class="text-xl">Se stejným ID</h2>
            <hr class="h-1 bg-white border-none grow">
          </header>
          <div v-if="!savedWithSameIDCollapsed" class="flex flex-col gap-2">
            <SavedCollabVue :save="savedCollabs[currentlyUsedSaved]" :coll-index="currentlyUsedSaved" @change-name="modifySaveName" @load-collab="loadCollab" @remove-collab="removeCollab" />
          </div>
        </div> -->
        
        <!-- All collabs -->
        <div>
          <header class="flex gap-3 items-center mt-3 mb-1 opacity-80" v-if="savedCollabs?.length">
            <hr class="w-4 h-1 bg-white border-none">
            <h2 class="text-xl">{{ $t('collabTools.allCollabs') }}</h2>
            <hr class="h-1 bg-white border-none grow">
          </header>
          <div class="flex flex-col gap-2">
            <SavedCollabVue
              v-for="(save, index) in savedCollabs"
              :save="save"
              :collIndex="index"
              :in-use="currentlyUsedSaved == index"
              @do-save="saveAllCollabs"
              @load-collab="loadCollab"
              @remove-collab="removeCollab"
            />
          </div>
        </div>
      </main>
    </aside>
  </dialog>
</template>