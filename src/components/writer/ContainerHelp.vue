<script setup lang="ts">

defineProps<{
    icon: string
    helpContent: string
}>()

const BASE_URL = import.meta.env.BASE_URL

</script>

<template>
    <div class="my-1 w-[30rem] max-w-full flex flex-col items-center p-2 text-xl text-center rounded-md bg-lof-300">
        <div>
            <img :src="`${BASE_URL}/formatting/${icon}.svg`" class="p-2 mx-auto w-24 opacity-10" alt="">
            <div>
                <h2 class="overflow-ellipsis">{{ helpContent }}</h2>
                <slot></slot>
            </div>
        </div>
    </div>
</template>