<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';


const props = defineProps<{
    disabled?: boolean
    multiple?: boolean
    fileType?: 'image'
    unclickable?: boolean
}>()

const emit = defineEmits<{
    (e: "data", blob: Blob): void
}>()

const getFile = async (e: DragEvent) => {
    let file
    if (e.clipboardData) file = e.clipboardData?.files
    else if (!e.dataTransfer) file = e.target.files
    else file = e.dataTransfer?.files
    emit('data', props.multiple ? file : file[0])
}

const pasteFile = (e: Event) => {
    console.log(e.clipboardData.files.length)
    getFile(e)
}

onMounted(() => document.addEventListener("paste", pasteFile))
onUnmounted(() => document.removeEventListener("paste", pasteFile))

const uploader = ref<HTMLInputElement>()
defineExpose({uploader})

</script>

<template>
    <input
        type="file"
        ref="uploader"
        accept="image/*"
        :multiple="multiple"
        @drop="getFile"
        @input="getFile"
        :disabled="disabled"
        class="absolute inset-0 opacity-0 appearance-none"
        :class="{'pointer-events-none': unclickable}"
    >
</template>