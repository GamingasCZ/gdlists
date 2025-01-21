<script setup lang="ts">
import { inject } from 'vue';

const openDialogs = inject("openedDialogs")
const model = defineModel()

</script>

<template>
    <div class="relative mt-2">
        <textarea v-model="model" :placeholder="$t('reviews.descPlaceholder')" class="p-1 w-full h-28 bg-black bg-opacity-40 rounded-md resize-none placeholder:opacity-40">
        </textarea>
        <button @click="openDialogs.description = true" class="absolute right-1.5 bottom-2 bg-black bg-opacity-60 rounded-sm">
            <img src="@/images/fullscreen.svg" class="p-1 w-8" alt="">
        </button>
    </div>
</template>