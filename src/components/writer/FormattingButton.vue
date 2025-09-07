<script setup lang="ts">
import { ref } from 'vue';
import Tooltip from '../ui/Tooltip.vue';
import Dropdown from '../ui/Dropdown.vue';
import { SETTINGS } from '@/siteSettings';
import type { ToolbarButton, ToolbarAction } from '@/writers/Writer';
import { comboHeld, doOverride, isFirefox } from '@/writers/shortcuts';

const props = defineProps<{
    button: ToolbarButton
    disabled: boolean
}>()

const emit = defineEmits<{
    (e: 'clicked', action: ToolbarAction): void
}>()

const base = import.meta.env.BASE_URL
const but = ref<HTMLButtonElement>()
const hovering = ref(false)
const lastSelected = ref(0)
const iconPath = (x: string | string[]) => {
    return `${base}/formatting/${typeof x == 'string' ? x : x[lastSelected.value]}.svg`
}

const dropdownOpen = ref(false)
const getAction = (holdingShift: boolean) => {
    let obj = {action: null, shift: false}
    obj.action = typeof props.button.action[1] == 'object'
    ? props.button?.action[1]?.[lastSelected.value] : props.button?.action?.[1]
    obj.shift = holdingShift

    return obj
}

const titleSwitchable = ref(0)
const swapTitle = (ind: number) => titleSwitchable.value = ind

const extComponent = ref<HTMLButtonElement>()

</script>

<template>
    <div
        @click.right.prevent.exact="dropdownOpen = true"
        @mouseover="hovering = true"
        @mouseleave="hovering = false"
        :class="{'!bg-opacity-60 bg-black': false}"
        :style="{marginLeft: button?.leftOffset ? `${button.leftOffset[+SETTINGS.compactToolbar]}rem` : null}"
        ref="but"
        class="flex relative flex-col items-center w-max rounded-md transition-colors duration-75 group disabled:opacity-40 hover:bg-opacity-40 hover:bg-black"
    >
        <component v-if="button.component" ref="extComponent" @modify-title="swapTitle" :is="button.component" :disabled="disabled" />
        <button
            v-else
            @mousedown.prevent=""
            class="relative p-1 disabled:opacity-40"
            @click="emit('clicked', getAction($event.shiftKey))"
            :disabled="disabled"
        >
            <img :src="iconPath(button.icon)" class="w-6 pointer-events-none min-w-6">
        </button>
        <div v-if="!isFirefox && comboHeld == button?.shortcut?.[0]" class="absolute -bottom-4 left-1/2 z-10 px-2 py-1 text-sm rounded-sm -translate-x-1/2 bg-lof-100">{{ doOverride(button.shortcut[1]) }}</div>
        <button
            @click.stop="
                button?.dropdownText ?
                    (dropdownOpen = !dropdownOpen) :
                    (button.component ?
                        extComponent?.clickAction() :
                        emit('clicked', getAction())
                    )" 
                v-if="(button.title || button?.titleSwitchable) && !SETTINGS.compactToolbar"
                @mousedown.prevent=""
                :disabled="disabled" class="flex relative px-2 w-full rounded-b-md disabled:opacity-40" :class="{'hover:bg-black': button?.dropdownText}">
            <span :class="{'font-bold': button.bold, 'group-hover:opacity-0': button?.dropdownText}" class="text-sm transition-opacity duration-75">{{ button?.title ?? button?.titleSwitchable?.[titleSwitchable] }}</span>
            <img
                v-if="button?.dropdownText"
                src="@/images/dropdown.svg"
                class="absolute top-1/2 left-1/2 w-4 opacity-0 transition-opacity duration-75 -translate-x-1/2 -translate-y-1/2 button group-hover:opacity-100"
                alt="">
        </button>

        <Tooltip
            v-if="(button?.tooltip || (SETTINGS.compactToolbar && button?.title)) && hovering"
            :text="button?.tooltip || (SETTINGS.compactToolbar ? button?.title : '')"
            :button="but"
        />

        <Dropdown v-if="button?.dropdownText && dropdownOpen" @close="dropdownOpen = false" :button="but">
            <template #header>
                <div class="flex gap-2 p-2 text-white">
                    <button
                        v-for="(opt, ind) in button.dropdownText"
                        @click="lastSelected = ind; dropdownOpen = false; emit('clicked', getAction($event.shiftKey))"
                        class="flex flex-col gap-2 items-center p-1 px-4 text-sm bg-black bg-opacity-40 rounded-md hover:bg-opacity-80 hover:bg-black"
                    >
                        <img class="w-6" :src="iconPath(button.icon[ind])" alt="">
                        <span>{{ opt }}</span>
                    </button>
                </div>
            </template>
        </Dropdown>
        
    </div>
    <hr v-if="button?.splitAfter" class="inline-flex mx-2 w-0.5 h-4 bg-white border-none opacity-10 aspect-square">
</template>