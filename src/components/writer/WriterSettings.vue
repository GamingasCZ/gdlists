<script setup lang="ts">
const emit = defineEmits(["closePopup"]);

</script>

<template>
  <section
    @click.stop=""
    class="absolute top-1/2 left-1/2 flex max-h-[95vh] w-[35rem] max-w-[95vw] -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg bg-greenGradient text-white shadow-lg shadow-black"
  >
    <div class="relative m-2">
      <h1 class="text-xl font-bold text-center">{{ $t('other.settings') }}</h1>
      <img
        src="@/images/close.svg"
        alt=""
        class="absolute top-0 right-0 w-6 button"
        @click="emit('closePopup')"
      />
    </div>

    <div class="bg-[url(@/images/fade.webp)] bg-repeat-x">
      Popis recenze
      Barva pozadí
      Pozadí seznamu
      Odrážky
      Číslování nadpisů
      Řádkování
    </div>
  </section>
</template>
