<script setup lang="ts">

defineProps<{
    disabled?: boolean
    multiple?: boolean
    fileType?: 'image'
}>()

const emit = defineEmits<{
    (e: "data", blob: Blob): void
}>()

const getFile = async (e: DragEvent) => {
    let file
    if (!e.dataTransfer) file = e.target.files[0]
    else file = e.dataTransfer?.files[0]
    emit('data', file)
}

const pasteFile = (e: Event) => {
    e.preventDefault()
    if (currentTab.value == 1) return // Not on external images
    if (!e.clipboardData.files.length) return notify(8)
    uploadImage(e.clipboardData?.files, true)
}

</script>

<template>
    <input type="file" @drop="getFile" @input="getFile" :disabled="disabled" class="absolute inset-0 opacity-0 appearance-none">
</template>