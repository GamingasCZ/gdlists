<script setup lang="ts">
import ListSection from './homepage/ListSection.vue'
import LoginButton from './global/LoginButton.vue'

defineProps({
  isLoggedIn: Boolean
})
</script>

<template>
  <header
    class="flex h-[256px] items-end justify-center bg-[url(../images/introGrad2.webp)] bg-center"
  >
    <form action="./browse" method="get" class="flex gap-2 items-center text-white translate-y-1/2">
      <input
        type="text"
        name="q"
        class="max-w-[70vw] rounded-md border-4 border-lof-300 bg-greenGradient py-2 px-1 outline-transparent placeholder:text-xl"
        :placeholder="$t('homepage.searchLists')"
      />
      <button type="submit">
        <img
          src="../images/searchOpaque.svg"
          alt=""
          class="p-2 rounded-full button bg-greenGradient"
        />
      </button>
    </form>
  </header>
  <div class="flex gap-2 justify-center pt-8 text-base text-white">
    <RouterLink to="/editor">
      <button class="flex gap-4 items-center px-2 py-3 rounded-md button bg-lof-300">
        <img src="../images/plus.svg" alt="" class="w-6" />{{ $t('homepage.createList') }}
      </button>
    </RouterLink>
    <button class="flex gap-4 items-center px-2 py-3 rounded-md button bg-lof-300 sm:mr-14">
      <img src="../images/dice.svg" alt="" class="w-6" />{{ $t('homepage.tryLuck') }}
    </button>
  </div>

  <section class="flex justify-center">
    <div
      v-if="!isLoggedIn"
      class="flex gap-3 justify-center items-center px-2 py-1 mx-4 mt-6 max-w-4xl text-white rounded-md bg-greenGradient"
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
    content-type="/getLists.php?homepage=1"
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
    content-type="@recentlyViewed"
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
