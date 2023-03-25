<script setup lang="ts">
import LoginButton from './LoginButton.vue'
</script>

<template>
  <div class="fixed right-2 top-12 flex flex-col gap-3 rounded-md bg-greenGradient p-2 text-white">
    <LoginButton class="w-full" />

    <section
      class="flex w-36 flex-col items-center justify-center gap-1 rounded-md bg-black bg-opacity-50 py-2"
    >
      {{ $t('settingsMenu.scrolling') }}
      <select name="paging" class="rounded-md bg-lof-300 px-2">
        <option>{{ $t('settingsMenu.infinite') }}</option>
        <option>{{ $t('settingsMenu.pages') }}</option>
      </select>
    </section>

    <section
      class="flex w-36 flex-col items-center justify-center gap-1 rounded-md bg-black bg-opacity-50 py-2"
    >
      {{ $t('settingsMenu.language') }}
      <select name="lang" class="rounded-md bg-lof-300 px-2">
        <option>{{ $t('settingsMenu.czech') }}</option>
        <option>{{ $t('settingsMenu.english') }}</option>
      </select>
    </section>
  </div>
</template>
