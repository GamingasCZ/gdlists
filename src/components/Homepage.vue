<script setup lang="ts">
import ListSection from './homepage/ListSection.vue'
import LoginButton from './global/LoginButton.vue'
import ListPreview from './global/ListPreview.vue'

defineProps({
  isLoggedIn: Boolean
})
</script>

<template>
  <header
    class="flex h-[256px] items-end justify-center bg-[url(../images/introGrad2.webp)] bg-center"
  >
    <form action="/browse" method="get" class="flex translate-y-1/2 items-center gap-2 text-white">
      <input
        type="text"
        class="max-w-[70vw] rounded-md border-4 border-lof-300 bg-greenGradient py-2 px-1 outline-transparent placeholder:text-xl"
        :placeholder="$t('homepage.searchLists')"
      />
      <button type="submit">
        <img
          src="../images/searchOpaque.svg"
          alt=""
          class="button rounded-full bg-greenGradient p-2"
        />
      </button>
    </form>
  </header>
  <div class="flex justify-center gap-2 pt-8 text-base text-white">
    <button class="button flex items-center gap-4 rounded-md bg-lof-300 px-2 py-3">
      <img src="../images/plus.svg" alt="" class="w-6" />{{ $t('homepage.createList') }}
    </button>
    <button class="button flex items-center gap-4 rounded-md bg-lof-300 px-2 py-3 sm:mr-14">
      <img src="../images/dice.svg" alt="" class="w-6" />{{ $t('homepage.tryLuck') }}
    </button>
  </div>

  <section class="flex justify-center">
    <div
      v-if="!isLoggedIn"
      class="mx-4 mt-6 flex max-w-4xl items-center justify-center gap-3 rounded-md bg-greenGradient px-2 py-1 text-white"
    >
      <img src="../images/info.svg" alt="" class="w-6" />
      <div>
        <p class="max-sm:text-xs">{{ $t('homepage.welcomeToGDL') }}</p>
        <p class="max-md:hidden">{{ $t('homepage.connectDiscord') }}</p>
      </div>
      <LoginButton class="ml-auto" />
    </div>
  </section>

  <ListSection
    :header-name="$t('homepage.newest')"
    :extra-text="$t('homepage.more')"
    extra-icon="more"
    :empty-text="$t('homepage.listsUnavailable')"
  />

  <ListSection :header-name="$t('homepage.pinned')" :empty-text="$t('homepage.noListsPinned')" />

  <ListSection
    v-if="isLoggedIn"
    :header-name="$t('homepage.uploaded')"
    :extra-text="$t('homepage.more')"
    extra-icon="more"
    :empty-text="$t('homepage.noListsUploaded')"
  />

  <ListSection
    :header-name="$t('homepage.visited')"
    :extra-text="$t('homepage.clear')"
    extra-icon="close"
    :empty-text="$t('homepage.noListsVisited')"
  />

  <ListSection
    :header-name="$t('homepage.savedMix')"
    :extra-text="$t('homepage.more')"
    extra-icon="more"
    :empty-text="$t('homepage.noLevelsSaved')"
  />

  <ListSection
    :header-name="$t('homepage.official')"
    :empty-text="$t('homepage.listsNonexistent')"
  />
</template>
