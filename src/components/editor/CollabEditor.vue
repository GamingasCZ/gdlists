<script setup lang="ts">
import { creatorToCollab, makeColor } from '@/Editor';
import chroma from 'chroma-js';
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import type { CollabData, CollabHumans, Level, SavedCollab } from '@/interfaces'
import CollabCreator from './CollabCreator.vue';
import SavedCollabVue from './SavedCollab.vue';
import { SETTINGS, hasLocalStorage } from '@/siteSettings';
import { socialMedia, socialMediaImages, checkAndRemoveDomain } from './socialSites';
import { useI18n } from 'vue-i18n';
import { i18n } from '@/locales';
import Dialog from '../global/Dialog.vue';
import { dialog } from '../ui/sizes';
import SectionDivider from '../ui/SectionDivider.vue';
import Dropdown from '../ui/Dropdown.vue';

const props = defineProps<{
  levelArray: Level[]
  index: number
  clpboard: object

}>()

const emit = defineEmits<{
  (e: "closePopup"): void;
  (e: "sendClipboard", memberClipboard: [number, string, CollabHumans]): void;
}>();

var collab = ref(props.levelArray[props.index!].creator)
var levelColor = props.levelArray?.[props.index]?.color

const colorSex = ref(chroma.hsl(90 + levelColor?.[0] % 360, 0.9, 0.25).hex())
const colorSex2 = ref(chroma.hsl(270 + levelColor?.[0] % 360, 0.6, 0.1).hex())

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

/*
=======
Roles
=======
*/

const roleColors = ref<string[]>([])

function createCollab() {
  addRole(["Host", true])
}

function addRole(preset: [string, boolean] = ["", false]) {
  if (typeof collab.value == 'string') {
    collab.value = creatorToCollab(collab.value)
    props.levelArray[props.index!].creator = collab.value
  }
  if (!collab.value[1].includes(preset[0])) {
    collab.value?.[1].push(preset[0])
    collab.value?.[4].push(preset[1]) // Add to hidden roles
    makeRoleColors()
  }
}

var lastPickedRole = -1
function pickRole(creatorPos: number, rolePos: number) {
  if (typeof collab.value == "string") return

  lastPickedRole = rolePos
  collab.value[creatorPos == 999 ? 0 : 2][creatorPos == 999 ? 0 : creatorPos].role = rolePos
}

/*
=======
Members
=======
*/

function sortCollab(type: 0 | 1 | 2) {
  if (typeof collab.value == 'string') return
  switch (type) {
    case 0: // By part
      collab.value[2] = collab.value[2].sort((a, b) => a.part[0] - b.part[0])
      break;
    case 1: // By name
      collab.value[2] = collab.value[2].sort((a, b) => a.name.localeCompare(b.name))
      break;
    case 2: // By role
      collab.value[2] = collab.value[2].sort((a, b) => a.role - b.role)
      break;
  }
}

function addMember(params?: CollabHumans) {
  pickingRole.value = -1;
  if (typeof collab.value == 'string') return

  let lastMemberPart = collab.value[2][collab.value[2].length - 1]?.part ?? [0, 0]
  collab.value[2].push({
    name: params?.name ?? "",
    socials: params?.socials ?? [],
    color: makeColor(params?.color, true),
    part: params?.part ?? [lastMemberPart[1], Math.min(100, lastMemberPart[1] + 5)],
    role: params?.role ?? (lastPickedRole == -1 ? 0 : lastPickedRole),
    verified: params?.verified ?? 0
  })
  nextTick(() => {
    let inp = document.querySelectorAll(".collabMember > main > form input")
    inp[inp.length-1].focus()
  })
}

function removeMember(position: number) {
  pickingRole.value = -1
  collab.value[2].splice(position, 1)
  socialPicker.open = false
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
  collab.value[2][collab.value[2].length - 1].role = newRoleIndex
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

const removeRole = (pos: number) => {
  (collab.value as CollabData)[1].splice(pos, 1);
  (collab.value as CollabData)[4].splice(pos, 1);
  makeRoleColors()
}

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
  document.body.addEventListener("click", () => socialPicker.dropdownOpen = false, { once: true, capture: true },)
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
        props.levelArray[props.index].levelName || i18n.global.t('collabTools.unnamedCollab'),
    collabHost: collab.value[0][0].name,
    levelID: parseInt(props.levelArray[props.index].levelID || "-1"),
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
  props.levelArray[props.index].creator = saveData.data
  if (saveData.levelID != "-1")
    props.levelArray[props.index].levelID = saveData.levelID.toString()
  collab.value = saveData.data
  currentlyUsedSaved.value = collabIndex
  makeRoleColors()
}

