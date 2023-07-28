<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'


const props = defineProps<{
    percentage: number
    guesses: number[]
    bothModesEnabled: boolean
    listID: string
    listName: string
    listCreator: string
}>()

const emit = defineEmits<{
  (e: "replayList"): void;
}>();


let maxPoints = ref(((props.bothModesEnabled | 0) + 1) * props.guesses.length)
let points = ref(props.guesses.filter(x => x > 0).length * ((props.bothModesEnabled | 0) + 1))
let percentage = ref(Math.ceil(points.value/maxPoints.value*100))

let translation = [
    useI18n().t("other.by"),
    useI18n().t("listViewer.scoreBetter")
]
const shareResult = () => {
    let coolEmojiArray = props.guesses.map(num => {
        switch (num) {
            case 0: return '🟥'; break;
            case 2:
            case 3: return props.bothModesEnabled ? '🟨' : '🟩'; break;
            case 1: return '🟩'; break;
        }
    })

	let text = `${props.listName} ${translation[0]} ${props.listCreator}\n${coolEmojiArray.join("")} ${points.value}/${maxPoints.value}\n${translation[1]}\nhttps://gamingas.wz.cz/gdlists/s/${props.listID}`
    navigator.clipboard.writeText(text)
}

</script>

<template>
    <section class="w-[35rem] max-w-[95vw] flex flex-col gap-3 p-3 mx-auto rounded-lg bg-greenGradient">
        <h1 class="text-2xl text-center">{{ $t('listViewer.listFinished') }}</h1>
        <div class="relative mx-auto w-11/12 h-8 bg-black bg-opacity-40 rounded-full brightness-200" :style="{backgroundImage: `linear-gradient(90deg, var(--primaryColor) ${percentage}%, transparent ${percentage}%)`}">
            <span class="absolute top-1/2 left-1/2 text-xl -translate-x-1/2 -translate-y-1/2">{{ percentage }}%</span>
        </div>
        <table class="grid grid-cols-2 gap-3">
            <td><button class="px-2 py-1 w-full text-lg text-left bg-black bg-opacity-40 rounded-md button" @click="shareResult()"><img src="@/images/share.svg" alt="" class="inline mr-3 w-12">{{ $t('other.share') }}</button></td>
            <td><button class="px-2 py-1 w-full text-lg text-left bg-black bg-opacity-40 rounded-md button" @click="emit('replayList')"><img src="@/images/replay.svg" alt="" class="inline mr-3 w-12">{{ $t('listViewer.playAgain') }}</button></td>
        </table>
    </section>
</template>