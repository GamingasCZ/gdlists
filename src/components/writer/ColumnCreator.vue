<script setup lang="ts">
import { inject, ref } from 'vue';
import ColumnPreview from './ColumnPreview.vue';
import { i18n } from '@/locales';

interface ColumnDetails {
    amount: number
    type: 'fill' | 'fit'
    align: 0|1|2|3
}

const emit = defineEmits<{
    (e: "close"): void
}>()

const add = inject("addContainer")!

const create = (count: number, widths: boolean[], align: string) => {
    add(`twoColumns`, [count, widths, align])
    emit('close')
}

const highlightedCreateColumns = ref(-1)
const BASE = import.meta.env.BASE_URL

const alignText = [
    i18n.global.t('reviews.left'),
    i18n.global.t('reviews.center'),
    i18n.global.t('reviews.right'),
    i18n.global.t('reviews.between'),
]
const highlightedAlign = ref(-1)

const pickedColumns = ref(false)
const pickedMaxContent = ref(false)
const playing = ref([false,false])

const pickColAmount = (amount: number) => {
    if (amount < 2) return
    colWidths.value = Array(amount).fill(false)

    pickedColumns.value = true
    highlightedAlign.value = -1
}

const colWidths = ref<boolean[]>([])

</script>

<template>
    <section class="p-2 w-80 text-white">
        
        <div v-if="!pickedColumns">
            <h2 v-if="highlightedCreateColumns == -1" class="mb-2 text-2xl opacity-40">{{ $t('reviews.pickCols') }}</h2>
            <h2 v-else-if="highlightedCreateColumns <= 1" class="mb-2 text-2xl opacity-40">{{ $t('reviews.pickCols1') }}</h2>
            <h2 v-else class="mb-2 text-2xl opacity-80">{{ $t('reviews.colsSelected', highlightedCreateColumns) }}</h2>
            <button class="w-full overflow-clip rounded-lg bg-lof-100">
                <div class="p-2">
                    <ColumnPreview @click="pickColAmount(highlightedCreateColumns)" v-model="highlightedCreateColumns" :playing="false" :col-amount="8" />
                </div>
            </button>
            <p class="relative py-2 pl-8 mt-4 text-sm bg-white bg-opacity-5 rounded-md text-balanced">
                <img src="@/images/info.svg" class="absolute top-2 left-2 w-4 opacity-50" alt="">
                {{ $t('reviews.colHelp') }}
            </p>
        </div>
        
        <div v-if="pickedColumns">
            <div class="mb-2 text-2xl">
                <button @click="pickedColumns = false"><img src="@/images/back.svg" class="mx-2 w-4 opacity-60 hover:opacity-100 button" alt=""></button>
                <span class="opacity-40">{{ $t('reviews.colWTitle') }}</span>
            </div>
            <div class="w-full overflow-clip rounded-lg bg-lof-100 border-lof-400">
                <div class="flex p-2" :class="{'justify-center': highlightedAlign == 1, 'justify-end': highlightedAlign == 2}">
                    <ColumnPreview clickable :shrink="highlightedAlign != -1 && highlightedAlign != 3" @changed-width="colWidths = $event" :spread="highlightedAlign == 3" :fixed-amount="highlightedCreateColumns" :col-amount="highlightedCreateColumns" />
                </div>
            </div>
            <p v-if="colWidths.includes(false)" class="pb-1 text-center">{{ $t('reviews.colClick') }}</p>
            <div v-else class="flex justify-between items-center px-2 text-left" @mouseleave="highlightedAlign = -1">
                <p class="text-lg text-center">{{ highlightedAlign > -1 ? alignText[highlightedAlign] : $t('other.alignment') }}</p>
                <div class="flex">
                    <button @click="create(highlightedCreateColumns, colWidths, ['left', 'center', 'right', 'justify'][ind])" class="p-1 mx-1 rounded-md button hover:bg-black hover:bg-opacity-40" @mouseenter="highlightedAlign = ind" v-for="(align, ind) in [$t('reviews.left'), $t('reviews.center'), $t('reviews.right'), $t('reviews.justify')]">
                        <img :src="`${BASE}/formatting/align${align}.svg`" class="w-5" alt="">
                    </button>
                </div>
            </div>

            <button @click="create(highlightedCreateColumns, colWidths, 'center')" class="flex gap-2 px-3 py-1 mx-auto mt-2 text-lg font-bold text-black rounded-md bg-lof-400 button">
                <img src="@/images/plus.svg" class="w-4 invert" alt="">
                {{ $t('other.add') }}
            </button>
            <div class="relative py-2 pr-2 pl-8 mt-8 text-sm bg-white bg-opacity-5 rounded-md text-balanced">
                <img src="@/images/info.svg" class="absolute top-2 left-2 w-4 opacity-50" alt="">
                <span v-html="$t('reviews.cHelp1')"></span>
                <table class="mt-2 w-full">
                    <tr>
                        <td class="p-1 border-2 border-white border-opacity-10">
                            <img src="@/images/formatting/alignLeft.svg" class="p-1 w-8 rounded-md opacity-20 bg-lof-300" alt="">
                        </td>
                        <td class="p-1 border-2 border-white border-opacity-10">
                            <img src="@/images/formatting/alignLeft.svg" class="p-1 w-8 rounded-md opacity-20 bg-lof-300" alt="">
                        </td>
                    </tr>
                </table>
                <span class="text-xs opacity-50">{{ $t('reviews.cHelp3') }}</span>

                <hr class="my-3 rounded-md border border-white opacity-5">

                <span id="underHelp" v-html="$t('reviews.cHelp2')"></span>
                <table class="mt-1 border-separate">
                    <tr>
                        <td class="p-1 border-2 border-lof-100">
                            <img src="@/images/image.svg" class="p-1 rounded-md opacity-40 min-w-8 bg-lof-300" alt="">
                        </td>
                        <td class="p-1 w-full border-2 border-white border-opacity-10">
                            <img src="@/images/formatting/alignLeft.svg" class="p-1 w-8 rounded-md opacity-20 bg-lof-300" alt="">
                        </td>
                        <td class="p-1 border-2 border-lof-100">
                            <img src="@/images/image.svg" class="p-1 rounded-md opacity-40 min-w-8 bg-lof-300" alt="">
                        </td>
                    </tr>
                </table>
                <span class="text-xs opacity-50">{{ $t('reviews.cHelp4') }}</span>
            </div>
        </div>
    </section>
</template>

<style>

#underrHelp b {
    text-decoration: underline 6px var(--siteBackground);
}
</style>