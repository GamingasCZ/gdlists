<script setup lang="ts">
import type { TitleData } from '@/interfaces';
import PostTitle from '../levelViewer/PostTitle.vue';
import Option from '../ui/Option.vue';
import { onMounted, ref } from 'vue';

const themePath = import.meta.env.BASE_URL+"/titleThemes"
const themeCount = 4

defineProps<{
    name: string
    tagline: string
    font: number
    data?: TitleData
}>()

const elA = ref<HTMLDivElement>()
const elB = ref<HTMLDivElement>()
const scale = ref(1)
onMounted(() => {
    scale.value = elA.value?.clientWidth/elB.value?.clientWidth ?? 1
})

</script>

<template>
    <section ref="elA">
        <div ref="elB" :style="{scale: scale}" class="flex origin-left w-[70rem] relative items-center p-2 mb-1 bg-lof-100 group min-h-48">
            <button class="flex absolute top-2 right-2 gap-2 items-center px-2 py-1 bg-black bg-opacity-60 rounded-full opacity-0 transition-opacity group-hover:opacity-100 max-md:hidden button">
                <img src="@/images/align.svg" class="w-5" alt="">
                Mobilní zobrazení
            </button>
            <button class="flex absolute right-2 top-12 gap-2 items-center px-2 py-1 bg-black bg-opacity-60 rounded-full opacity-0 transition-opacity group-hover:opacity-100 max-md:hidden button">
                <img src="@/images/view.svg" class="w-5" alt="">
                Zobrazit pozadí
            </button>
            <PostTitle :title-data="data" :tagline="tagline" :font="font" :text="name || $t('reviews.heading')" />
        </div>
        <section class="flex bg-[url(@/images/fade.svg)] bg-repeat-x overflow-scroll flex-col gap-2 p-2 max-h-[20rem]">
            <Option
                :name="'Motiv'"
                :desc="'Mění vzhled nadpisu.'"
                control="inline-slot"
                >
                <div class="flex gap-2 justify-center mr-2">
                    <button @click="data.theme = theme-1" class="p-1 bg-black bg-opacity-40 rounded-md" v-for="theme in themeCount">
                        <img class="w-10" :src="`${themePath}/${theme-1}.svg`" alt="">
                    </button>
                </div>
            </Option>
            <Option
                :name="'Zobrazit tagline'"
                :desc="'Vloží pod název tagline příspěvku.'"
                control="cbox"
                v-model="data.tagline"
                >
            </Option>
            <Option
                :name="'Barvy'"
                control="slot"
            >
                <div>
                    <div class="flex flex-col gap-2 items-center p-2 m-2 w-max bg-black bg-opacity-40 rounded-md">
                        <input type="checkbox" id="teAutoColor">
                        <label for="teAutoColor">Automaticky</label>
                    </div>
                </div>
            </Option>
            <div class="grid grid-cols-2 gap-2">
                <Option
                    :name="'Velikost'"
                    control="dropdown"
                    :control-options="[['Malá', 0], ['Normální', 1], ['Velká', 2]]"
                    v-model="data.size"
                    >
                </Option>
                <Option
                    :name="'Zarovnání'"
                    control="dropdown"
                    :control-options="[['Doleva', 0], ['Doprostřed', 1], ['Doprava', 2]]"
                    v-model="data.align"
                >
                </Option>
            </div>
            <div class="grid grid-cols-2 gap-2">
                <Option
                    :name="'Obrys'"
                    control="cbox"
                    class="grow"
                    v-model="data.outline"
                >
                </Option>
                <Option
                    :name="'Stín'"
                    control="dropdown"
                    :control-options="[['Žádný', 0], ['Rozmazaný', 1], ['Hrubý', 2]]"
                    class="grow"
                    v-model="data.shadow"
                >
                </Option>
            </div>
            <Option
                :name="'Následovat písmo recenze'"
                :desc="'Nadpis bude mít stejné písmo jako text recenze.'"
                control="cbox"
                v-model="data.followFont"
            >
            </Option>
    
        </section>
    </section>
</template>