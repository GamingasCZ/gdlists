<script setup lang="ts">
import { onMounted, ref } from 'vue';


const emit = defineEmits<{
    (e: 'openSettings'): void
}>()

defineProps<{
    settings: object
}>()

const image = ref<HTMLImageElement>()
const imageLoading = ref(-2)

onMounted(() => {
    image.value?.addEventListener("loadstart", () => imageLoading.value = 1)
    image.value?.addEventListener("load", () => imageLoading.value = 0)
    image.value?.addEventListener("error", () => imageLoading.value = -1)
})

const BASE_URL = import.meta.env.BASE_URL
</script>

<template>
    <div class="mx-auto my-1 w-[30rem] max-w-full overflow-clip min-h-20">
        <button v-show="imageLoading != 0" @click="emit('openSettings')" class="flex flex-col items-center p-2 w-full text-xl text-center rounded-md bg-lof-300">
            <div v-if="imageLoading == -2">
                <img :src="`${BASE_URL}/formatting/showImage.svg`" class="p-2 mx-auto w-24 opacity-10" alt="">
                <h2>{{ $t('reviews.clickImgSet') }}</h2>
            </div>
            <div v-if="imageLoading == 1">
                <img src="@/images/loading.webp" class="p-2 mx-auto w-24 opacity-10 animate-spin" alt="">
                <h2>{{ $t('other.loading') }}...</h2>
            </div>
            <div v-if="imageLoading == -1">
                <img src="@/images/close.svg" class="p-2 mx-auto w-24 opacity-10" alt="">
                <h2>{{ $t('reviews.imgError') }}</h2>
            </div>
        </button>
        <figure v-show="imageLoading == 0">
            <img
                ref="image"
                class="rounded-md"
                :src="settings.url"
                :alt="settings.alt"
                :title="settings.alt"
            >
            <figcaption>{{ settings.description }}</figcaption>
        </figure>
    </div>
</template>