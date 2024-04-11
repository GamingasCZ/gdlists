<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import LevelCard from '../global/LevelCard.vue';
import ContainerHelp from "./ContainerHelp.vue";
import type { Level } from '@/interfaces';
import { reviewData } from '@/Reviews';

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
        <ContainerHelp v-if="levelData == null" icon="showLevel" :help-content="reviewData.levels.length > 0 ? 'Vyber level, který chceš zobrazit.' : 'Zatím jsi nepřidal žádné levely!'">
            <form v-show="reviewData.levels.length > 0" target="." class="flex gap-1 justify-center w-full" @submit.prevent="levelData = reviewData.levels[pickedIndex]">
                <select v-model="pickedIndex" class="p-2 bg-white bg-opacity-10 rounded-md">
                    <option :value="index" v-for="(level, index) in reviewData.levels">{{ level.levelName || $t('other.unnamesd') }}</option>
                </select>
                <button type="submit" class="p-1 w-10 rounded-md bg-lof-400">
                        <img class="mx-auto mt-1 w-6" src="@/images/check.svg" alt="">
                </button>
            </form>
        </ContainerHelp>
        
        <figure class="p-2 w-max" v-else>
            <LevelCard v-bind="levelData" :disable-stars="true" />
            <figcaption class="mt-2">{{ settings.description }}</figcaption>
        </figure>
    </div>
</template>