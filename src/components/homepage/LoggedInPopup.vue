<script setup lang="ts">
const emit = defineEmits(["closePopup"]);
const props = defineProps<{
  pfplink: string;
  username: string;
}>();
</script>

<template>
  <section
    @click.stop=""
    class="absolute top-1/2 left-1/2 flex max-h-[95vh] w-[25rem] max-w-[95vw] -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-lg bg-greenGradient text-white shadow-lg shadow-black"
  >
    <img
      :src="pfplink"
      class="w-28 rounded-full border-8 border-solid -translate-y-14 border-lof-300"
      alt=""
    />
    <div
      class="flex flex-col gap-2 justify-center items-center mx-2 text-center -translate-y-7"
    >
      <h1 class="text-lg text-yellow-200">
        {{ $t('other.welcomeToGDL') }} <b>{{ username }}!</b>
      </h1>
      <p>{{ $t('other.greatFeatures') }}</p>
      <button
        class="px-3 py-2 text-2xl font-black text-black align-bottom rounded-md bg-lof-400"
        @click="emit('closePopup')"
      >
        <img src="@/images/check.svg" alt="" class="inline mr-3 w-8" />{{ $t('other.ok') }}
      </button>
    </div>
  </section>
</template>
