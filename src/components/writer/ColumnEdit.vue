<script setup lang="ts">
import type { PostData } from '@/interfaces';
import { inject, type Ref } from 'vue';

const postData = inject<Ref<PostData>>("postData")!
const selectedNest = inject<Ref<number[]>>("selectedNestContainer")!

const emit = defineEmits<{
    (e: "close"): void
}>()

const columnCommand = inject<(ind: number) => void>("columnCommand")!

</script>

<template>
    <div @mousedown.prevent="" @click.stop="" class="m-2">
        <div class="flex flex-col gap-3 justify-center mb-5 text-xl text-center text-white">
            <div v-for="(setting, index) in [$t('other.add'), $t('other.duplicate')]">
                <h2>{{ $t('reviews.columnSetting', [setting]) }}</h2>
                <div>
                    <button :disabled="postData.containers[selectedNest[0]].settings.components.length > 9" @click="columnCommand(index*2)" class="box-border p-1 w-9 bg-black bg-opacity-40 rounded-md disabled:opacity-40 hover:bg-opacity-60 aspect-square">
                        <img src="@/images/moveUp.svg" class="mx-auto w-5 -rotate-90 button" alt="">
                    </button>
                    <button :disabled="postData.containers[selectedNest[0]].settings.components.length > 9" @click="columnCommand(index*2+1)" class="box-border p-1 ml-2 w-9 bg-black bg-opacity-40 rounded-md disabled:opacity-40 hover:bg-opacity-60 aspect-square">
                        <img src="@/images/moveUp.svg" class="mx-auto w-5 rotate-90 button" alt="">
                    </button>
                </div>
            </div>
            <div>
                <h2>{{ $t('reviews.vertAlign') }}</h2>
                <div>
                    <button @click="columnCommand(11)" class="box-border p-1 w-9 bg-black bg-opacity-40 rounded-md hover:bg-opacity-60 aspect-square">
                        <img src="@/images/moveUp.svg" :class="{'opacity-40': postData.containers[selectedNest[0]].settings.components[selectedNest[1]][11]}" class="mx-auto w-5 button" alt="">
                    </button>
                    <button @click="columnCommand(12)" class="box-border p-1 ml-2 w-9 bg-black bg-opacity-40 rounded-md hover:bg-opacity-60 aspect-square">
                        <img src="@/images/moveMiddle.svg" :class="{'opacity-40': !postData.containers[selectedNest[0]].settings.components[selectedNest[1]].includes(1)}" class="mx-auto w-5 rotate-180 button" alt="">
                    </button>
                    <button @click="columnCommand(13)" class="box-border p-1 ml-2 w-9 bg-black bg-opacity-40 rounded-md hover:bg-opacity-60 aspect-square">
                        <img src="@/images/moveUp.svg" :class="{'opacity-40': !postData.containers[selectedNest[0]].settings.components[selectedNest[1]].includes(2)}" class="mx-auto w-5 rotate-180 button" alt="">
                    </button>
                </div>
            </div>
            <button @click="columnCommand(7); emit('close')" class="flex gap-1 items-center p-1 text-base font-bold text-black bg-red-400 rounded-md">
                <img src="@/images/del.svg" alt="" class="w-5">
                <span>{{ $t('reviews.removeColumn') }}</span>
            </button>
            <button @click="columnCommand(6)" class="flex gap-1 items-center p-1 text-base font-bold text-black rounded-md bg-lof-400">
                <img src="@/images/grow.svg" alt="" class="w-5">
                <span v-if="!postData.containers?.[selectedNest[0]]?.settings?.components?.[selectedNest[1]]?.[10] == true">{{ $t('reviews.cMaxContent') }}</span>
                <span v-else>{{ $t('reviews.cFillSpace') }}</span>
            </button>
        </div>
        <div class="flex gap-1 justify-between">
            <button @click="columnCommand(8)" class="box-border p-1 w-9 bg-black bg-opacity-40 rounded-md hover:bg-opacity-60 aspect-square">
                <img src="@/images/moveUp.svg" class="mx-auto w-5 button" alt="">
            </button>
            <button @click="columnCommand(9)" class="box-border p-1 w-9 bg-black bg-opacity-40 rounded-md hover:bg-opacity-60 aspect-square">
                <img src="@/images/moveDown.svg" class="mx-auto w-5 button" alt="">
            </button>
            <button @click="columnCommand(10); emit('close')" class="flex gap-1 items-center p-1 ml-6 text-xl font-bold text-black bg-red-400 rounded-md">
                <img src="@/images/del.svg" alt="" class="w-6">
                <span>{{ $t('editor.remove') }}</span>
            </button>
        </div>
    </div>
</template>