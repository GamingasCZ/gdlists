<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  shareText: string;
  review: boolean;
}>();

let text = `${useI18n().t('other.cringeAhhTextLmao')} - ${props.shareText}`;
let reviewText = `${useI18n().t('other.cringeAhhTextLmao2', [props.shareText])}`;
const links = ref<string[]>([
  `https://www.reddit.com/submit?url=${encodeURIComponent(props.review ? reviewText : text)}`,
  `https://twitter.com/intent/tweet?text=${encodeURIComponent(props.review ? reviewText : text)}`,
]);
</script>

<template>
    <h4 class="ml-2 font-bold leading-3">{{ $t('other.link') }}:</h4>
    <div class="m-2">
      <input
        readonly
        @mouseover="($event.target as HTMLInputElement).select()"
        type="text"
        :value="shareText"
        class="p-1 px-2 mt-1 w-full bg-white bg-opacity-10 rounded-full outline-none"
      />
    </div>

    <h4 class="mt-5 ml-2 font-bold leading-3">{{ $t('other.shareOn') }}:</h4>
    <div class="grid grid-cols-2 gap-2 p-2 mt-2">
      <a target="_blank" :href="links[0]">
        <button
          class="px-2 py-1 w-full leading-3 text-left bg-white bg-opacity-10 rounded-full button"
        >
          <img
            class="inline mr-2 w-6"
            src="@/images/redditIcon.svg"
            alt=""
          />Reddit
        </button>
      </a>
      <a target="_blank" :href="links[1]">
        <button
          class="px-2 py-1 w-full leading-3 text-left bg-white bg-opacity-10 rounded-full button"
        >
          <img
            class="inline mr-2 w-6"
            src="@/images/twitterIcon.svg"
            alt=""
          />Twitter
        </button>
      </a>
    </div>
</template>
