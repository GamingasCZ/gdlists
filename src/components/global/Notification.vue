<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

const props = defineProps<{
    title: string
    content: string
    icon: string
    stamp: number
}>()

const getIcon = ref(props.icon)
switch (props.icon) {
    case 'save':
        import(`@/images/save.svg`).then(res => getIcon.value = res.default)
        break;
    case 'check':
        import(`@/images/checkThick.svg`).then(res => getIcon.value = res.default)
        break;
}

const shown = ref(false)
watch(props, () => { // todo rozbitý když měníš jazyk
    shown.value = true
    setTimeout(() => shown.value = false, 1500);
})

</script>

<template>
    <Transition name="slide">
        <article v-if="shown" class="flex items-center fixed right-0 bottom-5 p-2 rounded-md rounded-r-none shadow-lg z-50 min-w-[15em] gap-3 bg-lof-200 bg-opacity-50 shadow-black">
            <img :src="getIcon" class="box-border p-1 w-10 h-10 bg-black bg-opacity-40 rounded-md" alt="">
            <p class="leading-none text-white">
                <h2 class="font-bold">{{ title }}</h2>
                <p class="mt-1" v-if="content">{{ content }}</p>
            </p>
        </article>
    </Transition>
</template>

<style>

.slide-enter-active,
.slide-leave-active {
  transition: right 0.3s cubic-bezier(0.77, 0, 0.175, 1);
}

.slide-enter-from,
.slide-leave-to {
  right: -25rem;
}

</style>