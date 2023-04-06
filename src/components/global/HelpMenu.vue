<script setup lang="ts">

const emit = defineEmits(['closePopup'])

</script>

<template>
  <dialog
    open
    @click="emit('closePopup')"
    tabindex="0"
    @keyup.esc="emit('closePopup')"
  >
    <section
      @click.stop=""
      class="absolute top-1/2 left-1/2 w-[40rem] max-w-[95vw] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-greenGradient p-2 text-white shadow-lg shadow-black"
    >
      <div class="relative">
        <h1 class="text-xl font-bold text-center">Nápověda</h1>
        <img
          src="@/images/close.svg"
          alt=""
          class="absolute top-0 right-0 w-6 button"
          @click="emit('closePopup')"
        />
      </div>
      <div class="mt-2">
        <input type="text" placeholder="Hledat v nápovědě..." class="p-1 px-2 bg-white bg-opacity-10 rounded-full">
        <div class="">
            
        </div>
      </div>
    </section>
  </dialog>
</template>