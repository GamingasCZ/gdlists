<script setup lang="ts">
import { prettyDate } from '@/Editor';
import axios from 'axios';
import { ref } from 'vue';


const currentSession = ref(-1)
const base = import.meta.env.BASE_URL
const error = ref(false)
const SESSIONS = ref<Session[]>([])
type os = 'Linux' | 'Mac OS'  |'Windows' | 'Android' | 'iPhone' 

interface Session {
    session_data: {dev: os, mobile: boolean, browser: string}
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

const deviceNames = (ind: number) => {

}

</script>

<template>
    <section class="flex flex-col overflow-y-auto gap-2 p-2 bg-[url(@/images/fade.webp)] bg-repeat-x">
        <div v-for="(session, ind) in SESSIONS" :class="{'border-l-4 border-lof-400': currentSession == ind}" class="flex gap-2 items-center p-2 bg-black bg-opacity-40 rounded-md">
            <img class="w-14 opacity-40" :src="base + `/deviceIcons/${session.session_data.mobile ? 'mobile' : 'desktop'}.svg`" alt="">
            <div class="grow">
                <h3 class="text-xl font-bold">{{ session.session_data.browser }} ({{ session.session_data.dev }})</h3>
                <span class="text-white text-opacity-40">Použito: {{ prettyDate(session.last_login/1000) }}</span>
            </div>
            <button v-if="session.session_index != currentSession" @click="logoutDevice(session.session_index, ind)" class="p-1 bg-red-500 rounded-md">
                <img src="@/images/logout.svg" alt="" class="w-6">
            </button>
        </div>
    </section>
</template>