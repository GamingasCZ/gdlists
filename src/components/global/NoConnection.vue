<script setup lang="ts">
import { isOnline } from '@/Editor';
</script>

<template>
    <Transition name="topSlide">
        <section v-if="!isOnline" class="flex fixed top-16 left-1/2 z-20 items-center p-2 w-max text-white bg-black bg-opacity-90 rounded-md backdrop-blur-sm -translate-x-1/2">
            <img src="@/images/waifu.svg" alt="" class="inline mr-4 w-6">
            <label class="text-xl leading-none">{{ $t('other.disconnected') }}</label>
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