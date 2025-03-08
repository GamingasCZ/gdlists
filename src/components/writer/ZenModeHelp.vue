<script setup lang="ts">
import { viewedPopups } from '@/siteSettings';

const emit = defineEmits<{
    (e: 'close'): void
}>()

const close = (e: KeyboardEvent | TouchEvent) => {
    if (e.type != 'touchstart') {
        if (e.code == "Space") return
        document.body.removeEventListener("keyup", close)
    }
    viewedPopups.zenModeHelp = true
    localStorage.setItem("popupsViewed", JSON.stringify(viewedPopups))
    emit('close')

}

document.body.addEventListener("keyup", close)
document.body.addEventListener("touchstart", close)

</script>

<template>
    <section class="flex flex-col items-center p-4">
        <img src="@/images/zen.svg" class="w-32 opacity-20" alt="">
        <h1 class="my-4 text-3xl font-bold opacity-80">{{ $t('reviews.zmHelp1') }}</h1>
        <ul class="w-full list-disc list-inside text-left opacity-80">
            <li>{{ $t('reviews.zmHelp2') }}</li>
            <li>{{ $t('reviews.zmHelp3') }}</li>
            <li v-html="$t('reviews.zmHelp4')"></li>
        </ul>
        <p class="mt-8 max-sm:hidden" v-html="$t('reviews.zmHelp5')"></p>
        <p class="mt-8 sm:hidden">{{ $t('reviews.zmHelp6') }}</p>
    </section>
</template>