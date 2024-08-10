<script setup lang="ts">
import { prettyDate } from '@/Editor';
import { hasLocalStorage } from '@/siteSettings';
import axios from 'axios';
import { ref } from 'vue';


const currentSession = ref(-1)
const base = import.meta.env.BASE_URL
const error = ref(false)
const SESSIONS = ref<Session[]>([])
type os = 'Linux' | 'Mac OS'  |'Windows' | 'Android' | 'iPhone' 
type sessionData = {dev: os, mobile: boolean, browser: string}

interface Session {
    session_data: sessionData
    session_index: number
    last_login: number
}

interface SessionResponse {
    sessions: Session[]
    currentSession: number
}

axios.get(import.meta.env.VITE_API+"/accounts.php", {params: {sessions: 1}}).then(res => {
    SESSIONS.value = res.data.sessions
    currentSession.value = res.data.currentSession
}).catch(() => error.value = true)

const logoutDevice = (sessionIndex: number, arrIndex: number) => {
    axios.delete(import.meta.env.VITE_API + "/accounts.php", {params: {index: sessionIndex}}).then(res => {
        if (res.data == 1) SESSIONS.value.splice(arrIndex, 1)
    })
}

const logoutAll = () => {
    axios.delete(import.meta.env.VITE_API + "/accounts.php", {params: {all: 1}}).then(res => {
        if (res.data == 1) return
    })
}


const editingSessionName = ref(-1)
var customNames = {}
if (hasLocalStorage()) {
    customNames = JSON.parse(localStorage.getItem("customSessionNames")!) ?? {}
}

const deviceNames = (def: sessionData, ind: number) => {
    if (customNames[ind])
        return customNames[ind]
    return def.browser + ' (' +def.dev + ')'
}

const saveNames = () => {
    localStorage.setItem("customSessionNames", JSON.stringify(customNames))
    editingSessionName.value = -1
}

const getLoginDate = (date: number) => {
    return new Date(date*1000)
}

defineExpose({logoutAll}) 
</script>

<template>
    <section class="flex min-h-96 flex-col overflow-y-auto gap-2 p-2 bg-[url(@/images/fade.webp)] bg-repeat-x">
        <div v-for="(session, ind) in SESSIONS" :class="{'border-l-4 border-lof-400': currentSession == session.session_index}" class="flex gap-2 items-center p-2 bg-black bg-opacity-40 rounded-md">
            <img class="w-14 opacity-40" :src="base + `/deviceIcons/${session.session_data.mobile ? 'mobile' : 'desktop'}.svg`" alt="">
            <div class="grow">
                <input v-model="customNames[session.session_index]" v-if="editingSessionName == ind" @blur="saveNames" @keyup.enter="saveNames" @mouseover="$event.target.focus()" maxlength="40" class="block px-2 bg-transparent border-b-2 border-white outline-none focus-within:bg-white focus-within:bg-opacity-10" type="text">
                <div v-else @click="editingSessionName = ind" class="flex gap-2 items-center w-max cursor-text group">
                    <h3 class="text-xl font-bold">{{ deviceNames(session.session_data, session.session_index) }}</h3>
                    <img src="@/images/edit.svg" class="w-3 opacity-0 transition-opacity group-hover:opacity-100" alt="">
                </div>

                <span v-if="session.session_index != currentSession" :title="`${getLoginDate(session.last_login).toLocaleDateString()} ${getLoginDate(session.last_login).toLocaleTimeString()}`" class="text-white text-opacity-40 cursor-help">{{ $t('settingsMenu.lastLogin') }}: {{ prettyDate((Date.now() - getLoginDate(session.last_login))/1000) }}</span>
                <span v-else class="text-white text-opacity-80">{{ $t('settingsMenu.thisDevice') }}</span>
            </div>
            <!-- <button v-if="session.session_index != currentSession" @click="logoutDevice(session.session_index, ind)" class="p-2 bg-red-400 rounded-md button">
                <img src="@/images/logout.svg" alt="" class="w-5 invert">
            </button> -->
        </div>
    </section>
</template>