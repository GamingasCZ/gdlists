<script setup lang="ts">
import { arrow, createPopper, offset } from '@popperjs/core';
import { onMounted, ref } from 'vue';


const props = defineProps<{
    text: string
    button: HTMLElement
}>()

const dropdown = ref<HTMLElement>()
onMounted(() => {
    createPopper(props.button, dropdown.value, {
        placement: 'bottom',
        modifiers: [{name: 'arrow'}, {name:'offset', options: {offset: [0, 12]}}]
    })
})

</script>

<template>
    <Transition name="fade" >
        <Teleport to="body">
            <div ref="dropdown" role="tooltip" class="z-50" data-popper-placement>
                <div
                class="p-1 text-sm text-white rounded-md shadow-drop max-w-52 bg-lof-200" id="tooltip">
                    <div data-popper-arrow class="bg-lof-200 -z-10" id="arrow" alt=""></div>    
                    <p>{{ text }}</p>
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