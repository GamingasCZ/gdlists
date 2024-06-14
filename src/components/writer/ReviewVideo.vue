<script setup lang="ts">
import { shortenYTLink } from '@/Editor';
import { onMounted, ref, watch } from 'vue';
import ContainerHelp from './ContainerHelp.vue';
import Resizer from '../global/Resizer.vue';


const emit = defineEmits<{
    (e: 'openSettings'): void
}>()

const props = defineProps<{
    settings: object
    editable: boolean
}>()

watch(props, () => {
    videoLoading.value = 0
})

const videoLoading = ref(-2)
if (props.settings.url) videoLoading.value = 0
</script>

<template>
    <ContainerHelp v-if="videoLoading != 0" icon="addVideo" :help-content="videoLoading == -1 ? $t('reviews.loadVideoFail') : $t('reviews.setVideo')"></ContainerHelp>
    <figure v-else>
        <Resizer :min-size="104" :max-size="720" gizmo-pos="corner" :editable="editable" @resize="settings.width = $event">
            <iframe
                :width="settings.width" :height="settings.width/1.77"
                :src="`https://www.youtube-nocookie.com/embed/${shortenYTLink(settings.url)}`"
                title="YouTube video player" frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowfullscreen
                class="rounded-md"
                :style="{maxWidth: '100%'}"
                >
            </iframe>
        </Resizer>
        <figcaption>{{ settings.description }}</figcaption>
    </figure>
</template>