<script setup lang="ts">
import { SETTINGS, hasLocalStorage, viewedPopups } from '@/siteSettings';
import { ref } from 'vue';

const selected = ref(SETTINGS.value.levelViewMode)
const changeSelection = (ind: number) => {
    selected.value = ind
    SETTINGS.value.levelViewMode = ind
}

const confirm = () => {
    viewedPopups.pickedStyling = true
    shown.value = false
    localStorage.setItem("popupsViewed", JSON.stringify(viewedPopups))
}

const shown = ref(!viewedPopups.pickedStyling)
const base = import.meta.env.BASE_URL

</script>

<template>
    <section class="p-2 mx-auto text-center rounded-md w-[35rem] max-w-[95vw] bg-greenGradient" v-if="hasLocalStorage() && shown">
        <h2 class="text-2xl">{{ $t('listViewer.pickView1') }}</h2>
        <h3>{{ $t('listViewer.pickView2') }}</h3>
        <div class="flex gap-3 justify-center p-3 bg-black bg-opacity-40 rounded-md">
            <button class="flex flex-col p-2 bg-white bg-opacity-5 rounded-md hover:bg-opacity-10" @click="changeSelection(0)" :class="{'!bg-opacity-20': selected == 0}">
                <img class="w-24 opacity-60" :src="`${base}/viewModes/classic.svg`" alt="">{{ $t('settingsMenu.classic') }}
            </button>
            <button class="flex flex-col p-2 bg-white bg-opacity-5 rounded-md hover:bg-opacity-10" @click="changeSelection(1)" :class="{'!bg-opacity-20': selected == 1}">
                <img class="w-24 opacity-60" :src="`${base}/viewModes/compact.svg`" alt="">{{ $t('settingsMenu.compact') }}
            </button>
            <button class="flex flex-col p-2 bg-white bg-opacity-5 rounded-md hover:bg-opacity-10" @click="changeSelection(2)" :class="{'!bg-opacity-20': selected == 2}">
                <img class="w-24 opacity-60" :src="`${base}/viewModes/spreadsheet.svg`" alt="">{{ $t('settingsMenu.table') }}
            </button>
        </div>
        <button @click="confirm" class="flex gap-2 items-center p-1 px-2 mt-3 ml-auto text-xl font-bold text-black rounded-md bg-lof-400"><img src="../../images/check.svg" class="w-6 h-6" alt="">{{ $t('other.use') }}</button>
    </section>
</template>