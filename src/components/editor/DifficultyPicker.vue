<script setup lang="ts">

defineProps({
    selectedFace: Number,
    selectedRate: Number
})

const emit = defineEmits(['changeRate', 'changeFace'])

</script>

<template>
    <section class="flex justify-between">
        <div class="box-border flex overflow-x-auto gap-3 items-center flex-grow-[1]">
            <button v-for="diff in 12" :key="diff" type="button" class="p-1 w-12 bg-opacity-40 rounded-md button aspect-square" @click="emit('changeFace', diff-1)" :class="{'bg-black': diff-1 == selectedFace}">
                <img :src="'/src/images/faces/'+(diff-1)+'.webp'">
            </button>
        </div>
        <div class="box-border grid grid-cols-2 gap-1 p-2 bg-black bg-opacity-20 rounded-md">
            <button type="button" class="p-1 w-10 bg-black bg-opacity-20 rounded-md aspect-square" v-for="(rate, index) in ['error', 'star', 'faces/featured', 'faces/epic']" @click="emit('changeRate', index)">
                <img class="button" :src="'/src/images/'+rate+'.webp'" :class="{disabled: index != selectedRate}">
            </button>
        </div>
    </section>
</template>