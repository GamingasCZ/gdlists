<script setup lang="ts">

const props = defineProps<{
    optIcons: string[]
    optNames: string[]
    id: string
}>()

if (props.optIcons.length != props.optNames.length) {
    throw new Error("Radio controls need same amout of icons as names");
}

const model = defineModel()

const base = import.meta.env.BASE_URL

</script>

<template>
    <fieldset class="flex gap-2 justify-center">
        <label v-for="(button, index) in optNames" class="flex flex-col items-center p-2 w-24 text-center bg-black bg-opacity-20 rounded-md">
            <img :src="base + optIcons[index]" class="w-16 opacity-40" alt="">
            <span>{{ button }}</span>
            <input
                type="radio"
                :value="index"
                v-model="model"
                :name="id"
                :id="`${id}-${button}`"
            >
        </label>
    </fieldset>
</template>