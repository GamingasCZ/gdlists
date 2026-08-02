<script setup lang="ts">
const props = defineProps<{ 
	rate: any;
}>()

let likes = parseInt(props.rate*100)
</script>

<template>
	<div class="flex gap-2 items-center px-1 h-4 text-sm md:mx-3 grow">
        <div v-show="rate != -1" class="flex w-full h-1.5 overflow-clip bg-black bg-opacity-40 rounded-full grow">
            <div class="h-full bg-lof-400" :style="{width: `${likes}%`}"></div>
            <div class="h-full invert bg-lof-400 grow"></div>
        </div>
        <span class="left-1/2 px-1 bg-opacity-80 max-md:bg-black max-md:rounded-full max-md:-translate-x-1/2 max-md:absolute" v-show="parseInt(rate) != -1">{{ likes }}%</span>
    </div>
</template>
