<script setup lang="ts">
import { levelList, creatorToCollab, makeColor } from '@/Editor';
import chroma from 'chroma-js';
import { computed, onMounted, ref, watch } from 'vue';
import type { CollabHumans } from '@/interfaces'
import CollabCreator from './CollabCreator.vue';
import { hasLocalStorage } from '@/siteSettings';

const props = defineProps({
    index: {type: Number, required: true}
})

const emit = defineEmits<{
  (e: "closePopup"): void;
}>();

const colorLeft = ref(chroma.hsl(levelList.value.levels?.[props.index]?.color?.[0], 0.906, 0.167).hex())
const colorRight = ref(chroma.hsl(levelList.value.levels?.[props.index]?.color?.[0], 0.231, 0.102).hex())
const colorSex = ref(chroma.hsl(90+levelList.value.levels?.[props.index]?.color?.[0] % 360, 0.9, 0.25).hex())
const colorSex2 = ref(chroma.hsl(270+levelList.value.levels?.[props.index]?.color?.[0] % 360, 0.6, 0.1).hex())

const roleSidebarOpen = ref(false)

const modifyCreator = (e: Event) => {
  let newCreator = (e.target as HTMLInputElement).value
  if (typeof levelList.value.levels[props.index!].creator == 'string')
    levelList.value.levels[props.index!].creator = newCreator
  else
    levelList.value.levels[props.index!].creator[0][0] = newCreator
}

watch(props, () => {
    colorLeft.value = chroma.hsl(levelList.value.levels?.[props.index]?.color?.[0], 0.906, 0.167).hex()
    colorRight.value = chroma.hsl(levelList.value.levels?.[props.index]?.color?.[0], 0.231, 0.102).hex()
})

const roleColors = ref<string[]>([])
function addRole(preset: string = "") {
  let creator = levelList.value.levels[props.index].creator
  if (typeof creator == 'string') levelList.value.levels[props.index].creator = creatorToCollab(creator)

  levelList.value.levels[props.index].creator?.[1].push(preset)
  roleColors.value = chroma.scale([colorSex.value, colorSex2.value]).mode('oklch').colors(levelList.value.levels[props.index].creator[1].length)
}

function pickRole(creatorPos: number, rolePos: number) {
  levelList.value.levels[props.index].creator[2][creatorPos].role = rolePos
  pickingRole.value = -1
}

function addMember(params?: CollabHumans) {
  (levelList.value.levels[props.index].creator[2] as CollabHumans[]).push({
    name: params?.name ?? "",
    socials: params?.socials ?? [],
    color: params?.color ?? makeColor(),
    part: params?.part ?? [0, 0],
    role: params?.role ?? 0,
    verified: params?.verified ?? 0
  })
}

const noMembers = computed(() => 
  levelList.value.levels[props.index!].creator?.[2] == undefined || levelList.value.levels[props.index!].creator?.[2].length == 0)
const localStrg = hasLocalStorage()
const pickingRole = ref(-1)

