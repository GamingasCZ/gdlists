<script setup lang="ts">
import { ref } from 'vue';


defineProps<{
    colAmount: number
}>()

const hoveringAmount = defineModel({default: -1})

</script>

<template>
    <div class="flex" @mouseout="hoveringAmount = -1">
        <button
            v-for="i in colAmount"
            @mouseover="hoveringAmount = i"
            :class="{'bg-lof-300': hoveringAmount >= i}"
            class="h-8 border grow border-lof-400"
        ></button>
    </div>
</template>