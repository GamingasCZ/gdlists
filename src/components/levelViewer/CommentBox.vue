<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { makeColor, EMOJI_COUNT, isOnline } from '@/Editor'
import chroma from 'chroma-js'
import ColorPicker from '../global/ColorPicker.vue'
import Editor from 'pure-editor'
import axios, { type AxiosResponse } from 'axios'
import cookier from 'cookier'
import LoginButton from '../global/LoginButton.vue'
import { useI18n } from 'vue-i18n'
import { SETTINGS } from '@/siteSettings'
import ProfilePicture from '../global/ProfilePicture.vue'

const props = defineProps<{
    listID: string
    hidden: string
    isReview: boolean
}>()

const MIN_COMMENT_LEN = 10
const MAX_COMMENT_LEN = 300

const loggedIn = ref<boolean>(true)

const pfp = ref<number>()
const username = ref<string>("")
if (localStorage) {
    let userInfo = JSON.parse(localStorage.getItem("account_info")!)
    if (userInfo == null) loggedIn.value = false
    else {
        pfp.value = userInfo[1]
        username.value = userInfo[0]
    }
}

let emojis = ref<string[]>([])
function loadEmojis() {
    for (let i = 0; i < EMOJI_COUNT; i++) {
        emojis.value.push(`${import.meta.env.BASE_URL}/emoji/${(i+1).toString().padStart(2, '0')}.webp`)
    }
}
loadEmojis()

const commentLength = ref(0)

const listColor = ref<number[]>([Math.floor(Math.random()*360), 1, 8+Math.random()*24])
const parsedColor = ref<string>(chroma.hsl(listColor.value[0], 1, listColor.value[2]/64).hex())
const darkParsedColor = ref<string>(chroma.hsl(listColor.value[0], 1, listColor.value[2]/64).darken(4).hex())
const lengthPie = ref()
if (SETTINGS.value.disableColors) {
    parsedColor.value = getComputedStyle(document.documentElement).getPropertyValue("--primaryColor")
    darkParsedColor.value = getComputedStyle(document.documentElement).getPropertyValue("--siteBackground")
    lengthPie.value = getComputedStyle(document.documentElement).getPropertyValue("--brightGreen")
    watch(commentLength, () => lengthPie.value = `linear-gradient(90deg, ${getComputedStyle(document.documentElement).getPropertyValue("--brightGreen")} ${Math.ceil(commentLength.value/MAX_COMMENT_LEN*100)}%, ${darkParsedColor.value} ${Math.ceil(commentLength.value/MAX_COMMENT_LEN*100)+2}%)`)
}
else {
    watch(listColor, () => {
        parsedColor.value = chroma.hsl(listColor.value[0], 1, listColor.value[2]/64).hex()
        darkParsedColor.value = chroma.hsl(listColor.value[0], 1, listColor.value[2]/64).darken(4).hex()
        lengthPie.value = `linear-gradient(90deg, ${chroma.hsl(listColor.value[0], 1, 0.4).hex()} ${Math.ceil(commentLength.value/MAX_COMMENT_LEN*100)}%, ${darkParsedColor.value} ${Math.ceil(commentLength.value/MAX_COMMENT_LEN*100)+2}%)`
    }, {deep: true})
    watch(commentLength, () => lengthPie.value = `linear-gradient(90deg, ${chroma.hsl(listColor.value[0], 1, 0.4).hex()} ${Math.ceil(commentLength.value/MAX_COMMENT_LEN*100)}%, ${darkParsedColor.value} ${Math.ceil(commentLength.value/MAX_COMMENT_LEN*100)+2}%)`)
}

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

const placeholderActive = ref<boolean>(true)
const placeholder = ref<string>("")
let listPlaceholders = [
    useI18n().t("listViewer.commHelp1"),
    useI18n().t("listViewer.commHelp2"),
    useI18n().t("listViewer.commHelp3"),
    useI18n().t("listViewer.commHelp4"),
]
let reviewPlaceholders = [
    useI18n().t('listViewer.commHelpR1'),
    useI18n().t('listViewer.commHelpR2'),
    useI18n().t('listViewer.commHelpR3'),
    useI18n().t('listViewer.commHelpR4'),
]

placeholder.value = [listPlaceholders, reviewPlaceholders][props.isReview | 0][Math.floor(Math.random() * listPlaceholders.length)]


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

