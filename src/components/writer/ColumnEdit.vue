<script setup lang="ts">
import type { PostData } from '@/interfaces';
import { computed, inject, ref, type Ref } from 'vue';
import DeleteColumnIcon from "../../images/delColun.svg?raw"
import GrowColumnIcon from "../../images/grow.svg?raw"
import GapsIcon from "../../images/gaps.svg?raw"
import Tooltip from '../ui/Tooltip.vue';

const postData = inject<Ref<PostData>>("postData")!
const selectedNest = inject<Ref<number[]>>("selectedNestContainer")!

const emit = defineEmits<{
    (e: "close"): void
}>()

const columnCommand = inject<(ind: number) => void>("columnCommand")!
const dupButton = ref<HTMLButtonElement>()
const delButton = ref<HTMLButtonElement>()
const dupButtonTooltip = ref(0)

const isFillColumn = computed(() =>
    !postData.value.containers?.[selectedNest.value[0]]?.settings?.components?.[selectedNest.value[1]]?.includes(true))

const hasGaps = computed(() =>
    !postData.value.containers?.[selectedNest.value[0]]?.settings?.gaps)

</script>

<template>
    <div @mousedown.prevent="" @click.stop="" class="flex rounded-md">
        <div class="flex flex-col gap-1 items-center p-2 bg-black bg-opacity-40 rounded-l-md">
            <button @click="columnCommand(8)" class="p-1 button">
                <img src="@/images/moveUp.svg" class="w-5" alt="">
            </button>
            <button @click="columnCommand(9)" class="p-1 mt-1 button">
                <img src="@/images/moveDown.svg" class="w-5" alt="">
            </button>

            <button ref="delButton" @click="columnCommand(7); emit('close')" @mouseover="dupButtonTooltip = 3" @mouseleave="dupButtonTooltip = 0" class="p-1 mt-auto button">
                <div class="w-6 h-6 fill-red-400" v-html="DeleteColumnIcon"></div>
                <Tooltip v-if="dupButtonTooltip == 3" :button="delButton" :text="$t('reviews.removeColumn')" />
            </button>
            <button @click="columnCommand(10); emit('close')" class="p-1 w-max bg-red-400 rounded-md button">
                <img src="@/images/del.svg" alt="" class="w-6">
            </button>
        </div>
        <div class="flex flex-col gap-3 justify-center p-2 text-xl text-center text-white min-w-60">
            <div class="flex justify-evenly items-center">
                <button :disabled="postData.containers[selectedNest[0]].settings.components.length > 9" @click="columnCommand(0)" class="box-border p-1 w-9 bg-black bg-opacity-40 rounded-md disabled:opacity-40 hover:bg-opacity-60 aspect-square">
                    <img src="@/images/back.svg" class="mx-auto w-5 button" alt="">
                </button>
                <div class="flex flex-col">
                    <span class="leading-none">{{ $t('other.add') }}</span>
                    <span class="text-xs leading-none opacity-40">{{ $t('other.column') }}</span>
                </div>
                <button :disabled="postData.containers[selectedNest[0]].settings.components.length > 9" @click="columnCommand(1)" class="box-border p-1 w-9 bg-black bg-opacity-40 rounded-md disabled:opacity-40 hover:bg-opacity-60 aspect-square">
                    <img src="@/images/back.svg" class="mx-auto w-5 rotate-180 button" alt="">
                </button>
                <hr class="w-0.5 h-3 border border-white opacity-20">
                <button ref="dupButton" @mouseover="dupButtonTooltip = 1" @mouseleave="dupButtonTooltip = 0" :disabled="postData.containers[selectedNest[0]].settings.components.length > 9" @click="columnCommand(3)" class="box-border relative p-1 w-9 bg-black bg-opacity-40 rounded-md disabled:opacity-40 hover:bg-opacity-60 aspect-square">
                    <img src="@/images/copy.svg" class="mx-auto w-5 button" alt="">
                    <Tooltip v-if="dupButtonTooltip == 1" :button="dupButton" :text="$t('reviews.dupColumn')" />
                </button>
            </div>
            
            <div class="flex gap-4 justify-between mt-1">
                <div>
                    <div class="flex flex-col mt-2 text-left">
                        <span class="leading-none">{{ $t('reviews.vertAlign') }}</span>
                        <span class="text-xs leading-none opacity-40">{{ $t('reviews.cContent') }}</span>
                    </div>
                    <div class="flex flex-col gap-1 mt-2">
                        <button @click="columnCommand(11)" class="box-border p-1 w-20 bg-black bg-opacity-40 rounded-md hover:bg-opacity-60">
                            <img src="@/images/moveUp.svg" :class="{'opacity-40': postData.containers[selectedNest[0]].settings.components[selectedNest[1]][11]}" class="mx-auto w-5 button" alt="">
                        </button>
                        <button @click="columnCommand(12)" class="box-border p-1 w-20 bg-black bg-opacity-40 rounded-md hover:bg-opacity-60">
                            <img src="@/images/moveMiddle.svg" :class="{'opacity-40': !postData.containers[selectedNest[0]].settings.components[selectedNest[1]].includes(1)}" class="mx-auto w-5 rotate-180 button" alt="">
                        </button>
                        <button @click="columnCommand(13)" class="box-border p-1 w-20 bg-black bg-opacity-40 rounded-md hover:bg-opacity-60">
                            <img src="@/images/moveUp.svg" :class="{'opacity-40': !postData.containers[selectedNest[0]].settings.components[selectedNest[1]].includes(2)}" class="mx-auto w-5 rotate-180 button" alt="">
                        </button>
                    </div>
                </div>


                <div class="flex flex-col gap-4 grow">
                    <button ref="growButton" @click="columnCommand(6)" class="flex gap-2 justify-center items-center bg-black bg-opacity-40 rounded-md grow button">
                        <div class="w-5 h-5 stroke-white" :class="{'!stroke-lof-400': !isFillColumn}"
                        v-html="GrowColumnIcon"></div>
                        <span>{{ isFillColumn ? $t('reviews.expand') : $t('reviews.fill') }}</span>
                    </button>
                    <button @click="columnCommand(14)" class="flex gap-2 justify-center items-center p-1 bg-black bg-opacity-40 rounded-md button grow">
                        <div class="w-6 h-6 hue-rotate-90 fill-lof-400" :class="{'stroke-white': hasGaps, 'stroke-lof-400': !hasGaps}" v-html="GapsIcon"></div>
                        <span>{{ $t('reviews.colGaps') }}</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
