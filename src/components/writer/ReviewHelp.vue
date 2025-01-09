<script setup lang="ts">
import { inject, ref } from 'vue';

const props = defineProps<{
	inverted: boolean
	noRatings: boolean
	hasLevels: boolean
	hasRatings: boolean
}>()
const emit = defineEmits(['startWriting'])
const openedDialogs = inject("openedDialogs")

const invert = ref(props.inverted ? 'invert(1)' : 'invert(0)')
</script>

<template>
	<div class="grid sm:grid-cols-2 font-[poppins] py-4 px-2 gap-y-5">
		<h2 class="text-3xl font-black">Rozepsané</h2>
	</div>
</template>

<style>

.invertable {
	filter: v-bind('invert');
}

</style>
