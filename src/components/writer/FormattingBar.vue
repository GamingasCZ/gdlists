<script setup lang="ts">
import { useI18n } from 'vue-i18n';


const emit = defineEmits<{
	(e: "addContainer", key: string): string
	(e: "setAlignment", align: string): string
	(e: "setFormatting", format: string): string
}>()

const BASE_URL = import.meta.env.BASE_URL

const actions = [
	[
		["bold", useI18n().t('reviews.bold'), ""],
		["cursive", useI18n().t('reviews.italics'), ""],
		["underline", useI18n().t('reviews.underline'), ""],
		["strike", useI18n().t('reviews.strike'), ""],
		["color", useI18n().t('reviews.textcolor'), ""],
		["link", useI18n().t('other.link'), ""]
	],
	[
		["heading1", useI18n().t('reviews.title', ['1'])],
		["heading2", useI18n().t('reviews.title', ['2'])],
		["heading3", useI18n().t('reviews.title', ['3'])]
	],
	[
		["alignLeft", useI18n().t('reviews.align', [useI18n().t('reviews.aLeft')]), "left"],
		["alignCenter", useI18n().t('reviews.align', [useI18n().t('reviews.aCenter')]), "center"],
		["alignRight", useI18n().t('reviews.align', [useI18n().t('reviews.aRight')]), "right"],
		["alignJustify", useI18n().t('reviews.align', [useI18n().t('reviews.aJustify')]), "justify"]
	],
	[
		["divisor", useI18n().t('reviews.addDivisor')],
		["list", useI18n().t('reviews.addBpoints')],
		["showList", useI18n().t('reviews.listLink')],
		["showLevel", useI18n().t('reviews.showLevel')],
		["showCollab", useI18n().t('reviews.addUsers')],
		["showImage", useI18n().t('reviews.addImage')],
		["addVideo", useI18n().t('reviews.addVideo')],
		["showRating", useI18n().t('reviews.dispRatings')],
		["twoColumns", useI18n().t('reviews.multicolumn')]
	]
]

const doAction = (action: number, button: string) => {
	switch (action) {
		case 0:
			emit('setFormatting', button[0]); break;
		case 2:
			emit('setAlignment', button[2]); break;
		case 1:
		case 3:
			emit('addContainer', button[0]); break;
	}
}

</script>

<template>
	<section class="flex overflow-auto sticky top-10 z-20 items-center p-1 mt-6 mb-2 text-3xl text-white rounded-md bg-greenGradient">
		<div v-for="(action, index) in actions" class="flex gap-1 items-center">
			<hr v-show="index > 0" class="inline-flex mx-2 w-0.5 h-6 bg-white border-none opacity-10 aspect-square">
			<button
				v-for="button in action"
				:title="button[1]"
				@click="doAction(index, button)"
				class="p-1 w-8 rounded-md transition-colors duration-75 hover:bg-opacity-40 hover:bg-black"
			>
				<img :src="`${BASE_URL}/formatting/${button[0]}.svg`" class="w-6 pointer-events-none">
			</button>
		</div>
	</section>
</template>
