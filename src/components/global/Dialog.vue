<script setup lang="ts">
import type { Component } from 'vue';


const props = defineProps<{
    component: Component
    args: any
}>()

console.log(props)

const emit = defineEmits<{
  (e: "closePopup"): void;
}>();

</script>


<template>
  <dialog
    open
    @click="emit('closePopup')"
    tabindex="0"
    @keyup.esc="emit('closePopup')"
  >
    <component :is="component" />
  </dialog>
</template>
