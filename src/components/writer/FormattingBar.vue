<script setup lang="ts">
import { i18n } from '@/locales';
import { nextTick, ref } from 'vue';
import Dropdown from '../ui/Dropdown.vue';
import Tooltip from '../ui/Tooltip.vue';
import { addFormatting } from '../global/parseEditorFormatting';


const emit = defineEmits<{
	(e: "addContainer", key: string): string
	(e: "setAlignment", align: string): string
	(e: "setFormatting", format: string): string
}>()

const BASE_URL = import.meta.env.BASE_URL

const actions = [
	[
		["md", i18n.global.t('reviews.md'),, "Markdown"],
		["view", i18n.global.t('reviews.preview'),, i18n.global.t('other.preview')],
	],
	[
		["heading1", i18n.global.t('reviews.title', ['1'])],
		["heading2", i18n.global.t('reviews.title', ['2'])],
		["heading3", i18n.global.t('reviews.title', ['3'])]
	],
	[
		["alignLeft", i18n.global.t('reviews.align', [i18n.global.t('reviews.aLeft')]), "left"],
		["alignCenter", i18n.global.t('reviews.align', [i18n.global.t('reviews.aCenter')]), "center"],
		["alignRight", i18n.global.t('reviews.align', [i18n.global.t('reviews.aRight')]), "right"],
		["alignJustify", i18n.global.t('reviews.align', [i18n.global.t('reviews.aJustify')]), "justify"]
	],
	[
		["divisor", i18n.global.t('reviews.addDivisor')],
		["showList", i18n.global.t('reviews.listLink')],
		["showLevel", i18n.global.t('reviews.showLevel')],
		["showCollab", i18n.global.t('reviews.addUsers')],
		["showImage", i18n.global.t('reviews.addImage')],
		["addVideo", i18n.global.t('reviews.addVideo')],
		["showRating", i18n.global.t('reviews.dispRatings')],
	],
	[
		["twoColumns", i18n.global.t('reviews.multicolumn'),, "Přidat sloupec"]
	]
]

const sectionNames = ["Formátování", "Nadpisy", "Zarovnání", "Prvky"]

const base = import.meta.env.BASE_URL
const FORMATTING = ["Tučně", "Kurzívou", "Přeškrtnutě", "Odrážka", "Citace", "Odkaz"]
const icons = ["bold", "cursive", "strike", "list", "quotes", "link"].map(x => `${base}/formatting/${x}.svg`)
const formatIndicies = [0,1,2,4,5,11]

const previewEnabled = ref(false)
const mdHelpShown = ref(false)
const buttons = ref()

const doAction = (action: number, button: string) => {
	switch (action) {
		case 0:
			if (button[0] == 'view') previewEnabled.value = !previewEnabled.value
			else if (button[0] == 'md') mdHelpShown.value = true
			emit('setFormatting', button[0]);
			break;
		case 2:
			emit('setAlignment', button[2]); break;
		case 1:
		case 3:
		case 4:
			emit('addContainer', button[0]); break;
	}
}

const doFormatting = (ind: number) => {
	document.activeElement.dataset.modf = 1
	addFormatting(formatIndicies[ind], document.activeElement)
}

const hoveringIndex = ref(-1)

</script>

<template>
	<section class="flex overflow-auto sticky top-10 z-20 items-center p-1 mt-6 mb-2 text-3xl text-white rounded-md bg-greenGradient">
		<div v-for="(action, index) in actions" :class="{'ml-auto': index == 4}" class="grid grid-rows-[max-content_max-content] items-center">
			<div class="flex gap-1 items-center" :class="{'': index == 4}">
				<hr v-show="index > 0 && index < 4" class="inline-flex mx-2 w-0.5 h-10 bg-white border-none opacity-10 translate-y-3 aspect-square">
				<button
					v-for="(button, buttonIndex) in action"
					@mouseenter="hoveringIndex = $el"
					@mouseout="hoveringIndex = -1"
					ref="buttons"
					:disabled="previewEnabled && button[0] != 'view'"
					@click="doAction(index, button)"
					@mousedown.prevent=""
					:class="{'!bg-opacity-60 bg-black': previewEnabled && button[0] == 'view'}"
					class="flex gap-2 items-center p-1 rounded-md transition-colors duration-75 disabled:opacity-40 hover:bg-opacity-40 hover:bg-black"
				>
					<img :src="`${BASE_URL}/formatting/${button[0]}.svg`" class="w-6 pointer-events-none min-w-6">
					<span class="text-sm" v-if="button[3]">{{ button[3] }}</span>
					<Tooltip v-if="hoveringIndex == $el" :button="$el" :text="button[1]" />
				</button>
			</div>
			<span class="text-sm text-center text-white text-opacity-40 translate-x-2">{{ sectionNames[index] }}</span>
		</div>
		<Dropdown v-if="mdHelpShown" @close="mdHelpShown = false" @picked-option="doFormatting" :button="buttons[0]" :options="FORMATTING" :icons="icons">
			<template #footer>
				<div class="flex gap-1 items-start p-1 m-1 text-xs text-white bg-white bg-opacity-10 rounded-sm">
					<img src="@/images/info.svg" class="inline mt-1 w-3 opacity-20" alt="">
					<div>Formátování používá Markdown. <a class="underline" target="_blank" href="https://gist.github.com/roshith-balendran/d50b32f8f7d900c34a7dc00766bcfb9c">Jak používat Markdown?</a><br>Na nadpisy a obrázky používej tlačítka vedle.</div>

				</div>
			</template>
		</Dropdown>
	</section>
</template>
