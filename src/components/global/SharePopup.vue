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
    <h4 class="ml-2 font-bold leading-3">{{ $t('other.link') }}:</h4>
    <div class="flex gap-2 m-2">
      <input
        readonly
        @mouseover="($event.target as HTMLInputElement).select()"
        type="text"
        :value="shareText"
        class="p-2 w-full bg-black bg-opacity-40 rounded-md outline-none grow"
      />
      <button
          @click="copyLink"
          class="p-2 bg-black bg-opacity-40 rounded-md aspect-square button"
        >
          <img
            class="mx-auto w-5"
            src="@/images/link.svg"
            alt=""
          />
        </button>
    </div>

    <h4 class="mt-5 ml-2 font-bold leading-3">{{ $t('other.shareOn') }}:</h4>
    <div class="grid grid-cols-3 gap-2 p-2">
      <a target="_blank" :href="links[0]">
        <button
          class="p-2 w-full leading-3 text-left bg-black bg-opacity-40 rounded-md button"
        >
          <img
            class="inline mr-2 h-5"
            src="@/images/socials/reddit.svg"
            alt=""
          />Reddit
        </button>
      </a>
      <a target="_blank" :href="links[2]">
        <button
          class="p-2 w-full leading-3 text-left bg-black bg-opacity-40 rounded-md button"
        >
          <img
            class="inline mr-2 h-5"
            src="@/images/socials/bluesky.svg"
            alt=""
          />Bluesky
        </button>
      </a>
      <a target="_blank" :href="links[1]">
        <button
          class="p-2 w-full leading-3 text-left bg-black bg-opacity-40 rounded-md button"
        >
          <img
            class="inline mr-2 h-5"
            src="@/images/socials/twitter.svg"
            alt=""
          />Twitter
        </button>
      </a>
    </div>
</template>
