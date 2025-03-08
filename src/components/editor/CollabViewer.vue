<script setup lang="ts">
import type { CollabHumans, CollabData } from "@/interfaces";
import chroma from "chroma-js";
import CollabViewerGraph from "./CollabViewerGraph.vue";
import CollabViewerMember from "./CollabViewerMember.vue";
import { hasLocalStorage } from "@/siteSettings";
import { inject, provide, ref } from "vue";
import CollabViewerMemberRow from "./CollabViewerMemberRow.vue";
import { computed } from "vue";

const props = defineProps<{
    levelColor: [number, number, number]
    levelName: string
    collabData: CollabData
    translucent: boolean
    index: number
    levelID: number
    editor?: boolean
}>()

const emit = defineEmits(['customColor'])

const colorLeft = chroma.hsl(props.levelColor?.[0], 0.906, 0.167, props.translucent ? 0.5 : 1).hex()
const colorRight = chroma.hsl(props.levelColor?.[0], 0.231, 0.102, props.translucent ? 0.5 : 1).hex()

const hasLStorage = hasLocalStorage()
const gridView = ref(true)
const saveCollab = inject<(ind: number) => void>("saveCollab")!

const hovering = ref<CollabHumans | null>(null)
provide("collabHovering", hovering)
provide("collabHumanoids", props.collabData[2])

const collabSaved = ref(false)
if (hasLStorage) {
  collabSaved.value = (JSON.parse(localStorage.getItem("savedCollabIDs")!) ?? []).includes(props.levelID)
}

var roleCount = Array(props.collabData[1].length).fill(0)
props.collabData[2].forEach(h => roleCount[h.role] += 1)
const visibleRoles = computed(() => props.collabData[1].filter((_, i) => !props.collabData?.[4]?.[i] ?? true))

emit('customColor', `linear-gradient(9deg, ${colorRight}, ${colorLeft})`)
</script>

<template>
      <button v-if="!editor && levelID != -1 && collabData[3]" class="flex absolute left-1 z-50 gap-3 px-2 py-1 my-1 w-max bg-black bg-opacity-40 rounded-md button disabled:opacity-30" @click="collabSaved = !collabSaved; saveCollab(index)" :disabled="!hasLStorage">
        <img v-if="!collabSaved" src="@/images/savedMobHeader.svg" class="w-6" alt="">
        <img v-else src="@/images/trash.svg" class="w-6" alt="">
        <span class="max-sm:hidden">{{ collabSaved ? $t('collabTools.removeSaved') : $t('other.save') }}</span>
      </button>
      <div v-else></div>
    <!-- Graphs --> 
    <div class="flex overflow-y-auto flex-col gap-1 p-1 min-h-64" v-if="visibleRoles.length">
      <CollabViewerGraph :role-name="typeof role == 'object' ? role.name : role" :humans="collabData[2].sort((a,b) => a.part[0] - b.part[0])" :all-roles="typeof role == 'object' ? collabData[1].map(r => r = r.name) : collabData[1]" v-for="(role, ind) in visibleRoles" />
    </div>

    <!-- Member header -->
    <header class="flex relative items-center justify-between bg-[url(@/images/headerBG.webp)] bg-center p-2">
        <h2 class="text-2xl font-black">{{ $t('collabTools.members') }}</h2>
        <div class="flex gap-2 items-center">
          <button v-if="gridView" @click="gridView = !gridView" class="bg-black bg-opacity-40 rounded-sm max-sm:hidden button"><img src="@/images/viewRows.svg" alt="" class="p-1 w-9"></button>
          <button v-else @click="gridView = !gridView" class="bg-black bg-opacity-40 rounded-sm max-sm:hidden button"><img src="@/images/viewGrid.svg" alt="" class="p-1 w-9"></button>
          <!-- <button class="bg-black bg-opacity-40 rounded-sm button"><img src="@/images/sort.svg" alt="" class="p-1 w-9"></button> -->
        </div>
    </header>
    
    <!-- Members -->
    <div class="w-full bg-[url(@/images/fade.webp)] bg-repeat-x flex flex-wrap max-h-max p-1 gap-1 overflow-y-auto h-96 justify-start content-start">
        <component :is="gridView ? CollabViewerMember : CollabViewerMemberRow" v-for="(member, ind) in collabData[2].toSorted((a,b) => collabData?.[4]?.[a.role] < collabData?.[4]?.[b.role])" :hidden-role="collabData?.[4]?.[member.role]" :index="ind" :role-count="roleCount" :human="member" :role-name="collabData[1][member.role]"/>
    </div>
</template>