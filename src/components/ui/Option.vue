<script setup lang="ts">

type controlType = "cbox" | "dropdown" | "radio" | "slot"

const model = defineModel()

defineProps<{
    name: string
    desc?: string
    control: controlType
    controlOptions?: [string, number][] | number
}>()

</script>

<template>
    <div @click.stop="" class="p-2 pr-0 mt-2 bg-black bg-opacity-40 rounded-md">
        <div class="flex justify-between items-center w-full">
            <div>
            <p class="text-xl leading-none">{{ name }}</p>
            <p class="text-sm opacity-40">{{ desc }}</p>
            </div>

            <input v-if="control == 'cbox'" v-model="model" type="checkbox" class="w-12 button" name="transparency" id="opaque">
            <select class="mr-2" v-else-if="control == 'dropdown'" v-model="model">
                <option v-for="opt in controlOptions" :value="opt[1]">{{ opt[0] }}</option>
            </select>
        </div>
        <div v-if="control == 'slot'">
            <slot />
        </div>
    </div>
</template>