<script setup lang="ts">
import { ref } from 'vue';


const deleteHover = ref<boolean>(false)
const deleteAnimPlaying = ref<boolean>(false)

const emit = defineEmits(['closePopup', 'deleteList'])

const doDeleteAnim = () => {
    emit('deleteList')
    deleteAnimPlaying.value = true
    let bg = document.getElementById("removeDialog") as HTMLDivElement
    bg.style.opacity = "0"
    bg.style.backgroundColor = "white"
    setTimeout(() => {
        bg.style.transitionProperty = "opacity"
        bg.style.transitionDuration = "1s"
        bg.style.opacity = "1"
    }, 50);
    
}

</script>

<template>
    <article id="removeDialog" class="flex fixed top-0 left-0 z-50 justify-center items-center w-full h-full text-white bg-black transition-colors duration-100 ease-in-out" :class="{'bg-[#260B0B]': deleteHover}">
        <section class="flex flex-col items-center" v-if="!deleteAnimPlaying">
            <header class="">
                <img src="@/images/szn2.webp" id="delTop" class="w-48 transition-transform duration-100 ease-in-out" :class="{'translate-y-[1.25rem]': !deleteHover}" alt="">
                <img src="@/images/szn1.webp" id="delBottom" class="w-48 transition-transform duration-100 ease-in-out" :class="{'-translate-y-[1.25rem]': !deleteHover}" alt="">
            </header>
            <main class="flex flex-col items-center">
                <h1 class="text-2xl font-bold text-center">{{ $t('editor.doDeleteList') }}</h1>
                <div class="mt-3">
                    <button class="px-4 py-2 mr-3 text-2xl font-black bg-red-500 bg-opacity-20 rounded-md button" @click="doDeleteAnim" @mouseover="deleteHover = true" @mouseout="deleteHover = false">{{ $t('other.yes') }}</button>
                    <button class="px-4 py-2 text-2xl font-black bg-blue-500 bg-opacity-20 rounded-md button" @click="emit('closePopup')">{{ $t('other.no') }}</button>
                </div>
            </main>
        </section>
    </article>
</template>