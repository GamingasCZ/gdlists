<script setup lang="ts">
import LoginButton from '../global/LoginButton.vue';

const emit = defineEmits(["closePopup"])

</script>

<template>
    <dialog open @click="emit('closePopup')" tabindex="0" @keyup.esc="emit('closePopup')">
        <section @click.stop=""
            class="absolute top-1/2 left-1/2 flex max-h-[95vh] w-[25rem] max-w-[95vw] -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg bg-greenGradient p-2 text-white shadow-lg shadow-black">
            <p class="text-lg text-center">{{ $t('listViewer.likeNotLoggedIn') }}</p>
            <section class="grid grid-cols-2 gap-3 mt-4">
                <LoginButton />
                <button @click="emit('closePopup')" class="px-2 py-1 text-sm leading-none text-left align-middle rounded-full border-4 border-black border-opacity-40 button">
                    <img src="@/images/close.svg" class="inline mr-2 w-5" alt="">
                    {{ $t('other.notNow') }}
                </button>
            </section>
        </section>
    </dialog>
</template>