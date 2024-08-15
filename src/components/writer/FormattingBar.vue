<script setup lang="ts">
import { i18n } from '@/locales';
import { computed, inject, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import Dropdown from '../ui/Dropdown.vue';
import Tooltip from '../ui/Tooltip.vue';
import { addCEFormatting, addFormatting } from '../global/parseEditorFormatting';
import { reviewData } from '@/Reviews';
import { SETTINGS } from '@/siteSettings';

const props = defineProps<{
	selectedNest: number[]
}>()

const emit = defineEmits<{
	(e: "addContainer", key: string): string
	(e: "setAlignment", align: string): string
	(e: "setFormatting", format: string): string
	(e: "columnCommand", index: number): string
}>()

const BASE_URL = import.meta.env.BASE_URL

const actions = [
	[
		["md", i18n.global.t('reviews.md'),, i18n.global.t('reviews.formatting')],
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
		["showImage", i18n.global.t('reviews.addImage')],
		["addVideo", i18n.global.t('reviews.addVideo')],
		["showRating", i18n.global.t('reviews.dispRatings')],
	],
]
// ["showCollab", i18n.global.t('reviews.addUsers')],

const columnData = ["twoColumns", i18n.global.t('reviews.multicolumn'),, "Přidat sloupec"]


const columnOptionsShown = ref(false)

const base = import.meta.env.BASE_URL
const FORMATTING = [i18n.global.t('reviews.bold'), i18n.global.t('reviews.italics'), i18n.global.t('reviews.strike'), i18n.global.t('other.points'), i18n.global.t('other.blockquote'), i18n.global.t('other.checklist'), i18n.global.t('other.link')]
const icons = ["bold", "cursive", "strike", "list", "quotes", "check", "link"].map(x => `${base}/formatting/${x}.svg`)
const formatIndicies = [0,1,2,4,5,6, 12]

const previewEnabled = ref(false)
const mdHelpShown = ref(false)
const columnButton = ref()
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
			emit('addContainer', button[0]); break;
		case 4:
			if (props.selectedNest[0] > -1)
				columnOptionsShown.value = !columnOptionsShown.value
			else
				emit('addContainer', button[0]); break;
	}
}

const doFormatting = (ind: number) => {
	let el = document.activeElement
	if (!el || !el.classList.contains("dataContainer")) return
	el.dataset.modf = 1

	addCEFormatting(formatIndicies[ind], el, false)
}

const hoveringIndex = ref(-1)

const getIndex = (sectIndex: number, butIndex: number) => {
	// WHY DID THIS TAKE SO LONG TO COME UP WITH AAAAAAAAA
	return actions.slice(0, sectIndex).map(a => a.length).reduce((b,c) => b+c, 0)+butIndex
}

const showFormatting = ref(false)
const showFormattingBar = (e) => {
	let sel = document.getSelection()
	showFormatting.value = sel && sel.type == 'Range' && sel.anchorNode?.parentElement?.classList.contains("regularParsing") && sel.anchorNode?.parentElement?.contentEditable === "true"
}

onMounted(() => {
	document.addEventListener("selectionchange", showFormattingBar)
})

onUnmounted(() => {
	document.removeEventListener("selectionchange", showFormattingBar)
})

const barPos = ref("2.5rem")
const nav = (e: MutationRecord[]) => {
	if (e[0].target.classList.contains("-translate-y-14"))
		barPos.value = "0"
	else
		barPos.value = "2.5rem"
}
const observer = new MutationObserver(nav)
if (SETTINGS.value.scrollNavbar)
	observer.observe(document.querySelector("#navbar")!, {attributes: true, attributeFilter: ["class"]})

</script>

