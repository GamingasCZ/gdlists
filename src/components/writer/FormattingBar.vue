<script setup lang="ts">
import { inject, onMounted, onUnmounted, ref } from 'vue';
import { addCEFormatting } from '../global/parseEditorFormatting';
import { SETTINGS } from '@/siteSettings';
import { Key, type Writer } from '@/writers/Writer';
import FormattingButton from './FormattingButton.vue';
import type { FormattingAction } from '@/interfaces';

const props = defineProps<{
	selectedNest: number[]
	writer: Writer
	barDisabled: boolean
}>()

const emit = defineEmits<{
	(e: "addContainer", key: string, holdingShift: boolean): string
	(e: "setAlignment", align: string): string
	(e: "setFormatting", format: string, viewMode?: 0 | 1): string
	(e: "columnCommand", index: number): string
	(e: "splitParagraph"): string
}>()

const doAction = inject<(a: FormattingAction, p: any, s: boolean) => void>("writerAction")!

const showFormatting = ref(false)
const showFormattingBar = (e) => {
	let sel = document.getSelection()
	showFormatting.value = sel && sel.type == 'Range' && sel.anchorNode?.parentElement?.classList.contains("regularParsing") && ["true", "inherit"].includes(sel.anchorNode?.parentElement?.contentEditable)

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
	// keyShortcuts = getShortcuts()
}

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
					newArr.shortcut = buts[i].shortcut[j]
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

const postData = inject("postData")

</script>

<template>
	<section @click.stop="" :style="{ top: barPos }"
		:class="{'!bg-[#ECE6D9]': postData.whitePage, 'bg-lof-200': !postData.whitePage}"
		class="flex rounded-md thinScrollbar transition-[top] bg-lof-200 sticky max-md:overflow-x-auto z-20 items-center justify-between p-1 mb-2 text-3xl text-white">
		<div v-for="(side) in Object.keys(writer.toolbar[currentToolbar])" class="flex gap-1 items-center" :class="{'invert-[0.9]': postData.whitePage}">
			<FormattingButton v-for="button in getToolbarButtons(side)" :button="button"
				@clicked="doAction(button.action[0], $event.action, $event.shift)" :disabled="barDisabled && button?.action?.[0] != 'preview'" />
		</div>
	</section>
</template>
