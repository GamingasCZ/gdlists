<script setup lang="ts">

const emit = defineEmits(["closePopup"]);

</script>

<template>
  <Transition name="fade">
    <dialog
      open
      @click="emit('closePopup')"
      tabindex="0"
      @keyup.esc="emit('closePopup')"
    >
        <section
          @click.stop=""
          class="absolute top-1/2 left-1/2 flex h-[40rem] max-h-[95svh] w-[35rem] max-w-[95vw] -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg bg-greenGradient p-2 text-white shadow-lg shadow-black"
        >
          <div class="relative">
            <h1 class="text-xl font-bold text-center">Import levelů</h1>
            <img
              src="@/images/close.svg"
              alt=""
              class="absolute top-0 right-0 w-6 button"
              @click="emit('closePopup')"
            />
          </div>
          <main class="grid grid-rows-[max-content_1fr_max-content_1fr_max-content] mt-3 w-full h-full">
            <div class="">
              <h2 class="text-xl font-bold text-center">Z herních listů</h2>
              <p class="text-center">Pro import, zadej ID listu z Geometry Dashe.</p>
              <form action="/" class="text-center">
                <input class="py-1 pl-3 mr-2 bg-white bg-opacity-20 rounded-md" maxlength="9" role="spinbutton" :placeholder="'ID listu'" type="text">
                <button type="submit" class="px-3 py-1 font-black text-black rounded-md bg-lof-400 button">Importovat</button>
              </form>
            </div>
            <hr class="self-center h-0.5 bg-white rounded-full border-none opacity-50">
            <div class="">
              <h2 class="text-xl font-bold text-center">Ze seznamu ID</h2>
              <p class="text-center">Vlož ID levelů. Mohou být odděleny čímkoliv, až na čísla.</p>
              <form action="/">
                <textarea class="p-1 w-full bg-white bg-opacity-20 rounded-md resize-none" :placeholder="'Zadej oddělená ID levelů (např. 96000699, 29107242, 128)'"></textarea>
                <button type="submit" class="px-3 py-1 font-black text-black rounded-md bg-lof-400 button">Importovat</button>
              </form>
            </div>
            <hr class="self-center h-0.5 bg-white rounded-full border-none opacity-50">
            <div class="">
              <h2 class="text-xl font-bold text-center">Z tabulek</h2>
              <h3 class="text-xs text-center text-yellow-300">Výjde později</h3>
              <p class="text-center">Importuj tabulku ve formátu .csv. CSV soubor lze exportovat ve všech tabulkových procesorech.</p>
              <button class="px-3 py-1 font-black text-black rounded-md opacity-40 grayscale bg-lof-400">Nahrát soubor</button>
            </div>
          </main>
        </section>
    </dialog>
  </Transition>
</template>
