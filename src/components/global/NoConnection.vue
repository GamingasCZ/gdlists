<script setup lang="ts">
import { isOnline } from '@/Editor';
</script>

<template>
    <Transition name="topSlide">
        <section v-if="!isOnline" class="flex fixed top-16 left-1/2 z-20 items-center p-2 w-max text-white bg-black bg-opacity-90 rounded-md backdrop-blur-sm -translate-x-1/2">
            <svg width="32" height="32" version="1.1" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="m9.5887 17.911a10.653 10.653 0 0 1 12.823 0" fill="none" stroke="#fff" stroke-linecap="round" stroke-width="6.8"/><circle cx="16" cy="26.419" r="3.4302" fill="#fff"/><path d="m3.4368 9.7472a20.876 20.876 0 0 1 25.126 5e-7" fill="none" stroke="#fff" stroke-linecap="round" stroke-width="6.8"/></svg>
            <label class="ml-3 text-xl leading-none">{{ $t('other.disconnected') }}</label>
        </section>
    </Transition>
</template>

<style>

.topSlide-enter-active,
.topSlide-leave-active {
  transition: top 0.3s cubic-bezier(0.77, 0, 0.175, 1);
}

.topSlide-enter-from,
.topSlide-leave-to {
  top: -10rem;
}

</style>