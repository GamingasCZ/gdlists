<script setup lang="ts">
import { SETTINGS } from '@/siteSettings';
import { ref, watch } from 'vue';

const props = defineProps<{
  open: boolean
  title: string
  width?: string
  sideButtonText?: string
  sideButtonDisabled?: boolean
  action?: any
  headerDisabled?: boolean
  topMost?: boolean
  customColor?: string
  disableTapClose?: boolean
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
    if (document.querySelectorAll(".modalDialog").length < 2)
      document.body.style.overflow = "auto"
  }
})

</script>


<template>
  <Transition name="fade">
    <dialog ref="main" @click="(SETTINGS.dialogClickClose && !disableTapClose) ? emit('closePopup') : ''" tabindex="0"
      @keyup.esc="emit('closePopup')" class="flex gap-2 justify-center items-center transition-all duration-75 modalDialog" v-if="open">
      <section @click.stop=""
        :style="{width: width ?? '35rem', backgroundImage: SETTINGS.disableColors ? null : customColor}"
        class="flex max-h-[95vh] max-w-[95vw] flex-col relative rounded-lg text-white shadow-lg shadow-black" :class="{'bg-greenGradient': SETTINGS.disableColors || !customColor, 'backdrop-blur-md': customColor}">
        <div v-show="!headerDisabled" class="relative z-40 m-2">
          <button :disabled="sideButtonDisabled!" @click="action" class="flex absolute gap-3 p-1 px-2 bg-black bg-opacity-40 rounded-md disabled:opacity-20 button" v-if="sideButtonText">
            <slot name="icon"></slot>
            <span class="max-sm:hidden">{{ sideButtonText }}</span>
          </button>
          <h1 class="ml-1 text-xl font-bold text-center">{{ props.title }}</h1>
          <img src="@/images/close.svg" alt="" class="absolute right-0 top-0.5 w-6 button" @click="emit('closePopup')" />
        </div>
        <slot />
      </section>
    </dialog>
  </Transition>
</template>
