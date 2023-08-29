<script setup lang="ts">
import { levelList, creatorToCollab, makeColor } from '@/Editor';
import chroma from 'chroma-js';
import { computed, onMounted, onUnmounted, onUpdated, reactive, ref, watch } from 'vue';
import type { CollabData, CollabHumans } from '@/interfaces'
import CollabCreator from './CollabCreator.vue';
import { hasLocalStorage } from '@/siteSettings';
import { socialMedia, socialMediaImages, checkAndRemoveDomain } from './socialSites';

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
  "Editor collabu",
  "Editor megacollabu",
  "Editor gigacollabu",
  "ježíšku na křížku",
  "Správa planety"
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

const roleColors = ref<string[]>([])
const roleSidebarOpen = ref(false)

function addRole(preset: string = "") {
  if (typeof collab.value == 'string') {
    collab.value = creatorToCollab(collab.value)
    levelList.value.levels[props.index!].creator = collab.value
  }

  collab.value?.[1].push(preset)
  makeRoleColors()
}

function pickRole(creatorPos: number, rolePos: number) {
  if (typeof collab.value == "string") return

  collab.value[2][creatorPos].role = rolePos
  pickingRole.value = -1
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

/*
=======
Members
=======
*/

const modifyCreator = (e: Event) => {
  let newCreator = (e.target as HTMLInputElement).value
  if (typeof collab.value == 'string')
    collab.value = newCreator
  else
    collab.value[0][0] = newCreator
}

function addMember(params?: CollabHumans) {
  pickingRole.value = -1;
  (collab.value[2] as CollabHumans[]).push({
    name: params?.name ?? "",
    socials: params?.socials ?? [],
    color: makeColor(params?.color),
    part: params?.part ?? [0, 0],
    role: params?.role ?? 0,
    verified: params?.verified ?? 0
  })
  makeFunyEditorName()
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
  collab.value?.[2] == undefined || !collab.value?.[2].length)
const noRoles = computed(() => 
  collab.value?.[1] == undefined || !collab.value?.[1].length)
const oneRoleAndHasMembers = computed(() =>
  collab.value?.[1].length == 1 && collab.value?.[2].length > 0
) 

const localStrg = hasLocalStorage()
const pickingRole = ref(-1)
const clipboardContent = ref<[number, string, CollabHumans]>(props.clipboard)
const sortDropdownOpen = ref(false)

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
const modifyPickerURL = (e: Event) => {
  if ([3, 4].includes(socialPicker.socialIndex)) // do not shorten discord and custom link
    socialPickerURL.value = (e.target as HTMLInputElement).value
  else
    socialPickerURL.value = checkAndRemoveDomain((e.target as HTMLInputElement).value)
}

function addSocial(editing: boolean, creatorIndex: number, editPos?: number) {
  if (typeof collab.value == "string") return
  if (collab.value[2].length >= 100) return

  socialPicker.open = true
  socialPicker.creatorIndex = creatorIndex
  socialPickerURL.value = ""
  socialPicker.editing = -1

  let usedSocials: number[] = []
  collab.value[2][socialPicker.creatorIndex].socials.forEach(web => usedSocials.push(web[0]))
  socialPicker.usedSocials = usedSocials
  
  if (editing) {
    socialPicker.socialIndex = collab.value[2][creatorIndex].socials[editPos!][0]
    socialPickerURL.value = checkAndRemoveDomain(collab.value[2][creatorIndex].socials[editPos!][1])
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

  if (socialPicker.editing > -1)
    collab.value[2][socialPicker.creatorIndex].socials[socialPicker.editing] = [socialPicker.socialIndex, socialPickerURL.value]
  else
    collab.value[2][socialPicker.creatorIndex].socials.push([socialPicker.socialIndex, socialPickerURL.value])
    
  socialPicker.editing = -1
  socialPicker.open = false
  socialPickerURL.value = ""
  socialPicker.dropdownOpen = false
}
const removeSocial = (creatorIndex: number, socialIndex: number) => {
  (collab.value as CollabData)[2][creatorIndex].socials.splice(socialIndex, 1);
  socialPicker.open = false;
}

onMounted(() => {

  makeRoleColors()

  // Convert old role format to the new one
  if (!noMembers && typeof collab.value[1][0] == 'object') {
    if (typeof collab.value != "string") return

    let i = 0;
    collab.value[1].forEach(roleObj => {
      (collab.value as CollabData)[1][i] = roleObj.name
      i += 1
    })
  }
})

onUnmounted(() => {
  if (typeof collab.value == "string") return
  if (!hasLocalStorage()) return

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
    @click="emit('closePopup')"
    tabindex="0"
    @keyup.esc="emit('closePopup')"
    class="flex gap-2 justify-center items-center"
  >
    <section
      @click.stop=""
      :style="{background: `linear-gradient(9deg, ${colorRight}, ${colorLeft})`}"
      class=" w-[60rem] max-h-[95svh] max-w-[95vw] rounded-lg py-2 text-white shadow-lg shadow-black h-[40rem]"
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

      <header class="flex gap-2 justify-between items-center mx-2 mt-2">
        
        <!-- Host input box -->
        <div class="flex gap-2 items-center">
          <img src="@/images/unknownCube.svg" class="w-11" alt="">
          <input value="Host" type="text" class="px-3 -mr-1 w-24 h-11 text-right bg-black bg-opacity-40 rounded-md" placeholder="Role hosta">: 
          <div class="flex flex-col gap-1">
              <input type="text" maxlength="15" class="px-1 w-44 bg-black bg-opacity-40 rounded-sm" v-model="(levelList.levels[index].creator as CollabData)[2][0].name" placeholder="Jméno člena">
              <section class="flex gap-1" v-if="(typeof collab != 'string')">
                  <button
                      class="w-8 rounded-sm button" :style="{backgroundColor: socialMedia[site[0]].color}"
                      v-for="(site, index) in collab?.[2]?.[0]?.socials"
                  >
                      <img :src="socialMediaImages[socialMedia[site[0]].icon]" class="box-border p-0.5 mx-auto h-4" alt="">
                  </button>
                  <button class="w-8 bg-gray-600 rounded-sm button" v-if="'pp'.length < 5">
                      <img src="../../images/plus.svg" class="box-border p-0.5 mx-auto h-4" alt="">
                  </button>
              </section>
          </div>
          <button class="box-border bg-black bg-opacity-40 rounded-md button">
              <img src="@/images/searchOpaque.svg" class="box-border p-1 w-8" alt="">
          </button>
        </div>

        <button v-if="!roleSidebarOpen" class="p-1 bg-black bg-opacity-40 rounded-md button" @click="roleSidebarOpen = !roleSidebarOpen">
          <img src="../../images/plus.svg" alt="" class="box-border inline p-0.5 mr-2 w-8">
          Upravit role
        </button>
      </header>

      <main>
        <header class="flex relative justify-between items-center bg-[url(@/images/headerBG.webp)] bg-center p-2 mt-3">
            <h2 class="text-2xl font-black">Členové</h2>
            <div class="sm:hidden"></div>
            <div class="flex items-center">
                <button
                  class="box-border p-1.5 mr-2 w-10 h-10 bg-black bg-opacity-40 rounded-md button"
                  :class="{'disabled': typeof collab != 'string' && (clipboardContent == undefined || collab[2].length >= 100)}"
                  :disabled="typeof collab != 'string' && (clipboardContent == undefined || collab[2].length >= 100)"
                  @click="pasteMember"
                >
                    <img src="@/images/paste.svg" alt="">
                </button>
                <button
                  class="box-border relative z-10 p-1.5 mr-2 w-10 h-10 bg-black bg-opacity-40 rounded-md button"
                  :class="{'disabled': (typeof collab == 'string')}"
                  :disabled="(typeof collab == 'string')"
                  @click="sortDropdownOpen = !sortDropdownOpen"
                >
                    <img src="@/images/sort.svg" alt="">
                    <Transition name="fade">
                      <div v-if="sortDropdownOpen" class="flex absolute -bottom-40 -left-1/2 flex-col gap-1 p-1 w-40 text-center bg-black bg-opacity-90 rounded-md backdrop-blur-sm -translate-x-11">
                        <img src="@/images/popupArr.svg" class="absolute -top-5 left-1/2 w-5 opacity-90 -translate-x-1.5" alt="">
                        <h2 class="font-bold">Seřadit podle</h2>
                        <button v-for="sort in ['Začátku části', 'Jména', 'Role']" class="block p-1 w-full text-white bg-white bg-opacity-10 rounded-md button">{{ sort }}</button>
                      </div>
                    </Transition>
                </button>
                <button
                  class="box-border p-1.5 mr-2 w-10 h-10 bg-black bg-opacity-40 rounded-md button"
                  @click="pasteMember"
                >
                    <img src="@/images/addfromFaves.svg" alt="">
                </button>
                <button class="box-border p-1.5 w-10 h-10 bg-black bg-opacity-40 rounded-md button"
                  @click="addMember()"
                  :disabled="typeof collab != 'string' && (noRoles || collab[2].length >= 100)"
                  :class="{'disabled': typeof collab != 'string' && (noRoles || collab[2].length >= 100)}"
                >
                    <img src="@/images/addLevel.svg" alt="">
                </button>
            </div>
            
            <!-- Socials input box -->
            <Transition name="fade">
              <form
                class="flex absolute bottom-0 left-1/2 -translate-x-1/2 gap-1 justify-center items-center w-[99%] h-[90%] bg-white bg-opacity-10 rounded-md backdrop-blur-sm shadow-drop"
                v-if="socialPicker.open"
                @submit.prevent="confirmSocial"  
              >
                  <div class="box-border flex relative items-center p-1 w-[30rem] max-w-[70vw] bg-black bg-opacity-40 rounded-md">
                    <button type="button" @click="openSocialDropdown" class="pr-1 align-middle bg-white bg-opacity-10 rounded-md button">
                      <img :src="socialMediaImages[socialMedia[socialPicker.socialIndex].icon]" class="absolute left-2 top-1/2 mx-auto w-4 opacity-40 -translate-y-1/2" alt="">
                      <label for="socInputBox" class="ml-7 text-xs opacity-40 pointer-events-none">{{ socialMedia[socialPicker.socialIndex].baseUrl }}</label>
                    </button>
                    <input maxlength="100" :value="socialPickerURL" @change="modifyPickerURL" @paste="modifyPickerURL" type="text" id="socInputBox" class="box-border px-1 ml-1 w-full bg-transparent rounded-sm outline-none focus-visible:bg-opacity-5 focus-visible:bg-white" :placeholder="socialMedia[socialPicker.socialIndex].name">
                    
                    <!-- Link buttons -->
                    <div class="flex absolute -left-2 -bottom-11 gap-2 p-2 rounded-md bg-[#020202]" v-if="socialPicker.dropdownOpen">
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
                  
  
                <button type="submit" class="p-1 bg-black bg-opacity-40 rounded-md button"><img src="@/images/checkThick.svg" class="w-6" alt=""></button>
                <button v-if="socialPicker.editing == -1" type="button" class="p-1 bg-black bg-opacity-40 rounded-md button"><img src="@/images/close.svg" class="w-6" alt="" @click="socialPicker.open = false"></button>
                <button v-else type="button" class="p-1 bg-black bg-opacity-40 rounded-md button"><img src="@/images/trash.svg" class="w-6" alt="" @click="removeSocial(socialPicker.creatorIndex, socialPicker.socialIndex)"></button>
  
              </form>
            </Transition>
            
        </header>

        <section class="bg-[url(@/images/fade.webp)] overflow-y-auto flex flex-col bg-repeat-x p-1 h-[30rem] gap-1">
            
            <!-- No roles help -->
            <div v-if="noMembers" class="flex flex-col gap-3 items-center my-auto">
              <img src="../../images/collabDudes.svg" class="w-[20rem] opacity-20" alt="">
              <h1 v-if="noRoles" class="text-2xl opacity-60 max-sm:text-lg">K přidání členů, přidej nějaké role.</h1>
              <h1 v-else class="text-2xl opacity-60 max-sm:text-lg">Zatím jsi nepřidal žádné členy.</h1>
              <button class="p-1 bg-black bg-opacity-40 rounded-md button" @click="roleSidebarOpen = !roleSidebarOpen" v-if="noRoles">
                <img src="../../images/plus.svg" alt="" class="box-border inline p-0.5 mr-2 w-8">
                Přidat role
              </button>
            </div>

            <!-- Collab humans -->
            <CollabCreator
              v-for="(member, pos) in (collab as CollabData)[2]"
              v-bind="member"
              :pos="pos"
              :level-index="index"
              :role-color="roleColors[member.role]"
              :host="false"
              @change-role="pickingRole = $event"
              @remove-member="removeMember"
              @copy-member="copyMember"
              @add-social="addSocial"
              @remove-social="removeSocial(pos, $event)"
            />
        </section>

      </main>
    </section>

    <aside
      @click.stop=""
      :style="{background: `linear-gradient(9deg, ${colorRight}, ${colorLeft})`}"
      class=" w-[20rem] max-h-[95svh] max-w-[95vw] rounded-lg text-white shadow-lg shadow-black"
      v-if="roleSidebarOpen || pickingRole > -1"
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
        <h1 class="text-xl font-black text-center">Role</h1>
        <button class="bg-black bg-opacity-40 rounded-md button disabled:opacity-40" :disabled="pickingRole > -1" @click="addRole()">
          <img
            src="@/images/addLevel.svg"
            alt=""
            class="box-border p-1 w-8"
          />
        </button>
      </header>
      <main class="bg-[url(@/images/fade.webp)] bg-repeat-x flex flex-col gap-2 p-2 overflow-y-auto overflow-x-clip" :class="{'h-[21rem]': pickingRole == -1, 'h-[37rem]': pickingRole > -1}">
        
        <!-- Presets and role help -->
        <article class="flex flex-col gap-2 justify-center items-center my-auto w-full" v-if="noRoles">
          <p class="text-3xl opacity-40">Návrhy</p>
          <hr class="mb-3 w-9/12 h-0.5 bg-white border-none opacity-10">
          <button
            v-for="preset in ['Layout', 'Dekorace', 'Testování', 'Optimalizace']"
            @click="addRole(preset)"
            class="w-3/5 text-xl text-white text-opacity-40 bg-black bg-opacity-40 rounded-md button"
          >
            {{ preset }}
          </button>
        </article>

        <!-- Role bubble -->
        <button @click="pickRole(pickingRole, pos)" v-for="(role, pos) in collab[1]" class="flex p-1 h-9 text-white rounded-md transition-colors items-middle shadow-drop" :style="{backgroundColor: roleColors[pos]}" :class="{'button': pickingRole > -1}">
          <input :disabled="pickingRole > -1" :class="{'pointer-events-none': pickingRole > -1}" type="text" v-model="levelList.levels[index].creator[1][pos]" placeholder="Jméno role" class="px-1 mr-2 bg-transparent rounded-sm border-opacity-40 border-solid transition-colors outline-none focus:bg-opacity-40 border-b-black focus:bg-black grow">
          <div class="flex gap-1">
            <button :disabled="pickingRole > -1 || oneRoleAndHasMembers" class="box-border p-1 w-7 bg-black bg-opacity-40 rounded-sm disabled:opacity-40 button" @click="(collab as CollabData)[1].splice(pos, 1); makeRoleColors()"><img src="@/images/trash.svg" alt=""></button>
          </div>
        </button>
      </main>

      <section v-if="localStrg && pickingRole == -1">
        <!-- Recently used header -->
        <header class="flex justify-between items-center bg-[url(@/images/headerBG.webp)] bg-top p-1 mt-3">
          <h2 class="w-full text-xl font-black text-center max-sm:hidden">Naposledy použité</h2>
        </header>
  
        <!-- Recently used content -->
        <main class="h-52 overflow-x-clip bg-[url(@/images/fade.webp)] bg-repeat-x overflow-y-auto flex flex-col gap-2 py-2">
  
          <!-- History empty help -->
          <article class="flex flex-col gap-4 justify-center items-center h-full opacity-20" v-if="!allLastUsedRoles.length">
            <img src="@/images/time.svg" class="w-28" alt="">
            <h2 class="w-52 text-lg leading-tight text-center">Tady se objeví tvé naposledy vytvořené role!</h2>
          </article>

          <button class="flex gap-1 items-center px-1 py-0.5 mx-1 text-left rounded-md shadow-drop" :style="{backgroundColor: colorLeft}" v-for="role in allLastUsedRoles">
            <span class="ml-1 w-full">{{ role }}</span>
            <button class="bg-black bg-opacity-40 rounded-sm button"><img src="@/images/pin.svg" alt="" class="box-border p-1 w-7" :class="{'opacity-30': !pinnedLastUsedRoles?.includes(role)}" @click="pinRole(role)"></button>
            <button class="bg-black bg-opacity-40 rounded-sm button"><img src="@/images/trash.svg" alt="" class="box-border p-1 w-7" @click="removeLastUsedRole(role)"></button>
          </button>
  
        </main>
      </section>
    </aside>
  </dialog>
</template>