onMounted(() => {
  if (!noMembers && typeof levelList.value.levels[props.index].creator[1][0] == 'object') {
    let i = 0;
    levelList.value.levels[props.index].creator[1].foreach((roleObj: object) => {
      levelList.value.levels[props.index].creator[1][i] = roleObj.name
      i += 1
    })
  }
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
        <h1 class="text-xl font-bold text-center">Editor collabu</h1>
        <img
          src="@/images/close.svg"
          alt=""
          class="w-6 button"
          @click="emit('closePopup')"
        />
      </div>

      <header class="flex gap-2 justify-between items-center mx-2 mt-2">
        <div class="flex gap-2">
          <img src="@/images/unknownCube.svg" class="w-10" alt="">
          <input value="Host" type="text" class="px-3 -mr-1 w-24 h-10 text-right bg-black bg-opacity-40 rounded-md" placeholder="Role hosta">: 
          <input type="text" @change="modifyCreator" :value="typeof levelList.levels[index!].creator == 'object' ? levelList.levels[index!].creator[0][0] : levelList.levels[index!].creator" class="px-3 h-10 bg-black bg-opacity-40 rounded-md max-sm:w-32" placeholder="Jméno hosta">
          <button class="box-border bg-black bg-opacity-40 rounded-md button">
              <img src="@/images/searchOpaque.svg" class="p-2 w-10" alt="">
          </button>
        </div>
        <button v-if="!noMembers" class="p-1 bg-black bg-opacity-40 rounded-md button" @click="roleSidebarOpen = !roleSidebarOpen">
          <img src="../../images/plus.svg" alt="" class="box-border inline p-0.5 mr-2 w-8">
          Přidat role
        </button>
      </header>

      <main>
        <header class="flex relative justify-between items-center bg-[url(@/images/headerBG.webp)] bg-center p-2 mt-3">
            <h2 class="text-2xl font-black max-sm:hidden">Členové</h2>
            <div class="sm:hidden"></div>
            <div class="flex items-center">
                <button class="box-border p-1.5 mr-2 w-10 h-10 bg-black bg-opacity-40 rounded-md button">
                    <img src="@/images/paste.svg" alt="">
                </button>
                <button class="box-border p-1.5 w-10 h-10 bg-black bg-opacity-40 rounded-md button" @click="addMember()">
                    <img src="@/images/addLevel.svg" alt="">
                </button>
            </div>
            
            <!-- Socials input box -->
            <section class="absolute flex items-center left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <button class="rounded-md bg-cyan-400 button"><img class="w-10" src="@/images/twitterIcon.svg"></button>
                <input type="text" class="bg-black rounded-md bg-opacity-40">
            </section>
            
        </header>

        <section class="bg-[url(@/images/fade.webp)] overflow-y-auto flex flex-col bg-repeat-x p-1 h-[30rem] overflow-y-auto gap-1">
            
            <!-- No roles help -->
            <div v-if="noMembers" class="flex flex-col gap-3 items-center my-auto">
              <img src="../../images/collabDudes.svg" class="w-[20rem] opacity-10" alt="">
              <h1 class="text-2xl opacity-60">K přidání členů, přidej nějaké role.</h1>
              <button class="p-1 bg-black bg-opacity-40 rounded-md button" @click="roleSidebarOpen = !roleSidebarOpen">
                <img src="../../images/plus.svg" alt="" class="box-border inline p-0.5 mr-2 w-8">
                Přidat role
              </button>
            </div>

            <!-- Collab humans -->
            <CollabCreator
              v-for="(member, pos) in levelList.levels[index].creator?.[2]"
              v-bind="member"
              :pos="pos"
              :level-index="index"
              :role-color="roleColors[member.role]"
              @change-role="pickingRole = $event"
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
        <img
          src="@/images/hideSidebar.svg"
          alt=""
          class="w-6 button"
          @click="roleSidebarOpen = false"
        />
        <h1 class="text-xl font-black text-center">Role</h1>
        <img
          src="@/images/addLevel.svg"
          alt=""
          class="box-border p-1 w-8 bg-black bg-opacity-40 rounded-md button"
          @click="addRole()"
          v-if="pickingRole == -1"
        />
        <div v-else></div>
      </header>
      <main class="bg-[url(@/images/fade.webp)] bg-repeat-x flex flex-col gap-2 p-2 overflow-y-auto overflow-x-clip" :class="{'h-[21rem]': pickingRole == -1, 'h-[37rem]': pickingRole > -1}">
        <button @click="pickRole(pickingRole, pos)" v-for="(role, pos) in levelList.levels[index].creator?.[1]" class="flex p-1 h-9 text-white rounded-md transition-colors items-middle shadow-drop h-max" :style="{backgroundColor: roleColors[pos]}" :class="{'button': pickingRole > -1}">
          <input :disabled="pickingRole > -1" :class="{'pointer-events-none': pickingRole > -1}" type="text" v-model="levelList.levels[index].creator[1][pos]" placeholder="Jméno role" class="px-1 mr-2 bg-transparent rounded-sm border-opacity-40 border-solid transition-colors outline-none focus:bg-opacity-40 border-b-black focus:bg-black grow">
          <div class="flex gap-1" v-if="pickingRole == -1">
            <button class="box-border p-1 w-7 bg-black bg-opacity-40 rounded-sm button" @click="levelList.levels[index].creator?.[1].splice(pos, 1)"><img src="@/images/trash.svg" alt=""></button>
          </div>
        </button>
      </main>

      <section v-if="localStrg && pickingRole == -1">
        <!-- Recently used header -->
        <header class="flex justify-between items-center bg-[url(@/images/headerBG.webp)] bg-top p-1 mt-3">
          <h2 class="w-full text-xl font-black text-center max-sm:hidden">Naposledy použité</h2>
        </header>
  
        <!-- Recently used content -->
        <main class="h-52 bg-[url(@/images/fade.webp)] bg-repeat-x overflow-y-auto">
  
          <!-- History empty help -->
          <article class="flex flex-col gap-4 justify-center items-center h-full opacity-20">
            <img src="@/images/time.svg" class="w-28" alt="">
            <h2 class="w-52 text-lg leading-tight text-center">Tady se objeví tvé naposledy vytvořené role!</h2>
          </article>
  
        </main>
      </section>
    </aside>
  </dialog>
</template>
