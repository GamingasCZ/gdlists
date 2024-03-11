<script setup lang="ts">

const emit = defineEmits<{
	(e: "addContainer", key: string): string
	(e: "setAlignment", align: string): string
}>()

const BASE_URL = import.meta.env.BASE_URL

const actions = [
	[
		["bold", "Tučně", ""],
		["cursive", "Kurzívou", ""],
		["underline", "Podtrženě", ""],
		["strike", "Přeškrtnutě", ""],
		["color", "Barva písma", ""]
	],
	[
		["heading1", "Nadpis 1"],
		["heading2", "Nadpis 2"],
		["heading3", "Nadpis 3"]
	],
	[
		["alignLeft", "Zarovnat doleva", "left"],
		["alignCenter", "Zarovnat doprostřed", "center"],
		["alignRight", "Zarovnat doprava", "right"],
		["alignJustify", "Zarovnat do bloku", "justify"]
	],
	[
		["list", "Seznam"],
		["showLevel", "Zobrazit level"],
		["showImage", "Přidat obrázek"],
		["addVideo", "Přidat video"],
		["showRating", "Zobrazit hodnocení"],
		["twoColumns", "Dva sloupce"]
	]
]

</script>

<template>
	<section class="flex overflow-auto sticky top-10 z-40 items-center p-1 mt-6 mb-2 text-3xl text-white rounded-md bg-greenGradient">
		<div v-for="(action, index) in actions" class="flex gap-1 items-center">
			<hr v-show="index > 0" class="inline-flex mx-2 mt-2 w-0.5 bg-white border-none opacity-10 aspect-square">
			<button
				v-for="button in action"
				:title="button[1]"
				@click="index != 2 ? emit('addContainer', button[0]) : emit('setAlignment', button[2])"
				class="p-1 w-8 rounded-md transition-colors duration-75 hover:bg-opacity-40 hover:bg-black"
			>
				<img :src="`${BASE_URL}/formatting/${button[0]}.svg`" class="w-6">
			</button>
		</div>
	</section>
</template>
