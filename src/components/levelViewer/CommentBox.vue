<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { makeColor, EMOJI_COUNT } from '@/Editor'
import chroma from 'chroma-js'
import ColorPicker from '../global/ColorPicker.vue'
import Editor from 'pure-editor'
import axios, { type AxiosResponse } from 'axios'
import cookier from 'cookier'

const props = defineProps<{
    listID: string
}>()

const loggedIn = ref<boolean>(true)

const pfp = ref<string>("")
const username = ref<string>("")
if (localStorage) {
    let userInfo = JSON.parse(localStorage.getItem("account_info")!)
    if (userInfo == null) loggedIn.value = false
    else {
        pfp.value = `https://cdn.discordapp.com/avatars/${userInfo[1]}/${userInfo[2]}.png`
        username.value = userInfo[0]
    }
}

function getEmoji(ind: number) {
    const path = `../../images/emoji/${ind.toString().padStart(2, '0')}.webp`;
    return new URL(path, import.meta.url).toString()
}


const listColor = ref<number[]>([Math.floor(Math.random()*360), 8+Math.random()*24])
const parsedColor = ref<string>(chroma.hsl(listColor.value[0], 1, listColor.value[1]/64).hex())
const darkParsedColor = ref<string>(chroma.hsl(listColor.value[0], 1, listColor.value[1]/64).darken(4).hex())
watch(listColor, () => {
    parsedColor.value = chroma.hsl(listColor.value[0], 1, listColor.value[1]/64).hex()
    darkParsedColor.value = chroma.hsl(listColor.value[0], 1, listColor.value[1]/64).darken(4).hex()
}, {deep: true})

const dropdownOpen = ref<number>(-1)
const openDropdown = (ind: number) => dropdownOpen.value = dropdownOpen.value == ind ? -1 : ind

var COMMENT_BOX
onMounted(() => {
    if (document.getElementById("commentBox") == null) return

    COMMENT_BOX = new Editor(document.getElementById("commentBox"), {
        emoji: {
            render(emoji) {
                const img = document.createElement('img')
                img.classList.add('inline-block', 'w-4',)
                img.src = getEmoji(emoji.id)
                img.draggable = false
                // const img = document.createElement('kbd')
                // img.classList.add('inline-block', 'w-4', 'h-4', 'bg-cover')
                // img.style.backgroundImage = `url(${getEmoji(emoji.id)})`
                // img.draggable = true
                return img
            },
        },
        submit: {
            will: e => e.key === 'Enter' && e.ctrlKey,
            done: console.log,
        },
    })
})

const placeholderActive = ref<boolean>(true)
const placeholder = ref<string>("")
let placeholders = [
    "Tvůj seznam je...",
    "Líbí se mi tvůj seznam, protože...",
    "Máš jiný názor než já. Už nikdy nebudeš klidně spát, protože...",
    "Tvůj seznam stojí za prd, protože...",
    "Mrkni se i na můj seznam..."
]
placeholder.value = placeholders[Math.floor(Math.random() * placeholders.length)]

const chatboxEmpty = () => {
    if (!document.getElementById("commentBox")?.textContent) placeholderActive.value = true
}
function sendComment() {
    let comment: Array<string | {id: string}> = COMMENT_BOX.submit()
    let parsedComment = ""
    comment.forEach((commentBit: string | {id: string}) => {
        if (typeof commentBit == "string") parsedComment += commentBit
        else if (typeof comment == "object") parsedComment += `&${commentBit.id.padStart(2, '0')}`
    });

    // why tf did i have to stringify the post data? it wouldn't show up in the backend otherwise fuck!!!!
    axios.post(import.meta.env.VITE_API+"/sendComment.php", JSON.stringify({
        comment: parsedComment,
        comType: "0",
        listID: props.listID,
        comColor: parsedColor.value,
    }), {headers: {Authorization: cookier("access_token").get()}}).then((res: AxiosResponse) => {
        (document.getElementById("listRefreshButton") as HTMLButtonElement).click()
    })
}
</script>

<template>
    <section v-if="!loggedIn">

    </section>

    <section v-else class="relative z-10 max-w-[95vw] w-[80rem] mx-auto max-sm:fixed max-sm:bottom-0 max-sm:left-0 max-sm:bg-black bg-opacity-40 max-sm:max-w-full max-sm:p-2">
        <pre @focus="placeholderActive = false" @blur="chatboxEmpty" contenteditable="true" id="commentBox" class="overflow-y-auto font-[poppins] box-border p-1 rounded-md border-4 border-solid sm:h-20" :style="{boxShadow: `0px 0px 10px ${parsedColor}`, borderColor: parsedColor, backgroundColor: darkParsedColor}"></pre>
        
        <!-- Color Picker -->
        <div :style="{backgroundColor: darkParsedColor}" class="box-border p-2 my-1 rounded-md" v-show="dropdownOpen == 0">
            <ColorPicker @colors-modified="listColor = $event" />
        </div>

        <!-- Emoji Picker -->
        <div :style="{backgroundColor: darkParsedColor}" class="box-border flex overflow-x-auto gap-2 p-2 my-1 rounded-md" v-show="dropdownOpen == 1">
            <button v-for="index in EMOJI_COUNT" class="min-h-[2rem] bg-cover select-none min-w-[2rem] button" :style="{backgroundImage: `url(${getEmoji(index)})`}" @click="COMMENT_BOX.insertEmoji({ id: index })" @drag=""></button>
        </div>

        <footer class="flex justify-between mt-1">
            <div>
                <img :src="pfp" class="inline mr-2 w-8 rounded-full" alt="">
                <label>{{ username }}</label>
            </div>

            <div class="flex gap-2">
                <button :style="{backgroundColor: darkParsedColor}" class="box-border p-1 w-8 rounded-full" @click="openDropdown(0)"><img src="@/images/color.svg" class="inline" alt=""></button>
                <button :style="{backgroundColor: darkParsedColor}" class="box-border p-1 w-8 rounded-full" @click="openDropdown(1)"><img src="@/images/emoji.svg" class="inline" alt=""></button>
                <button :style="{backgroundColor: darkParsedColor}" class="box-border p-1 w-8 rounded-full" @click="sendComment"><img src="@/images/send.svg" class="inline" alt=""></button>
            </div>
        </footer>
        <hr class="max-w-[95vw] w-[70rem] rounded-full bg-white bg-opacity-40 border-none h-1 mx-auto mt-6 mb-6 max-sm:hidden">
    </section>
</template>