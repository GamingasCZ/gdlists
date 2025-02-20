<script setup lang="ts">
import type { PostData } from '@/interfaces';
import { inject, ref } from 'vue';
import ColorPicker from '../global/ColorPicker.vue';
import { modifyListBG } from '@/Editor';
import { getDominantColor } from '@/Reviews';
import { FONTS } from '@/writers/Writer';

const props = defineProps<{
    postData: PostData
}>()

const openDialogs = inject<object>("openedDialogs")
const pre = import.meta.env.VITE_USERCONTENT
const uid = JSON.parse(localStorage.getItem("account_info") ?? ["0"])[1]
const mainRolledOut = ref(true)
const colorPickerOpen = ref(false)
const pageDetailsOpen = ref(false)

const modifyColor = (newColor: number[]) => {
    props.postData.pageBGcolor = newColor
    modifyListBG(newColor, false)
}

const applyFromBackground = () => {
    let img = document.createElement("img")
    img.src = props.postData.titleImg[0]
    img.onload = () => {
        props.postData.pageBGcolor = modifyListBG(getDominantColor(img).hex())
        img.remove()
    }
}

const resetColor = () => {
    props.postData.pageBGcolor = modifyListBG("", true)
}

</script>

<template>
    <section class="bg-lof-200 thinScrollbar mx-auto max-w-[58rem] text-white w-full rounded-md shadow-drop">
        <header class="flex p-2 cursor-pointer" @click="mainRolledOut = !mainRolledOut">
            <img src="@/images/sparkles.svg" class="mr-3 ml-2 w-8" alt="">
            <h2 class="text-2xl font-bold grow">{{ $t('settingsMenu.visual') }}</h2>
            <!-- <button class="button">
                <img src="@/images/dropdown.svg" :class="{'rotate-180': mainRolledOut}" class="w-6" alt="">
            </button> -->
        </header>

        <div v-show="mainRolledOut && !(colorPickerOpen || pageDetailsOpen)" class="flex overflow-x-auto gap-4 py-4 mx-4 max-w-full">
            <button @click="openDialogs.imagePicker = [true, -1]" class="flex relative flex-col gap-2 justify-center items-center h-32 overflow-clip bg-black bg-opacity-40 rounded-md hover:bg-opacity-80 aspect-video">
                <button class="flex flex-col gap-2 items-center p-2 button">
                    <img src="@/images/image.svg" alt="" class="w-10 opacity-40">
                    <p class="text-xl text-white text-opacity-40">{{ $t('other.bg') }}</p>
                </button>
                <img v-show="postData.titleImg[0].length" :src="postData.titleImg[0]" class="absolute inset-0 opacity-20 mix-blend-screen pointer-events-none">
                <button v-show="postData.titleImg[0].length" @click.stop="openDialogs.bgPreview = !openDialogs.bgPreview" :class="{'!opacity-100': openDialogs.bgPreview}" class="flex absolute top-1 left-1 gap-2 p-1 opacity-40 hover:opacity-80 button">
                    <img src="@/images/view.svg" class="w-6" alt="">
                </button>
                <button v-show="postData.titleImg[0].length" @click.stop="openDialogs.BGpicker[1] = 0; openDialogs.BGpicker[0] = true" class="flex absolute top-1 right-1 gap-2 p-1 opacity-40 hover:opacity-80 button">
                    <img src="@/images/gear.svg" class="w-6" alt="">
                </button>
                <button v-show="postData.titleImg[0].length" @click.stop="postData.titleImg[0] = ''" class="flex absolute right-1 bottom-1 gap-2 p-1 opacity-40 hover:opacity-80 button">
                    <img src="@/images/trash.svg" class="w-6" alt="">
                </button>
            </button>
    

            <button @click="openDialogs.imagePicker = [true, -2]" class="flex relative flex-col gap-2 justify-center items-center h-32 overflow-clip bg-black bg-opacity-40 rounded-md hover:bg-opacity-80 aspect-video">
                <img v-show="postData?.thumbnail?.[0].length" :src="`${pre}/userContent/${uid}/${postData?.thumbnail?.[0]}.webp`" class="absolute inset-0 opacity-20 mix-blend-screen pointer-events-none">
                <button class="flex flex-col gap-2 items-center p-2 button">
                    <img src="@/images/reviews/thumbnail.svg" alt="" class="w-10 opacity-40">
                    <p class="text-xl text-white text-opacity-40">{{ $t('reviews.thumbnail') }}</p>
                </button>
                <button v-show="postData?.thumbnail?.[0].length" @click.stop="openDialogs.BGpicker[1] = 2; openDialogs.BGpicker[0] = true" class="flex absolute top-1 right-1 gap-2 p-1 opacity-40 hover:opacity-80 button">
                    <img src="@/images/gear.svg" class="w-6" alt="">
                </button>
                <button v-show="postData.thumbnail[0].length" @click.stop="postData.thumbnail[0] = ''" class="flex absolute right-1 bottom-1 gap-2 p-1 opacity-40 hover:opacity-80 button">
                    <img src="@/images/trash.svg" class="w-6" alt="">
                </button>
            </button>
            
            <button @click="pageDetailsOpen = true" class="flex relative flex-col gap-2 justify-center items-center h-32 overflow-clip bg-black bg-opacity-40 rounded-md hover:bg-opacity-80 aspect-video">
                <button class="flex flex-col gap-2 items-center p-2 button">
                    <img src="@/images/page.svg" alt="" class="w-10 opacity-40">
                    <p class="text-xl text-white text-opacity-40">{{ $t('reviews.page') }}</p>
                </button>
            </button>

            <button @click="colorPickerOpen = true" class="flex relative flex-col gap-2 justify-center items-center overflow-clip bg-black bg-opacity-40 rounded-md grow hover:bg-opacity-80">
                <button class="flex flex-col gap-2 items-center p-2 button">
                    <img src="@/images/color.svg" alt="" class="w-10 opacity-40">
                    <p class="text-xl text-white text-opacity-40">{{ $t('editor.bgColor') }}</p>
                </button>
            </button>
        </div>

        <div v-show="mainRolledOut && pageDetailsOpen" class="flex flex-col gap-2 p-4 text-xl">
            <section class="flex justify-between items-center">
                <div class="flex gap-2">
                    <label class="flex flex-col gap-1 items-center p-2 bg-black bg-opacity-40 rounded-md">
                        <img src="@/images/color.svg" class="my-1 w-9 opacity-20 pointer-events-none" alt="">
                        <span>Barva</span>
                        <div class="flex gap-2">
                            <button @click="postData.whitePage = false" :title="$t('other.auto')" class="w-9 h-9 rounded-full bg-lof-200">A</button>
                            <button @click="postData.whitePage = true" class="w-9 h-9 rounded-full bg-[#ECE6D9]"></button>
                            <button class="w-9 h-9 rounded-full bg-lof-100">
                                <img src="@/images/color.svg" class="mx-auto w-5" alt="">
                            </button>
                        </div>
                    </label>
                    <label class="flex flex-col gap-1 items-center p-2 bg-black bg-opacity-40 rounded-md">
                        <img src="@/images/color.svg" class="my-1 w-9 opacity-20 pointer-events-none" alt="">
                        <span>{{ $t('other.opacity') }}</span>
                        <div class="flex gap-2">
                            <button @click="postData.transparentPage = 0" :title="'Neprůhledná'" class="w-9 h-9 rounded-md button bg-lof-300 border-lof-400"></button>
                            <button @click="postData.transparentPage = 2" :title="'Průsvitná'" id="pageTranslucent" class="w-9 h-9 rounded-md button bg-lof-300 border-lof-400"></button>
                            <button @click="postData.transparentPage = 1" :title="'Průhledná'" class="w-9 h-9 rounded-md border border-lof-300 button"></button>
                        </div>
                    </label>
                    <label class="flex flex-col gap-1 items-center p-2 bg-black bg-opacity-40 rounded-md">
                        <p class="text-5xl opacity-20 pointer-events-none">Aa</p>
                        <span>Písmo</span>
                        <select class="text-base" name="" id="">
                            <option v-for="font in FONTS" :value="font[1]">{{ font[0] }}</option>
                        </select>
                    </label>
                    
                    <label class="flex flex-col gap-1 items-center p-2 bg-black bg-opacity-40 rounded-md">
                        <img src="@/images/move.svg" class="my-1 w-9 opacity-20 pointer-events-none" alt="">
                        <span>Wide page</span>
                        <input :value="!postData.readerMode" @change="postData.readerMode = $event.target.value" type="checkbox" class="!m-0 button" name="" id="">
                    </label>
                </div>

                <div class="flex gap-2">
                    <!-- <label class="flex flex-col gap-1 items-center p-2 mr-4 bg-black bg-opacity-40 rounded-md">
                        <img src="@/images/color.svg" class="my-1 w-9 opacity-20 pointer-events-none" alt="">
                        <span>Font Color</span>
                        <div class="flex gap-2">
                            <button @click="postData.whitePage = false" class="w-9 h-9 rounded-full border border-lof-400 bg-lof-200">A</button>
                            <button class="w-9 h-9 rounded-full border border-lof-400 bg-lof-100">
                                <img src="@/images/color.svg" class="mx-auto w-5" alt="">
                            </button>
                        </div>
                    </label> -->
                </div>
                
                
            </section>

            <div class="flex gap-2 items-center ml-auto">
                <button class="p-2 bg-black bg-opacity-40 rounded-md button" @click="pageDetailsOpen = false"><img src="@/images/checkThick.svg" alt="" class="inline mr-2 w-5">{{ $t('other.accept') }}</button>
            </div>
        </div>

        <div v-show="mainRolledOut && colorPickerOpen" class="flex flex-col p-4">
            <ColorPicker
                @colors-modified="modifyColor"
                :hue="postData.pageBGcolor[0]"
                :saturation="postData.pageBGcolor[1]"
                :lightness="postData.pageBGcolor[2]"
            />
            <div class="flex gap-2 items-center ml-auto">
                <button class="p-2 bg-black bg-opacity-40 rounded-md disabled:opacity-40 disabled:pointer-events-none button" :disabled="!postData.titleImg?.[0]" @click="applyFromBackground()"><img src="@/images/image.svg" alt="" class="inline mr-2 w-5">{{ $t('reviews.selFromBG') }}</button>
                <button class="p-2 bg-black bg-opacity-40 rounded-md button" @click="resetColor()"><img src="@/images/replay.svg" alt="" class="inline mr-2 w-5">{{ $t('other.reset') }}</button>
                <hr class="w-0.5 h-4 bg-white rounded-md opacity-40">
                <button class="p-2 bg-black bg-opacity-40 rounded-md button" @click="colorPickerOpen = false"><img src="@/images/checkThick.svg" alt="" class="inline mr-2 w-5">{{ $t('other.accept') }}</button>
            </div>
        </div>
    </section>
</template>

<style>

#pageTranslucent {
    mask-image: linear-gradient(135deg, black 50%, transparent 51%);
}

</style>