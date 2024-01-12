<script setup lang="ts">
import { SETTINGS } from '@/siteSettings';
import { ref, watch } from 'vue';



const props = defineProps<{
    open: boolean
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

</script>


<template>
  <Transition name="fade">
    <dialog
      ref="main"
      @click="SETTINGS.dialogClickClose ? emit('closePopup') : ''"
      tabindex="0"
      @keyup.esc="emit('closePopup')"
      class="flex gap-2 justify-center items-center"
      v-if="open"
    >
      <slot />
    </dialog>
  </Transition>
</template>
