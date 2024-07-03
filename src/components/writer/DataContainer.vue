<script setup lang="ts">
import {nextTick, onMounted, ref, watch } from 'vue';
import type { Container } from './containers';
import ContainerSettings from './ContainerSettings.vue';
import parseMD from "../global/parseEditorFormatting";

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

let text = defineModel()

const previewText = ref("")

const doShowSettings = ref(false)
const mainText = ref<HTMLTextAreaElement>()
onMounted(() => {
	if (!props.editable) previewText.value = parseMD(props.text, true, props.currentSettings?.noMD)
})

watch(props, () => {
	if (props.editable) previewText.value = parseMD(text.value, true, props.currentSettings?.noMD)
})

const makeNextParagraph = () => {
	if (props.type.startsWith("heading") && e.key == "Enter") {
		e.preventDefault()
		emit('addParagraph', false)
	}
}

const mutation = (mutationList: MutationRecord[]) => {
	textChanges.disconnect()
	mainText.value.dataset.modf = "0"
	
	text.value = mutationList[0].target.value
	textChanges.observe(mainText.value!, {attributes: true, attributeFilter: ['data-modf']})
}

const textChanges = new MutationObserver(mutation)
const observeChanges = () => {
	if (props.editable)
		textChanges.observe(mainText.value!, {attributes: true, attributeFilter: ['data-modf']})
}

const setBoxHeight = () => {
	mainText.value.style.height = `unset`;
	mainText.value.style.height = `${mainText.value?.scrollHeight}px`;
}

const focus = ref(false)

</script>

<template>
	<div :data-type="type" @click.stop="emit('hasFocus', mainText!); focus = true" class="relative scroll-mt-10 reviewContainer outline-[2px] min-h-4 outline-lof-400" :class="{'!outline-none': dependentOnChildren, 'outline': focus && focused}">
		<component
			v-if="canEditText"
			:is="editable ? (type.startsWith('heading') ? 'input' : 'textarea') : 'p'"
			ref="mainText"
			@vue:mounted="observeChanges(); setBoxHeight()"
			@vue:updated="setBoxHeight()"
			@focus="emit('hasFocus', mainText!); focus = true"
			@keyup="text = $event.target.value"
			@input="setBoxHeight"
			@keyup.enter="makeNextParagraph"
			:placeholder="placeholder"
			v-html="editable ? '' : previewText"
			:value="text"
			class="w-full text-[align:inherit] break-words bg-transparent border-none outline-none resize-none regularParsing"
			data-modf="0"
			:style="{textAlign: 'inherit', color: 'inherit'}"
			:class="childStyling || []">
		</component>
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

</style>