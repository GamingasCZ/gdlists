<script setup lang="ts">

defineProps<{
    listPinned: boolean
}>()

const emit = defineEmits<{
  (e: "closePopup"): void,
  (e: "doListAction", action: "sharePopup" | "jumpPopup" | "pinList" | "editList" | "comments" | "mobileExtras"): string;
}>();

</script>

<template>
    <Transition name="fade">
        <dialog open @click="emit('closePopup')" tabindex="0" @keyup.esc="emit('closePopup')">
            <section @click.stop=""
            class="absolute top-1/2 left-1/2 gap-3 flex max-h-[95vh] w-[25rem] max-w-[95vw] -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg bg-greenGradient p-2 text-white shadow-lg shadow-black">
            <div class="relative">
                <h1 class="text-xl font-bold text-center">{{ $t('other.options') }}</h1>
                <img src="@/images/close.svg" alt="" class="absolute top-0 right-0 w-6 button" @click="emit('closePopup')" />
            </div>
            <button class="flex gap-2 items-center p-1 bg-white bg-opacity-10 rounded-md button" @click="emit('closePopup'); emit('doListAction', 'sharePopup')" >
                <img class="w-8" src="../../images/share.svg" alt="">{{ $t('other.share') }}
            </button>
            <button class="flex gap-2 items-center p-1 bg-white bg-opacity-10 rounded-md button" @click="emit('closePopup'); emit('doListAction', 'jumpPopup')" >
                <img class="w-8" src="../../images/jumpto.svg" alt="">{{ $t('listViewer.jumpTo') }}
            </button>
            <button class="flex gap-2 items-center p-1 bg-white bg-opacity-10 rounded-md button" @click="emit('closePopup'); emit('doListAction', 'pinList')" >
                <img class="w-8" src="../../images/pin.svg" alt="" v-if="listPinned">
                <img class="w-8" src="../../images/unpin.svg" alt="" v-else>
                {{listPinned ? $t('level.pin') : $t('level.unpin')}}
            </button>
            <button class="flex gap-2 items-center p-1 bg-white bg-opacity-10 rounded-md button" @click="emit('closePopup'); emit('doListAction', 'editList')" >
                <img class="w-8" src="../../images/edit.svg" alt="">{{ $t('level.edit') }}
            </button>
            </section>
        </dialog>
    </Transition>
</template>