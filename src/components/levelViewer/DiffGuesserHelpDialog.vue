<script setup lang="ts">
import type { viewedPopups } from '@/interfaces';
import { ref } from 'vue';


const emit = defineEmits(["closePopup"])

const closePopup = () => {
    let hidePopup: viewedPopups = JSON.parse(localStorage.getItem("popupsViewed")!)
    if (hidePopup.diffGuesserHelp == undefined) hidePopup.diffGuesserHelp = true
    localStorage.setItem("popupsViewed", JSON.stringify(hidePopup))
    emit('closePopup')
}
const page = ref(0)

</script>

<template>
    <dialog
      open
      tabindex="0"
    >
      <section
        @click.stop=""
        class="absolute top-1/2 left-1/2 flex max-h-[95vh] w-[35rem] max-w-[95vw] -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg bg-greenGradient p-2 text-white shadow-lg shadow-black"
      >

      <article v-if="page == 0" >
          <img src="@/images/diffGuessSign.svg" class="mx-auto w-72 h-72 opacity-40" alt="">
          <h1 class="mt-2 mb-6 text-2xl text-center">Vítej v hádacím seznamu!</h1>
          <p class="text-center sm:px-20">Toto jsou speciální seznamy, ve kterých hádáš obtížnosti a rating levelu.<br>Tvůrci seznamů mohou vypnout jednu z možností hádání.</p>
      </article>
      <article v-else-if="page == 1">
          <img src="@/images/diffGuessSign.svg" class="mx-auto w-72 h-72 opacity-40" alt="">
          <h1 class="mt-2 mb-6 text-2xl text-center">Jakpak jen to je...</h1>
          <p class="text-center sm:px-20">Za každý správně uhodnutý level můžeš získat dva body. Na konci se ti zobrazí tvé skóre a můžeš jej sdílet.</p>
          <p class="text-center sm:px-20">Nevíš-li, můžeš přeskočit hádání.</p>
      </article>
      <article v-else>
          <img src="@/images/diffGuesserHelp.svg" class="mx-auto w-72 h-52 opacity-40" alt="">
          <h1 class="mt-2 mb-6 text-2xl text-center">Můžeš hrát i klávesnicí!</h1>
          <ul class="sm:px-10">
              <li class="list-disc text-left">Šipkami <strong>doleva a doprava</strong> vybíráš obtížnosti nebo ratingy.</li>
              <li class="list-disc text-left">Šipkou <strong>dolů</strong> potvrdíš svou volbu.</li>
              <li class="list-disc text-left">Šipkou <strong>nahoru</strong> se vrátíš zpět.</li>
          </ul>
      </article>


      <footer class="flex justify-between mx-4 mt-4 mb-2">
        <button class="text-green-200" @click="closePopup()">{{ $t('other.skip') }}</button>
        <div class="flex gap-2 justify-center items-center">
            <a v-for="index in 3" @click="page = index-1" :class="{'!bg-white opacity-20': page != index-1}" class="p-1 rounded-full cursor-pointer bg-lof-400"></a>
        </div>
        <button v-if="page < 2" @click="page += 1" class="inline px-3 py-1 text-lg font-extrabold text-black align-bottom rounded-md bg-lof-400"><img src="@/images/check.svg" class="inline mr-2 w-6">{{ $t('other.next') }}</button>
        <button v-else @click="page += 1" class="inline px-3 py-1 text-lg font-extrabold text-black align-bottom rounded-md bg-lof-400"><img src="@/images/check.svg" class="inline mr-2 w-6">{{ $t('other.increasedIQ') }}</button>
      </footer>

      </section>
    </dialog>
  </template>