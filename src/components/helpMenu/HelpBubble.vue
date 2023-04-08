<script setup lang="ts">
import { ref } from "vue"
import parseText from "../global/parseEditorFormatting.ts"
    
defineProps({
    question: String,
    answer: String
})

const answerOpen = ref<boolean>(false)

</script>

<template>
    <section class="text-white bg-white bg-opacity-10 rounded-sm py-3 px-2">
        <div class="relative font-bold" @click="answerOpen = !answerOpen">
            <header>{{ question }}</header>
            <button class="absolute right-0 top-0" :style="{scale: answerOpen ? '1 -1' : '1 1'}">V</button>
        </div>
        <article v-show="answerOpen" class="leading-4">
            <hr class="opacity-40 my-2">
            <p v-html="parseText(answer)"></p>
        </article>
    </section>
</template>
