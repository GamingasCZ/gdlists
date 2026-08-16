<script setup lang="ts">
import { computed, nextTick } from 'vue';
import { onMounted, ref } from 'vue';

const emit = defineEmits<{
    (e: 'update', message: string): void
}>()

const props = defineProps<{
    isReview: boolean
    lang: string
}>()

// we using review language, not site language!!
var examples: string[];
if (props.isReview) {
    if (props.lang == 'cs')
        examples = [
            "Opraveny překlepy.",
            "Přidány levely.",
            "Přidány nové sekce.",
            "Upraveny obrázky.",
            "Upravena videa.",
        ]
    else
        examples = [
            "Fixed typos.",
            "Added levels.",
            "Added new sections.",
            "Replaced images.",
            "Changed videos.",
        ]
}
else {
    if (props.lang == 'cs')
        examples = [
            "Přidány levely.",
            "Upravena ID levelů.",
            "Přidána videa.",
            "Přidány obrázky.",
            "Upraveny komentáře k levelům.",
        ]
    else
        examples = [
            "Added levels.",
            "Updated Level IDs.",
            "Added videos.",
            "Added screenshots.",
            "Update level commentaries.",
        ]
}

const applyExample = (mess: string) => {
    message.value = mess
}

onMounted(() =>{
    nextTick(() => {
        let messEl = document.getElementById("updateMessArea")
        messEl?.focus()
    })
})

const message = ref("")
const messLen = computed(() => message.value.length)

</script>

<template>
    <form @submit.prevent="emit('update', message)" class="flex flex-col gap-1 py-3 text-center">
        <h2 class="text-2xl">{{ $t('reviews.folMess1') }}</h2>
        <p>{{ $t('reviews.folMess2') }}</p>
        <textarea @keyup.ctrl.enter="emit('update', message)" @keydown.ctrl.a="$event.target.select()" :maxlength="300" rows="6" id="updateMessArea" :placeholder="$t('reviews.folMess3')" class="p-2 bg-black bg-opacity-40 resize-none" v-model="message"></textarea>
        <span class="mr-2 text-right">{{ messLen }}/300</span>
        <hr class="mx-4 opacity-20">
        <span class="ml-2 text-xl font-bold text-left">{{ $t('collabTools.examples') }}:</span>
        <ul class="flex flex-wrap gap-2 px-2">
            <li v-for="mess in examples" @click="applyExample(mess)" class="p-1 bg-black bg-opacity-40 rounded-md border-2 button border-lof-300">{{ mess.slice(0,-1) }}</li>
        </ul>
        <button type="submit" class="flex gap-4 px-3 py-2 mx-auto w-max text-xl font-bold text-black rounded-md button bg-lof-400">
            <img src="@/images/upload.svg" alt="" class="w-7">
            <span>{{ $t('editor.update') }}</span>
        </button>
    </form>
</template>