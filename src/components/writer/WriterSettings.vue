<script setup lang="ts">
import { getBGcolor, modifyListBG } from '@/Editor';
import ColorPicker from '../global/ColorPicker.vue';
import { reviewData } from '@/Reviews';
import { ref } from 'vue';
import { inject } from 'vue';
import SectionDivider from '../ui/SectionDivider.vue';
import Option from '../ui/Option.vue';
import { i18n } from '@/locales';
import RadioPicker from '../ui/RadioPicker.vue';

const bgColorPickerOpen = ref(false)
const openDialogs = inject("openedDialogs")
const pre = import.meta.env.VITE_USERCONTENT
const uid = JSON.parse(localStorage.getItem("account_info"))[1]

const emit = defineEmits<{
  (e: "upload"): void
}>()

defineProps<{
  uploading: boolean
}>()

const LANGUAGES = [[i18n.global.t('settingsMenu.czech'), "cs"],
                   [i18n.global.t('settingsMenu.english'), "en"],
                   [i18n.global.t('other.german'), "de"],
                   [i18n.global.t('other.spanish'), "es"],
                   [i18n.global.t('other.korean'), "ko"],
                   [i18n.global.t('other.russian'), "ru"],
                   [i18n.global.t('other.other'), "ot"]]

const FONTS = [["Poppins", 0],
               ["Serif", 1],
               ["Sans-Serif", 2],
               ["Monospace", 3],
               ["Systémové", 4],
               ["Pusab", 5]]

</script>

<template>
    <div v-if="uploading" class="flex justify-between items-center p-2 mx-2 mb-2 bg-black bg-opacity-40 rounded-md">
      <span class="text-xl">{{ $t('reviews.settingsOk') }}</span>
      <button @click="emit('upload')" class="flex gap-2 items-center px-2 py-1 rounded-md button bg-lof-400">
        <img src="@/images/upload.svg" alt="" class="w-7">
        <span class="text-xl font-bold text-black">{{ $t('editor.upload') }}</span>
      </button>
    </div>
    
    <div class="bg-[url(@/images/fade.webp)] bg-repeat-x flex flex-col gap-2 p-2 h-[40rem] overflow-y-scroll">
      <SectionDivider :text="$t('other.general')" />

      <!-- <p class="ml-1 text-xl">{{ $t('reviews.description') }}</p>
      <div class="relative">
        <textarea v-model="reviewData.description" :placeholder="$t('reviews.descPlaceholder')" class="p-1 w-full h-28 bg-black bg-opacity-40 rounded-md resize-none placeholder:opacity-40">
        </textarea>
        <button @click="openDialogs.description = true" class="absolute right-1.5 bottom-2 bg-black bg-opacity-60 rounded-sm">
          <img src="@/images/fullscreen.svg" class="p-1 w-8" alt="">
        </button>
      </div> -->

      <Option :name="$t('reviews.private')" v-model="reviewData.private" control="cbox" />
      <!-- <Option :name="$t('reviews.noLevelRating')" :desc="$t('reviews.noratingHelp')" v-model="reviewData.disabledRatings" control="cbox" /> -->
      <Option :name="$t('other.disableComments')" v-model="reviewData.disComments" control="cbox" />
      <Option :name="$t('reviews.language')" v-model="reviewData.language" control="dropdown" :control-options="LANGUAGES" />

      <SectionDivider :text="$t('settingsMenu.visual')" />

      <Option :name="$t('reviews.thumbnail')" :desc="$t('reviews.thumbnailHelp')" control="inline-slot" :style="{backgroundImage: `url(${pre}/userContent/${uid}/${reviewData.thumbnail[0]}.webp)`}">
        <div class="flex gap-2 w-max">
          <button @click="openDialogs.imagePicker = [true, -2]" class="flex gap-2 p-1 bg-black bg-opacity-40 rounded-md button">
            <img src="@/images/copy.svg" class="w-6" alt="">
            <span>{{ reviewData?.thumbnail[0] ? $t('other.modify') : $t('other.pick') }}</span>
          </button>
          <button @click="openDialogs.BGpicker[1] = 2; openDialogs.BGpicker[0] = true" class="flex gap-2 p-1 bg-black bg-opacity-40 rounded-md button">
            <img src="@/images/gear.svg" class="w-6" alt="">
          </button>
          <button v-show="reviewData?.thumbnail[0]" @click="reviewData.thumbnail[0] = ''" class="flex gap-2 p-1 bg-black bg-opacity-40 rounded-md button">
            <img src="@/images/trash.svg" class="w-6" alt="">
          </button>
        </div>
      </Option>

      <Option :name="$t('reviews.bgImage')" control="inline-slot" :style="{backgroundImage: `url(${reviewData.titleImg[0]})`}">
        <div class="flex gap-2 w-max">
          <button @click="openDialogs.bgPreview = !openDialogs.bgPreview" class="flex gap-2 p-1 bg-black bg-opacity-40 rounded-md button">
            <img :class="{'opacity-20': !openDialogs.bgPreview}" src="@/images/view.svg" class="w-6 transition-opacity" alt="">
          </button>
          <button @click="openDialogs.imagePicker = [true, -1]" class="flex gap-2 p-1 bg-black bg-opacity-40 rounded-md button">
            <img src="@/images/copy.svg" class="w-6" alt="">
            <span>{{ reviewData.titleImg[0] ? $t('other.modify') : $t('other.pick') }}</span>
          </button>
          <button @click="openDialogs.BGpicker[1] = 0; openDialogs.BGpicker[0] = true" class="flex gap-2 p-1 bg-black bg-opacity-40 rounded-md button">
            <img src="@/images/gear.svg" class="w-6" alt="">
          </button>
          <button @click="reviewData.titleImg[0] = ''" v-show="reviewData.titleImg[0] != ''" class="flex gap-2 p-1 bg-black bg-opacity-40 rounded-md button">
            <img src="@/images/trash.svg" class="w-6" alt="">
          </button>
        </div>
      </Option>

      <Option :name="$t('reviews.bgcolor')" control="inline-slot" :style="{backgroundImage: `url(${reviewData.titleImg[0]})`}">
        <button
            type="button"
            class="box-border flex justify-center items-center w-8 h-8 rounded-md border-2 border-white focus:outline focus:outline-current button"
            @click="bgColorPickerOpen = !bgColorPickerOpen"
            :style="{background: getBGcolor()}"
          >
            <img src="../../images/color.svg" alt="" class="w-5" />
        </button>
      </Option>
      <Transition name="fade">
        <ColorPicker v-if="bgColorPickerOpen" class="mt-4" @colors-modified="reviewData.pageBGcolor = modifyListBG($event, false, true)" :hue="reviewData.pageBGcolor[0]" :saturation="0.36" :lightness="reviewData.pageBGcolor[2]" />
      </Transition>

      <Option name="Stránka" desc="Mění průhlednost pozadí recenze" control="slot">
        <RadioPicker v-model="reviewData.transparentPage" id="pageTransparency" :optNames="['Neprůhledná', 'Zamlžená', 'Průhledná']" />
      </Option>

      <Option v-model="reviewData.font" :name="$t('reviews.font')" control="dropdown" :control-options="FONTS" />

      <SectionDivider :text="$t('settingsMenu.access')" />

      <Option :name="$t('reviews.readerMode')" :desc="$t('reviews.readerModeHelp')" v-model="reviewData.readerMode" control="cbox" />
      <Option :name="$t('reviews.whitePage')" :desc="$t('reviews.whitePageHelp')" v-model="reviewData.whitePage" control="cbox" />

    </div>
</template>
