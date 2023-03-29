<script setup lang="ts">
import { ref, onMounted } from "vue";
import { levelList, testIfImageExists } from "../../Editor";

const emit = defineEmits<{
    (e: 'closePopup'): void
}>()

const loadedImage = ref<string>("loading")
onMounted(async () => {
    await testIfImageExists(levelList.value.titleImg[0]).then((exists: any) => loadedImage.value = exists)
});

const dragBoxTopOffset = ref<number>(0)
const draggingDragBox = ref<boolean>(false)

const setDragboxPos = (e: MouseEvent) => {
    if (!draggingDragBox.value) return

    let image = (document.querySelector("#dragboxImage") as HTMLImageElement)
    let dragbox = (document.querySelector("#dragbox") as HTMLElement)
    dragBoxTopOffset.value = e.screenY - dragbox.clientHeight/2 - image.y

    dragBoxTopOffset.value = Math.max(0, Math.min(dragBoxTopOffset.value, image.clientHeight - dragbox.clientHeight - 4)) // 4 = dragbox border width
    
    levelList.value.titleImg[1] = dragBoxTopOffset.value / (image.clientHeight - dragbox.clientHeight - 4) * 100 // percentage
}

</script>

<template>
    <dialog open @click="emit('closePopup')">
        <section @click.stop="" class="max-w-[95vw] text-white shadow-lg shadow-black w-[30rem] absolute top-1/2 left-1/2 p-2 rounded-lg -translate-x-1/2 -translate-y-1/2 bg-greenGradient">
            <div :style="{backgroundImage: loadedImage ? `url('${loadedImage}')` : '', backgroundPositionY: levelList.titleImg[1]+'%', backgroundPositionX: ['left', 'center', 'right'][levelList.titleImg[3]]}" class="absolute w-full h-full bg-no-repeat bg-cover opacity-40 blur-md z-[-1]"></div>
            <div class="relative mb-1 h-max">
                <h2 class="text-xl font-bold text-center">Nastavení obrázku</h2>
                <img src="@/images/close.svg" alt="" class="absolute top-0 right-0 w-6 button" @click="emit('closePopup')">
            </div>

            <div v-if="levelList.titleImg[0] == ''" class="flex gap-4 items-center p-3 mt-2 bg-blue-600 bg-opacity-30 rounded-md">
                <img src="@/images/info.svg" alt="" class="w-8">
                <span>Zadej <i>URL obrázku nebo animace</i> a zde pak budeš moct nastavit jeho vlastnosti!</span>
            </div>
            <div v-else-if="loadedImage == 'loading'" class="flex flex-col justify-center items-center py-6 mt-2 rounded-md">
                <img src="@/images/loading.webp" class="w-10 opacity-50 animate-spin" alt="">
                <span class="opacity-50">Načítání obrázku...</span>
            </div>
            <div v-else-if="!loadedImage" class="flex gap-4 items-center p-3 mt-2 bg-red-600 bg-opacity-30 rounded-md">
                <img src="@/images/close.svg" alt="" class="w-8">
                <span>Nepodařilo se načíst obrázek! URL obrázku velkou většinu času končí příponou <i>.jpg/.png/.webp/.gif!</i></span>
            </div>

            <main v-else class="flex gap-6 max-sm:flex-col max-sm:items-center">
                <section class="relative w-max h-max">
                    <img :src="levelList.titleImg[0]" alt="" class="w-52 pointer-events-none" id="dragboxImage">
                    <div @mousedown="draggingDragBox = true" @mouseout="draggingDragBox = false" @mouseup="draggingDragBox = false" @mousemove="setDragboxPos" :style="{top: dragBoxTopOffset+'px', height: levelList.titleImg[2]+'%'}" id="dragbox" class="absolute top-0 w-full border-4 border-green-400 active:cursor-move active:scale-x-105 hover:scale-x-[1.02] transition-transform duration-75"></div>
                </section>
                <section class="flex flex-col gap-3">
                    <div>
                        <h3>Zakrytí</h3>
                        <input type="range" name="" id="" class="slider" v-model="levelList.titleImg[2]" @input="dragBoxTopOffset = 0; levelList.titleImg[1] = 0" min="10" max="95">
                    </div>
                    <div>
                        <h2>Zarovnání</h2>
                        <div class="flex gap-2">
                            <button @click="levelList.titleImg[3] = 0" class="p-1 bg-black bg-opacity-40 rounded-md button"><img class="w-6" :class="{disabled: levelList.titleImg[3] != 0}" src="@/images/alignLeft.svg" alt=""></button>
                            <button @click="levelList.titleImg[3] = 1" class="p-1 bg-black bg-opacity-40 rounded-md button"><img class="w-6" :class="{disabled: levelList.titleImg[3] != 1}" src="@/images/alignCenter.svg" alt=""></button>
                            <button @click="levelList.titleImg[3] = 2" class="p-1 bg-black bg-opacity-40 rounded-md button"><img class="w-6" :class="{disabled: levelList.titleImg[3] != 2}" src="@/images/alignRight.svg" alt=""></button>
                        </div>
                    </div>
                    <div>
                        <input class="button" type="checkbox" name="" id="" v-model="levelList.titleImg[4]"><span>Přechod</span>
                    </div>
                </section>
            </main>

        </section>
    </dialog>
</template>