<script setup lang="ts">
import { hasLocalStorage } from '@/siteSettings';
import { ref } from 'vue';


const emit = defineEmits(["closePopup"])

const closePopup = () => {
    if (!hasLocalStorage()) return 
    
    let hidePopup = JSON.parse(localStorage.getItem("popupsViewed")!)
    if (hidePopup.diffGuesserHelp == undefined) hidePopup.diffGuesserHelp = true
    localStorage.setItem("popupsViewed", JSON.stringify(hidePopup))
    emit('closePopup')
}
const page = ref(0)

</script>

<template>
    <section
      @click.stop=""
      class="absolute top-1/2 left-1/2 flex max-h-[95vh] w-[35rem] max-w-[95vw] -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg bg-greenGradient p-2 text-white shadow-lg shadow-black"
    >

    <article v-if="page == 0" >
        <img src="@/images/diffGuessSign.svg" class="mx-auto w-60 h-72 opacity-40" alt="">
        <h1 class="mt-2 mb-6 text-2xl text-center">{{ $t('listViewer.diffGHelp1') }}</h1>
        <ul class="px-4 list-inside">
          <li class="list-disc text-left" v-html="$t('listViewer.diffGHelp4')"></li>
          <li class="list-disc text-left" v-html="$t('listViewer.diffGHelp5')"></li>
        </ul>
    </article>
    <article v-else-if="page == 1">
        <img src="@/images/guesshelpidk.svg" class="mx-auto w-72 h-72 opacity-40" alt="">
        <h1 class="mt-2 mb-6 text-2xl text-center">{{ $t('listViewer.diffGHelp2') }}</h1>
        <ul class="px-4 list-inside">
          <li class="list-disc text-left" v-html="$t('listViewer.diffGHelp6')"></li>
          <li class="list-disc text-left">{{ $t('listViewer.diffGHelp7') }}</li>
          <li class="list-disc text-left">{{ $t('listViewer.diffGHelp8') }}</li>
        </ul>
    </article>
    <article v-else>
        <img src="@/images/diffGuesserHelp.svg" class="mx-auto w-72 h-72 opacity-40" alt="">
        <h1 class="mt-2 mb-6 text-2xl text-center">{{ $t('listViewer.diffGHelp3') }}</h1>
        <ul class="px-4 list-inside">
            <li class="list-disc text-left" v-html="$t('listViewer.diffGHelp9')"></li>
            <li class="list-disc text-left" v-html="$t('listViewer.diffGHelp10')"></li>
            <li class="list-disc text-left" v-html="$t('listViewer.diffGHelp11')"></li>
        </ul>
    </article>


    <footer class="flex relative justify-between mx-4 mt-4 mb-2">
      <button class="text-green-200" @click="closePopup()">{{ $t('other.skip') }}</button>
      <div class="flex absolute top-1/2 left-1/2 gap-2 justify-center items-center -translate-x-1/2 -translate-y-1/2">
          <a v-for="index in 3" @click="page = index-1" :class="{'!bg-white opacity-20': page != index-1}" class="p-1 rounded-full cursor-pointer bg-lof-400"></a>
      </div>
      <button v-if="page < 2" @click="page += 1" class="inline px-3 py-1 text-lg font-extrabold text-black align-bottom rounded-md bg-lof-400"><img src="@/images/check.svg" class="inline mr-2 w-6">{{ $t('other.next') }}</button>
      <button v-else @click="closePopup()" class="inline px-3 py-1 text-lg font-extrabold text-black align-bottom rounded-md bg-lof-400"><img src="@/images/check.svg" class="inline mr-2 w-6">{{ $t('other.increasedIQ') }}</button>
    </footer>

    </section>
  </template>