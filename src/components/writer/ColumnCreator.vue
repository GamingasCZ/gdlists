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

const add = inject("addContainer")

const create = (count: number, isMaxContent: boolean, align: string) => {
    add(`twoColumns`, [count, isMaxContent, align])
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
const highlightedAlign = ref(1)

const pickedColumns = ref(false)
const pickedMaxContent = ref(false)
const playing = ref([false,false])

const pickColAmount = (amount: number) => {
    if (amount < 2) return

    pickedColumns.value = true
}

</script>

<template>
    <section class="p-2 w-72 text-white">
        
        <div v-if="!pickedColumns">
            <h2 v-if="highlightedCreateColumns == -1" class="mb-2 text-2xl opacity-40">{{ $t('reviews.pickCols') }}</h2>
            <h2 v-else-if="highlightedCreateColumns <= 1" class="mb-2 text-2xl opacity-40">{{ $t('reviews.pickCols1') }}</h2>
            <h2 v-else class="mb-2 text-2xl opacity-80">{{ $t('reviews.colsSelected', highlightedCreateColumns) }}</h2>
            <button class="w-full overflow-clip rounded-lg bg-lof-100">
                <div class="p-2">
                    <ColumnPreview @click="pickColAmount(highlightedCreateColumns)" v-model="highlightedCreateColumns" :playing="false" :col-amount="10" />
                </div>
    
            </button>
        </div>
        
        <div v-if="pickedColumns">
            <h2 class="mb-2 text-2xl opacity-40">{{ $t('reviews.selColType') }}</h2>
            <button @mouseenter="playing[0] = true" @mouseleave="playing[0] = false" @mousedown.stop="() => create(highlightedCreateColumns, false, 'left')" class="w-full overflow-clip rounded-lg button bg-lof-100 border-lof-400">
                <div class="p-2">
                    <ColumnPreview :fixed-amount="highlightedCreateColumns" :playing="playing[0]" :col-amount="highlightedCreateColumns" />
                </div>
                <div class="px-2 pb-2 text-left border-t bg-lof-300 border-t-lof-400">
                    <h2 class="text-xl font-bold">{{ $t('reviews.cFillSpace') }}</h2>
                    <p class="text-sm leading-tight text-balance">{{ $t('reviews.colFillHelp') }}</p>
                </div>
            </button>
            
            <button @mouseenter="playing[1] = true" @mouseleave="playing[1] = false" @click="pickedMaxContent = true" class="mt-2 w-full overflow-clip rounded-lg bg-lof-100 border-lof-400">
                <div class="flex p-2" :style="{justifyContent: ['start', 'center', 'end', 'space-between'][highlightedAlign]}">
                    <ColumnPreview max-content :playing="playing[1]" :spread="highlightedAlign == 3" :fixed-amount="highlightedCreateColumns" :col-amount="highlightedCreateColumns" />
                </div>
                <div class="px-2 pb-2 text-left border-t bg-lof-300 border-t-lof-400">
                    <h2 :class="{'opacity-30': pickedMaxContent}" class="text-xl font-bold">{{ $t('reviews.cMaxContent') }}</h2>
                    <h2 v-if="pickedMaxContent" class="text-xl font-bold">{{ $t('reviews.colAlign') }}</h2>
                    <p v-else class="text-sm leading-tight text-balance">{{ $t('reviews.colMaxHelp') }}</p>
                    <div v-if="pickedMaxContent">
                        <button class="w-full overflow-clip">
                            <div class="px-2 text-left">
                                <div class="flex justify-evenly">
                                    <button @click="create(highlightedCreateColumns, true, ['left', 'center', 'right', 'justify'][ind])" class="p-2 rounded-md button hover:bg-black hover:bg-opacity-40" @mouseenter="highlightedAlign = ind" v-for="(align, ind) in ['Left', 'Center', 'Right', 'Justify']">
                                        <img :src="`${BASE}/formatting/align${align}.svg`" class="w-8" alt="">
                                    </button>
                                </div>
                                <p class="text-xl text-center" v-if="highlightedAlign > -1">{{ alignText[highlightedAlign] }}</p>
                            </div>
                        
                        </button>
                    </div>
                </div>
            
            </button>
        </div>
    </section>
</template>