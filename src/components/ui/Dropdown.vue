<script setup lang="ts">
import { createPopper } from '@popperjs/core';
import type { Instance } from '@popperjs/core';
import { onBeforeUnmount, onMounted, ref } from 'vue';


const props = defineProps<{
    title: string
    options: string[]
    icons?: string[]
    button: HTMLElement
}>()

const emit = defineEmits<{
    (e: "pickedOption", opt: number): void
    (e: "close"): void
}>()

const dropdown = ref<HTMLElement>()
var popper: Instance
onMounted(() => {
    popper = createPopper(props.button, dropdown.value, {
        placement: 'bottom',
        modifiers: [{name: 'arrow'}, {name:'offset', options: {offset: [0, 12]}}]
    })
})

const closeDropdown = e => {
    let rect = dropdown.value?.getBoundingClientRect()
    if (e.x < rect?.left || e.x > rect?.right+rect?.width || e.y < rect?.top || e.y > rect?.top+rect?.height) {
        emit('close')
        document.body.removeEventListener("click", closeDropdown, {capture: true})
    }
}

onBeforeUnmount(() => popper.destroy())

document.body.addEventListener("click", closeDropdown, {capture: true})

</script>

<template>
    <Transition name="fade" >
        <Teleport to="body">
            <div ref="dropdown" @mousedown.prevent="" role="tooltip" class="z-50 shadow-drop" data-popper-placement>
                <div
                class="flex flex-col max-w-max bg-opacity-90 rounded-md min-w-40 bg-lof-200" id="tooltip">
                    <div data-popper-arrow class="bg-lof-200 -z-10" id="arrow" alt=""></div>    
                    <slot name="header" />
                    <button
                            v-for="(sort, index) in options"
                            @click.stop="emit('pickedOption', index); emit('close')"
                            :style="{backgroundImage: `url(${icons?.[index] ?? ''})`, backgroundSize: '1.25rem', backgroundPosition: '5px center'}"
                            class="pl-8 block bg-no-repeat text-left p-1 text-white hover:bg-lof-300 transition-colors duration-75 rounded-md m-1 focus-visible:!outline focus-visible:!outline-current">{{ sort }}</button>
                    <slot name="footer" />
                </div>
            </div>
        </Teleport>
    </Transition>
</template>

<style>
#arrow,
#arrow::before {@apply absolute w-4 h-4 bg-inherit -translate-y-2}

#arrow {@apply invisible}

#arrow::before {@apply visible content-[''] rotate-45;}

#tooltip[data-popper-placement^='top'] > #arrow {@apply -bottom-4; }
#tooltip[data-popper-placement^='bottom'] > #arrow {@apply -top-4; }
#tooltip[data-popper-placement^='left'] > #arrow {@apply -right-4; }
#tooltip[data-popper-placement^='right'] > #arrow {@apply -left-4; }
</style>