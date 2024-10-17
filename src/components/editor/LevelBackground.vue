<script setup lang="ts">
import { currentUID, newCardBG } from '@/Editor';
import type { LevelList } from '@/interfaces';
import { i18n } from '@/locales';
import { computed, inject, ref } from 'vue';

const props = defineProps<{
  cardIndex: number
  levelArray: LevelList
}>();

const gallery = inject("openedDialogs")
const bg = computed(() => props.levelArray.levels[props.cardIndex].BGimage)

if (!props.levelArray.levels[props.cardIndex].BGimage) {
  props.levelArray.levels[props.cardIndex].BGimage = newCardBG()
}

const openGallery = () => {
  gallery.imagePicker[0] = true
  gallery.imagePicker[1] = -5
  gallery.imagePicker[2] = props.cardIndex
}

const openSettings = () => {
  gallery.BGpicker[0] = true
  gallery.BGpicker[1] = 1
  gallery.BGpicker[2] = props.cardIndex
}

const base = import.meta.env.BASE_URL
const uc = import.meta.env.VITE_USERCONTENT
const themeIcons = [1, 2, 3, 4].map(x => `/cardThemeIcons/theme${x}.svg`)
const themeNames = [i18n.global.t('other.bgTheme1'), i18n.global.t('other.bgTheme2'), i18n.global.t('other.bgTheme3'), i18n.global.t('other.bgTheme4')]

const bgImage = computed(() => `url(${uc}/userContent/${currentUID.value}/${bg.value?.image?.[0]}.webp)`)
const bgImageY = computed(() => `${bg.value?.image?.[1]}%`)

</script>

<template>
  <div class="flex relative flex-col p-2 mt-1 overflow-clip rounded-md levelBGSettings"
  :style="{backgroundPositionY: `$}%`}">
    <div class="flex relative z-10 gap-4 justify-between items-center max-sm:flex-col">

      <div class="flex flex-col justify-center">
        <span class="mb-1 text-lg text-center">{{ $t('other.picture') }}</span>
        <div class="">
          <button v-if="!bg?.image?.[0]" @click="openGallery"
            class="flex items-center px-4 h-24 bg-black bg-opacity-80 rounded-md button">
            <img src="@/images/image.svg" class="mr-3 w-6" alt="">
            {{ $t('reviews.pick') }}
          </button>
          <div v-else class="flex gap-1 items-center w-max sm:flex-col">
            <button @click="openGallery" class="flex items-center p-2 py-0.5 w-full bg-black bg-opacity-80 rounded-md button">
              <img src="@/images/copy.svg" class="mr-2 w-4" alt="">
              {{ $t('other.modify') }}
            </button>
            <button @click="openSettings" class="flex items-center px-2 py-0.5 w-full bg-black bg-opacity-80 rounded-md button">
              <img src="@/images/gear.svg" class="mr-2 w-4" alt="">
              {{ $t('other.settings') }}
            </button>
            <button @click="bg.image[0] = ''"
              class="flex items-center p-2 py-0.5 w-full bg-black bg-opacity-80 rounded-md button">
              <img src="@/images/trash.svg" class="mr-2 w-4" alt="">
              {{ $t('editor.remove') }}
            </button>
          </div>
        </div>
      </div>

      <div class="flex flex-col justify-center">
        <span class="mb-1 text-lg text-center">{{ $t('other.effects') }}</span>
        <div class="grid grid-cols-3 gap-1 my-1">
          <div class="flex flex-col gap-3 justify-between items-center p-2 max-w-full text-center bg-black bg-opacity-80 rounded-md">
            <span>{{ $t('other.opacity') }}</span>
            <input class="mb-1 max-w-20 slider" type="range" v-model="bg.opacity" step="0.05" min="0.05" max="1">
          </div>
          <div
            class="flex flex-col gap-3 justify-between items-center p-2 max-w-full text-center bg-black bg-opacity-80 rounded-md">
            <span>{{ $t('other.tiling') }}</span>
            <input type="checkbox" v-model="bg.tile" class="button !mr-0 mb-1">
          </div>
          <div
            class="flex flex-col gap-3 justify-between items-center p-2 max-w-full text-center bg-black bg-opacity-80 rounded-md">
            <span>{{ $t('other.scrolling') }}</span>
            <select v-model="bg.scrolling">
              <option :value="0">{{ $t('other.off') }}</option>
              <option :value="1">{{ $t('other.byitself') }}</option>
              <option :value="2">{{ $t('other.parallax') }}</option>
            </select>
          </div>
        </div>
      </div>

      <div class="flex flex-col justify-center">
        <span class="mb-1 text-lg text-center">{{ $t('settingsMenu.visual') }}</span>  
        <div class="grid gap-1 w-max max-sm:grid-cols-4 sm:grid-cols-2">
          <button v-for="(button, index) in themeIcons" :title="themeNames[index]" class="p-1 bg-black bg-opacity-80 rounded-md button"
            @click="bg.theme = index">
            <img :src="base + button" :class="{ 'disabled': bg.theme != index }" class="w-8" alt="">
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>

.levelBGSettings::before {
  @apply content-[''] absolute inset-0 mix-blend-luminosity opacity-20;
  background: v-bind(bgImage);
  background-position-y: v-bind(bgImageY);
}

</style>