<script setup lang="ts">
import { levelList } from '@/Editor';
import { onMounted, ref } from 'vue';
import LevelCard from '../global/LevelCard.vue';
import type { Level } from '@/interfaces';


const emit = defineEmits<{
    (e: 'openSettings'): void
}>()

defineProps<{
    settings: object
}>()

const levelData = ref<Level | null>(null)
const pickedIndex = ref(0)

const BASE_URL = import.meta.env.BASE_URL
</script>

<template>
    <div class="p-1">
        <div v-if="levelData == null" class="mx-auto my-1 w-[30rem] max-w-full flex flex-col items-center p-2 text-xl text-center rounded-md bg-lof-300">
            <div>
                <img :src="`${BASE_URL}/formatting/showLevel.svg`" class="p-2 mx-auto w-24 opacity-10" alt="">
                <div v-if="levelList.levels.length > 0">
                    <h2>Vyber level, který chceš zobrazit.</h2>
                    <form target="." class="flex gap-1 justify-center w-full" @submit.prevent="levelData = levelList.levels[pickedIndex]">
                        <select v-model="pickedIndex" class="p-2 bg-white bg-opacity-10 rounded-md">
                            <option :value="index" v-for="(level, index) in levelList.levels">{{ level.levelName || $t('other.unnamesd') }}</option>
                        </select>
                        <button type="submit" class="p-1 w-10 rounded-md bg-lof-400">
                             <img class="mx-auto mt-1 w-6" src="@/images/check.svg" alt="">
                        </button>
                    </form>
                </div>
                <div v-else>
                    <h2>Zatím jsi nepřidal žádné levely!</h2>
                </div>
            </div>
        </div>
        <figure class="mx-auto w-max" v-else>
            <LevelCard v-bind="levelData" :disable-stars="true" />
            <figcaption>{{ settings.description }}</figcaption>
        </figure>
    </div>
</template>