<template>
	<section @click.stop="" :style="{top: barPos}" class="flex transition-[top] overflow-auto sticky z-20 items-center p-1 mt-6 mb-2 text-3xl text-white rounded-md bg-greenGradient">
		<div class="flex gap-3" v-show="showFormatting">
			<button
				v-for="(button, buttonIndex) in FORMATTING"
				@click="doFormatting(buttonIndex)"
				@mousedown.prevent=""
				:class="{'!bg-opacity-60 bg-black': previewEnabled && button[0] == 'view'}"
				class="flex gap-2 items-center p-1 w-max rounded-md transition-colors duration-75 disabled:opacity-40 hover:bg-opacity-40 hover:bg-black"
			>
				<img :src="icons[buttonIndex]" class="w-6 pointer-events-none min-w-6">
				<span class="text-sm pointer-events-none">{{ button }}</span>
			</button>
		</div>
		
		<div class="flex gap-1 items-center grow" v-show="!showFormatting">
			<div v-for="(action, index) in actions" class="flex gap-1 items-center">
				<hr v-show="index > 0 && index < 4" class="inline-flex mx-2 w-0.5 h-4 bg-white border-none opacity-10 aspect-square">
				<button
					v-for="(button, buttonIndex) in action"
					@mouseout="hoveringIndex = -1"
					ref="buttons"
					@mouseenter="hoveringIndex = buttons[getIndex(index, buttonIndex)]"
					:disabled="previewEnabled && button[0] != 'view'"
					@click="doAction(index, button)"
					@mousedown.prevent=""
					:class="{'!bg-opacity-60 bg-black': previewEnabled && button[0] == 'view'}"
					class="flex gap-2 items-center p-1 w-max rounded-md transition-colors duration-75 disabled:opacity-40 hover:bg-opacity-40 hover:bg-black"
				>
					<img :src="`${BASE_URL}/formatting/${button[0]}.svg`" class="w-6 pointer-events-none min-w-6">
					<span class="text-sm pointer-events-none" v-if="button[3]">{{ button[3] }}</span>
					
					<Transition name="fade">
						<Tooltip v-if="hoveringIndex == buttons?.[getIndex(index, buttonIndex)]" :button="hoveringIndex" :text="button[1]" />
					</Transition>
				</button>
			</div>
		</div>

		<button
			:disabled="previewEnabled"
			ref="columnButton"
			@click="doAction(4, columnData)"
			@mousedown.prevent=""
			class="flex gap-2 items-center p-1 w-max rounded-md transition-colors duration-75 disabled:opacity-40 hover:bg-opacity-40 hover:bg-black"
			v-show="!showFormatting"
		>
			<img :src="`${BASE_URL}/formatting/twoColumns.svg`" class="w-6 pointer-events-none min-w-6">
			<span class="w-max text-sm pointer-events-none">{{ selectedNest[0] > -1 ? $t('reviews.editColumn') : $t('reviews.addColumn') }}</span>
		</button>

		<Dropdown v-if="columnOptionsShown && selectedNest[0] != -1" @picked-option="emit('columnCommand', $event)" :button="columnButton" @close="columnOptionsShown = false">
			<template #header>
				<div class="m-2">
					<div class="flex flex-col gap-3 justify-center mb-5 text-xl text-center text-white">
						<div v-for="(setting, index) in [$t('other.add'), $t('other.duplicate')]">
							<h2>{{ $t('review.columnSetting', [setting]) }}</h2>
							<div>
								<button :disabled="reviewData.containers[selectedNest[0]].settings.components.length > 9" @click="emit('columnCommand', index*2)" class="box-border p-1 w-9 bg-black bg-opacity-40 rounded-md disabled:opacity-40 hover:bg-opacity-60 aspect-square">
									<img src="@/images/moveUp.svg" class="mx-auto w-5 -rotate-90 button" alt="">
								</button>
								<button :disabled="reviewData.containers[selectedNest[0]].settings.components.length > 9" @click="emit('columnCommand', index*2+1)" class="box-border p-1 ml-2 w-9 bg-black bg-opacity-40 rounded-md disabled:opacity-40 hover:bg-opacity-60 aspect-square">
									<img src="@/images/moveUp.svg" class="mx-auto w-5 rotate-90 button" alt="">
								</button>
							</div>
						</div>
						<div>
							<h2>{{ $t('reviews.vertAlign') }}</h2>
							<div>
								<button @click="emit('columnCommand', 11)" class="box-border p-1 w-9 bg-black bg-opacity-40 rounded-md hover:bg-opacity-60 aspect-square">
									<img src="@/images/moveUp.svg" :class="{'opacity-40': reviewData.containers[selectedNest[0]].settings.components[selectedNest[1]][11]}" class="mx-auto w-5 button" alt="">
								</button>
								<button @click="emit('columnCommand', 12)" class="box-border p-1 ml-2 w-9 bg-black bg-opacity-40 rounded-md hover:bg-opacity-60 aspect-square">
									<img src="@/images/moveMiddle.svg" :class="{'opacity-40': !reviewData.containers[selectedNest[0]].settings.components[selectedNest[1]].includes(1)}" class="mx-auto w-5 rotate-180 button" alt="">
								</button>
								<button @click="emit('columnCommand', 13)" class="box-border p-1 ml-2 w-9 bg-black bg-opacity-40 rounded-md hover:bg-opacity-60 aspect-square">
									<img src="@/images/moveUp.svg" :class="{'opacity-40': !reviewData.containers[selectedNest[0]].settings.components[selectedNest[1]].includes(2)}" class="mx-auto w-5 rotate-180 button" alt="">
								</button>
							</div>
						</div>
						<button @click="emit('columnCommand', 7); columnOptionsShown = false" class="flex gap-1 items-center p-1 text-base font-bold text-black bg-red-400 rounded-md">
							<img src="@/images/del.svg" alt="" class="w-5">
							<span>{{ $t('reviews.removeColumn') }}</span>
						</button>
						<button @click="emit('columnCommand', 6)" class="flex gap-1 items-center p-1 text-base font-bold text-black rounded-md bg-lof-400">
							<img src="@/images/grow.svg" alt="" class="w-5">
							<span v-if="!reviewData.containers?.[selectedNest[0]]?.settings?.components?.[selectedNest[1]]?.[10] == true">{{ $t('reviews.cMaxContent') }}</span>
							<span v-else>{{ $t('reviews.cFillSpace') }}</span>
						</button>
					</div>
					<div class="flex gap-1 justify-between">
						<button @click="emit('columnCommand', 8)" class="box-border p-1 w-9 bg-black bg-opacity-40 rounded-md hover:bg-opacity-60 aspect-square">
							<img src="@/images/moveUp.svg" class="mx-auto w-5 button" alt="">
						</button>
						<button @click="emit('columnCommand', 9)" class="box-border p-1 w-9 bg-black bg-opacity-40 rounded-md hover:bg-opacity-60 aspect-square">
							<img src="@/images/moveDown.svg" class="mx-auto w-5 button" alt="">
						</button>
						<button @click="emit('columnCommand', 10); columnOptionsShown = false" class="flex gap-1 items-center p-1 ml-6 text-xl font-bold text-black bg-red-400 rounded-md">
							<img src="@/images/del.svg" alt="" class="w-6">
							<span>{{ $t('editor.remove') }}</span>
						</button>
					</div>
				</div>
			</template>
		</Dropdown>

		<Dropdown v-if="mdHelpShown" @close="mdHelpShown = false" @picked-option="doFormatting" :button="buttons[0]" :options="FORMATTING" :icons="icons">
			<template #footer>
				<div class="flex gap-1 items-start p-1 m-1 text-xs text-white bg-white bg-opacity-10 rounded-sm">
					<img src="@/images/info.svg" class="inline mt-1 w-3 opacity-20" alt="">
					<div>{{ $t('reviews.formattingHelp1') }}<br><a class="underline" target="_blank" href="https://gist.github.com/roshith-balendran/d50b32f8f7d900c34a7dc00766bcfb9c">{{ $t('reviews.formattingHelp2') }}</a><br>{{ $t('reviews.formattingHelp3') }}</div>

				</div>
			</template>
		</Dropdown>
	</section>
</template>
