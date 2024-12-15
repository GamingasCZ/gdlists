<script setup lang="ts">
import { computed, ref } from 'vue';

const emit = defineEmits<{
    (e: "pushed"): void
}>()

defineProps<{
    text: string
}>()

const fill = ref(101)
var timer = -1
const startHold = () => {
    if (timer != -1) return
    fill.value = 90
    timer = setInterval(() => {
        fill.value -= 0.2
        if (fill.value <= 0) {
            endHold()
            emit('pushed')
        }
    }, 5);
}
const endHold = () => {
    clearInterval(timer)
    timer = -1
    fill.value = 101
}

const fillPerc = computed(() => Math.round(fill.value))

</script>

<template>
    <button @mousedown="startHold" @mouseleave="endHold" @mouseup="endHold" class="relative px-2 py-1 font-bold overflow-clip rounded-md border-2 border-red-400 button">
        <span class="relative z-10">{{ text }}</span>
        <Transition name="fade">
            <div v-show="fill != 101" class="absolute top-0 bottom-0 left-0 z-0 bg-[#14b7b7]" :style="{right: `${fillPerc}%`}"></div>
        </Transition>
        <Transition name="fade">
            <div v-show="fill != 101" class="absolute top-0 bottom-0 left-0 z-20 bg-transparent backdrop-invert" :style="{right: `${fillPerc}%`}"></div>
        </Transition>
    </button>
</template>