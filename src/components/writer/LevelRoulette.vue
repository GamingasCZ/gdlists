<script setup lang="ts">
import axios from 'axios';
import { random } from 'chroma-js';
import { computed, onMounted, ref } from 'vue';
import DifficultyIcon from '../global/DifficultyIcon.vue';
import { summonNotification } from '../imageUpload';
import type { Level } from '@/interfaces';
import { i18n } from '@/locales';


const scrolling = ref<HTMLDivElement>()
const cardWidth = ref(0)
const emit = defineEmits<{
    (e: "useLevel", level: Level): void
    (e: "exit"): void
}>()

let colorScroll = -1
const levelQueue = ref([])
const queuePos = ref(0)
const getLevelQueue = () => {
    axios.get(import.meta.env.VITE_API+"/getLists.php?randomLevel=5").then(res => {
        levelQueue.value = res.data[0]
    })
}

const isScrolling = ref(false)
const levelShowing = computed(() => levelQueue.value[queuePos.value] && !isScrolling.value)
const doScroll = async (force = false, by = 1) => {
    if (isScrolling.value || (levelShowing.value && !force)) return

    isScrolling.value = true
    scrolling.value.id = "carouselScroll"
    if (by < 0)
        scrolling.value?.classList.add("revAnim")

    if (queuePos.value == 4 || !levelQueue.value.length) {
        getLevelQueue()
        if (queuePos.value != 0)
            queuePos.value = 0
    }
    else {
        queuePos.value += by
    }

    colorScroll = setInterval(() => {
        cardColors.value.push(random().hex())
        cardColors.value.splice(0, 1)
    }, 100)

    setTimeout(() => {
        clearInterval(colorScroll)
        scrolling.value.id = "carouselScrollOut"
        setTimeout(() => {
            scrolling.value.id = ""
            isScrolling.value = false
            if (by < 0)
                scrolling.value?.classList.remove("revAnim")
        }, 300);
    }, 500);
}

onMounted(() => {
    cardWidth.value = scrolling.value?.parentElement?.clientWidth/3 - 8
    doScroll(true)
})

const copyLevelID = () => {
    summonNotification(i18n.global.t('other.lIDcopied'), "", "check")
    navigator.clipboard.writeText(levelQueue.value[queuePos.value].levelID)
}
const cardColors = ref([random().hex(), random().hex(), random().hex(), random().hex()])

const useLevel = () => {
    emit('useLevel', {
        levelName: levelQueue.value[queuePos.value].levelName,
        creator: levelQueue.value[queuePos.value].creator,
        difficulty: [levelQueue.value[queuePos.value].difficulty, levelQueue.value[queuePos.value].rating],
        levelID: levelQueue.value[queuePos.value].levelID,
        color: cardColors.value[queuePos.value],
    })
    emit('exit')
}

</script>

<template>
    <section class="relative w-full overflow-clip">
        <div ref="scrolling" class="flex gap-3 transition-opacity duration-150 levelRoulette">
            <div
                v-for="i in 4"
                @click="useLevel()"
                :style="{
                    minWidth: `${cardWidth-6}px`,
                    translate: `-${cardWidth}px`,
                    backgroundColor: cardColors[i-1]
                }"
                :class="{'!opacity-10': levelShowing && i != 3, '!opacity-50': levelShowing && i == 3}"
                class="h-40 bg-white rounded-lg opacity-40 transition-opacity duration-150">
            </div>
        </div>
        
        <Transition name="fade">
            <div v-if="levelShowing" class="justify-between max-md:flex">
                <button @click="emit('exit')" class="flex top-5 left-1/2 gap-3 items-center p-3 text-2xl rounded-md opacity-50 transition-colors md:translate-x-24 md:-translate-y-1/2 md:absolute hover:bg-white hover:bg-opacity-10">
                    <img src="@/images/close.svg" class="w-5 -scale-100" alt="">
                </button>

                <button v-if="queuePos > 0" @click="doScroll(true, -1)" class="flex left-8 top-1/2 gap-2 items-center p-3 text-2xl rounded-md opacity-50 transition-colors md:-translate-y-1/2 md:absolute hover:bg-white hover:bg-opacity-10">
                    <img src="@/images/play.svg" class="-scale-100" alt="">
                    {{ $t('other.previous') }}
                </button>

                <button @click="doScroll(true)" class="flex right-8 top-1/2 gap-2 items-center p-3 text-2xl rounded-md opacity-50 transition-colors md:-translate-y-1/2 md:absolute hover:bg-white hover:bg-opacity-10">
                    {{ $t('other.next') }}
                    <img src="@/images/play.svg" alt="">
                </button>
            </div>
        </Transition>
        
        <Transition name="fade">
            <button v-if="levelShowing" @click="useLevel()" class="flex absolute top-1/2 left-1/2 flex-col items-center -translate-x-1/2 -translate-y-1/2 max-md:pb-12 group">
                <DifficultyIcon class="w-16 pointer-events-none" :difficulty="levelQueue[queuePos].difficulty" :rating="levelQueue[queuePos].rating" />
                <h3 @click.stop="copyLevelID" class="text-2xl font-black leading-5 cursor-pointer group-hover:underline">{{ levelQueue[queuePos].levelName}}</h3>
                <p class="font-bold">{{ levelQueue[queuePos].creator }}</p>
            </button>
        </Transition>
    </section>
</template>

<style>

@keyframes scrollCar {
    from {
        @apply translate-x-[16.35rem]
    }
    to {
        @apply translate-x-0
    }
}
@keyframes scrollCarOut {
    from {
        @apply translate-x-[16.35rem]
    }
    to {
        @apply translate-x-0
    }
}

#carouselScroll {
    animation: scrollCar 0.1s linear;
    animation-iteration-count: 5;
}
#carouselScrollOut {
    animation: scrollCarOut 0.2s ease-out;
}

.revAnim {
    animation-direction: reverse !important;
}

.levelRoulette {
    mask: linear-gradient(90deg, transparent, black, transparent);
}

</style>