const modCommentLength = () => commentLength.value = parseComment(COMMENT_BOX.value.getValues()).length

const commentError = ref(false)
function sendComment(com = "") {
    if (parseComment(COMMENT_BOX.value.getValues()).length < MIN_COMMENT_LEN) return

    let oldComment = document.getElementById("commentBox")?.innerHTML
    let comment: Array<string | {id: string}>
    if (com == "") comment = COMMENT_BOX.value.submit()
    else comment = com
    let parsedComment = parseComment(comment)
    commentLength.value = 0

    // why tf did i have to stringify the post data? it wouldn't show up in the backend otherwise fuck!!!!
    let postData = {
        comment: parsedComment,
        comType: "0",
        comColor: parsedColor.value,
    }
    if (props.isReview) postData.reviewID = props.listID
    else {
        postData.listID = props.listID
        postData.hidden = props.hidden
    }

    axios.post(import.meta.env.VITE_API+"/sendComment.php", postData).then((res: AxiosResponse) => {
        if (res.data == 6)
            (document.getElementById("listRefreshButton") as HTMLButtonElement).click()
        else {
            document.getElementById("commentBox").innerHTML = oldComment
            modCommentLength()
            commentError.value = true
            setTimeout(() => {
                commentError.value = false
            }, 5000);
        }
    }).catch(() => {
        document.getElementById("commentBox").innerHTML = oldComment
        modCommentLength()
        commentError.value = true
        setTimeout(() => {
            commentError.value = false
        }, 5000);
    })
}
</script>

<template>
    <section class="relative z-20 max-w-[95vw] w-[80rem] mx-auto max-sm:fixed max-sm:bottom-0 max-sm:left-0 max-sm:bg-black bg-opacity-40 max-sm:max-w-full max-sm:p-2">
        <pre
            @focus="placeholderActive = false"
            @blur="chatboxEmpty"
            @paste="modCommentLength()"
            @input="modCommentLength()"
            :tabindex="loggedIn ? 0 : -1"
            :class="{'pointer-events-none': !loggedIn, 'opacity-25': !loggedIn}"
            contenteditable="true"
            id="commentBox"
            class="overflow-y-auto break-all whitespace-normal font-[poppins] box-border p-1 rounded-md border-4 border-solid sm:h-24"
            :style="{boxShadow: `0px 0px 10px ${parsedColor}`, borderColor: parsedColor, backgroundColor: darkParsedColor}">
        </pre>
        
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

        <!-- Comment send error -->
        <Transition name="fade">
            <div v-if="commentError" class="flex gap-2 items-center p-1 my-2 rounded-md max-sm:text-sm" :style="{backgroundColor: parsedColor}">
                <img src="@/images/info.svg" alt="" class="w-4">
                <p>{{ $t('listViewer.failSendComm') }}</p>
            </div>
        </Transition>
        <footer class="flex justify-between mt-2">
            <div>
                <ProfilePicture class="inline mr-2 w-8 rounded-full" :uid="pfp" />
                <label>{{ username }}</label>
            </div>

            <div class="flex gap-2">
                <button :style="{backgroundColor: darkParsedColor}" class="box-border p-1 rounded-md aspect-square disabled:opacity-50" :disabled="!loggedIn" @click="openDropdown(0)"><img src="@/images/color.svg" class="w-6" alt=""></button>
                <button :style="{backgroundColor: darkParsedColor}" class="box-border p-1 rounded-md aspect-square disabled:opacity-50" :disabled="!loggedIn" @click="openDropdown(1)"><img src="@/images/emoji.svg" class="w-6" alt=""></button>
                <button 
                    :style="{backgroundColor: darkParsedColor}"
                    class="box-border flex relative gap-2 items-center px-1 w-max rounded-md transition-opacity duration-75 disabled:opacity-50"
                    :disabled="(commentLength < MIN_COMMENT_LEN || commentLength > MAX_COMMENT_LEN) || !loggedIn || !isOnline || commentError"
                    @click="sendComment()"
                >
                    <div :style="{backgroundImage: lengthPie}" class="absolute bottom-0 left-0 w-full h-1 rounded-b-sm" v-show="commentLength > 1"></div>
                    <img src="@/images/send.svg" class="w-7" alt="">
                    <p>{{ $t('other.send') }}</p>
                </button>
            </div>
        </footer>
    </section>
</template>