onMounted(() => {
  makeRoleColors()
  if (!localStrg) return

  let saveIDs = JSON.parse(localStorage.getItem("savedCollabIDs")!) ?? [];
  hasSavedCollab.value = saveIDs.indexOf(parseInt(props.levelArray[props.index].levelID))

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

const confirmDeleteOpen = ref(false)
const sortButton = ref<HTMLButtonElement>()

const deleteCollab = () => {
  props.levelArray[props.index].creator = props.levelArray[props.index].creator[0][0].name
  emit('closePopup')
}

const openSaved = () => savedSidebarOpen.value = true
defineExpose({
  openSaved
})

</script>

<template>
      <!-- Saved collabs-->
      <Dialog :open="savedSidebarOpen" @close-popup="savedSidebarOpen = false" :title="$t('navbar.saved')" :width="dialog.small">
          <main
            class="bg-[url(@/images/fade.svg)] bg-repeat-x flex flex-col gap-2 p-2 w-full overflow-y-auto overflow-x-clip h-[46rem]">
            <button v-if="localStrg" class="py-2 m-1 bg-black bg-opacity-40 rounded-md button disabled:opacity-40"
              :disabled="(typeof collab == 'string')" @click="saveCollab()">
            <img src="@/images/symbolicSave.svg" class="inline mr-3 w-6" alt="">
            {{ $t('collabTools.saveCollab') }}
          </button>

            <article v-if="!savedCollabs?.length"
              class="flex flex-col gap-3 justify-center items-center px-6 w-full h-full text-xl text-center opacity-20">
            <img src="@/images/savedMobHeader.svg" class="w-28" alt="">
            {{ $t('collabTools.savedHelp') }}
          </article>

            <!-- Currently editing -->
            <div v-if="currentlyUsedSaved != -1" class="mb-4">
              <SectionDivider :text="$t('collabTools.beingEdited')" />
              <SavedCollabVue :on-saves-page="false" :save="savedCollabs![currentlyUsedSaved]" :coll-index="currentlyUsedSaved"
                :in-use="true" @do-save="saveAllCollabs" @load-collab="loadCollab" @remove-collab="removeCollab" />
            </div>
            
            <!-- All collabs -->
            <div>
              <SectionDivider :text="$t('collabTools.allCollabs')" v-if="savedCollabs?.length" />
              <div class="flex flex-col gap-2">
                  <SavedCollabVue v-for="(save, index) in savedCollabs" :save="save" :collIndex="index"
                    :in-use="currentlyUsedSaved == index" :on-saves-page="false" @do-save="saveAllCollabs"
                    @load-collab="loadCollab" @remove-collab="removeCollab" />
              </div>
            </div>
        </main>
      </Dialog>

      <Dropdown v-if="sortDropdownOpen" @close="sortDropdownOpen = false" @picked-option="sortCollab" :button="sortButton" :options="[$t('collabTools.sortPart'), $t('collabTools.sortName'), $t('collabTools.sortRole')]">
        <template #header>
          <h2 class="text-xl font-bold text-center text-white">{{ $t('collabTools.sortBy') }}</h2>
        </template>
      </Dropdown>

      <!-- Header -->
      <section class="flex items-center mr-2" v-if="(typeof collab != 'string')">
          <CollabCreator class="ml-1 grow" v-bind="collab[0][0]" :pos="999" :level-index="index" :collab-array="collab"
            :role-colors="roleColors" :host="true" v-if="(typeof collab != 'string')"
            @change-role="pickRole(999, $event)" @remove-member="removeMember" @copy-member="copyMember"
            @add-social="addSocial" @remove-social="removeSocial(0, $event)" @remove-role="removeRole" @add-role="addRole" />
        <div v-else class="flex ml-1 grow"></div>
      </section>
      <div v-else></div>

        <header class="flex relative justify-between items-center bg-[url(@/images/headerBG.webp)] bg-center p-2">
            <h2 class="text-2xl font-black">{{ $t('collabTools.members') }}</h2>
            <div class="sm:hidden"></div>
            <div class="flex items-center">
              <button class="box-border p-1.5 mr-2 w-10 h-10 bg-black bg-opacity-40 rounded-md button"
                :class="{ 'disabled': !clipboardContent || !collab?.[2] || collab[2].length >= 100 }"
                      :disabled="!clipboardContent || !collab?.[2] || collab[2].length >= 100"
                :title="$t('collabTools.pasteMemberTitle')" @click="pasteMember">
                        <img src="@/images/paste.svg" alt="">
              </button>
              <button
                ref="sortButton"
                :disabled="typeof collab != 'string' && !collab[2].length"
                class="box-border z-10 p-1.5 disabled:opacity-30 mr-2 w-10 h-10 bg-black bg-opacity-40 rounded-md button focus-visible:!outline focus-visible:!outline-current"
                v-if="(typeof collab != 'string')" :title="$t('collabTools.sortTitle')" @click="sortDropdownOpen = true"
              >
                  <img src="@/images/sort.svg" alt="">
              </button>

          <button :title="$t('collabTools.addMemberTitle')"
            class="box-border p-1.5 w-10 h-10 bg-black bg-opacity-40 rounded-md button focus-visible:outline-4 focus-visible:outline-lof-400 focus-within:bg-lof-300"
            v-if="(typeof collab != 'string')" @click="addMember()" id="addCollabMember"
                  :disabled="typeof collab != 'string' && (noRoles || collab[2].length >= 100)"
            :class="{ 'disabled': typeof collab != 'string' && (noRoles || collab[2].length >= 100) }">
                    <img src="@/images/addLevel.svg" alt="">
                </button>
            </div>
            
            <!-- Socials input box -->
            <Transition name="fade">
              <form
                class="flex absolute bottom-0 left-1/2 z-30 -translate-x-1/2 gap-1 justify-center items-center w-[99%] h-[90%] bg-black bg-opacity-80 rounded-md"
                v-if="socialPicker.open" @submit.prevent="confirmSocial">
                <div class="box-border flex relative items-center p-1 w-[30rem] bg-black bg-opacity-40 rounded-md">
                  <button :title="$t('collabTools.pickSocialTitle')" type="button" @click="openSocialDropdown"
                    class="pr-1 min-w-max align-middle bg-white bg-opacity-10 rounded-md button">
                    <img :src="socialMediaImages[socialMedia[socialPicker.socialIndex].icon]"
                      class="absolute left-2 top-1/2 mx-auto w-4 opacity-40 -translate-y-1/2" alt="">
                    <label for="socInputBox" class="ml-7 text-xs opacity-40 pointer-events-none">{{
                      socialMedia[socialPicker.socialIndex].baseUrl }}</label>
                  </button>
                  <input maxlength="150" :value="socialPickerURL" @input="modifyPickerURL" @paste="modifyPickerURL" type="text"
                    id="socInputBox"
                    class="box-border px-1 ml-1 bg-transparent rounded-sm outline-none grow focus-visible:bg-opacity-5 focus-visible:bg-white"
                    :placeholder="socialMedia[socialPicker.socialIndex].name">
                    
                    <!-- Link buttons -->
                    <div class="flex absolute -left-2 -bottom-11 gap-2 p-2 rounded-md bg-[#020202] z-30"
                      v-if="socialPicker.dropdownOpen">
                            <img src="@/images/popupArr.svg" class="absolute -top-4 left-5 w-4 pointer-events-none" alt="">
                      <button type="button" class="flex justify-center items-center w-10 h-5 rounded-sm button"
                        :style="{ backgroundColor: website.color }" :title="website.name"
                              v-for="website in socialMedia.filter(web => !socialPicker.usedSocials.includes(web.index))"
                        @click="socialPicker.socialIndex = website.index">
                              <img class="w-4 pointer-events-none" :src="socialMediaImages[website.icon]">
                      </button>
                    </div>
                    
                  </div>
                  
  
            <button :title="$t('other.accept')" type="submit" :disabled="socialPickerURL.length < 5"
              class="p-1 bg-black bg-opacity-40 rounded-md focus-within:outline-current button disabled:opacity-50"><img src="@/images/checkThick.svg"
                class="w-6" alt=""></button>
            <button :title="$t('other.cancel')" v-if="socialPicker.editing == -1" type="button"
              class="p-1 bg-black bg-opacity-40 rounded-md focus-within:outline-current button" @click="socialPicker.open = false"><img
                src="@/images/close.svg" class="w-6" alt=""></button>
            <button :title="$t('editor.remove')" v-else type="button" class="p-1 bg-black bg-opacity-40 rounded-md focus-within:outline-current button"
              @click="removeSocial(socialPicker.creatorIndex, socialPicker.socialIndex)"><img src="@/images/trash.svg"
                class="w-6" alt=""></button>
  
              </form>
            </Transition>
            
        </header>

      <main class="bg-[url(@/images/fade.svg)] overflow-y-auto flex flex-col relative bg-repeat-x p-1 gap-1 h-[39rem]">
            
            <!-- No roles help -->
        <div v-if="noMembers" class="flex absolute top-1/2 left-1/2 flex-col gap-3 items-center w-full text-center -translate-x-1/2 -translate-y-1/2">
          <img src="../../images/collabDudes.svg" class="w-[min(20rem,70vw)] opacity-20" alt="">
          <h1 v-if="noRoles" class="text-2xl opacity-60 max-sm:text-lg">{{ $t('collabTools.addRoleToAddMember') }}</h1>
          <div v-else class="text-2xl max-sm:text-lg">
            <h1 class="opacity-60">{{ $t('collabTools.addSomeMembers') }}</h1>
            <div class="flex gap-2 mx-auto mt-2 mb-8 w-max text-base">
              <button class="p-1 bg-black bg-opacity-40 rounded-md button" @click="addMember">
                <img src="../../images/addLevel.svg" alt="" class="box-border inline p-0.5 mr-2 w-8">
                {{ $t('collabTools.addMemberTitle') }}
              </button>
              <button class="p-1 bg-black bg-opacity-40 rounded-md button" @click="deleteCollab">
                <img src="../../images/trash.svg" alt="" class="box-border inline p-0.5 mr-2 w-6">
                {{ $t('collabTools.removeCollab') }}
              </button>
            </div>
          </div>

          <div class="flex gap-2 min-w-max" v-if="noRoles">
            <button class="p-1 bg-black bg-opacity-40 rounded-md button" @click="createCollab" 
              autofocus="true">
              <img src="../../images/plus.svg" alt="" class="box-border inline p-0.5 mr-2 w-8">
              {{ $t('collabTools.addRoles') }}
            </button>
            <button class="p-1 bg-black bg-opacity-40 rounded-md button" @click="savedSidebarOpen = true">
              <img src="../../images/savedMobHeader.svg" alt="" class="box-border inline p-0.5 mr-2 w-8">
              {{ $t('navbar.saved') }}
            </button>
          </div>

          <!-- Load existing saved -->
          <div v-if="hasSavedCollab > -1">
            <hr class="w-96 h-1 bg-white rounded-full border-none opacity-80">
            <h1 class="mt-2 text-xl text-center opacity-60">{{ $t('collabTools.collabExists') }}</h1>
            <button class="flex items-center p-1 mx-auto mt-2 bg-black bg-opacity-40 rounded-md button"
              @click="loadCollab(savedCollabs?.[hasSavedCollab]!, hasSavedCollab)">
              <img src="@/images/checkThick.svg" class="mr-4 w-8" alt="">
              <span class="mr-1">{{ $t('other.use') }}</span>
              <strong><i>{{ savedCollabs?.[hasSavedCollab].collabName }}</i></strong>
            </button>
          </div>
        </div>

            <!-- Collab humans -->
            <div class="flex overflow-y-auto flex-col gap-1 h-full" v-if="(typeof collab != 'string')">
          <CollabCreator v-for="(member, pos) in (collab as CollabData)[2]" :key="member.name" v-bind="member" :pos="pos" :collab-array="collab"
            :level-index="index" :role-colors="roleColors" :host="false" @change-role="pickRole(pos, $event)"
            @remove-member="removeMember" @copy-member="copyMember" @add-social="addSocial"
            @remove-social="removeSocial(pos, $event)" @remove-role="removeRole" @add-role="addRole" />
            </div>
        </main>

</template>
