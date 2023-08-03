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

const resultMessage = [
    [ // 0 - 25%
        useI18n().t('listViewer.diffResult1'),
        useI18n().t('listViewer.diffResult2'),
        useI18n().t('listViewer.diffResult3'),
    ],
    [ // 26 - 50%
        useI18n().t('listViewer.diffResult4'),
        useI18n().t('listViewer.diffResult5'),
        useI18n().t('listViewer.diffResult6'),
    ],
    [ // 51 - 75%
        useI18n().t('listViewer.diffResult7'),
        useI18n().t('listViewer.diffResult8'),
        useI18n().t('listViewer.diffResult9'),
    ],
    [
        useI18n().t('listViewer.diffResult10'),// funi
    ],
    [ // 76 - 99%
        useI18n().t('listViewer.diffResult11'),
        useI18n().t('listViewer.diffResult12'),
        useI18n().t('listViewer.diffResult13'),
    ],
    [ // 100%
        useI18n().t('listViewer.diffResult14'),
        useI18n().t('listViewer.diffResult15'),
        useI18n().t('listViewer.diffResult16'),
    ]
]
const resultEmoji = [["12", "11", "04"], ["13", "05", "08"], ["06", "07", "18"], ["18"], ["15","14","02"],["17","09","10"]]

let maxPoints = ref(((props.bothModesEnabled | 0) + 1) * props.guesses.length)
let points = ref(0)
props.guesses.forEach(guess => {
    if (guess == 1) points.value += props.bothModesEnabled ? 2 : 1
    else if (guess > 0) points.value += 1
})
let percentage = ref(Math.ceil(points.value/maxPoints.value*100))


const resultMessagePick = ref([0,0])
if (percentage.value <= 25) resultMessagePick.value = [0, Math.floor(Math.random() * 3)]
else if (percentage.value <= 50) resultMessagePick.value = [1, Math.floor(Math.random() * 3)]
else if (percentage.value == 69) resultMessagePick.value = [3, 0]
else if (percentage.value <= 75) resultMessagePick.value = [2, Math.floor(Math.random() * 3)]
else if (percentage.value <= 99) resultMessagePick.value = [4, Math.floor(Math.random() * 3)]
else resultMessagePick.value = [5, Math.floor(Math.random() * 3)]

const resultEmojiPath = ref("")
const getEmoji = async () => await import(`../../images/emoji/${resultEmoji[resultMessagePick.value[0]][resultMessagePick.value[1]]}.webp`).then(res => resultEmojiPath.value = res.default)
getEmoji()

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
    copied.value = true
    setTimeout(() => copied.value = false, 500);
}

const replayList = () => {
    window.scrollTo({top: 0, behavior: 'instant'})
    emit('replayList')
}

const copied = ref(false)
const percentagePercantage = ref(`-${100-percentage.value}%`)
</script>

<template>
    <section class="w-[35rem] max-w-[95vw] mt-10 flex flex-col gap-3 p-3 mx-auto rounded-lg bg-greenGradient" id="guessResultDialog">
        <div class="absolute top-0 left-0 w-full h-full mix-blend-screen scale-110 -z-50 bg-lof-300" :style="{opacity: percentage/100}" id="rainbowGlow"></div>

        <div class="grid gap-2 items-center p-2 mx-auto mb-6 w-max max-w-full italic bg-black bg-opacity-40 rounded-md before:" style="grid-template-columns: max-content 1fr;">
            <img :src="resultEmojiPath" class="w-12 pointer-events-none" alt="">
            <span class="text-left">„{{ resultMessage[resultMessagePick[0]][resultMessagePick[1]] }}”</span>
        </div>
        <h1 class="text-2xl text-center">{{ $t('listViewer.listFinished') }}</h1>
        <div class="relative mx-auto w-11/12 h-8 overflow-clip bg-black bg-opacity-40 rounded-md brightness-200">
            <div class="w-full h-full bg-lof-300 guessResultBar"></div>
            <span class="absolute top-1/2 left-1/2 text-xl -translate-x-1/2 -translate-y-1/2">{{ percentage }}%</span>
        </div>
        <table class="grid grid-cols-2 gap-3 mx-auto w-11/12">
            <td v-if="!copied"><button class="px-2 py-1 w-full text-xl text-left bg-black bg-opacity-40 rounded-md button" @click="shareResult()"><img src="@/images/share.svg" alt="" class="box-border inline p-1 mr-3 w-10">{{ $t('other.share') }}</button></td>
            <td v-else><button class="px-2 py-1 w-full text-xl text-left bg-black bg-opacity-40 rounded-md button"><img src="@/images/copy.svg" alt="" class="box-border inline p-1 mr-3 w-10 animate-ping">{{ $t('other.copied') }}</button></td>
            <td><button class="px-2 py-1 w-full text-xl text-left bg-black bg-opacity-40 rounded-md button" @click="replayList()"><img src="@/images/replay.svg" alt="" class="box-border inline p-1 mr-3 w-10">{{ $t('listViewer.playAgain') }}</button></td>
        </table>
    </section>
</template>

<style scoped>
@keyframes scroll {
    from {transform: translateX(-100%);}
    to {transform: translateX(v-bind(percentagePercantage));}
}

@keyframes appear {
    from {
        opacity: 0;
        scale: 1.5;
        rotate: -30deg;
        translate: -8rem 2rem;
    }
    to {
        opacity: 1;
        scale: 1;
        rotate: 0deg;
        translate: none;
    }
}

@keyframes glow {
    from {filter: blur(40px) hue-rotate(0deg);}
    to {filter: blur(40px) hue-rotate(360deg);}
}

#rainbowGlow {
    animation: glow 5s linear infinite;
}

#guessResultDialog {
    animation: appear 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

.guessResultBar {
    animation: scroll 2s cubic-bezier(0.215, 0.610, 0.355, 1) forwards;
    animation-delay: 1s;
    transform: translateX(-100%);
}

</style>