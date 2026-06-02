<script setup lang="ts">
import type { TitleData } from '@/interfaces';
import PostTitle from '../levelViewer/PostTitle.vue';
import Option from '../ui/Option.vue';
import { computed, onMounted, ref, watch } from 'vue';
import ColorPicker from '../global/ColorPicker.vue';

const themePath = import.meta.env.BASE_URL+"/titleThemes"
const themeCount = 4

const props = defineProps<{
    name: string
    tagline: string
    font: number
    data?: TitleData
}>()

// scaling preview text
const elA = ref<HTMLDivElement>()
const elB = ref<HTMLDivElement>()
const scale = ref(1)
onMounted(() => {
    scale.value = elA.value?.clientWidth/elB.value?.clientWidth ?? 1
})

const themeColors = [
    2, 1, 1, 1
]
const colorCount = () => {
    let colors: {[setting: string]: any} = {}
    colors.theme = themeColors[props.data?.theme]
    if (props.data?.outline) colors.outline = 1
    if (props.data?.shadow > 0) colors.shadow = 1

    return colors
}
const getEditableColors = computed(colorCount)
const generateColorArray = () => {
    if (!props.data) return

    let cols = colorCount()
    for (const col in cols) {
        if (props.data.colors[1]?.[col] && props.data.colors[1][col].length == cols[col]) continue
        cols[col] = Array(cols[col]).fill([140, 32, 3]);
    }
    
    if (!props.data.colors[1].length)
        props.data.colors[1] = cols
    else {
        for (const col in cols)
            props.data.colors[1][col] = cols[col]
    }
}

watch(getEditableColors, generateColorArray, {deep: true})

const colorPickerOpen = ref<(-1 | [string, number])>(-1)
const base = import.meta.env.BASE_URL
generateColorArray(true)

const deb = (newCols: any) => {
    props.data.colors[1][colorPickerOpen[0]][colorPickerOpen[1]] = newCols
}

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
                {{ data?.colors[1] }}
                <div v-if="colorPickerOpen != -1" class="p-2">
                    <ColorPicker
                        @colors-modified="deb($event)"
                        :hue="data.colors[1][colorPickerOpen[0]][colorPickerOpen[1]][0]"
                        :lightness="data.colors[1][colorPickerOpen[0]][colorPickerOpen[1]][2]"
                    />
                    <button @click="colorPickerOpen = -1" class="flex gap-2 p-2 ml-auto bg-black rounded-md button"><img src="@/images/checkThick.svg" class="w-4" alt="">{{ $t('other.accept') }}</button>
                </div>
                <div v-else class="flex gap-2 items-center">
                    <div class="flex flex-col gap-2 items-center p-2 m-2 w-max bg-black bg-opacity-40 rounded-md">
                        <input v-model="data.colors[0]" type="checkbox" id="teAutoColor">
                        <label for="teAutoColor">Automaticky</label>
                    </div>

                    <template v-for="(colAmount, colKey, ind) in getEditableColors">
                        <button
                            v-for="colIndex in colAmount"
                            class="flex justify-center items-center w-10 h-10 rounded-md border-4 border-white border-solid button focus-visible:!outline focus-visible:!outline-current"
                            :class="{'disabled': data.colors[0]}"
                            :disabled="data.colors[0]"
                            :style="{backgroundColor: `hsl(${data?.colors[1][colKey][colIndex-1][0]}, ${data?.colors[1][colKey][colIndex-1][1]*100}%, ${data?.colors[1][colKey][colIndex-1][2]}%)`}"
                            @click="colorPickerOpen = [colKey, colIndex-1]"
                        >
                            <img :src="`${base}/titleThemes/${colKey}.svg`" class="w-6" alt="">
                        </button>
                    </template>
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