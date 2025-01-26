<script setup lang="ts">

defineProps<{
    icon: string
    helpContent: string
}>()

const BASE_URL = import.meta.env.BASE_URL

</script>

<template>
    <button class="my-1 font-[poppins] text-white w-full max-w-96 flex flex-col items-center p-2 text-xl text-center rounded-md bg-lof-300">
        <div>
            <div>
                <img :src="`${BASE_URL}/formatting/${icon}.svg`" class="p-2 mx-auto w-24 max-w-[50%] opacity-10" alt="">
                <h2 class="overflow-ellipsis">{{ helpContent }}</h2>
                <slot></slot>
            </div>
        </div>
    </button>
</template>