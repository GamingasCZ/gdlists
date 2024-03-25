<script setup lang="ts">
import { SETTINGS } from '@/siteSettings';
import { ref, watch } from 'vue';

const props = defineProps<{
  open: boolean
  title: string
  width?: string
}>()

const emit = defineEmits<{
  (e: "closePopup"): void;
}>();

const main = ref<HTMLDialogElement>()
watch(props, () => {
  if (props.open) {
    main.value?.showModal()
    document.body.style.overflow = "clip"
  }
  else {
    main.value?.close()
    document.body.style.overflow = "auto"
  }
})

const hello = ref()
</script>


<template>
  <Transition name="fade">
    <dialog ref="main" @click="SETTINGS.dialogClickClose ? emit('closePopup') : ''" tabindex="0"
      @keyup.esc="emit('closePopup')" class="flex gap-2 justify-center items-center" v-if="open">
      <section @click.stop=""
        :style="{width: width ?? '35rem'}"
        class="absolute top-1/2 left-1/2 flex max-h-[95vh] max-w-[95vw] -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg bg-greenGradient text-white shadow-lg shadow-black">
        <div class="relative m-2">
          <h1 class="ml-1 text-xl font-bold text-center">{{ props.title }}</h1>
          <img src="@/images/close.svg" alt="" class="absolute top-0 right-0 w-6 button" @click="emit('closePopup')" />
        </div>
        <slot />
      </section>
    </dialog>
  </Transition>
</template>
