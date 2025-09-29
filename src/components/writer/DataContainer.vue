<script setup lang="ts">
import {inject, nextTick, onMounted, onUpdated, ref, watch } from 'vue';
import type { Container } from './containers';
import ContainerSettings from './ContainerSettings.vue';
import parseMD from "../global/parseEditorFormatting";
import striptags from 'striptags';
import { flexNames } from '@/Reviews';

const emit = defineEmits<{
	(e: "removeContainer"): void
	(e: "moveContainer", by: number): void
	(e: "textModified", newText: string)
	(e: "hasFocus"): void
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
	index?: number
	align: string
	nestIndex?: number
}

const props = defineProps<Container & Extras>()
const fontSizes = ['', '8px', '12px', '14px', '16px', '18px', '20px', '22px', '24px', '32px', '36px', '48px', '64px']
const doShowSettings = inject<boolean | number>("containerSettingsShown")
const lastTextChange = inject<() => void>("lastTextChange")!
const mainText = ref<HTMLTextAreaElement>()
const textParent = ref<HTMLDivElement>()

const togglePreview = () => {
	if (!props.canEditText) return
	if (!mainText.value) return
	if (props.type == "twoColumns") return
	
	let textToParse = props.currentSettings?.noMD ? props.text.replaceAll("\n", "<br>") : props.text
	if (!props.editable) mainText.value.innerHTML = parseMD(textToParse, true, props.currentSettings?.noMD)
	else mainText.value.innerText = textToParse
}

watch(() => props.editable, togglePreview)

const makeNextParagraph = (e: KeyboardEvent) => {
	if (props.type.startsWith("heading")) {
		e.preventDefault()
		emit('addParagraph', false)
	}
}

const doFocusText = (setFocus = true) => {
	if (!props.editable) return

	if (setFocus) {
		if (props.canEditText)
			mainText.value?.focus()
		else
			textParent.value?.focus()
	}

	focus.value = true
	emit('hasFocus')
}

const checkHasText = () => (((mainText.value?.innerText || props.text) ?? "")?.trim() ?? "").length > 0

const modifyText = (e: InputEvent) => {
	lastTextChange()
	emit('textModified', e?.target.outerText)
	hasText.value = checkHasText()
}

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
	lastTextChange()
	emit('textModified', mainText.value?.innerText!)
}

defineExpose({
	doFocusText,
	togglePreview,
})

const mutation = (record: MutationRecord[]) => {
	if (record[0].attributeName == "data-modf") {
		lastTextChange()
		nextTick(() => emit('textModified', mainText.value?.outerText!))
		hasText.value = checkHasText()
	}
}

const observer = new MutationObserver(mutation)
const startObserving = () => observer.observe(mainText.value!, {attributes: true})

const focus = ref(false)
const hasText = ref(checkHasText())

var settingsFun: () => void
const mount = () => {
	doFocusText()

	textParent.value?.addEventListener("click", e => {
		if (!props.editable) return
		doFocusText(false)
		e.stopPropagation()
	})

	textParent.value?.addEventListener("contextmenu", e => {
		if (!props.editable) return
		e.preventDefault()
		doFocusText()
		nextTick(() => rmbSettingOpen(e))
	})
}

const mousePos = ref([0,0])
const rmbSettingOpen = (mPos: MouseEvent) => {
	if (!props.editable || !settingsFun) return

	mousePos.value = [mPos.pageX, mPos.pageY]
	doShowSettings.value = 2
	nextTick(settingsFun)
}

onMounted(mount)

const settings = ref<HTMLDialogElement>()
</script>

<template>
	<div
		class="flex relative flex-wrap w-full outline-none scroll-mt-24 reviewContainer min-h-4"
		:class="{'min-w-12': !canEditText, 'min-w-64': canEditText}"
		:style="{ justifyContent: flexNames[align] }"
		:data-type="type"
		ref="textParent"
		:tabindex="(canEditText || !editable || dependentOnChildren) ? -1 : 0"
		@focusin="!dependentOnChildren && doFocusText(false)"
		:data-selected="focus && focused"
	>
		<hr class="absolute z-10 right-[-6px] border-lof-400 h-full border-r-4" v-if="!dependentOnChildren && focus && focused">
		<p
			v-if="canEditText"
			ref="mainText"
			@vue:mounted="togglePreview(); startObserving()"
			@keydown.enter="makeNextParagraph"
			@input="modifyText"
			@paste="pasteText"
			data-modf="0"
			:data-hastext="!hasText && editable"
			class="w-full leading-relaxed selection:bg-lof-400 selection:text-black dataContainer whitespace-break-spaces text-[align:inherit] bg-transparent border-none outline-none resize-none regularParsing"
			:placeholder="placeholder"
			:contenteditable="editable"
			:style="{textAlign: 'inherit', color: 'inherit', wordBreak: 'break-word', textIndent: currentSettings?.indent ? '2rem' : '', fontSize: fontSizes[currentSettings?.size ?? 0]}"
			:class="childStyling || []">
		</p>
			
		<slot></slot>
		<div v-if="!dependentOnChildren && editable" class="absolute z-10 flex flex-col top-[-2px] -right-[38px] box-border max-sm:right-0">
			<button @click="settings?.showSettings()" tabindex="-1" @auxclick="emit('removeContainer')" :class="{'!opacity-100': focused}" class="flex flex-col items-center p-1 text-sm font-bold text-center text-black opacity-0 bg-lof-400">
				<img src="@/images/gear.svg" class="w-7 invert">
			</button>
		</div>

		<ContainerSettings
			v-if="!dependentOnChildren && editable && focus"
			@vue:mounted="settingsFun = settings?.showSettings"
			class="containerSettings"
			ref="settings"
			:type="type"
			:settings-arr="currentSettings"
			:shown="doShowSettings"
			:mouse-pos="mousePos"
			:index="index"
			:nest="nestIndex"
			@pressed-button="emit('settingsButton', $event)"
			@hid-settings="doShowSettings = false; doFocusText(true)"
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
	@apply opacity-30 pointer-events-none absolute;
}

</style>
