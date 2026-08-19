<script setup lang="ts">
import { computed, ref } from 'vue';
import TabBar from '../ui/TabBar.vue';
import ColorizerPicker from './ColorizerPicker.vue';
import { i18n } from '@/locales.ts';
import ColorizerPreset from './ColorizerPreset.vue';

const MESSAGES = computed(() => [
    "Zatím jsi nevybral žádnou paletu.",
    "Vybral jsi novou paletu.",
    "Paleta {0} je aktivní."
])

const buttons = [
    [],
    [i18n.global.t('other.preview'), i18n.global.t('other.activate')],
    [i18n.global.t('other.deactivate')]
]

const applyButtonState = ref(2)
const tab = ref(2)

const grad = ref([{color: [180, 1, 0.5], position: 0}, {color: [270, 1, 0.5], position: 1}])
</script>

<template>
    <div class="grid grid-rows-[max-content,_30rem,_max-content]">
        <TabBar @switched-tab="tab = $event" :default-tab="2" :tab-names="[$t('other.custom'), $t('navbar.saved'), $t('other.presets')]" />
        <section class="flex p-2 bg-black bg-opacity-40 h-30 max-h-30">
            <template v-if="tab == 0">
                <ColorizerPicker
                    @moved-stop="grad[$event.ind].position = $event.newPos"
                    :gradient="grad"

                />
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
                    <ColorizerPreset v-for="i in 10" :gradient="grad" name="testk" selected />
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