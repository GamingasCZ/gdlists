<script setup lang="ts">

const props = defineProps<{
    optIcons: string[]
    optNames: string[]
    id: string
    imgWidth?: number
}>()

if (props.optIcons.length != props.optNames.length) {
    throw new Error("Radio controls need same amout of icons as names");
}

const model = defineModel()

const base = import.meta.env.BASE_URL

</script>

<template>
    <fieldset class="flex gap-2 justify-center mt-2">
        <label v-for="(button, index) in optNames" class="flex flex-col items-center p-2 w-full text-center bg-black bg-opacity-20 rounded-md max-w-24">
            <img :src="base + optIcons[index]" :style="{width: imgWidth ? `${imgWidth}px` : ''}" class="mx-auto opacity-40 max-w-16" alt="">
            <span>{{ button }}</span>
            <input
                type="radio"
                :value="index"
                v-model="model"
                :name="id"
                class="!m-0"
                :id="`${id}-${button}`"
            >
        </label>
    </fieldset>
</template>