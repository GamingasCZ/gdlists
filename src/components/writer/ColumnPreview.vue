<script setup lang="ts">
import { ref, watch } from 'vue';


const props = defineProps<{
    colAmount: number
    fixedAmount?: number
    maxContent?: boolean
    playing: boolean
    spread?: boolean
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

</script>

<template>
    <table :class="{'w-full': !maxContent || spread}" class="border-collapse" @mouseout="hoveringAmount = -1">
        <tr :class="{'flex justify-between': spread}">
            <td
                v-for="i in Math.max(0, colAmount)"
                @mouseover="hoveringAmount = fixedAmount ?? i"
                :class="{'!bg-lof-300 cursor-pointer': hoveringAmount >= i && !fixedAmount}"
                class="px-2 h-8 border-2 min-w-4 border-lof-400 first:rounded-l-md last:rounded-r-md"
            >
                <div v-if="animStep == i" :class="{'w-8': maxContent}" class="h-3 gridEx bg-lof-300"></div>
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