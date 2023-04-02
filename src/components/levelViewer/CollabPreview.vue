<script setup lang="ts">
import type { CollabData } from '../../interfaces'

const props = defineProps<{
    collab: CollabData
}>()

</script>

<template>
    <section>
        <h2 class="text-xl font-black text-center">{{ collab[0][2] ?? "Host" }}: {{ collab[0][0] }}</h2>
        <div class="p-2 bg-black bg-opacity-40 rounded-lg button">
            <span v-for="person in collab[2]" :style="{color: person.color}">{{ person.name }}, </span>
        </div>
    </section>
</template>