<script setup lang="ts">
import { ref, watch } from 'vue';
import parseText from "../global/parseEditorFormatting";


const props = defineProps<{
    errorText: string
    stamp: number
    previewing: boolean
}>()

const hidden = ref(true)

let timeout = -1
watch(props, () => {
    if (!props.errorText) { // Empty error (=no error)
        hidden.value = true
        return
    }
    
    if (props.previewing) { // Hide the popup when previewing list
        hidden.value = true
        return
    }

    hidden.value = false
    if (timeout != -1) clearTimeout(timeout)
    timeout = setTimeout(() => {hidden.value = true; timeout = -1}, 2000);
})

</script>

<template>
    <Transition name="fade">
        <main v-if="!hidden" class="fixed top-16 left-1/2 p-3 w-96 z-40 bg-[url(@/images/sadNotif.webp)] bg-no-repeat bg-right-top max-w-[95vw] bg-black bg-opacity-80 rounded-lg backdrop-blur-sm -translate-x-1/2">
            <h1 class="my-2 text-2xl text-center text-red-300">{{ $t('editor.error') }}</h1>
            <p class="mt-6 text-center text-white" v-html="parseText(errorText)"></p>
        </main>
    </Transition>
</template>