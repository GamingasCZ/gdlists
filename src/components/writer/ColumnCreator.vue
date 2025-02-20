<script setup lang="ts">
import { inject, ref } from 'vue';
import ColumnPreview from './ColumnPreview.vue';

interface ColumnDetails {
    amount: number
    type: 'fill' | 'fit'
    align: 0|1|2|3
}

const emit = defineEmits<{
    (e: "close"): void
}>()

const add = inject("addContainer")

const create = () => {
    add("twoColumns")
}

const highlightedCreateColumns = ref(0)

</script>

<template>
    <section class="p-4 text-center text-white min-w-64">
        <ColumnPreview @click="create" v-model="highlightedCreateColumns" :col-amount="10" />
        <p v-show="highlightedCreateColumns == -1" class="mt-2 text-lg text-white text-opacity-40">Vyber počet sloupců</p>
        <p v-show="highlightedCreateColumns == 1" class="mt-2 text-lg text-white text-opacity-40">Vyber více než jeden</p>
        <p v-show="highlightedCreateColumns > 1" class="mt-2 text-lg text-white">{{ highlightedCreateColumns }} sloupců</p>
    </section>
</template>