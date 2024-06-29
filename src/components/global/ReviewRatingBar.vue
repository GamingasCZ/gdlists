<script setup lang="ts">
const props = defineProps<{ 
	rate: any;
}>()

let likes = parseInt(props.rate*100)
</script>

<template>
	<div class="flex gap-2 items-center px-1 mx-3 h-4 text-sm grow">
        <div v-show="rate != -1" class="flex w-full h-1.5 overflow-clip bg-black bg-opacity-40 rounded-full grow">
            <div class="h-full bg-lof-400" :style="{width: `${likes}%`}"></div>
            <div class="h-full invert bg-lof-400 grow"></div>
        </div>
        <span v-show="parseInt(rate) != -1">{{ likes }}%</span>
    </div>
</template>
