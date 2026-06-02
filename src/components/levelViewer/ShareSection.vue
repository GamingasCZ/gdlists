<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { summonNotification } from "../imageUpload";
import { i18n } from "@/locales";
import Dropdown from "../ui/Dropdown.vue";

const props = defineProps<{
  shareText: string;
  review: boolean;
}>();

let text = `${useI18n().t('other.cringeAhhTextLmao')} - ${props.shareText}`;
let reviewText = `${useI18n().t('other.cringeAhhTextLmao2', [props.shareText])}`;
const links = ref<string[]>([
  `https://www.reddit.com/submit?url=${encodeURIComponent(props.review ? reviewText : text)}`,
  `https://bsky.app/intent/compose?text=${encodeURIComponent(props.review ? reviewText : text)}`,
  `https://twitter.com/intent/tweet?text=${encodeURIComponent(props.review ? reviewText : text)}`,
]);

const copyLink = () => {
  navigator.clipboard.writeText(props.shareText)
  summonNotification(i18n.global.t('other.linkCopied'), "", "check")
}

const copyExtLink = () => {
    let ext = "?ui="+extShareOpts.value.map(x => +x).join("")
    navigator.clipboard.writeText(props.shareText+ext)
    summonNotification(i18n.global.t('other.linkCopied'), "", "check")
    shareExtrasOpen.value = false
}

const shareExtrasOpen = ref(false)
const shareExtras = ref<HTMLButtonElement>()
const extShareOptions = [
    i18n.global.t('listViewer.hUi1', [i18n.global.t('listViewer.hUi2')]),
    i18n.global.t('listViewer.hUi1', [i18n.global.t('listViewer.hUi3')]),
    i18n.global.t('listViewer.hUi1', [i18n.global.t('listViewer.hUi4')]),
    i18n.global.t('listViewer.hUi1', [i18n.global.t('listViewer.hUi5')]),
]
const extShareOpts = ref(Array(extShareOptions.length).fill(false))

</script>

<template>
<section class="flex items-center gap-4 max-w-[58rem] my-4 mx-auto w-full">
    <span class="text-3xl font-bold" >{{ $t('other.share') }}</span>
    <hr class="w-full border opacity-20">
    <div class="flex gap-4 items-center min-w-max">
        <div class="flex gap-2 items-center p-1 rounded-md hover:bg-black hover:bg-opacity-40">
            <button @click="copyLink" class="button" :title="$t('other.copyLink')"><img class="h-6" src="@/images/link.svg" alt=""></button>
            <button @click="shareExtrasOpen = true" ref="shareExtras" class="px-1 button" :title="$t('other.copyLink')"><img class="w-2 rotate-180" src="@/images/genericRate.svg" alt=""></button>
            <Dropdown v-if="shareExtrasOpen" :button="shareExtras" @close="shareExtrasOpen = false">
                <template #header>
                    <div class="flex flex-col gap-2 p-2 text-white">
                        <div v-for="(opt, ind) in extShareOptions">
                            <input type="checkbox" v-model="extShareOpts[ind]" :id="`eOpt${ind}`">
                            <label :for="`eOpt${ind}`">{{ opt }}</label>
                        </div>
                        <button class="flex gap-2 px-2 py-1 mt-4 text-black rounded-md button bg-lof-400" @click="copyExtLink">
                            <img src="@/images/link.svg" class="w-4 invert" alt="">
                            {{ $t('other.copy') }}
                        </button>
                    </div>
                </template>
            </Dropdown>
        </div>
        <hr class="w-2 border opacity-20">
        <a target="_blank" :href="links[0]">
            <button class="button" title="Reddit"><img class="h-6" src="@/images/socials/reddit.svg" alt=""></button>
        </a>

        <a target="_blank" :href="links[1]">
            <button class="button" title="Bluesky"><img class="h-6" src="@/images/socials/bluesky.svg" alt=""></button>
        </a>

        <a target="_blank" :href="links[2]">
            <button class="button" title="Twitter"><img class="h-6" src="@/images/socials/twitter.svg" alt=""></button>
        </a>
    </div>
</section>
</template>