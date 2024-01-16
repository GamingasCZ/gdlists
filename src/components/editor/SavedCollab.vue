<script setup lang="ts">
import { makeColorFromString, parseElapsed } from '@/Editor';
import type { SavedCollab } from '@/interfaces'
import chroma, { type Color } from 'chroma-js';
import { inject, ref } from 'vue'


const props = defineProps<{
    collIndex?: number;
    save: SavedCollab;
    inUse: boolean;
    onSavesPage: boolean;
}>()

const emit = defineEmits<{
    (e: "doSave"): void,
    (e: "loadCollab", data: SavedCollab, index: number): void,
    (e: "removeCollab", object: SavedCollab): void
    (e: "openCollab", index: SavedCollab)
}>()

const saveColor = ref<Color>(makeColorFromString(props.save.collabName));
const getGradient = () =>
    `linear-gradient(90deg, ${saveColor.value.darken(
        2
    )}, ${saveColor.value.darken()}, ${saveColor.value.brighten()})`;

const editing = ref(false)
const uploadDate = ref(new Date(props.save.timestamp))
const openCollabTools = inject("openCollabTools")


</script>

<template>
    <section
        class="text-white flex px-2 p-1 gap-x-3 gap-y-1 rounded-md border-2 border-solid shadow-drop bg-[length:150vw] bg-center transition-[background-position] duration-200 hover:bg-left"
        :class="{ 'cursor-pointer': onSavesPage, 'flex-col': !onSavesPage }" :style="{
            backgroundImage: getGradient(),
            borderColor: saveColor.darken(2).hex(),
        }"
        @click="onSavesPage ? openCollabTools(save) : ''">
        <section class="flex flex-col gap-1 items-center place-content-center" v-if="onSavesPage">
            <div v-if="save.memberCount" class="flex gap-1 text-xs">
                <img src="../../images/collab.svg" alt="" class="w-4" />{{ save.memberCount }}
            </div>
            <div v-if="save.timestamp" class="flex gap-1 text-xs hover:cursor-help"
                :title="`${uploadDate.toLocaleDateString()} ${uploadDate.toLocaleTimeString()}`">
                <img src="../../images/time.svg" alt="" class="w-4" />{{
                    parseElapsed((Date.now() - save.timestamp)/1000)
                }}
            </div>
        </section>

        <div class="flex flex-col leading-none">
            <div class="flex gap-1 items-center cursor-text group">
                <input autocomplete="off" maxlength="25" type="text" :placeholder="$t('collabTools.collabName')" v-if="!onSavesPage"
                    @focusin="editing = true" @focusout="editing = false" @change="emit('doSave')" v-model="save.collabName"
                    @keyup.enter="($event.target as HTMLInputElement).blur()"
                    class="w-full text-xl font-bold leading-none bg-black bg-opacity-0 rounded-md outline-none disabled:pointer-events-auto focus-within:pl-1 focus-within:py-1 focus-within:bg-opacity-40">
                <h2 v-else class="text-xl font-bold leading-tight">{{ save.collabName }}</h2>
                <img src="@/images/edit.svg" v-show="!editing" v-if="!onSavesPage"
                    class="mr-1 w-4 opacity-0 transition-opacity group-hover:opacity-100" alt="">
            </div>
            <h3 v-if="!onSavesPage" class="text-sm opacity-60">{{ save.collabHost ? save.collabHost : $t('collabTools.noHost') }} + {{
                $t('collabTools.memberCount', save.memberCount) }}</h3>
            <h3 v-else class="text-xs">- {{ save.collabHost || $t('collabTools.noHost') }} -</h3>
        </div>

        <footer class="grid grid-cols-2 gap-1" v-if="!inUse && !onSavesPage">
            <button @click="emit('loadCollab', save, collIndex!)"
                class="flex gap-2 items-center px-2 py-1 bg-black bg-opacity-40 rounded-md button">
                <img class="w-6" alt="" src="@/images/checkThick.svg">{{ $t('other.use') }}
            </button>
            <button @click="emit('removeCollab', collIndex!)"
                class="flex gap-2 items-center px-2 py-1 bg-black bg-opacity-40 rounded-md button">
                <img class="w-6" alt="" src="@/images/trash.svg">{{ $t('other.delete') }}
            </button>
        </footer>

        <div v-if="onSavesPage" class="flex ml-auto">
            <RouterLink :to="`/${save.listID[0]}?goto=${save.listID[1]}`" @click.stop.prevent="" class="box-border p-2 w-10 bg-black bg-opacity-40 rounded-md button" v-if="save.listID">
                <img src="@/images/browseMobHeader.svg" class="w-7" alt="" />
            </RouterLink>
            <button class="box-border p-2 ml-2 w-10 bg-black bg-opacity-40 rounded-md button"
                @click.stop.prevent="emit('removeCollab', save!)">
                <img src="@/images/trash.svg" class="w-7" alt="" />
            </button>
        </div>
    </section>
</template>