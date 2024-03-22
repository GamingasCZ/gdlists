<script setup lang="ts">
import { shortenYTLink } from '@/Editor';
import { onMounted, ref, watch } from 'vue';


const emit = defineEmits<{
    (e: 'openSettings'): void
}>()

const props = defineProps<{
    settings: object
}>()

watch(props, () => {
    videoLoading.value = 0
})

const videoLoading = ref(-2)

const BASE_URL = import.meta.env.BASE_URL
</script>

<template>
    <div class="mx-auto my-1 w-[30rem] max-w-full overflow-clip min-h-20">
        <button v-show="videoLoading != 0" @click="emit('openSettings')" class="flex flex-col items-center p-2 w-full text-xl text-center rounded-md bg-lof-300">
            <div v-if="videoLoading == -2">
                <img :src="`${BASE_URL}/formatting/addVideo.svg`" class="p-2 mx-auto w-24 opacity-10" alt="">
                <h2>Kliknutím nastav video.</h2>
            </div>
            <div v-if="videoLoading == -1">
                <img src="@/images/close.svg" class="p-2 mx-auto w-24 opacity-10" alt="">
                <h2>Nepodařilo se načíst video!</h2>
            </div>
        </button>
        <figure>
            <iframe
                v-show="videoLoading == 0" width="560" height="315"
                :src="`https://www.youtube-nocookie.com/embed/${shortenYTLink(settings.url)}`"
                title="YouTube video player" frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowfullscreen
                class="rounded-md"
                >
            </iframe>
            <figcaption>{{ settings.description }}</figcaption>
        </figure>
    </div>
</template>