<script setup lang="ts">
import { shortenYTLink } from '@/Editor';
import { onMounted, ref, watch } from 'vue';
import ContainerHelp from './ContainerHelp.vue';
import Resizer from '../global/Resizer.vue';
import containers, { type caddVideo } from './containers';


const emit = defineEmits<{
    (e: 'openSettings'): void
}>()

const props = defineProps<{
    settings: caddVideo
    editable: boolean
}>()

watch(() => props.settings.url, () => {
    if (shortenYTLink(props.settings.url))
        videoLoading.value = 0
})

const videoLoading = ref(-2)
if (props.settings.url) videoLoading.value = 0

const size = containers.addVideo.settings[1].valueRange

</script>

<template>
    <ContainerHelp v-if="videoLoading != 0" icon="addVideo" :help-content="videoLoading == -1 ? $t('reviews.loadVideoFail') : $t('reviews.setVideo')">
        <form @submit.prevent="">
            <input type="text" v-model="settings.url" class="p-1 bg-white bg-opacity-10 rounded-md" :placeholder="$t('reviews.ytLink')">
        </form>
    </ContainerHelp>
    <figure v-else class="text-inherit group">
        <Resizer :min-size="size[0]" :max-size="size[1]" class="h-max" gizmo-pos="corner" :editable="editable" @resize="settings.width = $event">
            <iframe
                :width="settings.height*1.77 || settings.width" :height="settings.height ? settings.height : settings.width/1.77"
                :src="`https://www.youtube-nocookie.com/embed/${shortenYTLink(settings.url, true)}`"
                title="YouTube video player" frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowfullscreen
                class="rounded-md"
                :class="{'max-w-full': !settings?.height}"
                >
            </iframe>
        </Resizer>
        <figcaption class="text-[90%] text-inherit">{{ settings.description }}</figcaption>
    </figure>
</template>