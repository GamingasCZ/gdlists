<script setup lang="ts">
import type { LocalNotification } from '@/interfaces';
import { onMounted, ref, watch } from 'vue'
import { Stack } from '../imageUpload';

const props = defineProps<LocalNotification & {stackIndex: number}>()

const getIcon = ref(props.icon)
switch (props.icon) {
    case 'save':
        import(`@/images/save.svg`).then(res => getIcon.value = res.default)
        break;
    case 'error':
        import(`@/images/close.svg`).then(res => getIcon.value = res.default)
        break;
    case 'check':
        import(`@/images/checkThick.svg`).then(res => getIcon.value = res.default)
        break;
}

const shown = ref(false)
onMounted(() => { // todo rozbitý když měníš jazyk
    shown.value = true
    setTimeout(() => {
        shown.value = false
        setTimeout(() => {
            delete Stack.value[props.stackIndex]
        }, 300);
    }, 2000 + props.text.length * 100);
})

</script>

<template>
    <Transition name="notifSlide">
        <article v-show="shown" class="flex z-10 max-w-xs items-center p-2 rounded-md rounded-r-none shadow-lg min-w-[15em] gap-3 bg-lof-300 bg-opacity-50 shadow-black">
            <img :src="getIcon" class="box-border p-1 w-10 h-10 bg-black bg-opacity-40 rounded-md" alt="">
            <p class="leading-none text-white">
                <h2 class="font-bold">{{ title }}</h2>
                <p class="mt-1" v-if="text">{{ text }}</p>
            </p>
        </article>
    </Transition>
</template>

<style>

.notifSlide-enter-active,
.notifSlide-leave-active {
  transition: transform 0.3s cubic-bezier(0.77, 0, 0.175, 1);
}

.notifSlide-enter-from,
.notifSlide-leave-to {
    @apply translate-x-full
}

</style>