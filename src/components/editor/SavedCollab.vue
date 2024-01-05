<script setup lang="ts">
import type { SavedCollab } from '@/interfaces'
import { ref } from 'vue'


defineProps<{
    collIndex: number
    save: SavedCollab
    inUse: boolean
}>()

const emit = defineEmits<{
    (e: "doSave"): void,
    (e: "loadCollab", data: SavedCollab, index: number): void,
    (e: "removeCollab", index: number): void
}>()

const editing = ref(false)

</script>

<template>
<section
    class="p-1 rounded-md bg-greenGradient shadow-drop"
>
    <div
    class="flex gap-1 items-center cursor-text group"
    >
    <input
        autocomplete="off" maxlength="25" type="text" :placeholder="$t('collabTools.collabName')"
        @focusin="editing = true" @focusout="editing = false"
        @change="emit('doSave')"
        v-model="save.collabName"
        @keyup.enter="($event.target as HTMLInputElement).blur()"
        class="w-full text-xl font-bold leading-none bg-black bg-opacity-0 rounded-md outline-none focus-within:pl-1 focus-within:py-1 focus-within:bg-opacity-40">
    <img src="@/images/edit.svg" v-show="!editing" class="mr-1 w-4 opacity-0 transition-opacity group-hover:opacity-100" alt="">
    </div>
    <h3 class="mb-2 text-sm opacity-60">{{ save.collabHost ? save.collabHost : $t('collabTools.noHost') }} + {{ $t('collabTools.memberCount', save.memberCount) }}</h3>

    <footer class="grid grid-cols-2 gap-1" v-if="!inUse">
        <button @click="emit('loadCollab', save, collIndex)" class="flex gap-2 items-center px-2 py-1 bg-black bg-opacity-40 rounded-md button">
            <img class="w-6" alt="" src="@/images/checkThick.svg">{{ $t('other.use') }}
        </button>
        <button @click="emit('removeCollab', collIndex)" class="flex gap-2 items-center px-2 py-1 bg-black bg-opacity-40 rounded-md button">
            <img class="w-6" alt="" src="@/images/trash.svg">{{ $t('other.delete') }}
        </button>
    </footer>
</section>
</template>