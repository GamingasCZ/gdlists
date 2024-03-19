<script setup lang="ts">

const emit = defineEmits(['closePopup'])
</script>

<template>
  <section @click.stop=""
    class="absolute flex flex-col top-1/2 left-1/2 max-h-[95svh] w-[20rem] max-w-[95vw] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-greenGradient text-white shadow-lg shadow-black">
    <div class="relative">
      <h1 class="mt-2 text-xl font-bold text-center">{{ $t('other.contact') }}</h1>
      <img src="@/images/close.svg" alt="" class="absolute top-2 right-2 w-6 button" @click="emit('closePopup')" />
    </div>
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
            <img src="@/images/socials/twitter.svg" class="mr-1 w-7" alt="">
            <span>@g4mingaz</span>
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
  </section>
</template>
