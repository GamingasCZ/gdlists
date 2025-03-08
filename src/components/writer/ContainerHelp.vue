<script setup lang="ts">
import { ref } from 'vue';


defineProps<{
    icon: string
    helpContent: string
    unclickable?: boolean
}>()

const BASE_URL = import.meta.env.BASE_URL
const main = ref<HTMLButtonElement>()
const inner = ref<HTMLDivElement>()
const focus = () => {
    let slotEl = inner.value?.children?.[2]
    if (slotEl?.tagName == "FORM")
        slotEl?.[0].focus()
    else
        main.value?.focus()
}


</script>

<template>
<button @vue:mounted="$nextTick(focus)" :disabled="unclickable" ref="main" class="my-2 focus-within:bg-lof-300 transition-colors duration-100 font-[poppins] text-white w-full max-w-96 flex flex-col items-center p-2 text-xl text-center rounded-md bg-lof-100">
    <div>
        <div ref="inner">
            <img :src="`${BASE_URL}/formatting/${icon}.svg`" class="p-2 mx-auto w-24 max-w-[50%] opacity-10" alt="">
            <h2 class="overflow-ellipsis">{{ helpContent }}</h2>
            <slot></slot>
        </div>
    </div>
</button>
</template>