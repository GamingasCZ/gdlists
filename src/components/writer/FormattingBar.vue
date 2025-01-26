<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { addCEFormatting } from '../global/parseEditorFormatting';
import { SETTINGS } from '@/siteSettings';
import { Key, type Writer } from '@/writers/Writer';
import FormattingButton from './FormattingButton.vue';

const props = defineProps<{
	selectedNest: number[]
	writer: Writer
}>()

const emit = defineEmits<{
	(e: "addContainer", key: string, holdingShift: boolean): string
	(e: "setAlignment", align: string): string
	(e: "setFormatting", format: string, viewMode?: 0 | 1): string
	(e: "columnCommand", index: number): string
	(e: "splitParagraph"): string
}>()

const columnOptionsShown = ref(false)
const formatIndicies = [0, 1, 2, 4, 5, 6, 12]
const previewEnabled = ref(false)
const previewMode = ref(0)

type FormattingAction = 'add' | 'preview' | 'align' | 'column' | 'format' | 'splitParagraph'

interface FormattingButton {
	title: string
	icon: string | string[]
	action: [FormattingAction, string | string[]]
	dropdownText?: string[]
	tooltip?: string
	splitAfter?: boolean
	bold?: boolean
}

const doAction = (action: FormattingAction, param: any, holdingShift = false) => {
	switch (action) {
		case 'add':
			emit('addContainer', param, holdingShift);
			break;
		case 'preview':
			previewEnabled.value = param !== 0
			previewMode.value = param
			
			if (previewEnabled.value)
				swapToolbar('previewing')
			else
				swapToolbar('main')
			emit('setFormatting', 'view', previewMode.value);
			break;
		case 'align':
			emit('setAlignment', param);
			break;
		case 'column':
			if (props.selectedNest[0] > -1)
				columnOptionsShown.value = !columnOptionsShown.value
			else
				emit('addContainer', 'twoColumns', holdingShift);
			break;
		case 'format':
			doFormatting(param)
			break;
		case 'splitParagraph':
			emit('splitParagraph'); break;
	}
}

const doFormatting = (ind: number) => {
	let el = document.activeElement
	if (!el || !el.classList.contains("dataContainer")) return
	el.dataset.modf = 1

	addCEFormatting(formatIndicies[ind], el, false)
}

const showFormatting = ref(false)
const showFormattingBar = (e) => {
	let sel = document.getSelection()
	showFormatting.value = sel && sel.type == 'Range' && sel.anchorNode?.parentElement?.classList.contains("regularParsing") && sel.anchorNode?.parentElement?.contentEditable === "true"

	if (currentToolbar.value == 'previewing') return
	
	if (showFormatting.value)
		swapToolbar('formatting')
	else
		swapToolbar('main')
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
	observer.observe(document.querySelector("#navbar")!, { attributes: true, attributeFilter: ["class"] })

const currentToolbar = ref("main")
const swapToolbar = (to: string) => {
	currentToolbar.value = to
	keyShortcuts = getShortcuts()
}

const getShortcuts = () => {
	let shortcuts = []
	for (const key in props.writer.toolbar) {
		for (const key2 in props.writer.toolbar[key]) {
			for (const button of props.writer.toolbar[key][key2]) {
				if (button?.shortcut)
					shortcuts.push([button?.shortcut, button?.action])

				// Fixed shortcuts apply only if a given toolbar is active
				if (button?.shortcutFixed && key == currentToolbar.value)
					shortcuts.push([button?.shortcutFixed, button?.action])
			}
		}
	}
	return shortcuts
}
var keyShortcuts = getShortcuts()
const isValidShortcut = (combo: number, key: string) => {
	for (let i = 0; i < keyShortcuts.length; i++) {
		if (keyShortcuts[i][0][0] == combo && keyShortcuts[i][0][1] == key)
			return keyShortcuts[i][1]
	}
	return false
}

var heldModifiers = ref(Key.None)



document.documentElement.addEventListener("keydown", e => {
	let combo = +e.ctrlKey * Key.Ctrl | +e.shiftKey * Key.Shift | +e.altKey * Key.Alt
	heldModifiers.value = combo

	// Mainly for text selection to keep working
	// Disables browser shortcuts
	if (combo != Key.None && e.key.length == 1 && isValidShortcut(combo, e.key.toUpperCase()))
		e.preventDefault()
})

window.addEventListener("keyup", e => {
	let currCombo = +e.ctrlKey * Key.Ctrl | +e.shiftKey * Key.Shift | +e.altKey * Key.Alt

	let f: string[] | boolean;
	if (currCombo != Key.None && e.key.length == 1 && (f = isValidShortcut(currCombo, e.key.toUpperCase())))
		doAction(...f)
})

const getToolbarButtons = (side: 'left' | 'right') => {
	if (SETTINGS.value.compactToolbar) {
		let buts = props.writer.toolbar[currentToolbar.value]?.[side]!.slice(0)
		let newButs = props.writer.toolbar[currentToolbar.value]?.[side]!.slice(0).filter(x => !x?.dropdownText)
		let b = 0
		for (let i = 0; i < buts.length; i++) {
			if (buts[i]?.dropdownText) {
				let j = buts[i].dropdownText.length-1
				buts[i].dropdownText.forEach(x => {
					let newArr = JSON.parse(JSON.stringify(buts[i]))
					newArr.tooltip = buts[i].dropdownText[j]
					delete newArr.dropdownText
					newArr.icon = buts[i].icon[j]
					newArr.splitAfter = j == buts[i].dropdownText?.length-1
					newArr.action = [buts[i].action[0], buts[i].action[1][j]]
					newButs?.splice(i+b, 0, newArr)
					j--
				})
				b += buts[i].dropdownText?.length-1
			}
		}
		return newButs
	}
	else
		return props.writer.toolbar[currentToolbar.value]?.[side]
}

</script>

<template>
	<section @click.stop="" :style="{ top: barPos }"
		class="flex transition-[top] bg-lof-200 overflow-auto sticky z-20 items-center justify-between p-1 mb-2 text-3xl text-white">
		<div v-for="(side) in Object.keys(writer.toolbar[currentToolbar])" class="flex gap-1 items-center">
			<FormattingButton v-for="button in getToolbarButtons(side)" :button="button"
				@clicked="doAction(button.action[0], $event, false)" />
		</div>
	</section>
</template>
