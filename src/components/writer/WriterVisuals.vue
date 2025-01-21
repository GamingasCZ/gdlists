<script setup lang="ts">
import type { ReviewList } from '@/interfaces';
import { inject, ref } from 'vue';

defineProps<{
    reviewData: ReviewList
}>()

const openDialogs = inject<object>("openedDialogs")
const pre = import.meta.env.VITE_USERCONTENT
const uid = JSON.parse(localStorage.getItem("account_info") ?? ["0"])[1]
const mainRolledOut = ref(true)
</script>

<template>
    <section class="bg-lof-200 mx-auto max-w-[58rem] text-white w-full rounded-md shadow-drop">
        <header class="flex p-2 cursor-pointer" @click="mainRolledOut = !mainRolledOut">
            <img src="@/images/sparkles.svg" class="mr-3 ml-2 w-8" alt="">
            <h2 class="text-2xl font-bold grow">{{ $t('settingsMenu.visual') }}</h2>
            <button class="button">
                <img src="@/images/dropdown.svg" :class="{'rotate-180': mainRolledOut}" class="w-6" alt="">
            </button>
        </header>

        <div v-show="mainRolledOut" class="flex overflow-x-auto gap-4 py-4 mx-4 max-w-full">
            <div @click="openDialogs.imagePicker = [true, -1]" class="flex relative flex-col gap-2 justify-center items-center h-32 overflow-clip bg-black bg-opacity-40 rounded-md hover:bg-opacity-80 aspect-video">
                <button class="flex flex-col gap-2 items-center p-2 button">
                    <img src="@/images/image.svg" alt="" class="w-10 opacity-40">
                    <p class="text-xl text-white text-opacity-40">{{ $t('other.bg') }}</p>
                </button>
                <img v-show="reviewData.titleImg[0].length" :src="reviewData.titleImg[0]" class="absolute inset-0 opacity-20 mix-blend-screen pointer-events-none">
                <button v-show="reviewData.titleImg[0].length" @click.stop="openDialogs.bgPreview = !openDialogs.bgPreview" :class="{'!opacity-100': openDialogs.bgPreview}" class="flex absolute top-1 left-1 gap-2 p-1 opacity-40 hover:opacity-80 button">
                    <img src="@/images/view.svg" class="w-6" alt="">
                </button>
                <button v-show="reviewData.titleImg[0].length" @click.stop="openDialogs.BGpicker[1] = 0; openDialogs.BGpicker[0] = true" class="flex absolute top-1 right-1 gap-2 p-1 opacity-40 hover:opacity-80 button">
                    <img src="@/images/gear.svg" class="w-6" alt="">
                </button>
            </div>
    

            <div @click="openDialogs.imagePicker = [true, -2]" class="flex relative flex-col gap-2 justify-center items-center h-32 overflow-clip bg-black bg-opacity-40 rounded-md hover:bg-opacity-80 aspect-video">
                <img v-show="reviewData?.thumbnail?.[0].length" :src="`${pre}/userContent/${uid}/${reviewData?.thumbnail?.[0]}.webp`" class="absolute inset-0 opacity-20 mix-blend-screen pointer-events-none">
                <button class="flex flex-col gap-2 items-center p-2 button">
                    <img src="@/images/image.svg" alt="" class="w-10 opacity-40">
                    <p class="text-xl text-white text-opacity-40">{{ $t('reviews.thumbnail') }}</p>
                </button>
                <button v-show="reviewData?.thumbnail?.[0].length" @click.stop="openDialogs.BGpicker[1] = 2; openDialogs.BGpicker[0] = true" class="flex absolute top-1 right-1 gap-2 p-1 opacity-40 hover:opacity-80 button">
                    <img src="@/images/gear.svg" class="w-6" alt="">
                </button>
            </div>
            
            <div @click="openDialogs.imagePicker = [true, -2]" class="flex relative flex-col gap-2 justify-center items-center h-32 overflow-clip bg-black bg-opacity-40 rounded-md hover:bg-opacity-80 aspect-video">
                <button class="flex flex-col gap-2 items-center p-2 button">
                    <img src="@/images/image.svg" alt="" class="w-10 opacity-40">
                    <p class="text-xl text-white text-opacity-40">{{ $t('reviews.page') }}</p>
                </button>
            </div>

            <div @click="openDialogs.imagePicker = [true, -2]" class="flex relative flex-col gap-2 justify-center items-center overflow-clip bg-black bg-opacity-40 rounded-md grow hover:bg-opacity-80">
                <button class="flex flex-col gap-2 items-center p-2 button">
                    <img src="@/images/color.svg" alt="" class="w-10 opacity-40">
                    <p class="text-xl text-white text-opacity-40">{{ $t('editor.bgColor') }}</p>
                </button>
            </div>
        </div>
    </section>
</template>