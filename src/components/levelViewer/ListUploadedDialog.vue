<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { removeBackup} from '../../Editor'

const props = defineProps<{
    link: string
    isUpdating: boolean
    isReview: boolean
}>()
const emit = defineEmits(["closePopup", "doEdit"])

const closing = ref(false)
const copied = ref(false)
const closePopup = () => {
    closing.value = true
    setTimeout(() => {
        emit('closePopup')
    }, 100);
}
const copyLink = () => {
    navigator.clipboard.writeText(props.link)
    copied.value = true;
    setTimeout(() => copied.value = false, 500)
}

let text = `${useI18n().t('other.cringeAhhTextLmao')} - ${props.link}`;
let reviewText = `${useI18n().t('other.cringeAhhTextLmao2', [props.link])}`;
const links = [
  `https://www.reddit.com/submit?url=${encodeURIComponent(props.isReview ? reviewText : text)}`,
  `https://twitter.com/intent/tweet?text=${encodeURIComponent(props.isReview ? reviewText : text)}`,
  `https://bsky.app/intent/compose?text=${encodeURIComponent(props.isReview ? reviewText : text)}`,
];

const doShare = (ind: number) => window.open(links[ind], '_blank')

onMounted(() => {
    removeBackup()
})

const base = import.meta.env.BASE_URL

</script>

<template>
    <section @click.stop=""
        class="absolute top-1/2 left-1/2 flex max-h-[95vh] w-[25rem] max-w-[95vw] -translate-x-1/2 -translate-y-32 flex-col rounded-b-md bg-greenGradient p-2 text-white shadow-lg shadow-black">
        <div class="absolute left-0 -top-24 w-full h-24 bg-gradient-to-t to-transparent from-lof-300"></div>
        <img v-if="!isReview" class="absolute left-0 -top-44 z-10 w-96 cursor-default pointer-events-none ship" :src="`${base}/static/uploading.webp`" alt="" :id="!closing ? 'float' : ''" :class="{'-translate-y-full' : closing}">
        <img v-else class="absolute left-2 -top-44 z-10 w-96 cursor-default pointer-events-none ship" :src="`${base}/static/upload2.webp`" alt="" :id="!closing ? 'float' : ''" :class="{'-translate-y-full' : closing}">

        <h1 v-if="!isReview" class="mt-32 mb-5 text-3xl font-extrabold text-center">{{ $t('list.uploadFinished', [isUpdating ? $t('list.updated') : $t('list.uploaded')]) }}</h1>
        <h1 v-else class="mt-32 mb-5 text-3xl font-extrabold text-center">{{ $t('list.uploadFinished2', [isUpdating ? $t('list.updated2') : $t('list.uploaded2')]) }}</h1>

        <label>{{ $t('other.share') }}</label>
        <input type="text" class="p-1 text-lg bg-black bg-opacity-40 rounded-md outline-none" readonly @mouseover="$event.target?.select()" :value="link">
        <div class="flex gap-1 mt-1">
            <button @click="doShare(2)" class="py-1 text-white bg-black bg-opacity-40 rounded-md grow button"><img src="@/images/socials/bluesky.svg" alt="" class="inline mr-2 w-4">Bluesky</button>
            <button @click="doShare(1)" class="py-1 text-white bg-black bg-opacity-40 rounded-md grow button"><img src="@/images/socials/twitter.svg" alt="" class="inline mr-2 w-4">Twitter</button>
            <button @click="doShare(0)" class="py-1 text-white bg-black bg-opacity-40 rounded-md grow button"><img src="@/images/socials/reddit.svg" alt="" class="inline mr-2 w-4">Reddit</button>
            <button v-if="!copied" @click="copyLink()" class="p-1 text-white bg-black bg-opacity-40 rounded-md aspect-square button"><img src="@/images/link.svg" alt="" class="inline w-4"></button>
            <button v-else class="p-1 text-white bg-black bg-opacity-40 rounded-md aspect-square button"><img src="@/images/copy.svg" alt="" class="inline w-4 animate-ping"></button>
        </div>

        <div class="grid grid-cols-2 gap-2 mt-10">
            <button @click="emit('doEdit')" class="p-1 px-2 text-lg text-left text-white rounded-md border-4 border-black border-opacity-40 border-solid button"><img src="@/images/edit.svg" class="inline mr-2 w-6" alt="">{{ $t('level.edit') }}</button>
            <button @click="closePopup()" class="p-2 text-lg text-left text-white bg-black bg-opacity-40 rounded-md button"><img src="@/images/close.svg" class="inline mr-2 w-6" alt="">{{ $t('other.close') }}</button>
        </div>
    </section>
</template>

<style scoped>
@keyframes float {
    from { translate: 0 -1rem; }
    to { translate: 0 0rem; }
}

.ship {
    transition: transform 1s ease-out;
}
#float {animation: float 3s cubic-bezier(.46,.03,.52,.96) alternate infinite none;}

</style>