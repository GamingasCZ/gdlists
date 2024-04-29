<script setup lang="ts">
import LoginButton from '../global/LoginButton.vue';

const emit = defineEmits(["closePopup"])

</script>

<template>
    <div class="m-4">
        <p class="text-lg text-center">{{ $t('listViewer.likeNotLoggedIn') }}</p>
        <section class="grid grid-cols-2 gap-3 mt-4">
            <LoginButton />
            <button @click="emit('closePopup')" class="px-2 py-1 text-sm leading-none text-left align-middle rounded-md border-4 border-black border-opacity-40 button">
                <img src="@/images/close.svg" class="inline mr-2 w-5" alt="">
                {{ $t('other.notNow') }}
            </button>
        </section>
    </div>
</template>