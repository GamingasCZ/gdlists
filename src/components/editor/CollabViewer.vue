<script setup lang="ts">
import type { CollabData } from "@/interfaces";
import chroma from "chroma-js";
import CollabViewerGraph from "./CollabViewerGraph.vue";
import CollabViewerMember from "./CollabViewerMember.vue";
import { hasLocalStorage } from "@/siteSettings";
import { ref } from "vue";
import CollabViewerMemberRow from "./CollabViewerMemberRow.vue";

const props = defineProps<{
    levelColor: [number, number, number]
    levelName: string
    collabData: CollabData
    translucent: boolean
}>()

const emit = defineEmits(['closePopup'])

const colorLeft = chroma.hsl(props.levelColor?.[0], 0.906, 0.167, props.translucent ? 0.5 : 1).hex()
const colorRight = chroma.hsl(props.levelColor?.[0], 0.231, 0.102, props.translucent ? 0.5 : 1).hex()

const hasLStorage = hasLocalStorage()
const gridView = ref(true)
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
      :class="{'backdrop-blur-sm': translucent}"
      class=" w-[60rem] max-h-[95svh] max-w-[95vw] rounded-lg pt-1 grid grid-rows-[repeat(3,max-content)] text-white shadow-lg shadow-black h-[50rem]"
    >
     <div class="flex relative justify-between items-center mx-1.5 mt-0.5 mb-1 -translate-y-0.5">
        <button class="flex gap-3 px-2 py-1 bg-black bg-opacity-40 rounded-md button disabled:opacity-30" :disabled="!hasLStorage">
          <img src="@/images/savedMobHeader.svg" class="w-6" alt="">
          <span class="max-sm:hidden">{{ $t('other.save') }}</span>
        </button>
        <h1 class="text-2xl font-extrabold text-center">{{ levelName }}</h1>
        <img
          src="@/images/close.svg"
          alt=""
          class="w-6 button"
          @click="emit('closePopup')"
        />
      </div>
      <!-- Graphs --> 
      <div class="flex overflow-y-auto flex-col gap-1 p-1 h-[min(30vh,15rem)]">
        <CollabViewerGraph :role-name="typeof role == 'object' ? role.name : role" :humans="collabData[2].sort((a,b) => a.part[0] - b.part[0])" v-for="role in collabData[1]" />
      </div>

      <!-- Member header -->
      <header class="flex relative items-center justify-between bg-[url(@/images/headerBG.webp)] bg-center p-2">
          <h2 class="text-2xl font-black">{{ $t('collabTools.members') }}</h2>
          <div class="flex gap-2 items-center">
            <button v-if="gridView" @click="gridView = !gridView" class="bg-black bg-opacity-40 rounded-sm button"><img src="@/images/viewRows.svg" alt="" class="p-1 w-9"></button>
            <button v-else @click="gridView = !gridView" class="bg-black bg-opacity-40 rounded-sm button"><img src="@/images/viewGrid.svg" alt="" class="p-1 w-9"></button>
            <button class="bg-black bg-opacity-40 rounded-sm button"><img src="@/images/sort.svg" alt="" class="p-1 w-9"></button>
          </div>
      </header>
      
      <!-- Members -->
      <div class="w-full bg-[url(@/images/fade.webp)] bg-repeat-x flex flex-wrap max-h-max p-1 gap-1 overflow-y-auto h-auto justify-start content-start">
          <component :is="gridView ? CollabViewerMember : CollabViewerMemberRow" v-for="member in collabData[2]" :name="member.name" :part="member.part" :socials="member.socials" :icon="member.verified" :role-name="collabData[1][member.role]"/>
      </div>
    </section>
  </dialog>
</template>