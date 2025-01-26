<script setup lang="ts">
import type { Setting } from '@/interfaces';


const model = defineModel()

defineProps<Setting>()

const emit = defineEmits(['updated'])

</script>

<template>
    <div @click.stop="" :class="{'pointer-events-none opacity-20': disabled, 'flex': control == 'inline-slot'}" class="items-center p-2 bg-black bg-opacity-40 rounded-md transition-opacity duration-75">
        <div class="flex justify-between items-center w-full">
            <div class="mr-2">
                <p class="text-xl leading-none">{{ name }}</p>
                <p class="text-sm opacity-40">{{ desc }}</p>
            </div>

            <img v-if="disabled" src="@/images/loading.webp" class="w-6 animate-spin" alt="">
            <input v-else-if="control == 'cbox'" v-model="model" @change="emit('updated')" type="checkbox" class="!mr-0 min-w-6 min-h-6 button" name="transparency" id="opaque">
            <select v-else-if="control == 'dropdown'" @change="emit('updated')" v-model="model">
                <option v-for="opt in controlOptions" :value="opt[1]">{{ opt[0] }}</option>
            </select>
        </div>
        <div v-if="['slot', 'inline-slot'].includes(control)">
            <slot />
        </div>
        <component v-model="model" v-if="control == 'component'" :is="controlOptions" />
    </div>
</template>