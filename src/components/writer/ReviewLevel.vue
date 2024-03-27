<script setup lang="ts">
import { levelList } from '@/Editor';
import { onMounted, ref, watch } from 'vue';
import LevelCard from '../global/LevelCard.vue';
import ContainerHelp from "./ContainerHelp.vue";
import type { Level } from '@/interfaces';


const emit = defineEmits<{
    (e: 'openSettings'): void
    (e: 'clearButton'): void
}>()

const props = defineProps<{
    settings: object
    buttonState: string
}>()

watch(props, () => {
    console.log(props)
    switch (props.buttonState) {
        case "pickLevel": levelData.value = null; break;
    }
    emit("clearButton")
})

const levelData = ref<Level | null>(null)
const pickedIndex = ref(0)

</script>

<template>
    <div class="w-max">
        <ContainerHelp v-if="levelData == null" icon="showLevel" :help-content="levelList.levels.length > 0 ? 'Vyber level, který chceš zobrazit.' : 'Zatím jsi nepřidal žádné levely!'">
            <form v-show="levelList.levels.length > 0" target="." class="flex gap-1 justify-center w-full" @submit.prevent="levelData = levelList.levels[pickedIndex]">
                <select v-model="pickedIndex" class="p-2 bg-white bg-opacity-10 rounded-md">
                    <option :value="index" v-for="(level, index) in levelList.levels">{{ level.levelName || $t('other.unnamesd') }}</option>
                </select>
                <button type="submit" class="p-1 w-10 rounded-md bg-lof-400">
                        <img class="mx-auto mt-1 w-6" src="@/images/check.svg" alt="">
                </button>
            </form>
        </ContainerHelp>
        
        <figure class="mx-auto w-max" v-else>
            <LevelCard v-bind="levelData" :disable-stars="true" />
            <figcaption>{{ settings.description }}</figcaption>
        </figure>
    </div>
</template>