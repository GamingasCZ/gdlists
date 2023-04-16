<script setup lang="ts">
const emit = defineEmits(["closePopup"]);
const props = defineProps<{
  pfplink: string;
  username: string;
}>();
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
      class="absolute top-1/2 left-1/2 flex max-h-[95vh] w-[25rem] max-w-[95vw] -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-lg bg-greenGradient text-white shadow-lg shadow-black"
    >
      <img
        :src="pfplink"
        class="w-28 -translate-y-14 rounded-full border-8 border-solid border-lof-300"
        alt=""
      />
      <div
        class="mx-2 flex -translate-y-7 flex-col items-center justify-center gap-2 text-center"
      >
        <h1 class="text-lg text-yellow-200">
          Vítej v GD Seznamech, <b>{{ username }}!</b>
        </h1>
        <p>Teď můžeš vytvářet seznamy, likovat a komentovat!</p>
        <button
          class="rounded-md bg-lof-400 px-3 py-2 align-bottom text-2xl font-black text-black"
          @click="emit('closePopup')"
        >
          <img src="@/images/check.svg" alt="" class="mr-3 inline w-8" />Ok!
        </button>
      </div>
    </section>
  </dialog>
</template>
