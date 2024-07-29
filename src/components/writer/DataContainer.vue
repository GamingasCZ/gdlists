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

const doShowSettings = ref(false)
const mainText = ref<HTMLTextAreaElement>()

const togglePreview = () => {
	let textToParse = props.currentSettings?.noMD ? props.text.replaceAll("\n", "<br>") : props.text
	if (!props.editable) previewText.value = parseMD(textToParse, true, props.currentSettings?.noMD)
	else previewText.value = striptags(props.text).replaceAll("\n", "<br>")
}

const makeNextParagraph = (e: KeyboardEvent) => {
	if (props.type.startsWith("heading")) {
		e.preventDefault()
		emit('addParagraph', false)
	}
}

const doFocusText = () => {
	mainText.value?.focus()
}

const pasteText = (e: ClipboardEvent) => {
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
}

defineExpose({
	doFocusText,
	togglePreview
})

const mutation = (record: MutationRecord[]) => {
	if (record[0].attributeName == "data-modf")
		nextTick(() => emit('textModified', mainText.value?.outerText!))
}

const observer = new MutationObserver(mutation)
const startObserving = () => observer.observe(mainText.value!, {attributes: true})

const focus = ref(false)
const hasText = ref((props.text ?? "").trim().length > 0)

</script>

<template>
	<div :data-type="type" @click.stop="emit('hasFocus', mainText!); focus = true" class="relative scroll-mt-10 reviewContainer outline-[2px] min-h-4 outline-lof-400" :class="{'!outline-none': dependentOnChildren, 'outline': focus && focused}">
		<p
			v-if="canEditText"
			ref="mainText"
			@vue:mounted="togglePreview(); startObserving()"
			@keydown.enter="makeNextParagraph"
			@focus="emit('hasFocus', mainText!); focus = true"
			@input="emit('textModified', $event.target.outerText); hasText = $event.target.outerText.trim().length > 0"
			@paste="pasteText"
			v-html="previewText"
			data-modf="0"
			:data-hastext="!hasText && editable"
			class="w-full whitespace-pre text-[align:inherit] bg-transparent border-none outline-none resize-none regularParsing"
			:placeholder="placeholder"
			:contenteditable="editable"
			:style="{textAlign: 'inherit', color: 'inherit', wordBreak: 'break-word'}"
			:class="childStyling || []">
		</p>
			
		<slot></slot>
		<div v-if="!dependentOnChildren && editable" class="absolute z-10 flex flex-col top-[-2px] right-[-30px] box-border max-sm:right-0">
			<button @click="doShowSettings = true" tabindex="-1" @auxclick="emit('removeContainer')" :class="{'!opacity-100': focus && focused}" class="p-0.5 opacity-0 bg-lof-400"><img src="@/images/gear.svg" class="w-6 invert"></button>
		</div>

		<ContainerSettings
			v-if="!dependentOnChildren && editable"
			class="containerSettings"
			:type="type"
			:settings-arr="currentSettings"
			:shown="doShowSettings"
			@pressed-button="emit('settingsButton', $event)"
			@hid-settings="doShowSettings = false"
			@remove="emit('removeContainer')"
			@move="emit('moveContainer', $event)"
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
	@apply opacity-30 absolute;
}

</style>