<script setup lang="ts">
import { shortenYTLink } from '@/Editor';
import { onMounted, onUnmounted, ref } from 'vue';


const props = defineProps<{
    disabled?: boolean
    multiple?: boolean
    fileType?: 'image'
    unclickable?: boolean
    allowYoutubeLinks?: boolean
}>()

const emit = defineEmits<{
    (e: "data", blob: Blob | string): void
}>()

const getFile = async (e: DragEvent) => {
    let file
    e.preventDefault()
    if (props.disabled) return
    if (props.allowYoutubeLinks && e?.clipboardData) {
        let validYTLink = shortenYTLink(e.clipboardData.getData("text"))
        if (validYTLink) return emit('data', e.clipboardData.getData("text"))
    }

    if (e.clipboardData) file = e.clipboardData?.files
    else if (!e.dataTransfer) file = e.target.files
    else file = e.dataTransfer?.files
    emit('data', props.multiple ? file : file[0])
}

const pasteFile = (e: Event) => {
    getFile(e)
}

onMounted(() => {
    document.body.addEventListener("paste", pasteFile)
    document.body.addEventListener("drop", getFile)
})
onUnmounted(() => {
    document.body.removeEventListener("paste", pasteFile)
    document.body.removeEventListener("drop", getFile)
})

const uploader = ref<HTMLInputElement>()
defineExpose({uploader})

</script>

<template>
    <input
        type="file"
        ref="uploader"
        accept="image/*"
        :multiple="multiple"
        @input="getFile"
        :disabled="disabled"
        class="absolute inset-0 opacity-0 appearance-none"
        title=""
    >
</template>