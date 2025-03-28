<script setup lang="ts">
const base = import.meta.env.BASE_URL

const model = defineModel<[boolean, boolean, boolean]>({get(m) {
    m[0] = m[1] || m[2]
    return m
}})
</script>

<template>
    <div class="flex">
        <label class="flex gap-2 items-center py-2 pl-2 bg-black bg-opacity-40 rounded-b-md grow">
            <img :src="`${base}/faces/4.webp`" class="w-6 h-6" alt="">
            <span>{{ $t('reviews.difficulty') }}</span>
            <input v-model="model[1]" type="checkbox" class="ml-auto">
        </label>
        <label class="flex gap-2 items-center py-2 pl-2 bg-black bg-opacity-40 border-l-2 border-white border-opacity-10 grow">
            <img src="@/images/star.svg" class="w-5 h-5" alt="">
            <span>{{ $t('editor.rating') }}</span>
            <input v-model="model[2]" type="checkbox" class="ml-auto">
        </label>
    </div>
</template>