<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { makeColor, EMOJI_COUNT } from '@/Editor'
import chroma from 'chroma-js'
import ColorPicker from '../global/ColorPicker.vue'
import Editor from 'pure-editor'
import axios, { type AxiosResponse } from 'axios'
import cookier from 'cookier'
import LoginButton from '../global/LoginButton.vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
    listID: string
}>()

const MIN_COMMENT_LEN = 10
const MAX_COMMENT_LEN = 300

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

let emojis = ref<string[]>([])
async function loadEmojis() {
    for (let i = 0; i < EMOJI_COUNT; i++) {
        emojis.value.push(await import(`../../images/emoji/${(i+1).toString().padStart(2, '0')}.webp`).then(res => res.default))
    }
}
loadEmojis()

const listColor = ref<number[]>([Math.floor(Math.random()*360), 1, 8+Math.random()*24])
const parsedColor = ref<string>(chroma.hsl(listColor.value[0], 1, listColor.value[2]/64).hex())
const darkParsedColor = ref<string>(chroma.hsl(listColor.value[0], 1, listColor.value[2]/64).darken(4).hex())
watch(listColor, () => {
    parsedColor.value = chroma.hsl(listColor.value[0], 1, listColor.value[2]/64).hex()
    darkParsedColor.value = chroma.hsl(listColor.value[0], 1, listColor.value[2]/64).darken(4).hex()
}, {deep: true})

const dropdownOpen = ref<number>(-1)
const openDropdown = (ind: number) => dropdownOpen.value = dropdownOpen.value == ind ? -1 : ind

const COMMENT_BOX = ref()
onMounted(() => {
    if (document.getElementById("commentBox") == null) return

    COMMENT_BOX.value = new Editor(document.getElementById("commentBox"), {
        emoji: {
            render(emoji) {
                const img = document.createElement('img')
                img.classList.add('inline-block', 'w-4',)
                img.src = emojis.value[emoji.id-1]
                img.draggable = false
                return img
            },
        },
        submit: {
            done: sendComment,
        },
    })
})

const commentLength = ref(0)

const placeholderActive = ref<boolean>(true)
const placeholder = ref<string>("")
let placeholders = [
    useI18n().t("listViewer.commHelp1"),
    useI18n().t("listViewer.commHelp2"),
    useI18n().t("listViewer.commHelp3"),
    useI18n().t("listViewer.commHelp4"),
]
placeholder.value = placeholders[Math.floor(Math.random() * placeholders.length)]

const chatboxEmpty = () => {
    if (!document.getElementById("commentBox")?.textContent) placeholderActive.value = true
}

function parseComment(comment: Array<string | {id: string}> ): string {
    let parsedComment = ""
    comment.forEach((commentBit: string | {id: string}) => {
        if (typeof commentBit == "string") parsedComment += commentBit
        else if (typeof comment == "object") {
            if (commentBit.id == undefined) parsedComment += "\n" // bug when selecting all text and removing it
            else parsedComment += `&${commentBit.id.padStart(2, '0')}`
        }
    });
    return parsedComment
}
const lengthPie = ref()
watch(commentLength, () => lengthPie.value = `conic-gradient(${parsedColor.value} ${Math.ceil(commentLength.value/MAX_COMMENT_LEN*100)}%, ${darkParsedColor.value} ${Math.ceil(commentLength.value/MAX_COMMENT_LEN*100)+2}%)`)
const modCommentLength = () => commentLength.value = parseComment(COMMENT_BOX.value.getValues()).length


function sendComment(com = "") {
    if (parseComment(COMMENT_BOX.value.getValues()).length < MIN_COMMENT_LEN) return

    let comment: Array<string | {id: string}>
    if (com == "") comment = COMMENT_BOX.value.submit()
    else comment = com
    let parsedComment = parseComment(comment)
    commentLength.value = 0

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
    <section class="relative z-10 max-w-[95vw] w-[80rem] mx-auto max-sm:fixed max-sm:bottom-0 max-sm:left-0 max-sm:bg-black bg-opacity-40 max-sm:max-w-full max-sm:p-2">
        <pre :tabindex="loggedIn ? 0 : -1" @focus="placeholderActive = false" :class="{'pointer-events-none': !loggedIn, 'opacity-25': !loggedIn}" @blur="chatboxEmpty" @paste="modCommentLength()" @input="modCommentLength()" contenteditable="true" id="commentBox" class="overflow-y-auto break-all whitespace-normal font-[poppins] box-border p-1 rounded-md border-4 border-solid sm:h-24" :style="{boxShadow: `0px 0px 10px ${parsedColor}`, borderColor: parsedColor, backgroundColor: darkParsedColor}"></pre>
        
        <!-- placeholder text -->
        <p class="absolute top-2 left-3 opacity-30" v-if="placeholderActive && commentLength == 0">{{ placeholder }}</p>

        <!-- Not logged in notification -->
        <section v-if="!loggedIn" class="flex absolute top-5 left-1/2 z-20 flex-col gap-1 items-center w-full text-white -translate-x-1/2">
            <div class="flex gap-2 items-center">
                <img src="@/images/info.svg" alt="" class="w-6">
                <p>{{ $t('listViewer.commentLogin') }}</p>
            </div>
            <LoginButton />
        </section>

        <!-- Color Picker -->
        <div :style="{backgroundColor: darkParsedColor}" class="box-border p-2 my-1 rounded-md" v-show="dropdownOpen == 0">
            <ColorPicker @colors-modified="listColor = $event" :hue="listColor[0]" :saturation="listColor[1]" :lightness="listColor[2]"/>
        </div>

        <!-- Emoji Picker -->
        <div :style="{backgroundColor: darkParsedColor}" class="box-border flex overflow-x-auto gap-2 p-2 my-1 rounded-md" v-show="dropdownOpen == 1">
            <button v-for="index in EMOJI_COUNT" class="min-h-[2rem] bg-cover select-none min-w-[2rem] button" :style="{backgroundImage: `url(${emojis[index-1]})`}" @click="COMMENT_BOX.insertEmoji({ id: index }); commentLength = parseComment(COMMENT_BOX.getValues()).length" @drag=""></button>
        </div>

        <footer class="flex justify-between mt-1">
            <div>
                <img :src="pfp" class="inline mr-2 w-8 rounded-full" alt="">
                <label>{{ username }}</label>
            </div>

            <div class="flex gap-2">
                <button :style="{backgroundColor: darkParsedColor}" class="box-border p-1 w-8 rounded-full disabled:opacity-50" :disabled="!loggedIn" @click="openDropdown(0)"><img src="@/images/color.svg" class="inline" alt=""></button>
                <button :style="{backgroundColor: darkParsedColor}" class="box-border p-1 w-8 rounded-full disabled:opacity-50" :disabled="!loggedIn" @click="openDropdown(1)"><img src="@/images/emoji.svg" class="inline" alt=""></button>
                <button :style="{backgroundColor: darkParsedColor, backgroundImage: lengthPie}" class="box-border p-1 w-8 rounded-full transition-opacity duration-75 disabled:opacity-50" :disabled="(commentLength < MIN_COMMENT_LEN || commentLength > MAX_COMMENT_LEN) || !loggedIn" @click="sendComment()"><img src="@/images/send.svg" class="inline" alt=""></button>
            </div>
        </footer>
    </section>
</template>