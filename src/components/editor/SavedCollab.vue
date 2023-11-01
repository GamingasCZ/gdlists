<script setup lang="ts">
import type { CollabData, SavedCollab } from '@/interfaces'
import { reactive } from 'vue'


defineProps<{
    collIndex: number
    save: SavedCollab
}>()

const emit = defineEmits<{
    (e: "changeName", event: SubmitEvent, index: number): void,
    (e: "loadCollab", data: CollabData, index: number): void,
    (e: "removeCollab", index: number): void
}>()

const savedNameEdit = reactive({
  editing: false,
  editingIndex: -1,
  previousName: ""
})

</script>

<template>
<section
    class="p-1 rounded-md bg-greenGradient shadow-drop"
>
    <form
    class="flex gap-1 items-center cursor-text group"
    action="/"
    @submit.prevent="emit('changeName', $event, collIndex)"
    >
    <input
        autocomplete="off" maxlength="25" type="text" placeholder="Jméno collabu"
        @blur="savedNameEdit.editing = false; save.collabName = savedNameEdit.previousName"
        @focus="savedNameEdit.editingIndex = collIndex; savedNameEdit.previousName = save.collabName; savedNameEdit.editing = true"
        @keyup.capture.enter="emit('changeName', $event, collIndex)"
        :value="save.collabName"
        class="text-xl font-bold leading-none bg-black bg-opacity-0 rounded-md outline-none focus-within:pl-1 focus-within:py-1 focus-within:bg-opacity-40">
    <button type="submit" v-if="savedNameEdit.editing && savedNameEdit.editingIndex == collIndex" class="box-border p-1 h-8 bg-black bg-opacity-40 rounded-md aspect-square button">
        <img src="@/images/checkThick.svg" alt="">
    </button>
    <img src="@/images/edit.svg" v-else class="w-3 opacity-0 transition-opacity group-hover:opacity-100" alt="">
    </form>
    <h3 class="mb-2 text-sm opacity-60">{{ save.collabHost }} + {{ save.memberCount }} členů</h3>

    <footer class="grid grid-cols-2 gap-1">
    <button @click="emit('loadCollab', save.data, collIndex)" class="flex gap-2 items-center px-2 py-1 bg-black bg-opacity-40 rounded-md button">
        <img class="w-6" alt="" src="@/images/checkThick.svg">Použít
    </button>
    <button @click="emit('removeCollab', collIndex)" class="flex gap-2 items-center px-2 py-1 bg-black bg-opacity-40 rounded-md button">
        <img class="w-6" alt="" src="@/images/trash.svg">Smazat
    </button>
    </footer>
</section>
</template>