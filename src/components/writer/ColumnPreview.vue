<script setup lang="ts">
import { ref, watch } from 'vue';


const props = defineProps<{
    colAmount: number
    fixedAmount?: number
    playing: boolean
    spread?: boolean
    shrink?: boolean
    clickable: boolean
}>()

const emit = defineEmits<{
    (e: "changedWidth", newArray: boolean[]): void
}>()

const hoveringAmount = defineModel({default: -1})

const animStep = ref(0)

watch(() => props.playing, () => {
    if (prevInterval != -1)
        clearInterval(prevInterval)
    animStep.value = 0

    if (props.playing)
        playPreview()
})


var prevInterval: any = -1
const playPreview = () => {
    animStep.value = 1
    prevInterval = setInterval(() => {
        animStep.value += 1
        if (animStep.value > props.colAmount)
        animStep.value = 0
    }, 1500);
}

if (props.playing)
    playPreview()

const maxAmount = ref(Array(props.colAmount).fill(false))

const click = (ind: number) => {
    if (props.clickable) {
        maxAmount.value[ind] = !maxAmount.value[ind]; emit('changedWidth', maxAmount.value)
    } 
}

</script>

<template>
    <table :class="{'w-full': !shrink}" @mouseout="hoveringAmount = -1">
        <tr class="flex" :class="{'justify-between': spread}">
            <td
                v-for="(i, ind) in Math.max(0, colAmount)"
                @mouseover="hoveringAmount = fixedAmount ?? i"
                @click="click(ind)"
                :class="{'!bg-lof-300 cursor-pointer': hoveringAmount >= i && !fixedAmount, 'grow': !maxAmount[ind], 'border-r-0': !spread}"
                class="px-2 h-8 border-2 transition-all duration-75 cursor-pointer hover:bg-lof-300 min-w-8 border-lof-400 last:border-r-2 first:rounded-l-md last:rounded-r-md"
            >
                <!-- <div v-if="animStep == i" class="h-3 gridEx bg-lof-300"></div> -->
            </td>
        </tr>
    </table>
</template>

<style>

@keyframes gridExample {
    0% {transform: scaleX(0);}
    50% {transform: scaleX(1);}
    100% {transform: scaleX(0);}
}

.gridEx {
    animation: gridExample 1.5s cubic-bezier(0.165, 0.84, 0.44, 1);
}

</style>