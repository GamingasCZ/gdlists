<script setup lang="ts">
import { SETTINGS } from '@/siteSettings';
import THEMES, { saveTheme } from '@/themes';
import themes, { changeTheme } from '@/themes';
import { ref } from 'vue';
import { onBeforeRouteLeave, useRouter } from 'vue-router';

const emit = defineEmits(['close'])

const base = import.meta.env.BASE_URL

let currentThemeInUse = SETTINGS.value.selectedTheme
const selected = ref(currentThemeInUse)
const hoveringOver = ref('')

useRouter().beforeResolve(() => {
    changeTheme(currentThemeInUse)
    emit('close')
    return true
})

</script>

<template>
    <section class="flex fixed bottom-2 left-1/2 flex-col items-center p-2 w-full max-w-lg rounded-md -translate-x-1/2 shadow-drop bg-greenGradient">
        <p class="flex gap-3 items-center text-2xl text-center text-white"><span class="text-lg">Theme: </span><b class="transition-opacity" :class="{'opacity-60': hoveringOver}">{{ hoveringOver || THEMES[selected].name }}</b></p>
        <div class="flex gap-3 mt-2">
            <button @mouseenter="hoveringOver = theme.name" @mouseleave="hoveringOver = ''" @click="changeTheme(index); selected = index" v-for="(theme, index) in themes" class="overflow-clip rounded-full button" :class="{'border-4 border-lof-400': index == selected}">
                <img :src="`${base}/graphics/${theme.icon}.webp`" class="w-12 rounded-full" :class="{'border-2 border-black': selected == index}" alt="">
            </button>
        </div>
        <div class="flex justify-between mt-2 w-full">
            <button @click="changeTheme(currentThemeInUse); emit('close')" class="text-lof-400">{{ $t('other.cancel') }}</button>
            <button @click="saveTheme(); emit('close')" class="px-2 py-1 text-xl font-bold rounded-md bg-lof-400"><img src="@/images/check.svg" class="inline mr-2 w-4" alt="">{{ $t('other.use') }}</button>
        </div>
    </section>
</template>