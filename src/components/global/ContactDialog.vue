<script setup lang="ts">
const emit = defineEmits(['closePopup'])

</script>

<template>
    <div class="flex flex-col gap-2 p-2">
        <div class="flex gap-3 items-center">
            <img src="@/images/ggprof.webp" class="w-12 rounded-full" alt="">
            <h2 class="text-xl">GamingasCZ</h2>
        </div>
        <div class="flex gap-6 p-3 bg-black bg-opacity-40 rounded-md">
            <img src="@/images/discord.svg" class="w-8" alt="">
            <span>@g4mingaz</span>
        </div>
        <div class="flex gap-6 p-3 bg-black bg-opacity-40 rounded-md">
            <img src="@/images/socials/bluesky.svg" class="mr-1 w-7" alt="">
            <span>@gamingas.cz</span>
        </div>
        <div class="flex gap-6 p-3 underline bg-black bg-opacity-40 rounded-md">
            <img src="@/images/mail.svg" class="w-8" alt="">
            <a href="mailto:me@gamingas.cz">me@gamingas.cz</a>
        </div>
        <hr class="my-2 rounded-full border-2 opacity-10">
        <a href="https://github.com/GamingasCZ/gdlists/issues/new" target="_blank">
            <div class="flex gap-6 p-3 bg-black bg-opacity-40 rounded-md hover:bg-opacity-60">
                <img src="@/images/editorMobHeader.svg" class="mr-1 w-7" alt="">
                <span>{{ $t('other.reportBug') }}</span>
            </div>
        </a>
    </div>
</template>
