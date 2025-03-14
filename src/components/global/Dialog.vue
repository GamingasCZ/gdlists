<script setup lang="ts">
import { SETTINGS } from '@/siteSettings';
import { nextTick, onBeforeUnmount, onMounted, onUnmounted, onUpdated, ref, watch } from 'vue';

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

const clipBody = (closing: boolean, noFocus = false) => {
  if (closing) {
    main.value?.close()
    if (document.querySelectorAll(".modalDialog").length < 2)
      document.body.style.overflow = "auto"
  }
  else {
    main.value?.showModal()
    document.body.style.overflow = "clip"
    if (!noFocus)
      nextTick(() => main.value?.focus())
  }
}

var lastFocused: Element | null
onMounted(() => {
  if (props.open) clipBody(false)
})
onBeforeUnmount(() => {
  if (props.open) clipBody(true)
})

watch(() => props.open, () => {
  if (props.open) 
    lastFocused = document.activeElement
  else {
    if (lastFocused)
      lastFocused.focus()
  }
  clipBody(!props.open)
})

const start = ref<HTMLLinkElement>()
const end = ref<HTMLLinkElement>()

const focusStart = () => {
  (start.value?.nextElementSibling as HTMLLinkElement).focus()
}
const focusEnd = () => {
  (end.value?.previousElementSibling as HTMLLinkElement).focus()
}

</script>


<template>
  <Transition name="fade">
    <dialog ref="main" role="dialog" aria-modal="true" @click="(SETTINGS.dialogClickClose && !disableTapClose) ? emit('closePopup') : ''"
      @keyup.esc="emit('closePopup')" class="flex gap-2 justify-center items-center transition-all duration-75 modalDialog" v-if="open">
      <section @click.stop=""
      :style="{width: width ?? '35rem', backgroundImage: SETTINGS.disableColors ? null : customColor}"
      :class="{
        'max-sm:flex-col-reverse': SETTINGS.flipControls,
        'bg-greenGradient': SETTINGS.disableColors || !customColor,
        'backdrop-blur-md': customColor
      }"
        class="flex max-h-[95vh] max-w-[95vw] flex-col relative rounded-lg text-white shadow-lg shadow-black">
        <a class="outline-none" @click.stop="" @focus="focusEnd" href="#" ref="start"></a>
        <a class="outline-none" @click.stop="" href="#"></a>
        <div v-show="!headerDisabled" class="relative z-40 m-2">
          <button :disabled="sideButtonDisabled!" @click="action" class="flex absolute gap-3 p-1 px-2 bg-black bg-opacity-40 rounded-md disabled:opacity-20 button" v-if="sideButtonText">
            <slot name="icon"></slot>
            <span class="">{{ sideButtonText }}</span>
          </button>
          <h1 class="ml-1 text-xl font-bold text-center">{{ props.title }}</h1>
          <img src="@/images/close.svg" alt="" class="absolute right-0 top-0.5 w-6 button" @click="emit('closePopup')" />
        </div>
        <slot />
        <a class="outline-none" @click.stop="" href="#"></a>
        <a class="outline-none" @click.stop="" @focus="focusStart" href="#" ref="end"></a>
      </section>
    </dialog>
  </Transition>
</template>
