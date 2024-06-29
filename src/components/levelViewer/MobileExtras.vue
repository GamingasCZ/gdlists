<script setup lang="ts">

defineProps<{
    listPinned: boolean
}>()

const emit = defineEmits<{
    (e: "closePopup"): void,
    (e: "doListAction", action: "sharePopup" | "jumpPopup" | "pinList" | "editList" | "comments" | "mobileExtras"): string;
}>();

</script>

<template>
    <div class="flex flex-col gap-2 p-2">
        <button class="flex gap-2 items-center p-1 bg-white bg-opacity-10 rounded-md button"
            @click="emit('closePopup'); emit('doListAction', 'sharePopup')">
            <img class="w-8" src="../../images/share.svg" alt="">{{ $t('other.share') }}
        </button>
        <button class="flex gap-2 items-center p-1 bg-white bg-opacity-10 rounded-md button"
            @click="emit('closePopup'); emit('doListAction', 'jumpPopup')">
            <img class="w-8" src="../../images/jumpto.svg" alt="">{{ $t('listViewer.jumpTo') }}
        </button>
        <button class="flex gap-2 items-center p-1 bg-white bg-opacity-10 rounded-md button"
            @click="emit('closePopup'); emit('doListAction', 'pinList')">
            <img class="w-8" src="../../images/pin.svg" alt="" v-if="listPinned">
            <img class="w-8" src="../../images/unpin.svg" alt="" v-else>
            {{ listPinned ? $t('level.pin') : $t('level.unpin') }}
        </button>
        <button class="flex gap-2 items-center p-1 bg-white bg-opacity-10 rounded-md button"
            @click="emit('closePopup'); emit('doListAction', 'editList')">
            <img class="w-8" src="../../images/edit.svg" alt="">{{ $t('level.edit') }}
        </button>
    </div>
</template>