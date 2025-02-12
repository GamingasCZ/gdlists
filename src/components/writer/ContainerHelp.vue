<script setup lang="ts">
import { ref } from 'vue';


defineProps<{
    icon: string
    helpContent: string
    unclickable?: boolean
}>()

const BASE_URL = import.meta.env.BASE_URL
const main = ref<HTMLButtonElement>()
const focus = () => main.value?.focus()


</script>

<template>
<button @vue:mounted="focus()" :disabled="unclickable" ref="main" class="m-2 focus-within:bg-lof-300 transition-colors duration-100 font-[poppins] text-white w-full max-w-96 flex flex-col items-center p-2 text-xl text-center rounded-md bg-lof-100">
        <div>
            <div>
                <img :src="`${BASE_URL}/formatting/${icon}.svg`" class="p-2 mx-auto w-24 max-w-[50%] opacity-10" alt="">
                <h2 class="overflow-ellipsis">{{ helpContent }}</h2>
                <slot></slot>
            </div>
        </div>
    </button>
</template>