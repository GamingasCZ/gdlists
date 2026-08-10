<script setup lang="ts">
import axios from 'axios';
import { computed, nextTick, onMounted, ref } from 'vue';
import ProfilePicture from './ProfilePicture.vue';
import { currentCutout, currentUID } from '@/Editor';
import { i18n } from '@/locales.ts';
import { summonNotification } from '../imageUpload.ts';
import { hasLocalStorage } from '@/siteSettings.ts';
import Tooltip from '../ui/Tooltip.vue';

interface response {
    available_in: number
    max_len: number
    min_len: number
    interval: number
    last_names: string[]
}

const emit = defineEmits<{
    (e: "close"): void
}>()

defineProps<{
    currUsername: string
}>()

const messages = ref([
    i18n.global.t('other.uCMess1'),
    i18n.global.t("other.loading")+"..."
])

const availableIn = ref(-1)
const maxUsernameLen = ref(20)
const minUsernameLen = ref(3)
const interval = ref(30)
const prevUsernames = ref<string[]>([])
const newName = ref("")

axios.get(import.meta.env.VITE_API+"/username.php").then(res => {
    if (res.status != 200)
        return (availableIn.value = -2)

    let change: response = res.data
    availableIn.value = change.available_in
    maxUsernameLen.value = change.max_len
    minUsernameLen.value = change.min_len
    prevUsernames.value = change.last_names
    interval.value = change.interval

    nextTick(() => 
        document.getElementById("changeNameInput")?.focus()
    )

    messages.value[1] = i18n.global.t('other.uCMess2', [availableIn.value])
}).catch(() => {
    availableIn.value = -2
})

const checkAllowedChar = (char: string) => {
    if (char == '_' || char == '-') return true

    let ord = char.codePointAt(0) ?? 0
    
    let invalid = 0b00
    // numbers
    if (ord < 48 || ord > 57)
        invalid |= 0b10
    // letters
    if (ord < 65 || (ord > 90 && ord < 97) || ord > 122)
        invalid |= 0b01

    if (invalid == 0b11) return false
    else return true
}

const presetUsername = (to: string) => {
    newName.value = to
}

const changeName = (isDiscord?: boolean) => {
    let params = {}
    if (isDiscord) params.discord = 1
    else {
        params.newUsername = newName.value
        if (!invalidName()) return
    }

    axios.post(import.meta.env.VITE_API+"/username.php", params).then(res => {
        if (res.data[0] == "6") {
            summonNotification(i18n.global.t('other.uCChanged'), "", "check")
            if (hasLocalStorage()) {
                let acc = JSON.parse(localStorage.getItem("account_info")!)
                acc[0] = res.data.slice(1)
                localStorage.setItem("account_info", JSON.stringify(acc))
            }
            emit('close')
        }
        else {
            if (res.data == "-9")
                displayError(i18n.global.t('other.uCinUse'))
            else
                displayError(i18n.global.t('other.ucChFail'))
        }
    }).catch(() => {
        displayError(i18n.global.t('other.ucChFail'))
    })
}

const invalidName = () => {
    let nameLen = newName.value.length
    let invalid = false
    let inp = (document.getElementById("changeNameInput") as HTMLInputElement)
    if (nameLen > maxUsernameLen.value || nameLen < minUsernameLen.value) {
        inp.setCustomValidity(i18n.global.t('other.uCMess3', [minUsernameLen.value]))
        return false
    }

    for (let i = 0; i < nameLen; i++)
        if (!checkAllowedChar(newName.value[i])) invalid = true

    if (invalid) {
        inp.setCustomValidity(i18n.global.t('other.uCFail2'))
        inp.reportValidity()
        return false
    }
    return true
}

const errorShowing = ref(false)
const errorText = ref()
const displayError = (text: string) => {
    errorShowing.value = true
    errorText.value = text
    setTimeout(() => {
        errorShowing.value = false
    }, 2000);
}

const changeDisabled = computed(() =>
    availableIn.value != 0 || errorShowing.value
)

const discButton = ref<HTMLButtonElement>()
const dcHovering = ref(false)

</script>

<template>
<section class="p-2">
    <blockquote
        class="p-2 mb-4 bg-gradient-to-r to-transparent border-l-4 from-lof-300 border-l-lof-400"
        :class="{'-hue-rotate-[120deg]': availableIn == -2 || errorShowing}"
        v-if=" availableIn != 0 || errorShowing"
    >
        {{ errorShowing ? errorText : messages[+(availableIn != -2)] }}
    </blockquote>

    <div v-else class="flex gap-2 my-3">
        <ProfilePicture class="w-14" :uid="currentUID" :cutout="currentCutout" />
        <div class="flex flex-col">
            <span class="opacity-40">{{ $t('other.curName') }}</span>
            <span class="text-xl">{{ currUsername }}</span>
        </div>
    </div>
    <div>
        <form @submit.prevent="changeName(false)" class="flex gap-2">
            <input
                autocomplete="off"
                @invalid="invalidName"
                id="changeNameInput"
                v-model="newName"
                class="p-2 text-white bg-white bg-opacity-10 rounded-md disabled:opacity-50 grow"
                :placeholder="$t('other.newUN')"
                type="text"
                :disabled="changeDisabled"
                :maxlength="maxUsernameLen"
                :minlength="minUsernameLen"
            >
            <button :disabled="changeDisabled" @mouseover="!changeDisabled && (dcHovering = true)" @mouseout="dcHovering = false" ref="discButton" type="button" @click="changeName(true)"  :class="{'disabled': changeDisabled}" class="relative z-10 px-2 bg-black bg-opacity-40 rounded-md button hover:bg-opacity-60">
                <Tooltip v-if="dcHovering" :button="discButton" :text="$t('settingsMenu.pickDiscord')" no-teleport />
                <img src="@/images/socials/discord.svg" class="w-6" alt="">
            </button>
            <button type="submit" :disabled="changeDisabled" :class="{'disabled': changeDisabled}" class="flex gap-2 items-center px-2 text-xl text-black rounded-md button bg-lof-400">
                <img src="@/images/check.svg" class="w-5" alt="">
                {{ $t('other.modify') }}
            </button>
        </form>
        <div v-if="prevUsernames.length && availableIn == 0">
            <hr class="m-4 border opacity-40">
            <figure>
                <figcaption class="font-black text-white">{{ $t('other.uCprev') }}:</figcaption>
                <ul class="mx-2 overflow-clip rounded-md">
                    <li class="bg-black even:bg-opacity-20 odd:bg-opacity-40" v-for="name in prevUsernames">
                        <button @click="presetUsername(name.username)" class="p-1 pl-4 w-full text-left">
                            {{ name.username }}
                            <span v-if="name.username == currUsername" class="opacity-40">· {{ $t('other.inUse') }}</span>
                        </button>
                    </li>
                </ul>
            </figure>
        </div>
        <hr class="m-4 border opacity-40">
        <ul class="ml-6 list-disc">
            <li>{{ $t('other.ucHelp0') }}</li>
            <li>{{ $t('other.uCHelp1', [interval]) }}</li>
            <li>{{ $t('other.uChelp2') }}</li>
            <li>{{ $t('other.ucHelp3') }}</li>
        </ul>
    </div>
</section>

</template>