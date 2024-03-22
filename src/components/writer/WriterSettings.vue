<script setup lang="ts">
import { getBGcolor, modifyListBG } from '@/Editor';
import ColorPicker from '../global/ColorPicker.vue';
import { reviewData } from '@/Reviews';
import { ref } from 'vue';
import { inject } from 'vue';

const emit = defineEmits(["closePopup"]);
const bgColorPickerOpen = ref(false)
const openDialogs = inject("openedDialogs")

</script>

<template>
    <div class="bg-[url(@/images/fade.webp)] bg-repeat-x p-2 h-[40rem] overflow-y-scroll">

      <p class="ml-2 text-xl">Vzhled bodování</p>
      <fieldset class="flex gap-2 justify-center">
        <div class="flex flex-col items-center p-2 w-28 bg-black bg-opacity-40 rounded-md">
          <label class="text-center" for="stylePoints">
            <img class="w-16 opacity-60 button" src="@/images/reviews/points.svg" alt="">
            {{ $t('reviews.points') }}
          </label>
          <input v-model="reviewData.rateTheme" :value="0" type="radio" name="style" id="stylePoints">
        </div>
        <div class="flex flex-col items-center p-2 w-28 bg-black bg-opacity-40 rounded-md">
          <label class="text-center" for="styleStars">
            <img class="w-16 opacity-60 button" src="@/images/reviews/stars.svg" alt="">
            {{ $t('reviews.stars') }}
          </label>
          <input v-model="reviewData.rateTheme" :value="1" type="radio" name="style" id="styleStars">
        </div>
        <div class="flex flex-col items-center p-2 w-28 bg-black bg-opacity-40 rounded-md">
          <label class="text-center" for="styleNone">
            <img class="p-2 w-16 opacity-60 button" src="@/images/close.svg" alt="">
            {{ $t('reviews.none') }}
          </label>
          <input v-model="reviewData.rateTheme" :value="2" type="radio" name="style" id="styleNone">
        </div>
      </fieldset>
      <p v-show="reviewData.rateTheme == 2" class="text-sm text-center">Hodí se, pokud chceš recenzovat event, kontroverzi apod.</p>

      <p class="mt-8 ml-2 text-xl">{{ $t('reviews.description') }}</p>
      <div class="relative">
        <textarea v-model="reviewData.description" class="p-1 w-full h-28 bg-white bg-opacity-10 rounded-md resize-none">
        </textarea>
        <button class="absolute right-1.5 bottom-2 bg-black bg-opacity-40 rounded-md">
          <img src="@/images/fullscreen.svg" class="p-1 w-8" alt="">
        </button>
      </div>

      <div class="p-2 mt-2 bg-black bg-opacity-40 rounded-md">
        <div class="flex justify-between w-full">
          <span class="text-xl">{{ $t('reviews.private') }}</span>
          <input v-model="reviewData.private" type="checkbox" class="w-12 button" name="" id="">
        </div>
      </div>

      <p class="mt-8 ml-2 text-xl">{{ $t('reviews.bgImage') }}</p>
      <div class="flex gap-2 mb-2">
        <input v-model="reviewData.titleImg[0]" type="text" class="px-2 py-1 bg-white bg-opacity-10 rounded-md grow" placeholder="URL obrázku">
        <button @click="openDialogs.bgPreview = !openDialogs.bgPreview" class="p-1 bg-black bg-opacity-40 rounded-md button">
          <img :class="{'opacity-20': !openDialogs.bgPreview}" src="@/images/view.svg" class="w-6 transition-opacity" alt="">
        </button>
        <button @click="openDialogs.bgPicker = true" class="p-1 bg-black bg-opacity-40 rounded-md button">
          <img src="@/images/gear.svg" class="w-6" alt="">
        </button>
      </div>

      <div class="p-2 bg-black bg-opacity-40 rounded-md">
        <div class="flex justify-between w-full">
          <span class="ml-1 text-xl">Barva pozadí</span>
          <button
            type="button"
            class="box-border flex justify-center items-center mr-2 w-8 h-8 rounded-md border-2 border-white focus:outline focus:outline-current button"
            @click="bgColorPickerOpen = !bgColorPickerOpen"
            :style="{background: getBGcolor()}"
          >
            <img src="../../images/color.svg" alt="" class="w-5" />
          </button>
        </div>
        <Transition name="fade">
          <ColorPicker v-if="bgColorPickerOpen" class="mt-4" @colors-modified="reviewData.pageBGcolor = modifyListBG($event, false, true)" :hue="reviewData.pageBGcolor[0]" :saturation="0.36" :lightness="reviewData.pageBGcolor[2]" />
        </Transition>
      </div>

      <div class="p-2 mt-2 bg-black bg-opacity-40 rounded-md">
        <div class="flex justify-between w-full">
          <span class="ml-1 text-xl">Průhledná stránka</span>
          <input v-model="reviewData.transparentPage" type="checkbox" class="w-12 button" name="" id="">
        </div>
      </div>

      <p class="mt-8 ml-1 text-xl">Vzhled odrážek</p>
      <fieldset class="flex gap-2 justify-center">
        <div class="flex flex-col items-center p-2 w-28 bg-black bg-opacity-40 rounded-md button">
          <label class="text-center" for="stylePoints">
            <img class="w-16 opacity-60" src="@/images/emoji.svg" alt="">
            Klasické
          </label>
          <input type="radio" name="style" id="stylePoints">
        </div>
        <div class="flex flex-col items-center p-2 w-28 bg-black bg-opacity-40 rounded-md button">
          <label class="text-center" for="styleStars">
            <img class="w-16 opacity-60" src="@/images/wave.svg" alt="">
            Waveka
          </label>
          <input type="radio" name="style" id="styleStars">
        </div>
      </fieldset>

      <div class="p-2 mt-2 bg-black bg-opacity-40 rounded-md">
        <div class="flex justify-between w-full">
          <span class="ml-1 text-xl">Číslování nadpisů</span>
          <input type="checkbox" class="w-12 button" name="" id="">
        </div>
      </div>
      
      <div class="p-2 mt-2 bg-black bg-opacity-40 rounded-md">
        <div class="flex justify-between w-full">
          <span class="ml-1 text-xl">Řádkování</span>
          <select name="" id="">
            <option value="">1</option>
            <option value="">1,25</option>
            <option value="">1,5</option>
            <option value="">1,75</option>
            <option value="">2</option>
          </select>
        </div>
      </div>
    </div>
</template>
