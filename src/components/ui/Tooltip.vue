<script setup lang="ts">
import { createPopper } from '@popperjs/core';
import type { Instance } from '@popperjs/core';
import { onBeforeUnmount, onMounted, ref } from 'vue';


const props = defineProps<{
    text: string
    button: HTMLElement
}>()

const dropdown = ref<HTMLElement>()
var popper: Instance
onMounted(() => {
    popper = createPopper(props.button, dropdown.value, {
        placement: 'bottom',
        modifiers: [{name: 'arrow'}, {name:'offset', options: {offset: [0, 12]}}]
    })
})

onBeforeUnmount(() => popper.destroy())

</script>

<template>
    <Teleport to="body">
        <div ref="dropdown" role="tooltip" class="flex z-50 gap-2 items-center bg-lof-200" data-popper-placement>
            <div
            class="p-2 text-sm text-white rounded-md shadow-drop" id="tooltip">
                <div data-popper-arrow class="-z-10 bg-lof-200" id="arrow" alt=""></div>    
                <p>{{ text }}</p>
            </div>
            <slot name="after" />
        </div>
    </Teleport>
</template>

<style>
#tooltip[data-popper-placement=''] #arrow {@apply top-8; }
#tooltip[data-popper-placement^='top'] #arrow {@apply -bottom-4; }
</style>