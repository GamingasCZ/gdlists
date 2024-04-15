<script setup lang="ts">
import { shortenYTLink } from '@/Editor';
import { onMounted, ref, watch } from 'vue';
import ContainerHelp from './ContainerHelp.vue';


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
    <div class="my-1 overflow-clip min-h-20">
        <ContainerHelp v-if="videoLoading != 0" icon="addVideo" :help-content="videoLoading == -1 ? 'Nepodařilo se načíst video!' : 'Kliknutím nastav video.'"></ContainerHelp>
        <figure v-else>
            <iframe
                width="560" height="315"
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