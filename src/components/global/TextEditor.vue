<script setup lang="ts">
import { levelList } from '@/Editor';
import { ref } from 'vue';
import parseText from "./parseEditorFormatting";
import striptags from "striptags";

defineProps({
    editorTitle: String
})

const emit = defineEmits(['closePopup'])

const isPreviewing = ref<boolean>(false)

function addFormatting(type: number) {
    if (isPreviewing.value) return

    let chars = ["**", "//", "__", "--"][type]
    let textbox = document.querySelector("#mainTextbox") as HTMLTextAreaElement
    let selStart = textbox.selectionStart
    switch (true) {
        case type >= 0 && type <= 3:
            if (selStart == textbox.selectionEnd) { // No text selected
                textbox.value = textbox.value.slice(0, selStart) + `${chars} ${chars}` + textbox.value.slice(selStart)
                textbox.focus()
                textbox.selectionStart = selStart+2
                textbox.selectionEnd = selStart+3
            }
            else {
                let selectedText = textbox.value.slice(selStart, textbox.selectionEnd)
                textbox.value = textbox.value.slice(0, selStart) + `${chars}${selectedText}${chars}` + textbox.value.slice(textbox.selectionEnd)
                textbox.focus()
                textbox.selectionStart = textbox.selectionEnd+2
                textbox.selectionEnd = textbox.selectionEnd+2
            }
            
            break;
            case [4,5].includes(type):
                let format = type == 4 ? "#" : "*"
                let startLF = [undefined, "\n"].includes(textbox.value[selStart-1]) ? "" : "\n"
                textbox.value = textbox.value.slice(0, selStart) + `${startLF}${format}` + textbox.value.slice(selStart)
                textbox.focus()
                textbox.selectionStart = selStart+2
                textbox.selectionEnd = selStart+2
                break;
                
            default:
                break;
            }
}

</script>

<template>
    <dialog open>
        <section class="max-w-[95vw] max-h-[95%] flex flex-col text-white shadow-lg shadow-black w-[60rem] h-[30rem] absolute top-1/2 left-1/2 p-2 rounded-lg -translate-x-1/2 -translate-y-1/2 bg-greenGradient">
            <div class="relative mb-1 h-max">
                <h2 class="text-xl font-bold text-center">{{ editorTitle }}</h2>
                <img src="@/images/close.svg" alt="" class="absolute top-0 right-0 w-6 button" @click="emit('closePopup')">
            </div>
            <main class="flex flex-col flex-grow-[1] gap-1.5">
                <div class="box-border flex gap-1.5 items-center">
                    <button @click="addFormatting(0)" class="p-1 px-2 bg-white bg-opacity-10 rounded-md button" :class="{disabled: isPreviewing}"><img class="w-5" src="@/images/formatting/bold.webp" alt=""></button>
                    <button @click="addFormatting(1)" class="p-1 px-2 bg-white bg-opacity-10 rounded-md button" :class="{disabled: isPreviewing}"><img class="w-5" src="@/images/formatting/italics.webp" alt=""></button>
                    <button @click="addFormatting(2)" class="p-1 px-2 bg-white bg-opacity-10 rounded-md button" :class="{disabled: isPreviewing}"><img class="w-5" src="@/images/formatting/underline.webp" alt=""></button>
                    <button @click="addFormatting(3)" class="p-1 px-2 bg-white bg-opacity-10 rounded-md button" :class="{disabled: isPreviewing}"><img class="w-5" src="@/images/formatting/strikethrough.webp" alt=""></button>
                    <hr class="w-1.5 h-5 bg-white bg-opacity-10 rounded-full border-none">
                    <button @click="addFormatting(4)" class="p-1 px-2 bg-white bg-opacity-10 rounded-md button" :class="{disabled: isPreviewing}"><img class="w-5" src="@/images/formatting/header.webp" alt=""></button>
                    <hr class="w-1.5 h-5 bg-white bg-opacity-10 rounded-full border-none">
                    <button @click="addFormatting(5)" class="p-1 px-2 bg-white bg-opacity-10 rounded-md button" :class="{disabled: isPreviewing}"><img class="w-5" src="@/images/formatting/list.webp" alt=""></button>
                    <hr class="w-1.5 h-5 bg-white bg-opacity-10 rounded-full border-none">
                    <button @click="isPreviewing = !isPreviewing" class="p-1 px-2 bg-white bg-opacity-10 rounded-md button" :class="{'bg-opacity-[0.4]': isPreviewing}"><img class="inline w-5 align-middle" src="@/images/view.svg" alt=""><span class="pl-1 max-sm:hidden">Náhled</span></button>
                </div>
                <textarea id="mainTextbox" v-show="!isPreviewing" v-model="levelList.description" class="flex-grow-[1] px-2 py-1 w-full bg-white bg-opacity-10 rounded-lg resize-none h-max" placeholder="Popis seznamu"></textarea>
                <div class="px-1 border-4 border-white border-opacity-10 border-solid h-max flex-grow-[1] rounded-lg" v-show="isPreviewing" v-html="parseText(striptags(levelList.description, ['a', 'b', 'i', 'u', 'strike', 'h1', 'li']))"></div>
            </main>
        </section>
    </dialog>
</template>