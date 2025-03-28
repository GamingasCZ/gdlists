<script setup lang="ts">

defineProps<{
    listPinned: boolean
}>()

const emit = defineEmits<{
    (e: "closePopup"): void,
    (e: "doListAction", action: "sharePopup" | "jumpPopup" | "pinList" | "editList" | "comments" | "mobileExtras"): string;
}>();

const canEdit = document.querySelector("#postEditButton")

</script>

<template>
    <div class="grid grid-cols-2 gap-2 p-2">
        <button class="flex gap-2 items-center p-1 bg-black bg-opacity-40 rounded-md button"
            @click="emit('closePopup'); emit('doListAction', 'sharePopup')">
            <img class="m-1 w-6" src="../../images/share.svg" alt="">{{ $t('other.share') }}
        </button>
        <button class="flex gap-2 items-center p-1 bg-black bg-opacity-40 rounded-md button"
            @click="emit('closePopup'); emit('doListAction', 'jumpPopup')">
            <img class="m-1 w-6" src="../../images/jumpto.svg" alt="">{{ $t('listViewer.jumpTo') }}
        </button>
        <button class="flex gap-2 items-center p-1 bg-black bg-opacity-40 rounded-md button"
            @click="emit('closePopup'); emit('doListAction', 'pinList')">
            <img class="m-1 w-6" src="../../images/pin.svg" alt="" v-if="listPinned">
            <img class="m-1 w-6" src="../../images/unpin.svg" alt="" v-else>
            {{ listPinned ? $t('level.pin') : $t('level.unpin') }}
        </button>
        <button class="flex gap-2 items-center p-1 bg-black bg-opacity-40 rounded-md button"
            v-if="canEdit"
            @click="emit('closePopup'); emit('doListAction', 'editList')">
            <img class="m-1 w-6" src="../../images/edit.svg" alt="">{{ $t('level.edit') }}
        </button>
    </div>
</template>