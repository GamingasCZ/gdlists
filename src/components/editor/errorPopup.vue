<script setup lang="ts">
import { ref, watch } from 'vue';
import parseText from "../global/parseEditorFormatting";


const props = defineProps<{
    errorText: string
    showDblclickInfo: boolean
    stamp: number
}>()

const hidden = ref(true)

watch(props, () => {
    hidden.value = false
    setTimeout(() => hidden.value = true, 2000);
})

</script>

<template>
    <Transition name="fade">
        <main v-if="!hidden" class="fixed top-16 left-1/2 p-3 w-96 z-40 bg-[url(@/images/sadNotif.webp)] bg-no-repeat bg-right-top max-w-[95vw] bg-black bg-opacity-80 rounded-lg backdrop-blur-sm -translate-x-1/2">
            <h1 class="my-2 text-2xl text-center text-red-300">Chyba!</h1>
            <section v-if="showDblclickInfo" class="flex gap-2 items-center p-1 my-2 text-white bg-gray-600 bg-opacity-40 rounded-md opacity-40">
                <img src="@/images/info.svg" class="w-5">Klikni dvakrát pro ignorování chyby
            </section>
            <p class="mt-6 text-center text-white" v-html="parseText(errorText)"></p>
        </main>
    </Transition>
</template>