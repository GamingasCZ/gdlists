<script setup lang="ts">

defineProps<{
    backupData: object
    isReview: boolean
}>()
const emit = defineEmits(['loadBackup', 'removeBackup'])

</script>

<template>
    <section class="flex gap-3 justify-between items-center px-3 py-1 m-1 bg-white bg-opacity-10 rounded-md max-sm:flex-col"
        v-if="backupData.backupDate != 0">
        <div class="flex items-center">
            <img v-if="isReview" src="@/images/reviews.svg" class="inline mr-3 w-10" alt="">
            <img v-else src="@/images/browseMobHeader.svg" class="inline mr-3 w-10" alt="">
            <div class="inline-flex flex-col leading-snug">
                <h3 class="opacity-50">{{ isReview ? $t('editor.reviewInProgress') : $t('editor.listInProgress') }}</h3>
                <div>
                    <i>{{ backupData.backupName || (isReview ? $t('editor.unnamedReview') : $t('editor.unnamedList')) }}</i> - <b>{{ backupData.backupDate }}</b>
                </div>
            </div>
        </div>
        <div v-if="!isReview" class="flex gap-3 w-max max-sm:gap-1">
            <button class="inline-flex gap-2 p-1 font-bold bg-black bg-opacity-40 rounded-md button"
                @click="emit('loadBackup')">
                <img src="@/images/edit.svg" class="box-border inline p-0.5 w-6">
                <label>{{ $t('editor.restore') }}</label>
            </button>
            <button class="inline-flex gap-2 p-1 font-bold bg-black bg-opacity-40 rounded-md button"
                @click="emit('removeBackup')">
                <img src="@/images/trash.svg" class="box-border inline p-0.5 w-6">
                <label>{{ $t('editor.remove') }}</label>
            </button>
        </div>
        <div v-else class="flex gap-3 w-max max-sm:gap-1">
            <button class="inline-flex gap-2 p-1 font-bold bg-black bg-opacity-40 rounded-md button"
                @click="emit('loadBackup')">
                <img src="@/images/symbolicSave.svg" class="box-border inline p-0.5 w-6">
                <label>{{ $t('reviews.writeOn') }}</label>
            </button>
            <button class="inline-flex gap-2 p-1 font-bold bg-black bg-opacity-40 rounded-md button"
                @click="emit('removeBackup')">
                <img src="@/images/close.svg" class="box-border inline p-0.5 w-6">
                <label>{{ $t('other.cancel') }}</label>
            </button>
        </div>
</section></template>