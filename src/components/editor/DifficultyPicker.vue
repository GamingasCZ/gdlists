<script setup lang="ts">

defineProps({
    selectedFace: Number,
    selectedRate: Number
})

const emit = defineEmits(['changeRate', 'changeFace'])

</script>

<template>
    <section class="flex justify-between">
        <div class="flex items-center gap-3 overflow-x-auto box-border">
            <button v-for="diff in 12" :key="diff" type="button" class="button aspect-square bg-opacity-40 rounded-md w-12 p-1" @click="emit('changeFace', diff-1)" :class="{'bg-black': diff-1 == selectedFace}">
                <img :src="'/src/images/faces/'+(diff-1)+'.webp'">
            </button>
        </div>
        <div class="grid grid-cols-2 box-border gap-1 p-2 rounded-md bg-black bg-opacity-20">
            <button type="button" class="p-1 w-10 aspect-square bg-black bg-opacity-20 rounded-md" v-for="(rate, index) in ['error', 'star', 'faces/featured', 'faces/epic']" @click="emit('changeRate', index)">
                <img class="button" :src="'/src/images/'+rate+'.webp'" :class="{disabled: index != selectedRate}">
            </button>
        </div>
    </section>
</template>