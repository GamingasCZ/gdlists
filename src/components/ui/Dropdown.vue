<script setup lang="ts">

defineProps<{
    title: string
    options: string[]
}>()

const emit = defineEmits<{
    (e: "pickedOption", opt: number): void
    (e: "close"): void
}>()

document.body.addEventListener("click", () => emit("close"), {once: true, passive: false})

</script>

<template>
    <Transition name="fade">
        <div
        class="flex absolute left-1/2 flex-col gap-1 p-1 w-40 text-center bg-black bg-opacity-90 rounded-md backdrop-blur-sm translate-x-[calc(-50%_-_4px)]">
        <img src="@/images/popupArr.svg" class="absolute -top-5 left-1/2 w-5 opacity-90 -translate-x-1.5" alt="">
            <h2 class="font-bold">{{ title }}</h2>
            <button
                v-for="(sort, index) in options"
                @click.stop="emit('pickedOption', index); emit('close')"
                class="block p-1 w-full text-white bg-white bg-opacity-10 rounded-md button focus-visible:!outline focus-visible:!outline-current">{{
                    sort }}</button>
        </div>
    </Transition>
</template>