<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { summonNotification } from "../imageUpload";
import { i18n } from "@/locales";

const props = defineProps<{
  shareText: string;
  review: boolean;
}>();

let text = `${useI18n().t('other.cringeAhhTextLmao')} - ${props.shareText}`;
let reviewText = `${useI18n().t('other.cringeAhhTextLmao2', [props.shareText])}`;
const links = ref<string[]>([
  `https://www.reddit.com/submit?url=${encodeURIComponent(props.review ? reviewText : text)}`,
  `https://twitter.com/intent/tweet?text=${encodeURIComponent(props.review ? reviewText : text)}`,
  `https://bsky.app/intent/compose?text=${encodeURIComponent(props.review ? reviewText : text)}`,
]);

const copyLink = () => {
  navigator.clipboard.writeText(props.shareText)
  summonNotification(i18n.global.t('other.linkCopied'), "", "check")
}

</script>

<template>
<section class="flex items-center gap-4 max-w-[58rem] my-4 mx-auto w-full">
    <span class="text-3xl font-bold" >{{ $t('other.share') }}</span>
    <hr class="w-full border opacity-20">
    <div class="flex gap-4 items-center min-w-max">
        <a>
            <button @click="copyLink" class="button" :title="$t('other.copyLink')"><img class="h-6" src="@/images/link.svg" alt=""></button>
        </a>
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