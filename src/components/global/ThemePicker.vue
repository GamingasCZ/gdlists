<script setup lang="ts">
import { SETTINGS } from '@/siteSettings';
import THEMES, { checkSeasonalTheme, saveTheme, selectedBeforeSave } from '@/themes';
import themes, { changeTheme } from '@/themes';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const emit = defineEmits(['close'])

const base = import.meta.env.BASE_URL

let currentThemeInUse = SETTINGS.value.selectedTheme
const hoveringOver = ref('')

useRouter().beforeResolve(() => {
    changeTheme(currentThemeInUse)
    emit('close')
    return true
})

const isSeasonal = ref(checkSeasonalTheme() != -1)

</script>

<template>
    <section class="flex fixed bottom-2 left-1/2 flex-col items-center p-2 w-full max-w-lg rounded-md -translate-x-1/2 shadow-drop bg-greenGradient">
        <p class="flex gap-3 items-center text-2xl text-center text-white"><span class="text-lg">Theme: </span><b class="transition-opacity" :class="{'opacity-60': hoveringOver}">{{ hoveringOver || THEMES[selectedBeforeSave].name }}</b></p>
        <div class="flex gap-3 mt-2">
            <button :disabled="isSeasonal" @mouseenter="hoveringOver = theme.name" @mouseleave="hoveringOver = ''" @click="changeTheme(index); selectedBeforeSave = index" v-for="(theme, index) in themes" class="overflow-clip rounded-full disabled:opacity-40 button" :class="{'border-4 border-lof-400': index == selectedBeforeSave}">
                <img :src="`${base}/graphics/${theme.icon}.webp`" class="w-12 rounded-full" :class="{'border-2 border-black': selectedBeforeSave == index}" alt="">
            </button>
        </div>
        <div v-if="isSeasonal" class="flex flex-col mt-2 text-center text-lof-400">
            <span>{{ $t('settingsMenu.seasProgress') }}</span>
            <span class="text-xs">{{ $t('settingsMenu.seasProgressHelp') }}</span>
        </div>
        <div class="flex justify-between mt-2 w-full">
            <button @click="changeTheme(currentThemeInUse); emit('close')" class="text-lof-400">{{ $t('other.cancel') }}</button>
            <button @click="saveTheme(); emit('close')" class="px-2 py-1 text-xl font-bold rounded-md bg-lof-400"><img src="@/images/check.svg" class="inline mr-2 w-4" alt="">{{ $t('other.use') }}</button>
        </div>
    </section>
</template>