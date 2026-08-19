<script setup lang="ts">
import { computed, ref } from 'vue';
import TabBar from '../ui/TabBar.vue';
import ColorizerPicker from './ColorizerPicker.vue';
import { i18n } from '@/locales.ts';
import ColorizerPreset from './ColorizerPreset.vue';
import chroma from 'chroma-js';
import type { Stop } from '@/interfaces.ts';
import ColorPicker from '../global/ColorPicker.vue';

const MESSAGES = computed(() => [
    i18n.global.t('reviews.gradHelp1'),
    i18n.global.t('reviews.gradHelp2'),
    i18n.global.t('reviews.gradHelp3', ['aaaa'])
])

const buttons = [
    [],
    [i18n.global.t('other.preview'), i18n.global.t('other.activate')],
    [i18n.global.t('other.deactivate')]
]

const presets = [
    {
        name: 'Trans Flag',
        gradient: [{"color":[197,0.94,0.67],"position":0},{"position":0.25,"color":[348,0.79,0.81]},{"position":0.5,"color":[0,0,1]},{"position":0.75,"color":[348,0.79,0.81]},{"color":[197,0.94,0.67],"position":1}]
    },
    {
        name: 'Gold',
        gradient: [{"color":[197,0.94,0.67],"position":0},{"position":0.25,"color":[324,0.63,0.73]},{"position":0.5,"color":[0,0,1]},{"position":0.75,"color":[324,0.63,0.73]},{"color":[197,0.94,0.67],"position":1}]
    },
    {
        name: 'Sunset',
        gradient: [{"color":[197,0.94,0.67],"position":0},{"position":0.25,"color":[324,0.63,0.73]},{"position":0.5,"color":[0,0,1]},{"position":0.75,"color":[324,0.63,0.73]},{"color":[197,0.94,0.67],"position":1}]
    },
    {
        name: 'Heaven to Hell',
        gradient: [{"color":[197,0.94,0.67],"position":0},{"position":0.25,"color":[324,0.63,0.73]},{"position":0.5,"color":[0,0,1]},{"position":0.75,"color":[324,0.63,0.73]},{"color":[197,0.94,0.67],"position":1}]
    },
    {
        name: 'Sunset',
        gradient: [{"color":[197,0.94,0.67],"position":0},{"position":0.25,"color":[324,0.63,0.73]},{"position":0.5,"color":[0,0,1]},{"position":0.75,"color":[324,0.63,0.73]},{"color":[197,0.94,0.67],"position":1}]
    },
]

const applyButtonState = ref(2)
const tab = ref(2)

const colorPicker = ref<HTMLDivElement & {addStop: () => void, reverseGradient: () => void}>()

const grad = ref<Stop[]>([{color: [180, 1, 0.5], position: 0}, {color: [270, 1, 0.5], position: 1}])

const cloneStop = (ind: number) => {
    let newStop:Stop = JSON.parse(JSON.stringify(grad.value[ind]))
    newStop.position += newStop.position > 0.5 ? -0.1 : 0.1
    grad.value.splice(ind, 0, newStop)
}

var editing = ref(-1)
const gC = (i: number) => {
    ed.value = i
    document.querySelector("input[type='color']").click()
}
</script>

<template>
    <div class="grid grid-rows-[max-content,_30rem,_max-content]">
        <TabBar @switched-tab="tab = $event" :default-tab="2" :tab-names="[$t('other.custom'), $t('navbar.saved'), $t('other.presets')]" />
        <section class="flex relative p-2 bg-black bg-opacity-40 h-30 max-h-30">
            <template v-if="tab == 0">
                <ColorizerPicker
                    ref="colorPicker"
                    :gradient="grad"

                />
                <section class="flex absolute top-0 right-0 bottom-0 flex-col w-3/5 bg-greenGradient">
                    <div class="flex justify-between items-center p-3">
                        <span class="text-xl">{{ $t('review.gradStops') }}</span>
                        <button @click="colorPicker?.addStop()" class="flex gap-2 px-2 py-1 bg-black bg-opacity-40 rounded-md button"><img src="@/images/plus.svg" class="w-5" alt="">{{ $t('other.add') }}</button>
                    </div>
                    <!-- <input type="color" @input="grad[ed].color = chroma($event.target.value).hsl()" class="invisible" name="" id=""> -->
                    <div class="overflow-auto bg-black bg-opacity-20 grow">
                        <div v-for="(stop, ind) in grad" class="p-2 odd:bg-black odd:bg-opacity-20">
                            <div class="flex">
                                <button @click="editing = editing == ind ? -1 : ind" class="w-7 rounded-full border-2 border-black ring-2 ring-white button aspect-square" :style="{background: chroma.hsl(...stop.color).hex()}"></button>
                                <span class="ml-3 text-xl">{{ chroma.hsl(...stop.color).hex() }}</span>
                                <span class="ml-2 opacity-40">{{ Math.round(stop.position*100) }}%</span>
                                <div class="flex gap-2 ml-auto">
                                    <button @click="cloneStop(ind)" class="p-0.5 w-6 bg-black bg-opacity-40 rounded-md aspect-square"><img src="@/images/copy.svg" alt=""></button>
                                    <button @click="grad.splice(ind, 1)" class="p-0.5 w-6 bg-black bg-opacity-40 rounded-md aspect-square"><img src="@/images/trash.svg" alt=""></button>
    
                                </div>
                            </div>
                            <ColorPicker
                                v-if="editing == ind"
                                @colors-modified="stop.color = $event"
                                full
                                :hue="stop.color[0]"
                                :lightness="stop.color[2] * 100"
                                :saturation="stop.color[1] * 100"
                                class="mt-4"
                            />
                        </div>
                    </div>
                    <div class="flex gap-2 justify-around px-2 py-2">
                        <button @click="colorPicker?.reverseGradient()" class="flex gap-2 justify-center py-1 bg-white bg-opacity-0 rounded-md duration-75 transition-color hover:bg-opacity-10 grow"><img src="@/images/replay.svg" class="w-5">{{ $t('other.flip') }}</button>
                        <button class="flex gap-2 justify-center py-1 bg-white bg-opacity-0 rounded-md duration-75 transition-color hover:bg-opacity-10 grow"><img src="@/images/symbolicSave.svg" class="w-5">{{ $t('other.save') }}</button>
                    </div>
                </section>
            </template>
            <template v-else-if="tab == 1">
                <div class="flex flex-col gap-3 justify-center items-center w-full opacity-40">
                    <img src="@/images/color.svg" class="w-32" alt="">
                    <h2 class="text-2xl">{{ $t('reviews.palHelp1') }}</h2>
                    <span>{{ $t('reviews.palHelp2') }}</span>
                </div>
            </template>
            <template v-else-if="tab == 2">
                <div class="flex flex-wrap gap-6 justify-evenly p-3 w-full h-full">
                    <ColorizerPreset v-for="preset in presets" :gradient="preset.gradient" :name="preset.name" />
                </div>
            </template>
    
        </section>
        <div class="flex gap-2 items-center px-2 py-1 m-2 bg-black bg-opacity-40 rounded-md">
            <img v-if="applyButtonState == 0" src="@/images/info.svg" class="w-5" alt="">
            <img v-else src="@/images/color.svg" class="w-5" alt="">
            <span>{{ MESSAGES[applyButtonState] }}</span>
            <div class="flex justify-end grow">
                <button v-for="button in buttons[applyButtonState]" class="px-2 py-1 bg-black bg-opacity-40 rounded-md">{{ button }}</button>
            </div>
        </div>
    </div>
</template>