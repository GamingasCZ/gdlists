<script setup lang="ts">
import {nextTick, onMounted, ref, watch } from 'vue';
import type { Container } from './containers';
import ContainerSettings from './ContainerSettings.vue';
import parseMD from "../global/parseEditorFormatting";
import { main } from '@popperjs/core';
import striptags from 'striptags';

const emit = defineEmits<{
	(e: "removeContainer"): void
	(e: "moveContainer", by: number): void
	(e: "textModified", newText: string)
	(e: "hasFocus", elem: HTMLDivElement): void
	(e: "settingsButton", key: string): void
	(e: "lostFocus"): void
	(e: "addParagraph", inNest: boolean): void
}>()

interface Extras {
	currentSettings: object
	type: string
	focused: boolean
	editable?: boolean
	text?: string
}

const props = defineProps<Container & Extras>()

const previewText = ref("")

const fontSizes = ['', '8px', '12px', '14px', '16px', '18px', '20px', '22px', '24px', '32px', '36px', '48px', '64px']
const doShowSettings = ref<boolean | number>(false)
const mainText = ref<HTMLTextAreaElement>()

const togglePreview = () => {
	if (props.type == "twoColumns") return
	
	let textToParse = props.currentSettings?.noMD ? props.text.replaceAll("\n", "<br>") : props.text
	if (!props.editable) previewText.value = parseMD(textToParse, true, props.currentSettings?.noMD)
	else previewText.value = striptags(props.text).replaceAll("\n", "<br>")
}

watch(() => props.editable, togglePreview)

const makeNextParagraph = (e: KeyboardEvent) => {
	if (props.type.startsWith("heading")) {
		e.preventDefault()
		emit('addParagraph', false)
	}
}

const doFocusText = () => {
	if (!props.editable) return

	mainText.value?.focus()
	emit('hasFocus', mainText.value)
}

const checkHasText = () => ((mainText.value?.innerText || props.text) ?? "").trim().length > 0

const pasteText = (e: ClipboardEvent) => {
	if (!props.editable) return
	e.preventDefault()

	let pasteText = e.clipboardData?.getData("Text")
	let sel = window.getSelection()
	if (!pasteText || !sel) return

	let range = sel?.getRangeAt(0)
	let textNode = document.createTextNode(pasteText)
	range?.deleteContents()
	range?.insertNode(textNode)

	range?.setStartAfter(textNode)
	range?.setEndAfter(textNode)

	sel?.removeAllRanges()
	sel?.addRange(range)
	hasText.value = checkHasText()
	emit('textModified', mainText.value?.innerText!)
}

defineExpose({
	doFocusText,
	togglePreview
})

const mutation = (record: MutationRecord[]) => {
	if (record[0].attributeName == "data-modf") {
		nextTick(() => emit('textModified', mainText.value?.outerText!))
		hasText.value = checkHasText()
	}
}

const observer = new MutationObserver(mutation)
const startObserving = () => observer.observe(mainText.value!, {attributes: true})

const focus = ref(false)
const hasText = ref(checkHasText())

onMounted(doFocusText)

const mousePos = ref([0,0])
const rmbSettingOpen = (mPos: MouseEvent) => {
	mousePos.value = [mPos.pageX, mPos.pageY]
	doShowSettings.value = 2
}

</script>

<template>
	<div :data-type="type" @click.right.exact.prevent="emit('hasFocus', mainText!); focus = true; editable ? (rmbSettingOpen($event)) : null" @click.stop="emit('hasFocus', mainText!); focus = true" class="relative scroll-mt-10 reviewContainer min-h-4">
		<hr class="absolute right-[-6px] border-lof-400 h-full border-r-4" :class="{'!border-none': dependentOnChildren || !(focus && focused)}">
		<p
			v-if="canEditText"
			ref="mainText"
			@vue:mounted="togglePreview(); startObserving()"
			@keydown.enter="makeNextParagraph"
			@focus="emit('hasFocus', mainText!); focus = true"
			@input="emit('textModified', $event.target.outerText); hasText = checkHasText()"
			@paste="pasteText"
			v-html="previewText"
			data-modf="0"
			:data-hastext="!hasText && editable"
			class="w-full selection:bg-lof-400 selection:text-black dataContainer min-w-24 whitespace-break-spaces text-[align:inherit] bg-transparent border-none outline-none resize-none regularParsing"
			:placeholder="placeholder"
			:contenteditable="editable"
			:style="{textAlign: 'inherit', color: 'inherit', wordBreak: 'break-word', textIndent: currentSettings?.indent ? '2rem' : '', fontSize: fontSizes[currentSettings?.size ?? 0]}"
			:class="childStyling || []">
		</p>
			
		<slot></slot>
		<div v-if="!dependentOnChildren && editable" class="absolute z-10 flex flex-col top-[-2px] -right-[38px] box-border max-sm:right-0">
			<button @click="doShowSettings = 1" tabindex="-1" @auxclick="emit('removeContainer')" :class="{'!opacity-100': focus && focused}" class="flex flex-col items-center p-1 text-sm font-bold text-center text-black opacity-0 bg-lof-400">
				<img src="@/images/gear.svg" class="w-7 invert">
			</button>
		</div>

		{{ doShowSettings }}
		<ContainerSettings
			v-if="!dependentOnChildren && editable && (doShowSettings == 1 || focused)"
			class="containerSettings"
			:type="type"
			:settings-arr="currentSettings"
			:shown="doShowSettings"
			:mouse-pos="mousePos"
			@pressed-button="emit('settingsButton', $event)"
			@hid-settings="doShowSettings = false"
			@remove="emit('removeContainer')"
			@move="emit('moveContainer', $event)"
			@reset-pos="mousePos = [0, 0]"
		/>
	</div>
</template>

<style>

.listChildren > * {
	display: list-item;
	list-style-position: inside;
}

p[data-hasText=true]::before {
	content: attr(placeholder);
	text-align: inherit;
	@apply opacity-30 pointer-events-none;
}

</style>